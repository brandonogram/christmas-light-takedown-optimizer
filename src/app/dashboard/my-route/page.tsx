'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Navigation,
  MapPin,
  Phone,
  CheckCircle2,
  ChevronRight,
  Route
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Job, Route as RouteType } from '@/lib/supabase'

interface RouteJob extends Job {
  isCompleted: boolean
  isCurrent: boolean
}

function MyRouteContent() {
  const searchParams = useSearchParams()
  const routeId = searchParams.get('route')

  const [route, setRoute] = useState<RouteType | null>(null)
  const [jobs, setJobs] = useState<RouteJob[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [, setIsNavigating] = useState(false)

  useEffect(() => {
    loadTodayRoute()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId])

  async function loadTodayRoute() {
    try {
      let routeData: RouteType | null = null

      if (routeId) {
        // Load specific route
        const { data } = await supabase
          .from('routes')
          .select('*')
          .eq('id', routeId)
          .single()
        routeData = data
      } else {
        // Load today's route
        const today = new Date().toISOString().split('T')[0]
        const { data } = await supabase
          .from('routes')
          .select('*')
          .eq('date', today)
          .in('status', ['planned', 'in_progress'])
          .single()
        routeData = data
      }

      if (routeData) {
        setRoute(routeData)

        // Load jobs in route order
        const jobIds = routeData.job_ids || []
        if (jobIds.length > 0) {
          const { data: jobsData } = await supabase
            .from('jobs')
            .select('*')
            .in('id', jobIds)

          if (jobsData) {
            // Sort jobs by route order
            const orderedJobs = jobIds.map(id => jobsData.find(j => j.id === id)).filter(Boolean) as Job[]

            // Find current job (first non-completed)
            let currentIdx = orderedJobs.findIndex(j => j.status !== 'completed')
            if (currentIdx === -1) currentIdx = orderedJobs.length - 1

            setCurrentIndex(currentIdx)
            setJobs(orderedJobs.map((job, idx) => ({
              ...job,
              isCompleted: job.status === 'completed',
              isCurrent: idx === currentIdx
            })))
          }
        }
      }
    } catch (error) {
      console.error('Error loading route:', error)
    } finally {
      setLoading(false)
    }
  }

  async function markJobComplete(jobId: string) {
    try {
      await supabase
        .from('jobs')
        .update({ status: 'completed' })
        .eq('id', jobId)

      setJobs(jobs.map((job, idx) => {
        if (job.id === jobId) {
          return { ...job, isCompleted: true, isCurrent: false, status: 'completed' }
        }
        if (idx === currentIndex + 1) {
          return { ...job, isCurrent: true }
        }
        return job
      }))

      setCurrentIndex(prev => Math.min(prev + 1, jobs.length - 1))
    } catch (error) {
      console.error('Error completing job:', error)
    }
  }

  async function startNavigation(address: string) {
    setIsNavigating(true)
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.apple.com/?daddr=${encodedAddress}`, '_blank')

    // Update job status to en_route
    const currentJob = jobs[currentIndex]
    if (currentJob) {
      await supabase
        .from('jobs')
        .update({ status: 'en_route' })
        .eq('id', currentJob.id)
    }
  }

  function callCustomer(phone: string) {
    window.location.href = `tel:${phone}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
      </div>
    )
  }

  if (!route || jobs.length === 0) {
    return (
      <div className="p-4 lg:p-8">
        <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
          <Route className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-zinc-900 mb-1">No route assigned</h3>
          <p className="text-zinc-500 mb-4">
            {routeId ? 'This route has no jobs.' : 'No route scheduled for today.'}
          </p>
          <Link
            href="/dashboard/routes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <Route className="w-5 h-5" />
            View All Routes
          </Link>
        </div>
      </div>
    )
  }

  const completedCount = jobs.filter(j => j.isCompleted).length
  const currentJob = jobs[currentIndex]
  const progressPercent = Math.round((completedCount / jobs.length) * 100)

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">{route.date ? `Route for ${new Date(route.date).toLocaleDateString()}` : 'Today\'s Route'}</h1>
        <p className="text-zinc-600">{completedCount} of {jobs.length} stops completed</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-700">Route Progress</span>
          <span className="text-sm text-zinc-500">{progressPercent}%</span>
        </div>
        <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Current Stop Card */}
      {currentJob && !currentJob.isCompleted && (
        <div className="bg-gradient-to-br from-red-500 to-green-600 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="font-bold">{currentIndex + 1}</span>
            </div>
            <span className="text-white/80 text-sm font-medium">Current Stop</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">{currentJob.customer_name}</h2>
          <p className="text-white/90 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {currentJob.address}
            {currentJob.city && `, ${currentJob.city}`}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => startNavigation(currentJob.address)}
              className="flex items-center justify-center gap-2 py-3 bg-white text-zinc-900 rounded-xl font-semibold hover:bg-white/90 transition"
            >
              <Navigation className="w-5 h-5" />
              Navigate
            </button>
            {currentJob.customer_phone && (
              <button
                onClick={() => callCustomer(currentJob.customer_phone!)}
                className="flex items-center justify-center gap-2 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition"
              >
                <Phone className="w-5 h-5" />
                Call
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <Link
              href={`/dashboard/jobs/${currentJob.id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 text-white rounded-xl font-medium hover:bg-white/30 transition"
            >
              Job Details
              <ChevronRight className="w-5 h-5" />
            </Link>
            <button
              onClick={() => markJobComplete(currentJob.id)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-green-600 rounded-xl font-semibold hover:bg-white/90 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              Complete
            </button>
          </div>
        </div>
      )}

      {/* Route List */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h2 className="font-semibold text-zinc-900">All Stops</h2>
        </div>

        <div className="divide-y divide-zinc-100">
          {jobs.map((job, index) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className={`flex items-center gap-4 p-4 transition ${
                job.isCurrent ? 'bg-red-50' : job.isCompleted ? 'bg-green-50' : 'hover:bg-zinc-50'
              }`}
            >
              <div className="relative">
                {job.isCompleted ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                ) : job.isCurrent ? (
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="font-bold text-white text-sm">{index + 1}</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center">
                    <span className="font-medium text-zinc-600 text-sm">{index + 1}</span>
                  </div>
                )}
                {index < jobs.length - 1 && (
                  <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                    job.isCompleted ? 'bg-green-300' : 'bg-zinc-200'
                  }`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${
                  job.isCompleted ? 'text-green-700 line-through' : 'text-zinc-900'
                }`}>
                  {job.customer_name}
                </p>
                <p className="text-sm text-zinc-500 truncate">{job.address}</p>
              </div>

              {job.isCurrent && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                  Current
                </span>
              )}

              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </Link>
          ))}
        </div>
      </div>

      {/* All Completed Message */}
      {completedCount === jobs.length && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 mb-1">Route Complete!</h3>
          <p className="text-green-700">Great job! All {jobs.length} stops have been completed.</p>
        </div>
      )}
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
    </div>
  )
}

export default function MyRoutePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MyRouteContent />
    </Suspense>
  )
}
