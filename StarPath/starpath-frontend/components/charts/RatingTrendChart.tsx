'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface TrendDataPoint {
  date: string
  health: number
  staffing: number
  quality: number
  overall: number
}

interface RatingTrendChartProps {
  data: TrendDataPoint[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-card rounded-lg border border-white/15 p-3 text-sm">
      <p className="font-semibold text-white mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="text-white/70 capitalize">{p.dataKey}</span>
          <span className="font-bold text-white">{p.value}★</span>
        </div>
      ))}
    </div>
  )
}

export default function RatingTrendChart({ data }: RatingTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-slate-400">
        No rating history available
      </div>
    )
  }

  // Reverse data so it's chronological (oldest to newest)
  const chartData = [...data].reverse()

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 5]} 
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="health"
            stroke="#ef4444"
            name="Health Inspections"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="staffing"
            stroke="#f59e0b"
            name="Staffing"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="quality"
            stroke="#8b5cf6"
            name="Quality Measures"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="overall"
            stroke="#3366f4"
            name="Overall Rating"
            strokeWidth={3}
            dot={{ fill: '#3366f4', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
