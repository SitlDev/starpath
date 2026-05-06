'use client'

import { useState } from 'react'
import { API_URL } from '@/lib/api-config'
import { getToken } from '@/lib/auth'

interface FacilityFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function FacilityForm({ onSuccess, onCancel }: FacilityFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    cms_provider_id: '',
    bed_count: '',
    ownership: 'For-Profit',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name.startsWith('address_')) {
      const key = name.replace('address_', '')
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [key]: value,
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = getToken()
      if (!token) {
        throw new Error('Not authenticated')
      }

      const payload = {
        name: formData.name,
        cms_provider_id: formData.cms_provider_id,
        bed_count: parseInt(formData.bed_count) || 0,
        ownership: formData.ownership,
        address: formData.address,
      }

      const res = await fetch(`${API_URL}/api/v1/facilities/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.detail || 'Failed to create facility')
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create facility')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Facility</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Facility Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                placeholder="e.g., Sunny Valley Nursing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                CMS Provider ID *
              </label>
              <input
                type="text"
                name="cms_provider_id"
                value={formData.cms_provider_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                placeholder="e.g., 100001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bed Count
              </label>
              <input
                type="number"
                name="bed_count"
                value={formData.bed_count}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                placeholder="e.g., 120"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Ownership
              </label>
              <select
                name="ownership"
                value={formData.ownership}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-400"
              >
                <option>For-Profit</option>
                <option>Non-Profit</option>
                <option>Government</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Address</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="address_street"
                value={formData.address.street}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                placeholder="Street Address"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="address_city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  placeholder="City"
                />
                <input
                  type="text"
                  name="address_state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  placeholder="State"
                  maxLength={2}
                />
                <input
                  type="text"
                  name="address_zip"
                  value={formData.address.zip}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                  placeholder="ZIP Code"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
            >
              {loading ? 'Creating...' : 'Create Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
