import { NextRequest, NextResponse } from 'next/server'

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY || ''

// HeyGen API for avatar video generation
// Docs: https://docs.heygen.com/reference/generate-video

interface HeyGenVideoRequest {
  video_inputs: Array<{
    character: {
      type: 'avatar' | 'talking_photo'
      avatar_id?: string
      talking_photo_id?: string
      avatar_style?: 'normal' | 'circle'
    }
    voice: {
      type: 'text' | 'audio'
      input_text?: string
      voice_id?: string
      speed?: number
    }
    background?: {
      type: 'color' | 'image' | 'video'
      value?: string
    }
  }>
  dimension?: {
    width: number
    height: number
  }
  aspect_ratio?: '16:9' | '9:16' | '1:1'
  test?: boolean
}

export async function POST(request: NextRequest) {
  if (!HEYGEN_API_KEY) {
    return NextResponse.json(
      { error: 'HeyGen API key not configured' },
      { status: 500 }
    )
  }

  try {
    // Brandon Calloway educational video script
    const script = `
      Hey there! I'm Brandon Calloway, and I'm excited to introduce you to TakedownPro -
      the ultimate tool for Christmas light removal businesses.

      If you're spending hours planning routes, tracking inventory, and managing crews
      during takedown season, this app is going to change everything.

      TakedownPro connects directly with Jobber to sync your customer data automatically.
      Then it optimizes your daily routes so your crews can complete more jobs in less time.

      Your field crews get a mobile-first interface where they can see their route,
      check off inventory as they remove it, take before and after photos,
      and even print QR labels for storage totes.

      Plus, you get real-time status updates so you always know where your crews are
      and how the season is progressing.

      Ready to make takedown season your most efficient yet?
      Click the button below to connect your Jobber account and get started!
    `.trim().replace(/\s+/g, ' ')

    const videoRequest: HeyGenVideoRequest = {
      video_inputs: [
        {
          character: {
            type: 'avatar',
            avatar_id: 'josh_lite3_20230714', // Professional male avatar
            avatar_style: 'normal'
          },
          voice: {
            type: 'text',
            input_text: script,
            voice_id: 'en-US-ChristopherNeural', // Professional male voice
            speed: 1.0
          },
          background: {
            type: 'color',
            value: '#18181b' // zinc-900
          }
        }
      ],
      dimension: {
        width: 1920,
        height: 1080
      },
      aspect_ratio: '16:9',
      test: process.env.NODE_ENV !== 'production' // Use test mode in dev
    }

    // Step 1: Create video generation task
    const createResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-Api-Key': HEYGEN_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoRequest)
    })

    if (!createResponse.ok) {
      const errorData = await createResponse.json()
      console.error('HeyGen create error:', errorData)
      return NextResponse.json(
        { error: 'Failed to create video', details: errorData },
        { status: createResponse.status }
      )
    }

    const createData = await createResponse.json()
    const videoId = createData.data?.video_id

    if (!videoId) {
      return NextResponse.json(
        { error: 'No video ID returned from HeyGen' },
        { status: 500 }
      )
    }

    // Return the video ID for polling status
    return NextResponse.json({
      success: true,
      videoId,
      message: 'Video generation started. Poll /api/heygen/status?id=' + videoId + ' to check progress.'
    })

  } catch (error) {
    console.error('HeyGen API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate video', details: String(error) },
      { status: 500 }
    )
  }
}

// GET: Check video status
export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get('id')

  if (!videoId) {
    return NextResponse.json(
      { error: 'Video ID required' },
      { status: 400 }
    )
  }

  if (!HEYGEN_API_KEY) {
    return NextResponse.json(
      { error: 'HeyGen API key not configured' },
      { status: 500 }
    )
  }

  try {
    const statusResponse = await fetch(
      `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
      {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY
        }
      }
    )

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json()
      return NextResponse.json(
        { error: 'Failed to get video status', details: errorData },
        { status: statusResponse.status }
      )
    }

    const statusData = await statusResponse.json()

    return NextResponse.json({
      status: statusData.data?.status,
      videoUrl: statusData.data?.video_url,
      thumbnailUrl: statusData.data?.thumbnail_url,
      duration: statusData.data?.duration
    })

  } catch (error) {
    console.error('HeyGen status error:', error)
    return NextResponse.json(
      { error: 'Failed to check video status', details: String(error) },
      { status: 500 }
    )
  }
}
