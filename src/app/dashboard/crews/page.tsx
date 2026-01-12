'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Phone,
  UserPlus,
  Check,
  X
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Crew } from '@/lib/supabase'

interface EditingCrew {
  id: string | null
  name: string
  members: string[]
}

export default function CrewsPage() {
  const [crews, setCrews] = useState<Crew[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editing, setEditing] = useState<EditingCrew | null>(null)
  const [newMember, setNewMember] = useState('')

  useEffect(() => {
    loadCrews()
  }, [])

  async function loadCrews() {
    try {
      const { data } = await supabase
        .from('crews')
        .select('*')
        .order('name', { ascending: true })

      if (data) {
        setCrews(data)
      }
    } catch (error) {
      console.error('Error loading crews:', error)
    } finally {
      setLoading(false)
    }
  }

  function startAddCrew() {
    setIsAdding(true)
    setEditing({
      id: null,
      name: '',
      members: []
    })
  }

  function startEditCrew(crew: Crew) {
    setEditing({
      id: crew.id,
      name: crew.name,
      members: Array.isArray(crew.member_names) ? (crew.member_names as string[]) : []
    })
  }

  function addMember() {
    if (!newMember.trim() || !editing) return
    setEditing({
      ...editing,
      members: [...editing.members, newMember.trim()]
    })
    setNewMember('')
  }

  function removeMember(index: number) {
    if (!editing) return
    const newMembers = [...editing.members]
    newMembers.splice(index, 1)
    setEditing({ ...editing, members: newMembers })
  }

  async function saveCrew() {
    if (!editing || !editing.name.trim()) return

    try {
      if (editing.id) {
        // Update existing crew
        const { error } = await supabase
          .from('crews')
          .update({
            name: editing.name,
            member_names: editing.members
          })
          .eq('id', editing.id)

        if (error) throw error

        setCrews(crews.map(c =>
          c.id === editing.id
            ? { ...c, name: editing.name, member_names: editing.members }
            : c
        ))
      } else {
        // Create new crew
        const { data, error } = await supabase
          .from('crews')
          .insert({
            name: editing.name,
            member_names: editing.members
          })
          .select()
          .single()

        if (error) throw error
        if (data) {
          setCrews([...crews, data])
        }
      }

      setEditing(null)
      setIsAdding(false)
    } catch (error) {
      console.error('Error saving crew:', error)
    }
  }

  async function deleteCrew(crewId: string) {
    try {
      const { error } = await supabase
        .from('crews')
        .delete()
        .eq('id', crewId)

      if (error) throw error

      setCrews(crews.filter(c => c.id !== crewId))
    } catch (error) {
      console.error('Error deleting crew:', error)
    }
  }

  function cancelEdit() {
    setEditing(null)
    setIsAdding(false)
    setNewMember('')
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900">Crews</h1>
          <p className="text-zinc-600 mt-1">Manage your takedown crews</p>
        </div>
        {!isAdding && (
          <button
            onClick={startAddCrew}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Crew</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editing) && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">
            {editing?.id ? 'Edit Crew' : 'New Crew'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Crew Name</label>
              <input
                type="text"
                value={editing?.name || ''}
                onChange={(e) => setEditing(editing ? { ...editing, name: e.target.value } : null)}
                placeholder="e.g., North Team"
                className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Team Members</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMember()}
                  placeholder="Add team member name"
                  className="flex-1 px-3 py-2.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={addMember}
                  disabled={!newMember.trim()}
                  className="px-4 py-2.5 bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>

              {editing && editing.members.length > 0 && (
                <div className="space-y-2">
                  {editing.members.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-medium text-sm">
                            {member.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-zinc-900">{member}</span>
                      </div>
                      <button
                        onClick={() => removeMember(index)}
                        className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {editing && editing.members.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">
                  No team members added yet
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={cancelEdit}
                className="flex-1 py-2.5 px-4 border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveCrew}
                disabled={!editing?.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition font-medium disabled:opacity-50"
              >
                <Check className="w-5 h-5" />
                Save Crew
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crews List */}
      {crews.length > 0 ? (
        <div className="space-y-4">
          {crews.map((crew) => {
            const members = Array.isArray(crew.member_names)
              ? (crew.member_names as (string | null)[]).filter((m): m is string => m !== null)
              : []
            const isEditing = editing?.id === crew.id

            if (isEditing) return null

            return (
              <div
                key={crew.id}
                className="bg-white rounded-2xl border border-zinc-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-900">{crew.name}</h3>
                      <p className="text-sm text-zinc-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEditCrew(crew)}
                      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteCrew(crew.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {members.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-full"
                      >
                        <div className="w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                          <span className="text-green-700 font-medium text-xs">
                            {member.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-zinc-700">{member}</span>
                      </div>
                    ))}
                  </div>
                )}

                {members.length === 0 && (
                  <p className="text-sm text-zinc-500">No team members assigned</p>
                )}
              </div>
            )
          })}
        </div>
      ) : !isAdding && (
        <div className="text-center py-12 bg-white rounded-2xl border border-zinc-200">
          <Users className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-zinc-900 mb-1">No crews yet</h3>
          <p className="text-zinc-500 mb-4">Create your first crew to assign routes</p>
          <button
            onClick={startAddCrew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition"
          >
            <Plus className="w-5 h-5" />
            Add Crew
          </button>
        </div>
      )}
    </div>
  )
}
