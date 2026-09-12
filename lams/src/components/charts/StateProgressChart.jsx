import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Paper, Box, Typography } from '@mui/material'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>{label}</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
            <Typography variant="caption" color="text.secondary">Proposed:</Typography>
            <Typography variant="caption" fontWeight={600} sx={{ ml: 'auto' }}>{(payload[0]?.value || 0).toLocaleString('en-IN')} ha</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
            <Typography variant="caption" color="text.secondary">Acquired:</Typography>
            <Typography variant="caption" fontWeight={600} sx={{ ml: 'auto' }}>{(payload[1]?.value || 0).toLocaleString('en-IN')} ha</Typography>
          </Box>
        </Box>
      </Paper>
    )
  }
  return null
}

const StateProgressChart = ({ data }) => {
  const chartData = data.map((d) => ({
    state: d.state.replace(/ /g, '\n'),
    proposed: d.proposed,
    acquired: d.acquired,
  }))

  const maxValue = data.length > 0
    ? Math.max(...data.map((d) => d.proposed)) * 1.3
    : 100

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" horizontal={false} />
        <XAxis
          type="number"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: '#64748b' }}
          domain={[0, maxValue]}
          tickFormatter={(v) => Math.round(v / 1000) + 'k'}
        />
        <YAxis
          type="category"
          dataKey="state"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#0f172a', fontWeight: 500 }}
          width={100}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99, 102, 241, 0.2)' }} />
        <Bar dataKey="proposed" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={18} />
        <Bar dataKey="acquired" fill="#10B981" radius={[0, 4, 4, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default StateProgressChart
