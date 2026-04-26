import '../css/Sidebar.css';

function Sidebar({ courses, selectedCourseId, onSelectCourse, onAddCourse, onDeleteCourse }) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">TaskMaster</h2>

      <button className="add-course-btn" onClick={onAddCourse}>
        + Add Course
      </button>

      <div className="course-list">
        {courses.length === 0 ? (
          <p className="empty-courses">No courses yet</p>
        ) : (
          courses.map((course) => (
            <div
                key={course.id}
                className={
                selectedCourseId === course.id
                    ? 'course-item-wrapper active'
                    : 'course-item-wrapper'
                }
            >
                <button
                className="course-item"
                onClick={() => onSelectCourse(course.id)}
                >
                {course.name}
                </button>

                <button
                className="delete-course-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCourse(course.id);
                }}
                >
                ×
                </button>
            </div>
            ))
        )}
      </div>
    </aside>
  );
}

export default Sidebar;