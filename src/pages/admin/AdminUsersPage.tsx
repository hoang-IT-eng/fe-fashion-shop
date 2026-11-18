import React, { useEffect, useState } from 'react'
import { Shield, Trash2 } from 'lucide-react'
import { api } from '../../api/apiClient'
import { useToast } from '../../components/Toast'

interface UserRow {
  id: number
  name: string
  email: string
  role: 'user' | 'admin'
  createdAt?: string
}

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<UserRow[]>([])

  const loadUsers = async () => {
    const res = await api.get<UserRow[]>('/users')
    setUsers(Array.isArray(res) ? res : [])
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const handleRoleToggle = async (u: UserRow) => {
    const nextRole = u.role === 'admin' ? 'user' : 'admin'
    await api.put(`/users/${u.id}`, { role: nextRole })
    await loadUsers()
    toast(`Updated ${u.name} role to ${nextRole.toUpperCase()}.`, 'success')
  }

  const handleDelete = async (u: UserRow) => {
    if (u.role === 'admin') {
      toast('Cannot delete active Curator Admin.', 'error')
      return
    }
    await api.delete(`/users/${u.id}`)
    await loadUsers()
    toast(`Removed ${u.email}.`, 'info')
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.28em] uppercase text-[#f9f9f9]">
          INNER CIRCLE DIRECTORY &amp; ROLES
        </p>
        <h2 className="font-display text-2xl md:text-3xl text-[#f9f9f9]">
          Collectors &amp; Curators ({users.length})
        </h2>
      </div>

      <div className="bg-[#111111] border border-[#f9f9f9]/12 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#f9f9f9]/10 font-mono text-[10px] uppercase tracking-[0.22em] text-[#a3a3a3]">
              <th className="py-3.5 px-4">ID</th>
              <th className="py-3.5 px-4">Collector</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Clearance Role</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f9f9f9]/10 text-xs">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-[#232323]/40 transition">
                <td className="py-3 px-4 font-mono text-[#a3a3a3] tabular-nums">#{u.id}</td>
                <td className="py-3 px-4 font-medium text-[#f9f9f9]">{u.name}</td>
                <td className="py-3 px-4 font-mono text-[#a3a3a3]">{u.email}</td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => void handleRoleToggle(u)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 border font-mono text-[10px] uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'border-[#f9f9f9] text-[#f9f9f9] bg-[#f9f9f9]/10'
                        : 'border-[#f9f9f9]/20 text-[#f9f9f9]'
                    }`}
                  >
                    <Shield className="w-3 h-3" /> {u.role}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => void handleDelete(u)}
                    className="p-2 text-[#a3a3a3] hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
