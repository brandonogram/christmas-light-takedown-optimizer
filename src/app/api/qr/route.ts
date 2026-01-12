import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createServerClient } from '@/lib/supabase'

// QR Code generation for storage labels
// Each QR code links to the job's inventory for the following year

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, customerName, inventoryItems } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Get job details if not provided
    let customer = customerName
    let items = inventoryItems

    if (!customer || !items) {
      const { data: job } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (job) {
        customer = customer || job.customer_name
      }

      if (!items) {
        const { data: inventory } = await supabase
          .from('job_inventory')
          .select('*')
          .eq('job_id', jobId)

        items = inventory || []
      }
    }

    // Create QR code data - links to job inventory page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://christmas-light-takedown-optimizer.vercel.app'
    const qrData = `${baseUrl}/dashboard/jobs/${jobId}?year=${new Date().getFullYear()}`

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#18181b', // zinc-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })

    // Generate printable label HTML
    const labelHtml = generateLabelHtml(customer, items, qrCodeDataUrl, jobId)

    return NextResponse.json({
      success: true,
      qrCodeDataUrl,
      qrData,
      labelHtml,
      customerName: customer,
      inventoryCount: items.length,
    })

  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code', details: String(error) },
      { status: 500 }
    )
  }
}

function generateLabelHtml(
  customerName: string,
  inventoryItems: Array<{ item_type: string; quantity: number; description?: string }>,
  qrCodeDataUrl: string,
  jobId: string
): string {
  const year = new Date().getFullYear()
  const itemsList = inventoryItems
    .map(item => `<li>${item.quantity}x ${item.item_type}${item.description ? ` - ${item.description}` : ''}</li>`)
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Storage Label - ${customerName}</title>
  <style>
    @page {
      size: 4in 6in;
      margin: 0.25in;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0.5in;
      box-sizing: border-box;
    }
    .label {
      border: 2px solid #18181b;
      border-radius: 12px;
      padding: 16px;
      max-width: 3.5in;
      margin: 0 auto;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e4e4e7;
    }
    .logo {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ef4444, #22c55e);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    .title {
      font-size: 14px;
      font-weight: bold;
      color: #18181b;
    }
    .subtitle {
      font-size: 10px;
      color: #71717a;
    }
    .customer {
      font-size: 18px;
      font-weight: bold;
      color: #18181b;
      margin-bottom: 8px;
    }
    .year {
      font-size: 12px;
      color: #ef4444;
      font-weight: 600;
      margin-bottom: 12px;
    }
    .qr-container {
      text-align: center;
      margin: 16px 0;
    }
    .qr-container img {
      width: 120px;
      height: 120px;
    }
    .scan-text {
      font-size: 10px;
      color: #71717a;
      text-align: center;
      margin-top: 4px;
    }
    .inventory {
      margin-top: 12px;
    }
    .inventory-title {
      font-size: 11px;
      font-weight: 600;
      color: #71717a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .inventory ul {
      margin: 0;
      padding-left: 16px;
      font-size: 11px;
      color: #3f3f46;
    }
    .inventory li {
      margin-bottom: 2px;
    }
    .footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e4e4e7;
      font-size: 9px;
      color: #a1a1aa;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="label">
    <div class="header">
      <div class="logo">TP</div>
      <div>
        <div class="title">TakedownPro</div>
        <div class="subtitle">Christmas Light Storage</div>
      </div>
    </div>

    <div class="customer">${customerName}</div>
    <div class="year">Takedown Season ${year}</div>

    <div class="qr-container">
      <img src="${qrCodeDataUrl}" alt="QR Code" />
      <div class="scan-text">Scan to view inventory</div>
    </div>

    <div class="inventory">
      <div class="inventory-title">Contents</div>
      <ul>
        ${itemsList || '<li>See QR code for full inventory</li>'}
      </ul>
    </div>

    <div class="footer">
      Job ID: ${jobId.substring(0, 8)} | Generated ${new Date().toLocaleDateString()}
    </div>
  </div>
</body>
</html>
  `.trim()
}

// GET: Generate QR code for a specific job
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('job_id')
  const format = request.nextUrl.searchParams.get('format') || 'dataurl' // 'dataurl' or 'svg'

  if (!jobId) {
    return NextResponse.json(
      { error: 'job_id is required' },
      { status: 400 }
    )
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://christmas-light-takedown-optimizer.vercel.app'
    const qrData = `${baseUrl}/dashboard/jobs/${jobId}`

    if (format === 'svg') {
      const svg = await QRCode.toString(qrData, {
        type: 'svg',
        width: 200,
        margin: 2,
        color: {
          dark: '#18181b',
          light: '#ffffff',
        },
      })

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
        },
      })
    }

    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#18181b',
        light: '#ffffff',
      },
    })

    return NextResponse.json({
      qrCodeDataUrl: dataUrl,
      qrData,
    })

  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    )
  }
}
