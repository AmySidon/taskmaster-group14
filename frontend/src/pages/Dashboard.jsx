import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'
import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  fetchProjects,
  createProject
} from '../api'

function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Low',
    due_date: '',
    project_id: ''
  })

  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  // Load tasks and projects on mount
  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [tasksData, projectsData] = await Promise.all([
        fetchTasks(),
        fetchProjects()
      ])
      setTasks(tasksData)
      setProjects(projectsData)
      // Set default project_id if projects exist
      if (projectsData.length > 0) {
        setNewTask(prev => ({ ...prev, project_id: projectsData[0].id }))
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value })
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    try {
      const task = await createTask({
        title: newTask.title,
        priority: newTask.priority,
        due_date: newTask.due_date || null,
        project_id: newTask.project_id || null
      })
      setTasks([task, ...tasks])
      setNewTask({ title: '', priority: 'Low', due_date: '', project_id: projects[0]?.id || '' })
    } catch (err) {
      alert('Error adding task: ' + err.message)
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id)
      setTasks(tasks.filter(t => t.id !== id))
    } catch (err) {
      alert('Error deleting task: ' + err.message)
    }
  }

  const handleEditTask = async (id) => {
    const newTitle = prompt('Enter the new task title:')
    if (!newTitle || !newTitle.trim()) return
    try {
      const updated = await updateTask(id, { title: newTitle })
      setTasks(tasks.map(t => t.id === id ? updated : t))
    } catch (err) {
      alert('Error editing task: ' + err.message)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateTaskStatus(id, newStatus)
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t))
    } catch (err) {
      alert('Error updating status: ' + err.message)
    }
  }

  const handleAddProject = async () => {
    const name = prompt('Enter project/course name:')
    if (!name || !name.trim()) return
    try {
      const project = await createProject(name)
      setProjects([...projects, project])
    } catch (err) {
      alert('Error creating project: ' + err.message)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'All' || task.status === filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.project_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (loading) return <div><Navbar /><div className="dashboard-container"><p>Loading...</p></div></div>

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Welcome to TaskMaster.</p>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleAddTask} className="task-form">
          <input
            type="text"
            name="title"
            placeholder="Enter task"
            value={newTask.title}
            onChange={handleInputChange}
          />

          <select name="project_id" value={newTask.project_id} onChange={handleInputChange}>
            <option value="">No Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select name="priority" value={newTask.priority} onChange={handleInputChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <input
            type="date"
            name="due_date"
            value={newTask.due_date}
            onChange={handleInputChange}
          />

          <button type="submit">Add Task</button>
        </form>

        <button onClick={handleAddProject} style={{ marginBottom: '1rem' }}>
          + Add Project/Course
        </button>

        <input
          type="text"
          placeholder="Search tasks or projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

        <div className="filter-buttons">
          {['All', 'Pending', 'In Progress', 'Completed', 'Archived'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ fontWeight: filter === f ? 'bold' : 'normal' }}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="task-list">
          {filteredTasks.length === 0 && <p>No tasks found.</p>}
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              title={task.title}
              status={task.status}
              priority={task.priority}
              dueDate={task.due_date}
              course={task.project_name || 'No Project'}
              onDelete={() => handleDeleteTask(task.id)}
              onEdit={() => handleEditTask(task.id)}
              onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard