'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Truck,
  TrendingUp,
  Calendar,
  ChevronRight,
  MapPin,
  Users
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Job, Crew } from '@/lib/supabase'

interface DashboardStats {
  total: number
  completed: number
  inProgress: number
  scheduled: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    completed: 0,
    inProgress: 0,
    scheduled: 0
  })
  const [todayJobs, setTodayJobs] = useState<Job[]>([])
  const [crews, setCrews] = useState<Crew[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // Get all jobs
        const { data: jobs } = await supabase.from('jobs').select('*')

        if (jobs) {
          setStats({
            total: jobs.length,
            completed: jobs.filter(j => j.status === 'completed').length,
            inProgress: jobs.filter(j => ['en_route', 'on_site', 'in_progress'].includes(j.status)).length,
            scheduled: jobs.filter(j => j.status === 'scheduled').length
          })

          // Get today's jobs
          const today = new Date().toISOString().split('T')[0]
          setTodayJobs(jobs.filter(j => j.scheduled_date === today).slice(0, 5))
        }

        // Get crews
        const { data: crewData } = await supabase.from('crews').select('*')
        if (crewData) {
          setCrews(crewData)
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const progressPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const statCards = [
    { label: 'Total Jobs', value: stats.total, icon: ClipboardList, color: 'bg-blue-500' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'bg-green-500' },
    { label: 'In Progress', value: stats.inProgress, icon: Truck, color: 'bg-yellow-500' },
    { label: 'Scheduled', value: stats.scheduled, icon: Clock, color: 'bg-purple-500' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'on_site': return 'bg-yellow-100 text-yellow-700'
      case 'en_route': return 'bg-purple-100 text-purple-700'
      case 'scheduled': return 'bg-zinc-100 text-zinc-700'
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
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-zinc-600 mt-1">Welcome back! Here&apos;s your takedown season overview.</p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Season Progress</h2>
            <p className="text-sm text-zinc-500">{stats.completed} of {stats.total} jobs completed</p>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-zinc-900">{progressPercentage}%</span>
          </div>
        </div>
        <div className="h-4 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full gradient-festive rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-zinc-200 p-4">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            <p className="text-sm text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Jobs */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900">Today&apos;s Schedule</h2>
            </div>
            <Link
              href="/dashboard/jobs"
              className="text-sm text-red-600 font-medium hover:text-red-700 flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {todayJobs.length > 0 ? (
            <div className="space-y-3">
              {todayJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/dashboard/jobs/${job.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center group-hover:bg-zinc-200 transition">
                      <MapPin className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">{job.customer_name}</p>
                      <p className="text-sm text-zinc-500 truncate max-w-[200px]">{job.address}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">No jobs scheduled for today</p>
              <Link
                href="/dashboard/routes"
                className="text-sm text-red-600 font-medium hover:text-red-700 mt-2 inline-block"
              >
                Build a route →
              </Link>
            </div>
          )}
        </div>

        {/* Crews */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900">Crews</h2>
            </div>
            <Link
              href="/dashboard/crews"
              className="text-sm text-red-600 font-medium hover:text-red-700 flex items-center gap-1"
            >
              Manage
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {crews.length > 0 ? (
            <div className="space-y-3">
              {crews.map((crew) => {
                const members = Array.isArray(crew.member_names) ? crew.member_names : []
                return (
                  <div
                    key={crew.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-900">{crew.name}</p>
                        <p className="text-sm text-zinc-500">{members.length} members</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Active
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <p className="text-zinc-500">No crews set up yet</p>
              <Link
                href="/dashboard/crews"
                className="text-sm text-red-600 font-medium hover:text-red-700 mt-2 inline-block"
              >
                Add a crew →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-red-600 to-green-600 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/dashboard/routes/new"
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition"
          >
            <Calendar className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Build Route</span>
          </Link>
          <Link
            href="/dashboard/jobs"
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition"
          >
            <ClipboardList className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Jobs</span>
          </Link>
          <Link
            href="/dashboard/crews"
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition"
          >
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Manage Crews</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition"
          >
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm font-medium">View Reports</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
