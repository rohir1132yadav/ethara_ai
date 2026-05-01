import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'

const ProjectsPage = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [members, setMembers] = useState([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    members: [],
  })

  const loadProjects = async () => {
    const { data } = await api.get('/projects')
    setProjects(data)
  }

  useEffect(() => {
    let ignore = false
    api.get('/projects').then(({ data }) => {
      if (!ignore) setProjects(data)
    })
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    const loadMembers = async () => {
      const { data } = await api.get('/auth/users')
      setMembers(data)
    }
    if (user?.role === 'Admin') loadMembers()
  }, [user])

  const handleCreate = async (event) => {
    event.preventDefault()
    await api.post('/projects', {
      ...form,
      members: form.members.length ? form.members : [user._id],
    })
    setForm({ title: '', description: '', members: [] })
    loadProjects()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-extrabold tracking-tight">Projects</h1>

      {user?.role === 'Admin' && (
        <form className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200" onSubmit={handleCreate}>
          <h2 className="text-2xl font-bold">Create Project</h2>
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
          <select
            className="w-full rounded-lg border border-slate-300 p-3 text-lg"
            multiple
            value={form.members}
            onChange={(e) => {
              const options = Array.from(e.target.selectedOptions).map((opt) => opt.value)
              setForm({ ...form, members: options })
            }}
          >
            {members.map((member) => (
              <option value={member._id} key={member._id}>
                {member.name} ({member.role})
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-indigo-600 px-5 py-3 text-lg font-semibold text-white transition hover:bg-indigo-700">
            Create
          </button>
        </form>
      )}

      <div className="grid gap-5">
        {projects.map((project) => (
          <div key={project._id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-2xl font-bold">{project.title}</h3>
            <p className="mt-2 text-lg text-slate-600">{project.description}</p>
            <p className="mt-3 text-base text-slate-500">
              Members: {project.members.map((m) => m.name).join(', ')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage
