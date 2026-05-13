'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import StatCard from '@/components/ui/StatCard'
import RatingBadge from '@/components/ui/RatingBadge'
import FacilityForm from '@/components/FacilityForm'
import { getToken, getCurrentUser, User } from '@/lib/auth'
import { API_URL } from '@/lib/api-config'

interface Facility {
  id: string
  cms_provider_id: string
  name: string
  bed_count: number
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }
  ownership: string
  is_active: boolean
}

interface StarRating {
  id: string
  overall_rating: number
}

export default function FacilitiesPage() {
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [ratings, setRatings] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState<number | ''>('')
  const [sortBy, setSortBy] = useState<'name' | 'rating' | 'beds'>('name')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const token = getToken()
      if (!token) {
        router.push('/auth/login')
        return
      }

      try {
        const userData = await getCurrentUser(token)
        setUser(userData)

        const facilitiesRes = await fetch(`${API_URL}/api/v1/facilities/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (facilitiesRes.ok) {
          const data = await facilitiesRes.json()
          setFacilities(data)

          // Fetch latest ratings for each facility
          const ratingsMap: { [key: string]: number } = {}
          for (const facility of data) {
            try {
              const ratingRes = await fetch(`${API_URL}/api/v1/ratings/facility/${facility.id}/latest`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              })
              if (ratingRes.ok) {
                const rating = await ratingRes.json()
                ratingsMap[facility.id] = rating.overall_rating
              }
            } catch (err) {
              console.warn(`Failed to fetch rating for facility ${facility.id}`)
            }
          }
          setRatings(ratingsMap)
        }
      } catch (err) {
        setError('Failed to load facilities')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const filteredFacilities = facilities
    .filter(f =>
      (f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       f.cms_provider_id.includes(searchTerm)) &&
      (filterRating === '' || (ratings[f.id] || 0) === filterRating)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (ratings[b.id] || 0) - (ratings[a.id] || 0)
        case 'beds':
          return (b.bed_count || 0) - (a.bed_count || 0)
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Facilities</h1>
            <p className="text-slate-600">Manage and monitor all your skilled nursing facilities</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Facilities" value={facilities.length.toString()} />
            <StatCard label="Active Facilities" value={facilities.filter(f => f.is_active).length.toString()} />
            <StatCard label="Avg Beds" value={facilities.length > 0 ? Math.round(facilities.reduce((sum, f) => sum + (f.bed_count || 0), 0) / facilities.length).toString() : '0'} />
            <StatCard label="Last Updated" value="Today" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-900 border border-red-700 rounded-lg text-red-100 mb-6">
              {error}
            </div>
          )}

          {/* Search & Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search by facility name or provider ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-slate-900 rounded-lg transition-colors font-medium"
              >
                + New Facility
              </button>
            </div>

            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="rating">Rating (High to Low)</option>
                  <option value="beds">Bed Count (High to Low)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Filter by Rating</label>
                <select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
            </div>
          </div>

          {/* Facilities Grid */}
          {loading ? (
            <div className="text-slate-700">Loading facilities...</div>
          ) : filteredFacilities.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">
                {facilities.length === 0 ? 'No facilities yet.' : 'No facilities match your search.'}
              </p>
              {facilities.length === 0 && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-slate-900 rounded-lg transition"
                >
                  Add Your First Facility
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFacilities.map((facility) => (
                <Link
                  key={facility.id}
                  href={`/dashboard/facilities/${facility.id}`}
                  className="block bg-white border border-slate-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 truncate">{facility.name}</h3>
                      <p className="text-sm text-slate-600">Provider ID: {facility.cms_provider_id}</p>
                    </div>
                    {facility.is_active && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    {facility.address?.city && facility.address?.state && (
                      <p className="text-slate-700">
                        📍 {facility.address.city}, {facility.address.state}
                      </p>
                    )}
                    {facility.bed_count && (
                      <p className="text-slate-700">
                        🛏️ {facility.bed_count} beds
                      </p>
                    )}
                    {facility.ownership && (
                      <p className="text-slate-700 text-xs truncate">
                        🏢 {facility.ownership}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 text-sm">Rating:</span>
                      <RatingBadge rating={ratings[facility.id] || 0} />
                    </div>
                    <span className="text-blue-600 hover:text-blue-300 text-sm font-medium">
                      View Details →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Add Facility Modal */}
        {showAddForm && (
          <FacilityForm
            onSuccess={() => {
              setShowAddForm(false)
              router.refresh()
              // Reload facilities
              window.location.reload()
            }}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </main>
    </div>
  )
}
