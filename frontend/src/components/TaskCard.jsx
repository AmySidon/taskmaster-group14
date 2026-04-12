function TaskCard({ title, status, onDelete, onToggle, onEdit }) {
  return (
    <div className={`task-card ${status === 'Completed' ? 'completed' : ''}`}>
      <h3 style={{ textDecoration: status === 'Completed' ? 'line-through' : 'none' }}>
        {title}
      </h3>

      <p>Status: {status}</p>

      <button onClick={onToggle}>
        {status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
      </button>

      <button onClick={onEdit}>Edit</button>

      <button onClick={onDelete}>Delete</button>
    </div>
  )
}

export default TaskCard