import { useState } from 'react';
import '../css/Task.css';

const PRIORITY_META = {
  High:   { color: '#ef4444', bg: '#fef2f2', label: 'High' },
  Medium: { color: '#f59e0b', bg: '#fffbeb', label: 'Medium' },
  Low:    { color: '#10b981', bg: '#ecfdf5', label: 'Low' },
};

const STATUS_META = {
  Pending:     { color: '#92400e', bg: '#fef3c7' },
  'In Progress': { color: '#1d4ed8', bg: '#dbeafe' },
  Completed:   { color: '#166534', bg: '#dcfce7' },
  Archived:    { color: '#475569', bg: '#f1f5f9' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr, status) {
  if (!dateStr || status === 'Completed') return false;
  return new Date(dateStr + 'T00:00:00') < new Date();
}

function TaskCard({ id, title, status, priority, dueDate, projectName, onDelete, onEdit, onStatusChange }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priorityMeta = PRIORITY_META[priority] || PRIORITY_META.Low;
  const statusMeta = STATUS_META[status] || STATUS_META.Pending;
  const overdue = isOverdue(dueDate, status);

  const handleEditSave = () => {
    if (editValue.trim() && editValue.trim() !== title) {
      onEdit(id, editValue.trim());
    }
    setEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
    if (e.key === 'Escape') { setEditValue(title); setEditing(false); }
  };

  return (
    <div
      className={`task-card ${status === 'Completed' ? 'completed' : ''} ${overdue ? 'overdue' : ''}`}
      style={{ borderLeftColor: priorityMeta.color }}
    >
      {/* Title row */}
      <div className="task-title-row">
        {editing ? (
          <input
            autoFocus
            className="task-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleEditKeyDown}
            onBlur={handleEditSave}
          />
        ) : (
          <h3
            className="task-title"
            style={{ textDecoration: status === 'Completed' ? 'line-through' : 'none' }}
          >
            {title}
          </h3>
        )}
      </div>

      {/* Meta row */}
      <div className="task-meta">
        <span
          className="badge priority-badge"
          style={{ color: priorityMeta.color, background: priorityMeta.bg }}
        >
          {priorityMeta.label}
        </span>

        {dueDate && (
          <span className={`badge due-badge ${overdue ? 'due-overdue' : ''}`}>
            {overdue ? '⚠ ' : '📅 '}{formatDate(dueDate)}
          </span>
        )}

        {projectName && (
          <span className="badge course-badge">{projectName}</span>
        )}
      </div>

      {/* Status select */}
      <div className="task-status-row">
        <select
          className="status-select"
          value={status}
          style={{ color: statusMeta.color, background: statusMeta.bg }}
          onChange={(e) => onStatusChange(id, e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      {/* Actions */}
      <div className="task-actions">
        {!editing && (
          <button className="task-btn edit-btn" onClick={() => { setEditValue(title); setEditing(true); }}>
            Edit
          </button>
        )}

        {confirmDelete ? (
          <div className="confirm-delete">
            <span>Delete?</span>
            <button className="task-btn danger-btn" onClick={() => onDelete(id)}>Yes</button>
            <button className="task-btn cancel-btn" onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        ) : (
          <button className="task-btn danger-btn" onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;