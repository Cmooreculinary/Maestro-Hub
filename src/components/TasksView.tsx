import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  AlertCircle,
  Clock,
  Filter,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types';

export default function TasksView({ onUpdate }: { onUpdate: () => void }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, priority }),
      });
      if (res.ok) {
        setNewTaskTitle('');
        fetchTasks();
        onUpdate();
      }
    } catch (err) {
      console.error('Failed to add task', err);
    }
  };

  const toggleTask = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
      onUpdate();
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      fetchTasks();
      onUpdate();
    } catch (err) {
      console.error('Failed to delete task', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-zinc-500 text-sm">Manage your daily objectives and milestones.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <form onSubmit={addTask} className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Plus className="w-5 h-5 text-zinc-500 group-focus-within:text-yellow-400 transition-colors" />
        </div>
        <input 
          type="text" 
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..." 
          className="w-full pl-12 pr-32 py-4 bg-[#0F0F0F] border border-white/5 rounded-2xl focus:outline-none focus:ring-1 focus:ring-yellow-400/50 transition-all text-lg"
        />
        <div className="absolute inset-y-2 right-2 flex items-center gap-2">
          <select 
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none h-full"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button 
            type="submit"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-xl text-sm font-bold transition-all h-full"
          >
            Add
          </button>
        </div>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20 bg-[#0F0F0F] border border-dashed border-white/10 rounded-3xl">
            <CheckCircle className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No tasks found. Start by adding one above.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group flex items-center gap-4 p-4 bg-[#0F0F0F] border border-white/5 rounded-2xl hover:border-white/10 transition-all"
              >
                <button 
                  onClick={() => toggleTask(task.id, task.status)}
                  className="shrink-0 text-zinc-600 hover:text-yellow-400 transition-colors"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-medium truncate transition-all ${
                    task.status === 'completed' ? 'text-zinc-600 line-through' : 'text-zinc-200'
                  }`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                      task.priority === 'high' ? 'bg-red-500/10 text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(task.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
