import { useEffect, useState } from 'react';
import AuthForm from './AuthForm';
import API from './api';

interface Task {
  _id: string;
  title: string;
  completed: boolean;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handleAuthSuccess = (token: string) => {
    localStorage.setItem('token', token);
    setToken(token);

    // Decode JWT to extract email
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserEmail(payload.email || null);
    } catch {
      setUserEmail(null);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await API.get('/tasks');
        setTasks(res.data.reverse());
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      handleAuthSuccess(token); // also sets email
      fetchTasks();
    }
  }, [token]);

  if (!token) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserEmail(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl flex-1">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">📝 Your Tasks</h1>
          <div className="text-right text-sm text-gray-400">
            <p>{userEmail}</p>
            <button onClick={handleLogout} className="text-red-400 hover:underline">
              Logout
            </button>
          </div>
        </div>

        {/* Task input form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError('');

            if (!newTaskTitle.trim()) {
              setError('Task title cannot be empty!');
              return;
            }

            setSubmitting(true);
            try {
              const res = await API.post('/tasks', {
                title: newTaskTitle,
                completed: false,
              });
              setTasks([...tasks, res.data]);
              setNewTaskTitle('');
            } catch (err) {
              console.error('Failed to create task:', err);
            } finally {
              setSubmitting(false);
            }
          }}
          className="mb-4 flex flex-col sm:flex-row gap-2"
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter a task..."
            className="flex-1 px-4 py-2 rounded bg-gray-800 text-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className={`px-4 py-2 rounded text-white font-semibold ${
              submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </form>

        {error && <p className="text-red-400 mb-2 text-sm">{error}</p>}

        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Loading tasks...</p>
        ) : (
          <>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li
                  key={task._id}
                  className="bg-gray-800 px-4 py-2 rounded shadow flex justify-between items-center"
                >
                  {editingTaskId === task._id ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const updated = await API.put(`/tasks/${task._id}`, {
                            title: editedTitle,
                          });
                          setTasks(tasks.map((t) => (t._id === task._id ? updated.data : t)));
                          setEditingTaskId(null);
                          setEditedTitle('');
                        } catch (err) {
                          console.error('Failed to edit task:', err);
                        }
                      }}
                      className="flex-1 flex gap-2"
                    >
                      <input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 px-2 py-1 rounded bg-gray-700 text-white focus:outline-none"
                      />
                      <button type="submit" className="text-green-400 hover:text-green-600">💾</button>
                      <button type="button" onClick={() => setEditingTaskId(null)} className="text-gray-400 hover:text-gray-600">✖</button>
                    </form>
                  ) : (
                    <>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={async () => {
                          try {
                            const updated = await API.put(`/tasks/${task._id}`, {
                              completed: !task.completed,
                            });
                            setTasks(tasks.map((t) => (t._id === task._id ? updated.data : t)));
                          } catch (err) {
                            console.error('Failed to toggle task:', err);
                          }
                        }}
                      >
                        <span>{task.title}</span>
                        <div className="text-sm text-gray-400">
                          {task.completed ? '✔ Done' : '⏳ Pending'}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingTaskId(task._id);
                            setEditedTitle(task.title);
                          }}
                          className="text-yellow-400 hover:text-yellow-600"
                        >
                          ✏️
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={async () => {
                            try {
                              const confirmDelete = window.confirm('Are you sure you want to delete this task?');
                              if (!confirmDelete) return;

                              await API.delete(`/tasks/${task._id}`);
                              setTasks(tasks.filter((t) => t._id !== task._id));
                            } catch (err) {
                              console.error('Failed to delete task:', err);
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
            {tasks.length === 0 && (
              <p className="text-gray-400 text-center mt-4">
                No tasks yet. Start by adding one! ✨
              </p>
            )}
          </>
        )}
      </div>

      <footer className="mt-10 text-sm text-center text-gray-500">
        Built by Jarren Red Sanchez
      </footer>
    </div>
  );
}

export default App;