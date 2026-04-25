import '../css/Task.css'

function TaskCard({
  id,
  title,
  status,
  priority,
  dueDate,
  projectName,
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
      {projectName && <p>Course: {projectName}</p>}

      <label>Status:</label>
      <select value={status} onChange={(e) => onStatusChange(id, e.target.value)}>
        <option value="Pending">Pending</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Archived">Archived</option>
      </select>

      <button onClick={() => onEdit(id)}>Edit</button>
      <button onClick={() => onDelete(id)}>Delete</button>
    </div>
  )
}

export default TaskCard