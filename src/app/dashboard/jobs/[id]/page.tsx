'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Camera,
  CheckSquare,
  QrCode,
  FileText,
  AlertCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Job, JobInventory, JobPhoto } from '@/lib/supabase'

const statusOptions = [
  { value: 'en_route', label: 'En Route', color: 'bg-purple-500' },
  { value: 'on_site', label: 'On Site', color: 'bg-yellow-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
]

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [inventory, setInventory] = useState<JobInventory[]>([])
  const [photos, setPhotos] = useState<JobPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadJobData()
  }, [id])

  async function loadJobData() {
    try {
      const [jobRes, invRes, photoRes] = await Promise.all([
        supabase.from('jobs').select('*').eq('id', id).single(),
        supabase.from('job_inventory').select('*').eq('job_id', id),
        supabase.from('job_photos').select('*').eq('job_id', id),
      ])

      if (jobRes.data) setJob(jobRes.data)
      if (invRes.data) setInventory(invRes.data)
      if (photoRes.data) setPhotos(photoRes.data)
    } catch (error) {
      console.error('Error loading job:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(newStatus: string) {
    if (!job) return

    setUpdating(true)
    try {
      // Update job status
      await supabase
        .from('jobs')
        .update({ status: newStatus })
        .eq('id', job.id)

      // Log status update
      await supabase.from('status_updates').insert({
        job_id: job.id,
        status: newStatus,
        previous_status: job.status,
      })

      setJob({ ...job, status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  async function toggleInventoryItem(itemId: string, checked: boolean) {
    try {
      await supabase
        .from('job_inventory')
        .update({ checked_off: checked })
        .eq('id', itemId)

      setInventory(inventory.map(item =>
        item.id === itemId ? { ...item, checked_off: checked } : item
      ))
    } catch (error) {
      console.error('Error updating inventory:', error)
    }
  }

  function openMaps() {
    if (!job) return
    const address = encodeURIComponent(job.address)
    // Try Apple Maps on iOS, fallback to Google Maps
    window.open(`https://maps.apple.com/?daddr=${address}`, '_blank')
  }

  function callCustomer() {
    if (!job?.customer_phone) return
    window.location.href = `tel:${job.customer_phone}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="p-4 lg:p-8 text-center">
        <AlertCircle className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
        <h2 className="text-lg font-medium text-zinc-900">Job not found</h2>
        <Link href="/dashboard/jobs" className="text-red-600 hover:text-red-700 mt-2 inline-block">
          ← Back to jobs
        </Link>
      </div>
    )
  }

  const completedItems = inventory.filter(i => i.checked_off).length
  const totalItems = inventory.length

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-zinc-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-zinc-900">{job.customer_name}</h1>
          <p className="text-sm text-zinc-500">Takedown Job</p>
        </div>
      </div>

      {/* Status Buttons */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 mb-6">
        <h2 className="text-sm font-medium text-zinc-500 mb-3">Update Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => updateStatus(status.value)}
              disabled={updating}
              className={`py-3 px-4 rounded-xl font-medium text-sm transition ${
                job.status === status.value
                  ? `${status.color} text-white`
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Customer Information</h2>

        <div className="space-y-4">
          <button
            onClick={openMaps}
            className="w-full flex items-center gap-3 p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition text-left"
          >
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-zinc-900">{job.address}</p>
              {job.city && <p className="text-sm text-zinc-500">{job.city}, {job.state} {job.zip}</p>}
            </div>
            <Navigation className="w-5 h-5 text-zinc-400" />
          </button>

          {job.customer_phone && (
            <button
              onClick={callCustomer}
              className="w-full flex items-center gap-3 p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition text-left"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900">{job.customer_phone}</p>
                <p className="text-sm text-zinc-500">Tap to call</p>
              </div>
            </button>
          )}

          {job.customer_email && (
            <a
              href={`mailto:${job.customer_email}`}
              className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-zinc-900">{job.customer_email}</p>
                <p className="text-sm text-zinc-500">Tap to email</p>
              </div>
            </a>
          )}

          {job.scheduled_date && (
            <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  {new Date(job.scheduled_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {job.scheduled_time_start && (
                  <p className="text-sm text-zinc-500">{job.scheduled_time_start} - {job.scheduled_time_end}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {(job.notes || job.property_access_notes) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes
          </h2>
          {job.notes && <p className="text-yellow-800 mb-2">{job.notes}</p>}
          {job.property_access_notes && (
            <div className="mt-3 pt-3 border-t border-yellow-200">
              <p className="text-sm font-medium text-yellow-900">Access Notes:</p>
              <p className="text-yellow-800">{job.property_access_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Inventory Checklist */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            Inventory Checklist
          </h2>
          <span className="text-sm text-zinc-500">
            {completedItems}/{totalItems} checked
          </span>
        </div>

        {inventory.length > 0 ? (
          <div className="space-y-2">
            {inventory.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                  item.checked_off ? 'bg-green-50' : 'bg-zinc-50 hover:bg-zinc-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.checked_off || false}
                  onChange={(e) => toggleInventoryItem(item.id, e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-green-600 focus:ring-green-500"
                />
                <div className="flex-1">
                  <p className={`font-medium ${item.checked_off ? 'text-green-700 line-through' : 'text-zinc-900'}`}>
                    {item.item_type}
                  </p>
                  {item.description && (
                    <p className="text-sm text-zinc-500">{item.description}</p>
                  )}
                </div>
                <span className="text-sm text-zinc-500">×{item.quantity}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-4">No inventory items recorded</p>
        )}
      </div>

      {/* Photos */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Photos
          </h2>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition text-sm font-medium">
            <Camera className="w-4 h-4" />
            Add Photo
          </button>
        </div>

        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="aspect-square bg-zinc-100 rounded-xl overflow-hidden relative">
                <img
                  src={photo.photo_url}
                  alt={photo.photo_type}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded-lg">
                  {photo.photo_type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-zinc-500 py-4">No photos yet</p>
        )}
      </div>

      {/* QR Label */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5" />
          Storage Label
        </h2>
        <button className="w-full py-3 px-4 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Generate QR Label
        </button>
      </div>
    </div>
  )
}
