import { useState } from 'react'
import Navbar from '../components/Navbar'
import TaskCard from '../components/TaskCard'

function Dashboard() {
  const [courses] = useState([
    'CS 4398',
    'CS 4328',
    'Math 3377',
    'Personal'
  ])

  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Finish frontend',
      status: 'Pending',
      priority: 'High',
      dueDate: '2026-04-15',
      course: 'CS 4398'
    },
    {
      id: 2,
      title: 'Create backend routes',
      status: 'In Progress',
      priority: 'Medium',
      dueDate: '2026-04-18',
      course: 'CS 4398'
    },
    {
      id: 3,
      title: 'Connect database',
      status: 'Completed',
      priority: 'Low',
      dueDate: '2026-04-10',
      course: 'CS 4328'
    }
  ])

  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'Low',
    dueDate: '',
    course: 'CS 4398'
  })

  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const handleInputChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value
    })
  }

  const handleAddTask = (e) => {
    e.preventDefault()

    if (newTask.title.trim() === '') return

    const task = {
      id: Date.now(),
      title: newTask.title,
      status: 'Pending',
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      course: newTask.course
    }

    setTasks([...tasks, task])

    setNewTask({
      title: '',
      priority: 'Low',
      dueDate: '',
      course: 'CS 4398'
    })
  }

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)
  }

  const handleEditTask = (id) => {
    const newTitle = prompt('Enter the new task title:')

    if (!newTitle || newTitle.trim() === '') return

    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, title: newTitle } : task
    )

    setTasks(updatedTasks)
  }

  const handleStatusChange = (id, newStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, status: newStatus } : task
    )

    setTasks(updatedTasks)
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === 'All' || task.status === filter
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.course.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
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
            name="title"
            placeholder="Enter task"
            value={newTask.title}
            onChange={handleInputChange}
          />

          <select
            name="course"
            value={newTask.course}
            onChange={handleInputChange}
          >
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <select
            name="priority"
            value={newTask.priority}
            onChange={handleInputChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          <input
            type="date"
            name="dueDate"
            value={newTask.dueDate}
            onChange={handleInputChange}
          />

          <button type="submit">Add Task</button>
        </form>

        <input
          type="text"
          placeholder="Search tasks or courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />

        <div className="filter-buttons">
          <button onClick={() => setFilter('All')}>All</button>
          <button onClick={() => setFilter('Pending')}>Pending</button>
          <button onClick={() => setFilter('In Progress')}>In Progress</button>
          <button onClick={() => setFilter('Completed')}>Completed</button>
          <button onClick={() => setFilter('Archived')}>Archived</button>
        </div>

        <div className="task-list">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.title}
              status={task.status}
              priority={task.priority}
              dueDate={task.dueDate}
              course={task.course}
              onDelete={() => handleDeleteTask(task.id)}
              onEdit={() => handleEditTask(task.id)}
              onStatusChange={(newStatus) =>
                handleStatusChange(task.id, newStatus)
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard