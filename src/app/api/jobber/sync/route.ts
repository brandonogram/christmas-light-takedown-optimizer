import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase'

const JOBBER_API_URL = 'https://api.getjobber.com/api/graphql'

// GraphQL queries for Jobber API
const CLIENTS_QUERY = `
  query GetClients($first: Int!, $after: String) {
    clients(first: $first, after: $after) {
      nodes {
        id
        name
        firstName
        lastName
        email
        phone
        secondaryPhone
        billingAddress {
          street
          city
          province
          postalCode
          country
        }
        properties {
          nodes {
            id
            address {
              street
              city
              province
              postalCode
              country
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

const JOBS_QUERY = `
  query GetJobs($first: Int!, $after: String) {
    jobs(first: $first, after: $after) {
      nodes {
        id
        title
        jobNumber
        startAt
        endAt
        client {
          id
          name
          phone
          email
        }
        property {
          address {
            street
            city
            province
            postalCode
            country
          }
        }
        instructions
        jobStatus
        total
        invoices {
          nodes {
            id
            invoiceStatus
            amountDue
            amountPaid
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`

async function refreshToken(refreshToken: string, companyId: string) {
  const tokenResponse = await fetch('https://api.getjobber.com/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.JOBBER_CLIENT_ID || '',
      client_secret: process.env.JOBBER_CLIENT_SECRET || '',
      refresh_token: refreshToken,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Failed to refresh token')
  }

  const tokenData = await tokenResponse.json()
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString()

  const supabase = createServerClient()
  await supabase
    .from('jobber_connections')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
    })
    .eq('company_id', companyId)

  return tokenData.access_token
}

async function jobberGraphQL(accessToken: string, query: string, variables: object = {}) {
  const response = await fetch(JOBBER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-JOBBER-GRAPHQL-VERSION': '2023-11-15',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Jobber API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`)
  }

  return data.data
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const companyId = cookieStore.get('company_id')?.value

    if (!companyId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    // Get Jobber connection
    const { data: connection, error: connectionError } = await supabase
      .from('jobber_connections')
      .select('*')
      .eq('company_id', companyId)
      .single()

    if (connectionError || !connection) {
      return NextResponse.json(
        { error: 'Jobber not connected' },
        { status: 400 }
      )
    }

    let accessToken = connection.access_token

    // Check if token is expired
    if (new Date(connection.expires_at) < new Date()) {
      accessToken = await refreshToken(connection.refresh_token, companyId)
    }

    // Sync Jobs from Jobber
    let hasMoreJobs = true
    let jobsCursor: string | null = null
    const syncedJobs: string[] = []

    while (hasMoreJobs) {
      const jobsData = await jobberGraphQL(accessToken, JOBS_QUERY, {
        first: 50,
        after: jobsCursor,
      })

      for (const job of jobsData.jobs.nodes) {
        // Map Jobber job status to our status
        let status = 'pending'
        switch (job.jobStatus) {
          case 'requires_invoicing':
          case 'completed':
            status = 'completed'
            break
          case 'in_progress':
            status = 'in_progress'
            break
          case 'on_hold':
            status = 'pending'
            break
          case 'active':
          case 'today':
            status = 'scheduled'
            break
        }

        // Calculate payment status from invoices
        let paymentStatus = 'unpaid'
        if (job.invoices?.nodes?.length > 0) {
          const totalDue = job.invoices.nodes.reduce((sum: number, inv: { amountDue: number }) => sum + inv.amountDue, 0)
          const totalPaid = job.invoices.nodes.reduce((sum: number, inv: { amountPaid: number }) => sum + inv.amountPaid, 0)
          if (totalDue === 0 && totalPaid > 0) {
            paymentStatus = 'paid'
          } else if (totalPaid > 0) {
            paymentStatus = 'partial'
          }
        }

        const address = job.property?.address || {}

        // Upsert job
        const { data: upsertedJob } = await supabase
          .from('jobs')
          .upsert({
            company_id: companyId,
            jobber_id: job.id,
            jobber_number: job.jobNumber,
            customer_name: job.client?.name || 'Unknown Customer',
            customer_phone: job.client?.phone,
            customer_email: job.client?.email,
            address: address.street || '',
            city: address.city,
            state: address.province,
            zip: address.postalCode,
            scheduled_date: job.startAt?.split('T')[0],
            scheduled_time_start: job.startAt?.split('T')[1]?.substring(0, 5),
            scheduled_time_end: job.endAt?.split('T')[1]?.substring(0, 5),
            status,
            notes: job.instructions,
            payment_status: paymentStatus,
            total_price: job.total,
          }, {
            onConflict: 'jobber_id',
            ignoreDuplicates: false,
          })
          .select()

        if (upsertedJob && upsertedJob.length > 0) {
          syncedJobs.push(upsertedJob[0].id)
        }
      }

      hasMoreJobs = jobsData.jobs.pageInfo.hasNextPage
      jobsCursor = jobsData.jobs.pageInfo.endCursor
    }

    // Update last sync timestamp (using updated_at field)
    await supabase
      .from('jobber_connections')
      .update({ updated_at: new Date().toISOString() })
      .eq('company_id', companyId)

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedJobs.length} jobs from Jobber`,
      syncedJobs: syncedJobs.length,
    })

  } catch (error) {
    console.error('Jobber sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync with Jobber', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const companyId = cookieStore.get('company_id')?.value

    if (!companyId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const supabase = createServerClient()

    const { data: connection } = await supabase
      .from('jobber_connections')
      .select('updated_at, expires_at')
      .eq('company_id', companyId)
      .single()

    return NextResponse.json({
      connected: !!connection,
      lastSync: connection?.updated_at,
      expiresAt: connection?.expires_at,
    })

  } catch (error) {
    console.error('Error checking sync status:', error)
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    )
  }
}
