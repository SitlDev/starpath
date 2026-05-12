'use client'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'

interface DomainRadarChartProps {
  data: { domain: string; score: number; max: number }[]
}

export default function DomainRadarChart({ data }: DomainRadarChartProps) {
  const chartData = data.map(d => ({ ...d, fullMark: d.max }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="domain"
          tick={{ fill: 'rgba(255,255,255,0.50)', fontSize: 12, fontWeight: 500 }}
        />
        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,22,41,0.95)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '12px',
            color: '#fff',
          }}
          formatter={(value: number) => [`${'★'.repeat(Math.round(value))}`, 'Rating']}
        />
        <Radar name="Rating" dataKey="score" stroke="#3366f4" fill="#3366f4" fillOpacity={0.25} strokeWidth={2} dot={{ fill: '#3366f4', r: 4 }} />
      </RadarChart>
    </ResponsiveContainer>
  )
}
