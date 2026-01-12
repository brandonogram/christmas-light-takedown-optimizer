'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  Route,
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Trash2,
  Play
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Route as RouteType, Job } from '@/lib/supabase'

interface RouteWithJobs extends RouteType {
  jobs?: Job[]
}

export default function RoutesPage() {
  const [routes, setRoutes] = useState<RouteWithJobs[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoutes()
  }, [])

  async function loadRoutes() {
    try {
      const { data: routeData } = await supabase
        .from('routes')
        .select('*')
        .order('date', { ascending: false })

      if (routeData) {
        // Load jobs for each route
        const routesWithJobs = await Promise.all(
          routeData.map(async (route) => {
            const jobIds = route.job_ids || []
            if (jobIds.length > 0) {
              const { data: jobs } = await supabase
                .from('jobs')
                .select('*')
                .in('id', jobIds)
              return { ...route, jobs: jobs || [] }
            }
            return { ...route, jobs: [] }
          })
        )
        setRoutes(routesWithJobs)
      }
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteRoute(routeId: string) {
    try {
      await supabase.from('routes').delete().eq('id', routeId)
      setRoutes(routes.filter(r => r.id !== routeId))
    } catch (error) {
      console.error('Error deleting route:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'planned': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-zinc-100 text-zinc-700'
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
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Routes</h1>
          <p className="text-zinc-600 mt-1">Plan and manage daily routes</p>
        </div>
        <Link
          href="/dashboard/routes/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New Route</span>
        </Link>
      </div>

      {/* Routes List */}
      {routes.length > 0 ? (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-2xl border border-zinc-200 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <Route className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-zinc-900">
                          {`Route for ${new Date(route.date).toLocaleDateString()}`}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(route.status || 'planned')}`}>
                          {route.status || 'planned'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-zinc-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(route.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {route.jobs?.length || 0} stops
                        </span>
                        {route.total_estimated_time_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {Math.round(route.total_estimated_time_minutes / 60)}h
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Route Jobs Preview */}
                {route.jobs && route.jobs.length > 0 && (
                  <div className="border-t border-zinc-100 pt-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
                      <Users className="w-4 h-4" />
                      <span>Assigned: {route.crew_id ? 'Crew assigned' : 'Unassigned'}</span>
                    </div>
                    <div className="space-y-2">
                      {route.jobs.slice(0, 3).map((job, index) => (
                        <div key={job.id} className="flex items-center gap-3 text-sm">
                          <span className="w-6 h-6 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-medium">
                            {index + 1}
                          </span>
                          <span className="text-zinc-700">{job.customer_name}</span>
                          <span className="text-zinc-400 truncate flex-1">{job.address}</span>
                        </div>
                      ))}
                      {route.jobs.length > 3 && (
                        <p className="text-sm text-zinc-500 pl-9">
                          +{route.jobs.length - 3} more stops
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-100">
                  <Link
                    href={`/dashboard/routes/${route.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 transition"
                  >
                    Edit Route
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/my-route?route=${route.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition"
                  >
                    <Play className="w-4 h-4" />
                    Start Route
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
          <Route className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-zinc-900 mb-1">No routes yet</h3>
          <p className="text-zinc-500 mb-4">Create your first route to optimize your takedown schedule</p>
          <Link
            href="/dashboard/routes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <Plus className="w-5 h-5" />
            Create Route
          </Link>
        </div>
      )}
    </div>
  )
}
