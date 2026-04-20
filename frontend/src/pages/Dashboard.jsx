import { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';

function Dashboard() {
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem('courses');
    return savedCourses
      ? JSON.parse(savedCourses)
      : [
          { id: 1, name: 'CS 4398' }, // Temporary fake data. In the future, this will come from the backend.
          { id: 2, name: 'CS 4328' }
        ];
  });

  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('tasks');
    return savedTasks
      ? JSON.parse(savedTasks)
      : [
          {
            id: 1, // Temporary fake data. In the future, this will come from the backend.
            title: 'Finish frontend',
            status: 'Pending',
            priority: 'High',
            dueDate: '2026-04-15',
            courseId: 1
          },
          {
            id: 2,
            title: 'Create backend routes',
            status: 'In Progress',
            priority: 'Medium',
            dueDate: '2026-04-18',
            courseId: 1
          },
          {
            id: 3,
            title: 'Connect database',
            status: 'Completed',
            priority: 'Low',
            dueDate: '2026-04-10',
            courseId: 2
          }
        ];
  });

  const [selectedCourseId, setSelectedCourseId] = useState(() => {
    const savedSelectedCourse = localStorage.getItem('selectedCourseId');
    return savedSelectedCourse ? JSON.parse(savedSelectedCourse) : 1;
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('Low');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const [newCourseName, setNewCourseName] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('selectedCourseId', JSON.stringify(selectedCourseId));
  }, [selectedCourseId]);

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;

    const newCourse = {
      id: Date.now(),
      name: newCourseName.trim()
    };

    setCourses([...courses, newCourse]);
    setSelectedCourseId(newCourse.id);
    setNewCourseName('');
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !newTaskDueDate || !selectedCourseId) return;

    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      status: 'Pending',
      priority: newTaskPriority,
      dueDate: newTaskDueDate,
      courseId: selectedCourseId
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskPriority('Low');
    setNewTaskDueDate('');
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleDeleteCourse = (courseId) => {
    const updatedCourses = courses.filter((course) => course.id !== courseId);
    const updatedTasks = tasks.filter((task) => task.courseId !== courseId);

    setCourses(updatedCourses);
    setTasks(updatedTasks);

    if (selectedCourseId === courseId) {
      setSelectedCourseId(updatedCourses.length > 0 ? updatedCourses[0].id : null);
    }
  };

  const selectedCourse = courses.find((course) => course.id === selectedCourseId);

  const filteredTasks = tasks.filter((task) => {
    const matchesCourse = task.courseId === selectedCourseId;
    const matchesSearch = task.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === 'All' ? true : task.status === filterStatus;

    return matchesCourse && matchesSearch && matchesStatus;
  });

  if (loading) return <div><Navbar /><div className="dashboard-container"><p>Loading...</p></div></div>

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <p>Welcome to TaskMaster.</p>

      <div className="course-section">
        <h2>Courses</h2>

        <div className="add-course">
          <input
            type="text"
            placeholder="Enter course name"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
          />
          <button onClick={handleAddCourse}>Add Course</button>
        </div>

        <div className="course-list">
          {courses.map((course) => (
            <div key={course.id} style={{ marginBottom: '10px' }}>
              <button
                onClick={() => setSelectedCourseId(course.id)}
                style={{
                  fontWeight: selectedCourseId === course.id ? 'bold' : 'normal',
                  marginRight: '10px'
                }}
              >
                {course.name}
              </button>
              <button onClick={() => handleDeleteCourse(course.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>

      <hr />

      <div className="task-section">
        <h2>
          {selectedCourse ? `${selectedCourse.name} Tasks` : 'No Course Selected'}
        </h2>

        {selectedCourse && (
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

            <div className="task-list">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))
              ) : (
                <p>No tasks found for this course.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;