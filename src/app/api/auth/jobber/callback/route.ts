import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase'

const JOBBER_CLIENT_ID = process.env.JOBBER_CLIENT_ID || 'YOUR_CLIENT_ID'
const JOBBER_CLIENT_SECRET = process.env.JOBBER_CLIENT_SECRET || 'YOUR_CLIENT_SECRET'
const JOBBER_REDIRECT_URI = process.env.JOBBER_REDIRECT_URI || 'https://christmas-light-takedown-optimizer.vercel.app/api/auth/jobber/callback'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle error from Jobber
  if (error) {
    return NextResponse.redirect(new URL('/?error=oauth_denied', request.url))
  }

  // Verify state parameter
  const cookieStore = await cookies()
  const savedState = cookieStore.get('jobber_oauth_state')?.value

  if (!state || state !== savedState) {
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url))
  }

  // Clear the state cookie
  cookieStore.delete('jobber_oauth_state')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.getjobber.com/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: JOBBER_CLIENT_ID,
        client_secret: JOBBER_CLIENT_SECRET,
        code,
        redirect_uri: JOBBER_REDIRECT_URI,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in, scope } = tokenData

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + expires_in * 1000).toISOString()

    // Store tokens in Supabase
    const supabase = createServerClient()

    // First, create or get the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        name: 'My Company', // Will be updated from Jobber data
        email: '',
      })
      .select()
      .single()

    if (companyError) {
      console.error('Company creation error:', companyError)
      return NextResponse.redirect(new URL('/?error=company_creation_failed', request.url))
    }

    // Store the Jobber connection
    const { error: connectionError } = await supabase
      .from('jobber_connections')
      .upsert({
        company_id: company.id,
        access_token,
        refresh_token,
        expires_at: expiresAt,
        scope,
      })

    if (connectionError) {
      console.error('Connection storage error:', connectionError)
      return NextResponse.redirect(new URL('/?error=connection_failed', request.url))
    }

    // Set a session cookie with company ID
    cookieStore.set('company_id', company.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })

    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(new URL('/?error=unknown', request.url))
  }
}
