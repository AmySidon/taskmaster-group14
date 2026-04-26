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

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Low');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError('');

    try {
      const [tasksData, projectsData] = await Promise.all([
        fetchTasks(),
        fetchProjects()
      ]);

      setTasks(tasksData || []);
      setProjects(projectsData || []);

      if (projectsData && projectsData.length > 0) {
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
  const handleAddProject = async () => {
    const name = prompt("Enter course name:");

    if (!name || !name.trim()) return;

    try {
      const newProject = await createProject(name.trim());

      setProjects((prevProjects) => [...prevProjects, newProject]);
      setSelectedProjectId(newProject.id);
    } catch (err) {
      console.error("Error creating course:", err);
      alert("Could not save course.");
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;

    try {
      const createdTask = await createTask({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        due_date: newTaskDueDate || null,
        project_id: selectedProjectId
      });

      setTasks((prev) => [createdTask, ...prev]);
      setNewTaskTitle('');
      setNewTaskPriority('Low');
      setNewTaskDueDate('');
    } catch (err) {
      alert('Error adding task: ' + err.message);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await deleteProject(courseId);

      setProjects((prevProjects) =>
        prevProjects.filter((project) => project.id !== courseId)
      );

      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.project_id !== courseId)
      );

      if (selectedProjectId === courseId) {
        setSelectedProjectId(null);
      }
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("Could not delete course.");
    }
  };
  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleEditTask = async (taskId) => {
    const currentTask = tasks.find((task) => task.id === taskId);
    const newTitle = prompt('Enter the new task title:', currentTask?.title || '');

    if (!newTitle || !newTitle.trim()) return;

    try {
      const updated = await updateTask(taskId, { title: newTitle.trim() });
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updated : task))
      );
    } catch (err) {
      alert('Error editing task: ' + err.message);
    }
  };

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  const filteredTasks = tasks.filter((task) => {
    const matchesProject =
      selectedProjectId === null ? true : task.project_id === selectedProjectId;

    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.project_name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'All' ? true : task.status === filterStatus;

    return matchesProject && matchesSearch && matchesStatus;
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'In Progress').length;
  const overdueTasks = tasks.filter(
    (task) =>
      task.due_date &&
      new Date(task.due_date) < new Date() &&
      task.status !== 'Completed'
  ).length;

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <p>Loading...</p>
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
        
        <div className="dashboard-container">
          <div className="dashboard-header">
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back to TaskMaster</p>
            </div>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="summary-cards">
            <div className="summary-card">
              <h3>Total Tasks</h3>
              <p>{totalTasks}</p>
            </div>

            <div className="summary-card">
              <h3>Completed</h3>
              <p>{completedTasks}</p>
            </div>

            <div className="summary-card">
              <h3>In Progress</h3>
              <p>{inProgressTasks}</p>
            </div>

            <div className="summary-card">
              <h3>Overdue</h3>
              <p>{overdueTasks}</p>
            </div>
          </div>

          <div className="task-section">
            <h2>
              {selectedProject
                ? `${selectedProject.name} Tasks`
                : 'No Course Selected'}
            </h2>
                
            {selectedProject && (
              <>
                <div className="task-form">
                  <input
                    type="text"
                    placeholder="Enter task"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />

                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>

                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                  />

                  <button onClick={handleAddTask}>Add Task</button>
                </div>

                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Search tasks"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => setFilterStatus('All')}>All</button>
                    <button onClick={() => setFilterStatus('Pending')}>Pending</button>
                    <button onClick={() => setFilterStatus('In Progress')}>
                      In Progress
                    </button>
                    <button onClick={() => setFilterStatus('Completed')}>
                      Completed
                    </button>
                    <button onClick={() => setFilterStatus('Archived')}>
                      Archived
                    </button>
                  </div>
                </div>
                <h2>Courses</h2>
                
                <div className="task-list">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => {
                      const mappedTask = {
                        ...task,
                        dueDate: task.due_date,
                        courseName: task.project_name
                      };

                      return (
                        <TaskCard
                          key={mappedTask.id}
                          id={mappedTask.id}
                          title={mappedTask.title}
                          status={mappedTask.status}
                          priority={mappedTask.priority}
                          dueDate={mappedTask.dueDate}
                          projectName={mappedTask.courseName}
                          onDelete={handleDeleteTask}
                          onStatusChange={handleStatusChange}
                          onEdit={handleEditTask}
                        />
                      );
                    })
                  ) : (
                    <p>No tasks found for this course.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;