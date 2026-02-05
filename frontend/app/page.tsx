'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

type Status = 'Todo' | 'In-Progress' | 'Done';
type Priority = 'Low' | 'Med' | 'High';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  status: Status;
  priority: Priority;
  project_id: number;
}

interface AIIntakeResponse {
  title: string;
  priority: Priority;
}

export default function Page() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSmartIntake, setShowSmartIntake] = useState(false);
  
  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<Priority>('Med');
  const [formStatus, setFormStatus] = useState<Status>('Todo');
  const [smartIntakeInput, setSmartIntakeInput] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<AIIntakeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize: Create or get default project
  useEffect(() => {
    const initializeProject = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/projects`);
        if (response.ok) {
          const projectsList = await response.json();
          if (projectsList.length > 0) {
            setProjects(projectsList);
            setSelectedProject(projectsList[0]);
          } else {
            // Create default project
            const createResponse = await fetch(`${API_BASE}/api/projects`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: 'My Project' }),
            });
            if (createResponse.ok) {
              const newProject = await createResponse.json();
              setProjects([newProject]);
              setSelectedProject(newProject);
            }
          }
        }
      } catch (err) {
        setError('Failed to initialize project');
      }
    };
    initializeProject();
  }, []);

  // Load tasks when project or filter changes
  useEffect(() => {
    if (selectedProject) {
      loadTasks();
    }
  }, [selectedProject, statusFilter]);

  const loadTasks = async () => {
    if (!selectedProject) return;
    try {
      const url = statusFilter === 'All' 
        ? `${API_BASE}/api/projects/${selectedProject.id}/tasks`
        : `${API_BASE}/api/projects/${selectedProject.id}/tasks?status=${statusFilter}`;
      const response = await fetch(url);
      if (response.ok) {
        const tasksList = await response.json();
        setTasks(tasksList);
      }
    } catch (err) {
      setError('Failed to load tasks');
    }
  };

  const handleSmartIntake = async () => {
    if (!smartIntakeInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/ai/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: smartIntakeInput }),
      });
      if (response.ok) {
        const suggestion = await response.json();
        setAiSuggestion(suggestion);
        setFormTitle(suggestion.title);
        setFormPriority(suggestion.priority);
        setShowSmartIntake(false);
        setShowCreateForm(true);
        setSmartIntakeInput('');
      } else {
        setError('Failed to get AI suggestion');
      }
    } catch (err) {
      setError('Failed to get AI suggestion');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !formTitle.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/api/projects/${selectedProject.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          description: formDescription || undefined,
          priority: formPriority,
          status: formStatus,
        }),
      });
      if (response.ok) {
        // Reset form and reload tasks
        setFormTitle('');
        setFormDescription('');
        setFormPriority('Med');
        setFormStatus('Todo');
        setAiSuggestion(null);
        setShowCreateForm(false);
        await loadTasks();
      } else {
        setError('Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: number, newStatus: Status) => {
    try {
      const response = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await loadTasks();
      }
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50';
      case 'Med': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

      {error && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#fee', 
          color: '#c00', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Project Selector */}
      {projects.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <label style={{ marginRight: '8px', fontWeight: '500' }}>Project:</label>
          <select
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = projects.find(p => p.id === parseInt(e.target.value));
              setSelectedProject(project || null);
            }}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Status Filter */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <label style={{ fontWeight: '500' }}>Filter by Status:</label>
        {(['All', 'Todo', 'In-Progress', 'Done'] as const).map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              backgroundColor: statusFilter === status ? '#0070f3' : 'white',
              color: statusFilter === status ? 'white' : 'black',
              cursor: 'pointer',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setShowSmartIntake(false);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {showCreateForm ? 'Cancel' : '+ Create Task'}
        </button>
        <button
          onClick={() => {
            setShowSmartIntake(!showSmartIntake);
            setShowCreateForm(false);
          }}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500',
          }}
        >
          {showSmartIntake ? 'Cancel' : '✨ Smart Intake'}
        </button>
      </div>

      {/* Smart Intake Form */}
      {showSmartIntake && (
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ marginBottom: '12px', fontSize: '20px' }}>Smart Intake</h2>
          <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
            Paste your task description and we'll suggest a title and priority.
          </p>
          <textarea
            value={smartIntakeInput}
            onChange={(e) => setSmartIntakeInput(e.target.value)}
            placeholder="e.g., URGENT: Fix the critical bug in production that's causing errors..."
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '12px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginBottom: '12px',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSmartIntake}
            disabled={loading || !smartIntakeInput.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : 'Get Suggestion'}
          </button>
        </div>
      )}

      {/* Create Task Form */}
      {showCreateForm && (
        <div style={{
          padding: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          marginBottom: '24px',
          backgroundColor: '#f9fafb',
        }}>
          <h2 style={{ marginBottom: '16px', fontSize: '20px' }}>
            {aiSuggestion ? 'Create Task (AI Suggested)' : 'Create Task'}
          </h2>
          {aiSuggestion && (
            <div style={{
              padding: '12px',
              backgroundColor: '#e0f2fe',
              borderRadius: '4px',
              marginBottom: '16px',
              fontSize: '14px',
            }}>
              <strong>AI Suggestion:</strong> Title: "{aiSuggestion.title}", Priority: {aiSuggestion.priority}
            </div>
          )}
          <form onSubmit={handleCreateTask}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Priority
                </label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as Priority)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="Low">Low</option>
                  <option value="Med">Med</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as Status)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                >
                  <option value="Todo">Todo</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !formTitle.trim()}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#ccc' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '500',
              }}
            >
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </form>
        </div>
      )}

      {/* Task List */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Tasks ({tasks.length})
        </h2>
        {tasks.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No tasks found. Create one to get started!</p>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {tasks.map(task => (
              <div
                key={task.id}
                style={{
                  padding: '16px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        ...(getPriorityColor(task.priority) === 'text-red-600 bg-red-50' 
                          ? { backgroundColor: '#fee', color: '#c00' }
                          : getPriorityColor(task.priority) === 'text-yellow-600 bg-yellow-50'
                          ? { backgroundColor: '#fef3c7', color: '#92400e' }
                          : { backgroundColor: '#d1fae5', color: '#065f46' }
                        ),
                      }}
                    >
                      {task.priority}
                    </span>
                    <select
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Status)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        fontSize: '14px',
                      }}
                    >
                      <option value="Todo">Todo</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
