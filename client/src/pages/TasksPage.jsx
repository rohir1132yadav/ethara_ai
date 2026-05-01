import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import api from '../services/api'

const statuses = ['Todo', 'In Progress', 'Done']

const TasksPage = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    projectId: '',
    dueDate: '',
    status: 'Todo',
  })

  const loadTasks = async () => {
    const { data } = await api.get('/tasks')
    setTasks(data)
  }

  useEffect(() => {
    let ignore = false
    api.get('/tasks').then(({ data }) => {
      if (!ignore) setTasks(data)
    })
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const loadBaseData = async () => {
      const [projectRes, userRes] = await Promise.all([api.get('/projects'), api.get('/auth/users')])
      setProjects(projectRes.data)
      setUsers(userRes.data)
    }
    if (user?.role === 'Admin') loadBaseData()
  }, [user])

  const createTask = async (event) => {
    event.preventDefault()
    await api.post('/tasks', form)
    setForm({
      title: '',
      description: '',
      assignedTo: '',
      projectId: '',
      dueDate: '',
      status: 'Todo',
    })
    loadTasks()
  }

  const updateStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status })
    loadTasks()
  }

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`)
    loadTasks()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">Tasks</h1>
      {user?.role === 'Admin' && (
        <form onSubmit={createTask} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold">Create Task</h2>
          <input
            className="w-full rounded-lg border border-slate-300 p-3 text-lg"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <textarea
            className="w-full rounded-lg border border-slate-300 p-3 text-lg"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <select
              className="rounded-lg border border-slate-300 p-3 text-lg"
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option value={project._id} key={project._id}>
                  {project.title}
                </option>
              ))}
            </select>
            <select
              className="rounded-lg border border-slate-300 p-3 text-lg"
              value={form.assignedTo}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              required
            >
              <option value="">Assign to</option>
              {users.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
            <input
              className="rounded-lg border border-slate-300 p-3 text-lg"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              required
            />
          </div>
          <button className="rounded-lg bg-indigo-600 px-5 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700">
            Create Task
          </button>
        </form>
      )}

      <div className="space-y-4">
        {tasks.map((task) => {
          const overdue = task.status !== 'Done' && dayjs(task.dueDate).isBefore(dayjs(), 'day')
          return (
            <div key={task._id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-2xl font-bold">{task.title}</h3>
                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task._id, e.target.value)}
                    className="rounded-md border border-slate-300 p-2 text-base"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  {user?.role === 'Admin' && (
                    <button
                      type="button"
                      onClick={() => deleteTask(task._id)}
                      className="rounded-md bg-red-600 px-3 py-2 text-base font-medium text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-lg text-slate-600">{task.description}</p>
              <p className="mt-3 text-base text-slate-500">
                Project: {task.projectId?.title} | Assignee: {task.assignedTo?.name}
              </p>
              <p className={`text-base ${overdue ? 'font-semibold text-red-600' : 'text-slate-500'}`}>
                Due: {dayjs(task.dueDate).format('DD MMM YYYY')}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TasksPage
