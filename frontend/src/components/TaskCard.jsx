import '../css/Task.css'

function TaskCard({
  title,
  status,
  priority,
  dueDate,
  onDelete,
  onEdit,
  onStatusChange
}) {
  return (
    <div className={`task-card ${status === 'Completed' ? 'completed' : ''}`}>
      <h3 style={{ textDecoration: status === 'Completed' ? 'line-through' : 'none' }}>
        {title}
      </h3>

      <p>Priority: {priority}</p>
      <p>Due: {dueDate || 'No date'}</p>

      <label>Status:</label>
      <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Archived">Archived</option>
      </select>

      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
    </div>
  )
}

export default TaskCard