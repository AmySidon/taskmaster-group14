import '../css/Dashboard.css';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  fetchProjects,
  createProject,
  deleteProject
} from '../api';

const FILTER_STATUSES = ['All', 'Pending', 'In Progress', 'Completed', 'Archived'];

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Low');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [tasksData, projectsData] = await Promise.all([fetchTasks(), fetchProjects()]);
      setTasks(tasksData || []);
      setProjects(projectsData || []);
      if (projectsData?.length > 0) {
        setSelectedProjectId((prev) => prev ?? projectsData[0].id);
      } else {
        setSelectedProjectId(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  // Sidebar now passes the name directly instead of using prompt()
  const handleAddProject = async (name) => {
    try {
      const newProject = await createProject(name);
      setProjects((prev) => [...prev, newProject]);
      setSelectedProjectId(newProject.id);
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;
    try {
      const createdTask = await createTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        due_date: newTaskDueDate || null,
        project_id: selectedProjectId,
      });
      setTasks((prev) => [createdTask, ...prev]);
      setNewTaskTitle('');
      setNewTaskPriority('Low');
      setNewTaskDueDate('');
    } catch (err) {
      alert('Error adding task: ' + err.message);
    }
  };

  const handleAddTaskKeyDown = (e) => {
    if (e.key === 'Enter') handleAddTask();
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteProject(courseId);
      setProjects((prev) => prev.filter((p) => p.id !== courseId));
      setTasks((prev) => prev.filter((t) => t.project_id !== courseId));
      if (selectedProjectId === courseId) setSelectedProjectId(null);
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // TaskCard now passes the new title directly instead of using prompt()
  const handleEditTask = async (taskId, newTitle) => {
    try {
      const updated = await updateTask(taskId, { title: newTitle });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    } catch (err) {
      alert('Error editing task: ' + err.message);
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const filteredTasks = tasks.filter((task) => {
    const matchesProject = selectedProjectId === null ? true : task.project_id === selectedProjectId;
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.project_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ? true : task.status === filterStatus;
    return matchesProject && matchesSearch && matchesStatus;
  });

  // Stats scoped to selected project
  const scopedTasks = selectedProjectId
    ? tasks.filter((t) => t.project_id === selectedProjectId)
    : tasks;

  const totalTasks = scopedTasks.length;
  const completedTasks = scopedTasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = scopedTasks.filter((t) => t.status === 'In Progress').length;
  const overdueTasks = scopedTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed'
  ).length;

  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="loading-state">Loading your tasks…</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-layout">
        <Sidebar
          courses={projects}
          selectedCourseId={selectedProjectId}
          onSelectCourse={setSelectedProjectId}
          onAddCourse={handleAddProject}
          onDeleteCourse={handleDeleteCourse}
        />

        <main className="dashboard-main">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="dashboard-title">
                {selectedProject ? selectedProject.name : 'Dashboard'}
              </h1>
              <p className="dashboard-subtitle">
                {selectedProject
                  ? `${totalTasks} task${totalTasks !== 1 ? 's' : ''} · ${completionPct}% complete`
                  : 'Select a course to get started'}
              </p>
            </div>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {/* Summary cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">Total</span>
              <span className="summary-value">{totalTasks}</span>
            </div>
            <div className="summary-card completed-card">
              <span className="summary-label">Completed</span>
              <span className="summary-value">{completedTasks}</span>
            </div>
            <div className="summary-card progress-card">
              <span className="summary-label">In Progress</span>
              <span className="summary-value">{inProgressTasks}</span>
            </div>
            <div className={`summary-card ${overdueTasks > 0 ? 'overdue-card' : ''}`}>
              <span className="summary-label">Overdue</span>
              <span className="summary-value">{overdueTasks}</span>
            </div>
          </div>

          {selectedProject ? (
            <div className="task-section">
              {/* Add task form */}
              <div className="task-form">
                <input
                  type="text"
                  className="task-input"
                  placeholder="New task title…"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleAddTaskKeyDown}
                />
                <select
                  className="task-select"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input
                  type="date"
                  className="task-date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
                <button
                  className="add-task-btn"
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                >
                  + Add Task
                </button>
              </div>

              {/* Search + filter */}
              <div className="search-filter-bar">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍  Search tasks…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="filter-pills">
                  {FILTER_STATUSES.map((s) => (
                    <button
                      key={s}
                      className={`filter-pill ${filterStatus === s ? 'active' : ''}`}
                      onClick={() => setFilterStatus(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task list */}
              <div className="task-list">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      status={task.status}
                      priority={task.priority}
                      dueDate={task.due_date}
                      projectName={task.project_name}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      onEdit={handleEditTask}
                    />
                  ))
                ) : (
                  <div className="empty-tasks">
                    {searchTerm || filterStatus !== 'All'
                      ? 'No tasks match your filters.'
                      : 'No tasks yet — add one above!'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="no-course-state">
              <p>Select or create a course in the sidebar to manage tasks.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;