import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Task, TaskFormData, Comment } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private supabase: SupabaseClient;
  private tasksSubject = new BehaviorSubject<Task[]>([]);

  constructor() {
    this.supabase = createClient(
      'https://asjhkjirjutcbmgettek.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzamhramlyanV0Y2JtZ2V0dGVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MzAyMDEsImV4cCI6MjA3NDEwNjIwMX0.qEhBMO0mGi_7A5YHoRo8okphDq7PF_MUg2_hXeIz5Bw'
    );
    this.loadTasks();
  }

  get tasks$(): Observable<Task[]> {
    return this.tasksSubject.asObservable();
  }

  get tasks(): Task[] {
    return this.tasksSubject.value;
  }

  private async loadTasks(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('tasks')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      if (data) {
        const tasks = data.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          comments: (task.comments || []).map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt)
          }))
        }));
        this.tasksSubject.next(tasks);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  }



  async addTask(taskData: TaskFormData): Promise<void> {
    const newTask = {
      id: this.generateId(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: new Date(taskData.dueDate).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    try {
      const { error } = await this.supabase
        .from('tasks')
        .insert([newTask]);

      if (error) {
        console.error('Error adding task:', error);
        return;
      }

      // Reload tasks to get the updated list
      await this.loadTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async updateTask(id: string, taskData: TaskFormData): Promise<void> {
    const updatedTask = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      dueDate: new Date(taskData.dueDate).toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const { error } = await this.supabase
        .from('tasks')
        .update(updatedTask)
        .eq('id', id);

      if (error) {
        console.error('Error updating task:', error);
        return;
      }

      // Reload tasks to get the updated list
      await this.loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        return;
      }

      // Reload tasks to get the updated list
      await this.loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  async addComment(taskId: string, commentText: string): Promise<void> {
    const task = this.getTaskById(taskId);
    if (!task) return;

    const newComment: Comment = {
      id: this.generateId(),
      text: commentText,
      createdAt: new Date()
    };

    const updatedComments = [...task.comments, newComment];

    try {
      const { error } = await this.supabase
        .from('tasks')
        .update({ comments: updatedComments })
        .eq('id', taskId);

      if (error) {
        console.error('Error adding comment:', error);
        return;
      }

      await this.loadTasks();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  }

  async deleteComment(taskId: string, commentId: string): Promise<void> {
    const task = this.getTaskById(taskId);
    if (!task) return;

    const updatedComments = task.comments.filter(c => c.id !== commentId);

    try {
      const { error } = await this.supabase
        .from('tasks')
        .update({ comments: updatedComments })
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting comment:', error);
        return;
      }

      await this.loadTasks();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(task => task.id === id);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}