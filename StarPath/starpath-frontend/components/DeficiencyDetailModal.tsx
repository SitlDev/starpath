'use client'

import { X } from 'lucide-react'

interface Deficiency {
  id: string
  description: string
  severity: string
  scope: string
  f_tag?: string
}

interface DeficiencyDetailModalProps {
  deficiency: Deficiency | null
  onClose: () => void
}

const SEVERITY_LABELS: Record<string, string> = {
  '1': 'Scope Limited',
  '2': 'Isolated',
  '3': 'Widespread',
  '4': 'Systemic',
}

const SCOPE_LABELS: Record<string, string> = {
  'D': 'Isolated to one area/service',
  'E': 'Isolated to multiple areas/services',
  'F': 'Widespread to one area/service',
  'G': 'Widespread to multiple areas/services',
  'H': 'Systemic throughout the facility',
}

const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case '1':
      return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30'
    case '2':
      return 'bg-orange-500/10 text-orange-300 border-orange-500/30'
    case '3':
      return 'bg-red-500/10 text-red-300 border-red-500/30'
    case '4':
      return 'bg-red-600/10 text-red-200 border-red-600/30'
    default:
      return 'bg-slate-500/10 text-slate-300 border-slate-500/30'
  }
}

export default function DeficiencyDetailModal({
  deficiency,
  onClose,
}: DeficiencyDetailModalProps) {
  if (!deficiency) return null

  const fTag = deficiency.f_tag || 'N/A'
  const severityLabel =
    SEVERITY_LABELS[deficiency.severity] || deficiency.severity
  const scopeLabel = SCOPE_LABELS[deficiency.scope] || deficiency.scope

  // Link to CMS regulations for this F-tag
  const cmsRegulationUrl = `https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/GuidanceforLawEnforcement/downloads/tag${fTag.padStart(3, '0')}.pdf`

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800">
            <h2 className="text-xl font-bold text-white">Deficiency Details</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* F-Tag */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                F-Tag Code
              </label>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                  <p className="text-lg font-bold text-blue-300">F-{fTag}</p>
                </div>
                <a
                  href={cmsRegulationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm underline transition"
                >
                  View CMS Regulation →
                </a>
              </div>
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Severity Level
              </label>
              <div className={`px-4 py-2 rounded-lg border w-fit ${getSeverityColor(deficiency.severity)}`}>
                <p className="font-semibold">
                  {deficiency.severity} - {severityLabel}
                </p>
                <p className="text-xs mt-1 opacity-80">
                  {['', 'Limited impact on resident safety', 'Moderate impact on resident safety', 'Significant impact on resident safety', 'Immediate jeopardy to resident health/safety'][parseInt(deficiency.severity)] || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Scope */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Scope of Problem
              </label>
              <div className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg">
                <p className="font-semibold text-slate-200">
                  {deficiency.scope} - {scopeLabel}
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Description
              </label>
              <div className="px-4 py-3 bg-slate-700/30 border border-slate-600 rounded-lg">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {deficiency.description}
                </p>
              </div>
            </div>

            {/* Severity Reference */}
            <div className="bg-slate-700/20 border border-slate-600 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">
                Severity Reference Guide
              </h3>
              <div className="space-y-2 text-xs text-slate-400">
                <p>
                  <span className="font-semibold text-yellow-300">1 - Scope Limited:</span>{' '}
                  Limited scope deficiency with minimal resident impact
                </p>
                <p>
                  <span className="font-semibold text-orange-300">2 - Isolated:</span>{' '}
                  Isolated to specific residents or areas
                </p>
                <p>
                  <span className="font-semibold text-red-300">3 - Widespread:</span>{' '}
                  Affects multiple residents or widespread across the facility
                </p>
                <p>
                  <span className="font-semibold text-red-200">4 - Systemic:</span>{' '}
                  Pervasive throughout the facility with immediate jeopardy
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-700 p-6 bg-slate-700/30 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
