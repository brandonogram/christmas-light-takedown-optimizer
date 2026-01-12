import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Inventory management API for job items

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { job_id, items } = body

    if (!job_id || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'job_id and items array are required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Validate and format items
    const formattedItems = items.map(item => ({
      job_id,
      item_type: item.item_type || item.type,
      quantity: item.quantity || 1,
      description: item.description || null,
      location: item.location || null,
      checked_off: item.checked_off || false,
    }))

    // Insert items
    const { data: insertedItems, error } = await supabase
      .from('job_inventory')
      .insert(formattedItems)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      items: insertedItems,
      count: insertedItems.length,
    })

  } catch (error) {
    console.error('Inventory create error:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory items', details: String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('job_id')

    if (!jobId) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { data: items, error } = await supabase
      .from('job_inventory')
      .select('*')
      .eq('job_id', jobId)
      .order('item_type', { ascending: true })

    if (error) {
      throw error
    }

    // Calculate summary
    const summary = {
      total: items.length,
      checked: items.filter(i => i.checked_off).length,
      unchecked: items.filter(i => !i.checked_off).length,
      byType: items.reduce((acc, item) => {
        acc[item.item_type] = (acc[item.item_type] || 0) + (item.quantity || 1)
        return acc
      }, {} as Record<string, number>),
    }

    return NextResponse.json({
      items,
      summary,
    })

  } catch (error) {
    console.error('Inventory fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, checked_off, quantity, description, location } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const updateData: Record<string, unknown> = {}
    if (typeof checked_off === 'boolean') updateData.checked_off = checked_off
    if (typeof quantity === 'number') updateData.quantity = quantity
    if (description !== undefined) updateData.description = description
    if (location !== undefined) updateData.location = location

    const { data: updatedItem, error } = await supabase
      .from('job_inventory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
    })

  } catch (error) {
    console.error('Inventory update error:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory item', details: String(error) },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    const { error } = await supabase
      .from('job_inventory')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Item deleted',
    })

  } catch (error) {
    console.error('Inventory delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete inventory item' },
      { status: 500 }
    )
  }
}
