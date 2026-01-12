import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Jobber OAuth Configuration
// Callback URL: https://christmas-light-takedown-optimizer.vercel.app/api/auth/jobber/callback
// Manage App URL: https://christmas-light-takedown-optimizer.vercel.app/dashboard

const JOBBER_CLIENT_ID = process.env.JOBBER_CLIENT_ID || 'YOUR_CLIENT_ID'
const JOBBER_REDIRECT_URI = process.env.JOBBER_REDIRECT_URI || 'https://christmas-light-takedown-optimizer.vercel.app/api/auth/jobber/callback'

export async function GET() {
  // Generate a random state for CSRF protection
  const state = crypto.randomUUID()

  // Store state in cookie for verification
  const cookieStore = await cookies()
  cookieStore.set('jobber_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600 // 10 minutes
  })

  // Build the Jobber authorization URL
  const authUrl = new URL('https://api.getjobber.com/api/oauth/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', JOBBER_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', JOBBER_REDIRECT_URI)
  authUrl.searchParams.set('state', state)
  // Add scopes as needed - read/write access to various resources
  authUrl.searchParams.set('scope', 'read_clients write_clients read_jobs write_jobs read_schedules')

  return NextResponse.redirect(authUrl.toString())
}
