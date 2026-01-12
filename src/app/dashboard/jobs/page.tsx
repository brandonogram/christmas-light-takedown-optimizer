'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  MapPin,
  Phone,
  ChevronRight,
  RefreshCw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/lib/supabase'

const statusFilters = ['all', 'scheduled', 'in_progress', 'completed', 'pending']

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    loadJobs()
  }, [])

  async function loadJobs() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .order('scheduled_date', { ascending: true })

      if (data) {
        setJobs(data)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchQuery === '' ||
      job.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      job.status === statusFilter ||
      (statusFilter === 'in_progress' && ['en_route', 'on_site', 'in_progress'].includes(job.status))

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'on_site': return 'bg-yellow-100 text-yellow-700'
      case 'en_route': return 'bg-purple-100 text-purple-700'
      case 'scheduled': return 'bg-zinc-100 text-zinc-700'
      case 'pending': return 'bg-orange-100 text-orange-700'
      default: return 'bg-zinc-100 text-zinc-700'
    }
  }

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid': return 'text-green-600'
      case 'partial': return 'text-yellow-600'
      case 'unpaid': return 'text-red-600'
      default: return 'text-zinc-400'
    }
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Jobs</h1>
          <p className="text-zinc-600 mt-1">{filteredJobs.length} takedown jobs</p>
        </div>
        <button
          onClick={loadJobs}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Sync</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            <Filter className="w-5 h-5 text-zinc-400 flex-shrink-0" />
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  statusFilter === status
                    ? 'bg-zinc-900 text-white'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/dashboard/jobs/${job.id}`}
              className="block bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-zinc-900 truncate">{job.customer_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-zinc-500 mb-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{job.address}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {job.customer_phone && (
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Phone className="w-4 h-4" />
                        {job.customer_phone}
                      </span>
                    )}
                    {job.scheduled_date && (
                      <span className="text-zinc-500">
                        {new Date(job.scheduled_date).toLocaleDateString()}
                      </span>
                    )}
                    <span className={`font-medium ${getPaymentStatusColor(job.payment_status)}`}>
                      {job.payment_status || 'Unknown'}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-zinc-400 flex-shrink-0 ml-4" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
          <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-zinc-900 mb-1">No jobs found</h3>
          <p className="text-zinc-500">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Connect your Jobber account to sync jobs'}
          </p>
        </div>
      )}
    </div>
  )
}
