import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Valid status transitions
const validStatuses = ['pending', 'scheduled', 'en_route', 'on_site', 'in_progress', 'completed']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes } = body

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status', validStatuses },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get current job
    const { data: currentJob, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !currentJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const previousStatus = currentJob.status

    // Update job status
    const updateData: Record<string, string | null> = { status }

    // Set completion timestamp if completing
    if (status === 'completed' && previousStatus !== 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    // Add notes if provided
    if (notes) {
      updateData.notes = currentJob.notes
        ? `${currentJob.notes}\n\n[${new Date().toLocaleString()}] ${notes}`
        : `[${new Date().toLocaleString()}] ${notes}`
    }

    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log status update
    await supabase.from('status_updates').insert({
      job_id: id,
      status,
      previous_status: previousStatus,
      notes,
      location: null, // Could add GPS coordinates here from the request
    })

    return NextResponse.json({
      success: true,
      job: updatedJob,
      transition: {
        from: previousStatus,
        to: status,
      },
    })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update status', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServerClient()

    // Get status history for the job
    const { data: statusHistory, error } = await supabase
      .from('status_updates')
      .select('*')
      .eq('job_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      jobId: id,
      history: statusHistory,
    })

  } catch (error) {
    console.error('Error fetching status history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch status history' },
      { status: 500 }
    )
  }
}
