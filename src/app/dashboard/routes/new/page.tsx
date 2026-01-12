'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  GripVertical,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Navigation,
  Sparkles,
  Save,
  Users
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Job, Crew } from '@/lib/supabase'

export default function NewRoutePage() {
  const router = useRouter()
  const [availableJobs, setAvailableJobs] = useState<Job[]>([])
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([])
  const [crews, setCrews] = useState<Crew[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [optimizing, setOptimizing] = useState(false)

  const [routeDate, setRouteDate] = useState(new Date().toISOString().split('T')[0])
  const [routeName, setRouteName] = useState('')
  const [selectedCrew, setSelectedCrew] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [jobsRes, crewsRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('*')
          .in('status', ['scheduled', 'pending'])
          .order('scheduled_date', { ascending: true }),
        supabase.from('crews').select('*')
      ])

      if (jobsRes.data) setAvailableJobs(jobsRes.data)
      if (crewsRes.data) setCrews(crewsRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  function addJob(job: Job) {
    setSelectedJobs([...selectedJobs, job])
    setAvailableJobs(availableJobs.filter(j => j.id !== job.id))
  }

  function removeJob(job: Job) {
    setAvailableJobs([...availableJobs, job])
    setSelectedJobs(selectedJobs.filter(j => j.id !== job.id))
  }

  function moveJob(fromIndex: number, toIndex: number) {
    const newJobs = [...selectedJobs]
    const [movedJob] = newJobs.splice(fromIndex, 1)
    newJobs.splice(toIndex, 0, movedJob)
    setSelectedJobs(newJobs)
  }

  async function optimizeRoute() {
    if (selectedJobs.length < 2) return

    setOptimizing(true)

    // Simple distance-based optimization using a greedy nearest-neighbor approach
    // In production, this would use Google Maps Distance Matrix API or similar
    try {
      // For now, just shuffle to simulate optimization
      // TODO: Implement actual route optimization with Google Maps API
      const optimized = [...selectedJobs]

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Sort by city/zip as a simple optimization proxy
      optimized.sort((a, b) => {
        if (a.zip && b.zip) {
          return a.zip.localeCompare(b.zip)
        }
        return 0
      })

      setSelectedJobs(optimized)
    } catch (error) {
      console.error('Error optimizing route:', error)
    } finally {
      setOptimizing(false)
    }
  }

  async function saveRoute() {
    if (selectedJobs.length === 0) return

    setSaving(true)
    try {
      // Calculate estimated duration (30 min per job + 15 min travel between)
      const estimatedDuration = selectedJobs.length * 30 + (selectedJobs.length - 1) * 15

      const { data, error } = await supabase
        .from('routes')
        .insert({
          date: routeDate,
          crew_id: selectedCrew || null,
          job_ids: selectedJobs.map(j => j.id),
          status: 'planned',
          total_estimated_time_minutes: estimatedDuration,
        })
        .select()
        .single()

      if (error) throw error

      // Update jobs with scheduled date
      await supabase
        .from('jobs')
        .update({ scheduled_date: routeDate, status: 'scheduled' })
        .in('id', selectedJobs.map(j => j.id))

      router.push('/dashboard/routes')
    } catch (error) {
      console.error('Error saving route:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-zinc-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl lg:text-2xl font-bold text-zinc-900">Build New Route</h1>
          <p className="text-sm text-zinc-500">Add jobs and optimize the route order</p>
        </div>
      </div>

      {/* Route Settings */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Route Details</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Route Name</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g., North Side Route"
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="date"
                value={routeDate}
                onChange={(e) => setRouteDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Assign Crew</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <select
                value={selectedCrew}
                onChange={(e) => setSelectedCrew(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none bg-white"
              >
                <option value="">Unassigned</option>
                {crews.map(crew => (
                  <option key={crew.id} value={crew.id}>{crew.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Available Jobs */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">Available Jobs</h2>
            <span className="text-sm text-zinc-500">{availableJobs.length} jobs</span>
          </div>

          {availableJobs.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {availableJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 truncate">{job.customer_name}</p>
                    <p className="text-sm text-zinc-500 truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {job.address}
                    </p>
                  </div>
                  <button
                    onClick={() => addJob(job)}
                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">All jobs have been added to the route</p>
            </div>
          )}
        </div>

        {/* Selected Jobs (Route Order) */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">Route Order</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-500">{selectedJobs.length} stops</span>
              {selectedJobs.length >= 2 && (
                <button
                  onClick={optimizeRoute}
                  disabled={optimizing}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-green-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
                >
                  <Sparkles className={`w-4 h-4 ${optimizing ? 'animate-spin' : ''}`} />
                  {optimizing ? 'Optimizing...' : 'Optimize'}
                </button>
              )}
            </div>
          </div>

          {selectedJobs.length > 0 ? (
            <>
              <div className="space-y-2 max-h-[400px] overflow-y-auto mb-4">
                {selectedJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl group"
                  >
                    <div className="flex items-center gap-2">
                      <button className="cursor-grab text-zinc-400 hover:text-zinc-600">
                        <GripVertical className="w-5 h-5" />
                      </button>
                      <span className="w-7 h-7 bg-zinc-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 truncate">{job.customer_name}</p>
                      <p className="text-sm text-zinc-500 truncate">{job.address}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      {index > 0 && (
                        <button
                          onClick={() => moveJob(index, index - 1)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded"
                        >
                          ↑
                        </button>
                      )}
                      {index < selectedJobs.length - 1 && (
                        <button
                          onClick={() => moveJob(index, index + 1)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded"
                        >
                          ↓
                        </button>
                      )}
                      <button
                        onClick={() => removeJob(job)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Route Summary */}
              <div className="border-t border-zinc-200 pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-zinc-500">Estimated Time:</span>
                  <span className="font-medium text-zinc-900 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.round((selectedJobs.length * 30 + (selectedJobs.length - 1) * 15) / 60)}h {(selectedJobs.length * 30 + (selectedJobs.length - 1) * 15) % 60}m
                  </span>
                </div>
                <button
                  onClick={saveRoute}
                  disabled={saving || selectedJobs.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Route'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Navigation className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500 mb-2">No jobs in route yet</p>
              <p className="text-sm text-zinc-400">Click the + button to add jobs</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
