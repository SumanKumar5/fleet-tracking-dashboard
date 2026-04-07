import { useMemo } from 'react'
import { useFleetStore } from '../store/fleetStore'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const STATUS_CONFIG = [
  { key: 'moving',    label: 'Moving',    color: '#10b981' },
  { key: 'stopped',   label: 'Stopped',   color: '#f59e0b' },
  { key: 'completed', label: 'Completed', color: '#3b82f6' },
  { key: 'cancelled', label: 'Cancelled', color: '#ef4444' },
  { key: 'pending',   label: 'Pending',   color: '#6b7280' },
]

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const { name, value, color } = payload[0].payload
  return (
    <div style={{
      background    : 'rgba(10,14,26,0.97)',
      border        : '1px solid rgba(255,255,255,0.1)',
      borderRadius  : 10,
      padding       : '6px 12px',
      backdropFilter: 'blur(12px)',
    }}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-white text-xs font-semibold">{name}</span>
        <span className="text-gray-400 text-xs ml-1">{value}</span>
      </div>
    </div>
  )
}

export default function StatusDonut() {
  const vehicles = useFleetStore(s => s.vehicles)
  const list     = Object.values(vehicles)

  const data = useMemo(() => {
    return STATUS_CONFIG
      .map(s => ({
        name  : s.label,
        value : list.filter(v => v.status === s.key).length,
        color : s.color,
        key   : s.key,
      }))
      .filter(d => d.value > 0)
  }, [vehicles])

  const total = list.length

  if (total === 0) return null

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border    : '1px solid rgba(255,255,255,0.07)',
    }} className="flex items-center gap-3 px-4 py-2 rounded-xl min-w-[180px]">

      <div style={{ width: 52, height: 52, position: 'relative', shrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={16}
              outerRadius={24}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
              isAnimationActive={false}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position  : 'absolute',
          inset     : 0,
          display   : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span className="text-white text-xs font-bold">{total}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 min-w-0">
        <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Fleet Status</span>
        <div className="flex flex-col gap-0.5">
          {data.map(d => (
            <div key={d.key} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-gray-400 text-xs">{d.name}</span>
              <span className="text-white text-xs font-semibold ml-auto pl-2">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}