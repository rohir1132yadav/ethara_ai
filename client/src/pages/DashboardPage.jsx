import { useEffect, useState } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../services/api'

const COLORS = ['#f59e0b', '#0ea5e9', '#22c55e']

const DashboardPage = () => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    overdue: 0,
    statusData: [],
  })

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await api.get('/tasks/dashboard/stats')
      setStats(data)
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card title="Total Tasks" value={stats.total} />
        <Card title="Completed Tasks" value={stats.completed} />
        <Card title="Overdue Tasks" value={stats.overdue} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="mb-4 text-2xl font-bold">Tasks by Status</h2>
        <div className="h-[26rem]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={stats.statusData}
                dataKey="count"
                nameKey="_id"
                outerRadius={140}
                label
              >
                {stats.statusData.map((entry, index) => (
                  <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const Card = ({ title, value }) => (
  <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
    <p className="text-base font-medium text-slate-500">{title}</p>
    <p className="mt-1 text-5xl font-extrabold text-slate-800">{value}</p>
  </div>
)

export default DashboardPage
