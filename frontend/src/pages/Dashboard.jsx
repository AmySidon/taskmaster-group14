import { useState } from 'react'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'

function Dashboard() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Finish frontend', status: 'Pending' },
    { id: 2, title: 'Create backend routes', status: 'Pending' },
    { id: 3, title: 'Connect database', status: 'Completed' }
  ])

  const [newTask, setNewTask] = useState('')
  const [filter, setFilter] = useState('All')

  const handleAddTask = (e) => {
    e.preventDefault()

    if (newTask.trim() === '') return

    const task = {
      id: Date.now(),
      title: newTask,
      status: 'Pending'
    }

    setTasks([...tasks, task])
    setNewTask('')
  }

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)
  }

  const handleToggleStatus = (id) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id
        ? {
            ...task,
            status: task.status === 'Completed' ? 'Pending' : 'Completed'
          }
        : task
    )

    setTasks(updatedTasks)
  }

  const handleEditTask = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id)

    const updatedTitle = prompt('Edit task title:', taskToEdit.title)

    if (updatedTitle === null || updatedTitle.trim() === '') return

    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, title: updatedTitle } : task
    )

    setTasks(updatedTasks)
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'All') return true
    return task.status === filter
  })

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Welcome to TaskMaster.</p>

        <form onSubmit={handleAddTask} className="task-form">
          <input
            type="text"
            placeholder="Enter a new task"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button type="submit">Add Task</button>
        </form>

        <div className="filter-buttons">
          <button onClick={() => setFilter('All')}>All</button>
          <button onClick={() => setFilter('Pending')}>Pending</button>
          <button onClick={() => setFilter('Completed')}>Completed</button>
        </div>

        <div className="task-list">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              status={task.status}
              onDelete={() => handleDeleteTask(task.id)}
              onToggle={() => handleToggleStatus(task.id)}
              onEdit={() => handleEditTask(task.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard