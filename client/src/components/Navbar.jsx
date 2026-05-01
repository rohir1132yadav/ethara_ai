import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const Navbar = () => {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-5 lg:px-10">
        <Link to="/" className="text-2xl font-extrabold tracking-tight text-indigo-700">
          Team Task Manager
        </Link>
        <nav className="flex items-center gap-8 text-lg font-semibold text-slate-700">
          <NavLink to="/" className="transition hover:text-indigo-600">
            Dashboard
          </NavLink>
          <NavLink to="/projects" className="transition hover:text-indigo-600">
            Projects
          </NavLink>
          <NavLink to="/tasks" className="transition hover:text-indigo-600">
            Tasks
          </NavLink>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700">
            {user.name} ({user.role})
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-md bg-slate-900 px-4 py-2 text-base font-semibold text-white transition hover:bg-slate-700"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
