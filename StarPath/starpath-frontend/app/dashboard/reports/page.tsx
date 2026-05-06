'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Calendar, AlertCircle, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getToken } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

interface Facility {
  id: string
  cms_provider_id: string
  name: string
  bed_count: number
  is_active: boolean
}

interface Report {
  id: string
  type: 'facility' | 'ratings_trend'
  name: string
  description: string
  icon: React.ReactNode
}

export default function ReportsPage() {
  const router = useRouter()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [selectedFacility, setSelectedFacility] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string>('')
  const [error, setError] = useState('')

  const reports: Report[] = [
    {
      id: 'facility',
      type: 'facility',
      name: 'Comprehensive Facility Report',
      description: 'Complete facility overview including ratings, inspections, and deficiencies',
      icon: <FileText size={20} />,
    },
    {
      id: 'ratings_trend',
      type: 'ratings_trend',
      name: 'Ratings Trend Analysis',
      description: 'Historical ratings trends and performance analysis',
      icon: <TrendingUp size={20} />,
    },
  ]

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/facilities/`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFacilities(data)
        if (data.length > 0) {
          setSelectedFacility(data[0].id)
        }
      } else if (response.status === 401) {
        router.push('/auth/login')
      }
    } catch (err) {
      setError('Failed to load facilities')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (reportType: string) => {
    if (!selectedFacility) {
      setError('Please select a facility')
      return
    }

    setDownloading(reportType)

    try {
      let endpoint = ''
      let filename = ''

      if (reportType === 'facility') {
        endpoint = `/api/v1/reports/facility/${selectedFacility}`
        const facility = facilities.find((f) => f.id === selectedFacility)
        filename = `${facility?.name || 'Facility'}_Report.pdf`
      } else if (reportType === 'ratings_trend') {
        endpoint = `/api/v1/reports/ratings-trend/${selectedFacility}`
        const facility = facilities.find((f) => f.id === selectedFacility)
        filename = `${facility?.name || 'Facility'}_Ratings_Trend.pdf`
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        setError('Failed to download report')
      }
    } catch (err) {
      setError('Error downloading report')
      console.error(err)
    } finally {
      setDownloading('')
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin mb-4">
              <FileText size={32} className="text-indigo-500" />
            </div>
            <p className="text-slate-400">Loading reports...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reports & Exports</h1>
            <p className="text-slate-400">Download facility reports and analysis data</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Facility Selection */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-3">Select Facility</label>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Choose a facility --</option>
              {facilities.map((facility) => (
                <option key={facility.id} value={facility.id}>
                  {facility.name} ({facility.bed_count} beds)
                </option>
              ))}
            </select>

            {selectedFacility && (
              <div className="mt-4 p-4 bg-slate-700/50 rounded-lg">
                <p className="text-sm text-slate-300">
                  <strong>Selected:</strong>{' '}
                  {facilities.find((f) => f.id === selectedFacility)?.name}
                </p>
              </div>
            )}
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                    {report.icon}
                  </div>
                  {selectedFacility && (
                    <button
                      onClick={() => downloadReport(report.type)}
                      disabled={downloading === report.type}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-medium rounded-lg transition"
                    >
                      <Download size={16} />
                      {downloading === report.type ? 'Downloading...' : 'Download'}
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-white mb-2">{report.name}</h3>
                <p className="text-slate-400 text-sm">{report.description}</p>

                <div className="mt-4 pt-4 border-t border-slate-700">
                  <ul className="text-xs text-slate-400 space-y-1">
                    <li>✓ PDF format</li>
                    <li>✓ Professional layout</li>
                    <li>✓ Ready to print</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 flex-shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-blue-300 mb-1">About These Reports</h4>
                <p className="text-blue-200/80 text-sm">
                  These reports provide comprehensive facility analysis, including current star ratings, recent
                  inspections, identified deficiencies, and trend analysis. Reports are generated on-demand and can be
                  downloaded as PDF files for printing or distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
