import { useState } from 'react';
import '../css/Sidebar.css';

function Sidebar({ courses, selectedCourseId, onSelectCourse, onAddCourse, onDeleteCourse }) {
  const [adding, setAdding] = useState(false);
  const [courseName, setCourseName] = useState('');

  const handleSubmit = async () => {
    const trimmed = courseName.trim();
    if (!trimmed) return;
    await onAddCourse(trimmed);
    setCourseName('');
    setAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setAdding(false);
      setCourseName('');
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Courses</span>
      </div>

      <div className="course-list">
        {courses.length === 0 && !adding && (
          <p className="empty-courses">No courses yet</p>
        )}

        {courses.map((course) => (
          <div
            key={course.id}
            className={`course-item-wrapper ${selectedCourseId === course.id ? 'active' : ''}`}
          >
            <button
              className="course-item"
              onClick={() => onSelectCourse(course.id)}
            >
              <span className="course-dot" />
              {course.name}
            </button>
            <button
              className="delete-course-btn"
              title="Remove course"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCourse(course.id);
              }}
            >
              ×
            </button>
          </div>
        ))}

        {adding && (
          <div className="course-add-inline">
            <input
              autoFocus
              type="text"
              className="course-name-input"
              placeholder="Course name…"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="course-add-actions">
              <button className="confirm-btn" onClick={handleSubmit}>Add</button>
              <button className="cancel-btn" onClick={() => { setAdding(false); setCourseName(''); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <button className="add-course-btn" onClick={() => setAdding(true)}>
          + Add Course
        </button>
      )}
    </aside>
  );
}

export default Sidebar;