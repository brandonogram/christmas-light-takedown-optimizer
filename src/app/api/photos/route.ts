import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Photo upload and management API
// Handles before/after/inventory photos for jobs

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const jobId = formData.get('job_id') as string | null
    const photoType = formData.get('photo_type') as string | null // 'before', 'after', 'inventory', 'damage'

    if (!file || !jobId || !photoType) {
      return NextResponse.json(
        { error: 'Missing required fields: file, job_id, photo_type' },
        { status: 400 }
      )
    }

    const validPhotoTypes = ['before', 'after', 'inventory', 'damage', 'other']
    if (!validPhotoTypes.includes(photoType)) {
      return NextResponse.json(
        { error: 'Invalid photo_type', validPhotoTypes },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${jobId}/${photoType}/${Date.now()}.${fileExt}`

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('job-photos')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload photo', details: uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabase
      .storage
      .from('job-photos')
      .getPublicUrl(fileName)

    // Save photo record to database
    const { data: photoRecord, error: dbError } = await supabase
      .from('job_photos')
      .insert({
        job_id: jobId,
        photo_url: urlData.publicUrl,
        photo_type: photoType,
      })
      .select()
      .single()

    if (dbError) {
      // Try to delete the uploaded file if database insert fails
      await supabase.storage.from('job-photos').remove([fileName])
      throw dbError
    }

    return NextResponse.json({
      success: true,
      photo: photoRecord,
    })

  } catch (error) {
    console.error('Photo upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('job_id')
    const photoType = request.nextUrl.searchParams.get('photo_type')

    if (!jobId) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    let query = supabase
      .from('job_photos')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (photoType) {
      query = query.eq('photo_type', photoType)
    }

    const { data: photos, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      photos,
    })

  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const photoId = request.nextUrl.searchParams.get('id')

    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get photo record first
    const { data: photo, error: fetchError } = await supabase
      .from('job_photos')
      .select('*')
      .eq('id', photoId)
      .single()

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Delete from storage - extract path from URL
    if (photo.photo_url) {
      const urlParts = photo.photo_url.split('/job-photos/')
      if (urlParts.length > 1) {
        const storagePath = urlParts[1]
        await supabase.storage.from('job-photos').remove([storagePath])
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('job_photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted',
    })

  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}
