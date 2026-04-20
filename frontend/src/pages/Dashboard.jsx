import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  fetchProjects,
  createProject
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
    if (!newProjectName.trim()) return;

    try {
      const project = await createProject(newProjectName.trim());
      setProjects((prev) => [...prev, project]);
      setSelectedProjectId(project.id);
      setNewProjectName('');
    } catch (err) {
      alert('Error creating project/course: ' + err.message);
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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="dashboard-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <h1>Dashboard</h1>
        <p>Welcome to TaskMaster.</p>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="course-section">
          <h2>Courses / Projects</h2>

          <div className="add-course">
            <input
              type="text"
              placeholder="Enter course name"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
            />
            <button onClick={handleAddProject}>Add Course</button>
          </div>

          <div className="course-list">
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} style={{ marginBottom: '10px' }}>
                  <button
                    onClick={() => setSelectedProjectId(project.id)}
                    style={{
                      fontWeight:
                        selectedProjectId === project.id ? 'bold' : 'normal',
                      marginRight: '10px'
                    }}
                  >
                    {project.name}
                  </button>
                </div>
              ))
            ) : (
              <p>No courses/projects yet.</p>
            )}
          </div>
        </div>

        <hr />

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
                  <button onClick={() => setFilterStatus('Pending')}>
                    Pending
                  </button>
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

              <div className="task-list">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => {
                    const mappedTask = {
                      ...task,
                      dueDate: task.due_date,
                      courseId: task.project_id,
                      courseName: task.project_name
                    };

                    return (
                      <TaskCard
                        key={task.id}
                        task={mappedTask}
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
  );
}

export default Dashboard;