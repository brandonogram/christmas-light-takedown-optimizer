'use client'

import { useState, useEffect } from 'react'
import {
  Settings,
  Link2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Video,
  Sparkles,
  Download
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ConnectionStatus {
  connected: boolean
  lastSync: string | null
  expiresAt: string | null
}

export default function SettingsPage() {
  const [jobberStatus, setJobberStatus] = useState<ConnectionStatus>({
    connected: false,
    lastSync: null,
    expiresAt: null
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [generatingVideo, setGeneratingVideo] = useState(false)
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    checkConnections()
  }, [])

  async function checkConnections() {
    try {
      // Check Jobber connection
      const { data: connection } = await supabase
        .from('jobber_connections')
        .select('*')
        .limit(1)
        .single()

      if (connection) {
        setJobberStatus({
          connected: true,
          lastSync: connection.updated_at,
          expiresAt: connection.expires_at
        })
      }

      // Load company info
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .limit(1)
        .single()

      if (company) {
        // Parse storage_addresses if it exists
        const addressData = company.storage_addresses as { primary?: string } | null
        setCompanyInfo({
          name: company.name || '',
          email: company.email || '',
          phone: company.phone || '',
          address: addressData?.primary || ''
        })
      }
    } catch (error) {
      console.error('Error checking connections:', error)
    } finally {
      setLoading(false)
    }
  }

  async function syncJobberData() {
    setSyncing(true)
    try {
      const response = await fetch('/api/jobber/sync', { method: 'POST' })
      if (response.ok) {
        await checkConnections()
      }
    } catch (error) {
      console.error('Error syncing:', error)
    } finally {
      setSyncing(false)
    }
  }

  async function disconnectJobber() {
    try {
      await supabase.from('jobber_connections').delete().neq('id', '')
      setJobberStatus({
        connected: false,
        lastSync: null,
        expiresAt: null
      })
    } catch (error) {
      console.error('Error disconnecting:', error)
    }
  }

  async function generateHeyGenVideo() {
    setGeneratingVideo(true)
    try {
      const response = await fetch('/api/heygen', { method: 'POST' })
      if (response.ok) {
        const data = await response.json()
        // Handle video URL
        console.log('Video generated:', data)
      }
    } catch (error) {
      console.error('Error generating video:', error)
    } finally {
      setGeneratingVideo(false)
    }
  }

  async function updateCompanyInfo() {
    try {
      await supabase
        .from('companies')
        .update({
          name: companyInfo.name,
          email: companyInfo.email,
          phone: companyInfo.phone,
          storage_addresses: { primary: companyInfo.address },
        })
        .neq('id', '')
    } catch (error) {
      console.error('Error updating company:', error)
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
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-600 mt-1">Manage your connections and preferences</p>
      </div>

      {/* Jobber Integration */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Link2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Jobber Integration</h2>
              <p className="text-sm text-zinc-500">Sync customers and jobs from Jobber</p>
            </div>
          </div>
          {jobberStatus.connected ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-zinc-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Not Connected</span>
            </div>
          )}
        </div>

        {jobberStatus.connected ? (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-xl">
              <div>
                <p className="text-sm text-zinc-500">Last Synced</p>
                <p className="font-medium text-zinc-900">
                  {jobberStatus.lastSync
                    ? new Date(jobberStatus.lastSync).toLocaleString()
                    : 'Never'}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Token Expires</p>
                <p className="font-medium text-zinc-900">
                  {jobberStatus.expiresAt
                    ? new Date(jobberStatus.expiresAt).toLocaleString()
                    : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={syncJobberData}
                disabled={syncing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-100 text-zinc-700 rounded-xl font-medium hover:bg-zinc-200 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </button>
              <button
                onClick={disconnectJobber}
                className="flex items-center justify-center gap-2 py-2.5 px-4 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition"
              >
                <Trash2 className="w-5 h-5" />
                Disconnect
              </button>
            </div>
          </div>
        ) : (
          <a
            href="/api/auth/jobber"
            className="flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
          >
            <ExternalLink className="w-5 h-5" />
            Connect to Jobber
          </a>
        )}
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Company Information</h2>
            <p className="text-sm text-zinc-500">Your business details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={companyInfo.name}
                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="tel"
                  value={companyInfo.phone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <button
            onClick={updateCompanyInfo}
            className="w-full py-2.5 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-800 transition"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Video Generation */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-green-500 rounded-xl flex items-center justify-center">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Marketing Videos</h2>
            <p className="text-sm text-zinc-500">Generate AI videos for your landing page</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-zinc-900">HeyGen Avatar</span>
            </div>
            <p className="text-sm text-zinc-500 mb-3">Generate a video of Brandon explaining the app</p>
            <button
              onClick={generateHeyGenVideo}
              disabled={generatingVideo}
              className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition disabled:opacity-50"
            >
              {generatingVideo ? 'Generating...' : 'Generate Video'}
            </button>
          </div>

          <div className="p-4 bg-zinc-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <Video className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-zinc-900">Gemini Background</span>
            </div>
            <p className="text-sm text-zinc-500 mb-3">Generate a 10-second festive background video</p>
            <button
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Generate Video
            </button>
          </div>
        </div>
      </div>

      {/* Data Export */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Data Export</h2>
            <p className="text-sm text-zinc-500">Download your data</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <button className="py-2.5 px-4 border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition text-sm">
            Export Jobs
          </button>
          <button className="py-2.5 px-4 border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition text-sm">
            Export Routes
          </button>
          <button className="py-2.5 px-4 border border-zinc-200 text-zinc-700 rounded-xl font-medium hover:bg-zinc-50 transition text-sm">
            Export Reports
          </button>
        </div>
      </div>
    </div>
  )
}
