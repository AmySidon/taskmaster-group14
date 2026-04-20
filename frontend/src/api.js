const BASE_URL = 'http://localhost:5001/api'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`
  }
}

// AUTH
export async function loginUser(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data
}

export async function registerUser(username, email, password) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Registration failed')
  return data
}

// TASKS
export async function fetchTasks(filters = {}) {
  const params = new URLSearchParams(filters).toString()
  const res = await fetch(`${BASE_URL}/tasks/?${params}`, {
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch tasks')
  return data.tasks
}

export async function createTask(task) {
  const res = await fetch(`${BASE_URL}/tasks/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(task)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create task')
  return data.task
}

export async function updateTask(id, updates) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(updates)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update task')
  return data.task
}

export async function updateTaskStatus(id, status) {
  const res = await fetch(`${BASE_URL}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update status')
  return data
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to delete task')
  return data
}

// PROJECTS
export async function fetchProjects() {
  const res = await fetch(`${BASE_URL}/projects/`, {
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch projects')
  return data.projects
}

export async function createProject(name) {
  const res = await fetch(`${BASE_URL}/projects/`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create project')
  return data.project
}