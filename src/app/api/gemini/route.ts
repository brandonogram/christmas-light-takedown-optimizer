import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// Gemini API for video generation (using Veo or image-to-video)
// Note: As of early 2024, Gemini's video generation (Veo) may have limited availability
// This implementation provides a fallback approach

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    )
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

    // Request body can include custom prompts
    const body = await request.json().catch(() => ({}))
    const customPrompt = body.prompt || ''

    // Default video generation prompt for festive Christmas lights theme
    const videoPrompt = customPrompt || `
      Create a mesmerizing 10-second cinematic video of Christmas lights being professionally taken down.

      Scene elements:
      - Beautiful two-story home at dusk
      - Professional crew on ladders carefully removing string lights
      - Warm golden hour lighting
      - Gentle snowfall in the background
      - Close-up shots of lights being coiled and organized
      - Satisfied homeowner watching from the driveway

      Visual style:
      - Cinematic color grading with warm tones
      - Smooth camera movements
      - High production value
      - Festive but professional atmosphere

      The video should feel professional, efficient, and convey quality service.
    `.trim()

    // Try Veo video generation (may have limited availability)
    // Fallback: Generate a detailed image that could be used as a video thumbnail/placeholder

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Generate a creative description that could guide video creation
    const result = await model.generateContent([
      {
        text: `As a professional video director, create a detailed shot-by-shot breakdown for this video concept:

${videoPrompt}

Format your response as a JSON array of shots, each with:
- shot_number (1-10)
- duration_seconds (total should equal 10)
- camera_angle (wide, medium, close-up, aerial)
- description (what's happening)
- mood (the emotional tone)
- transition (cut, fade, dissolve)`
      }
    ])

    const response = await result.response
    const text = response.text()

    // Try to parse the JSON from the response
    let shotBreakdown = []
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        shotBreakdown = JSON.parse(jsonMatch[0])
      }
    } catch {
      // If parsing fails, return the raw text
      console.log('Could not parse shot breakdown as JSON')
    }

    // In production, this would integrate with Veo API when available
    // For now, return the creative direction that could be used for video creation

    return NextResponse.json({
      success: true,
      message: 'Video concept generated successfully',
      videoPrompt,
      shotBreakdown,
      rawResponse: text,
      // Placeholder video URLs - in production these would be actual generated videos
      placeholderVideoUrl: '/videos/christmas-lights-takedown.mp4',
      note: 'Video generation via Gemini Veo requires additional API access. The shot breakdown above can be used for manual video creation or with other video generation services.'
    })

  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate video concept', details: String(error) },
      { status: 500 }
    )
  }
}

// GET: Generate a festive image for the landing page
export async function GET(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    )
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' })

    // Generate a description for an image that could be created with an image generation API
    const result = await model.generateContent([
      {
        text: `Create a detailed image prompt for a hero image for a Christmas light takedown service app.

        The image should:
        - Show a professional crew member on a ladder removing lights
        - Beautiful suburban home in the background
        - Late afternoon winter lighting
        - Snow-dusted lawn
        - Professional truck with company branding visible
        - Warm, inviting, and professional feeling

        Output a single, detailed paragraph suitable for AI image generation (DALL-E, Midjourney, etc.)`
      }
    ])

    const response = await result.response
    const imagePrompt = response.text()

    return NextResponse.json({
      success: true,
      imagePrompt,
      note: 'Use this prompt with an image generation API to create the hero image'
    })

  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image prompt', details: String(error) },
      { status: 500 }
    )
  }
}
