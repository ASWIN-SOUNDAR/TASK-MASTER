import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="task-list-container">
      <div class="header">
        <h2>My Tasks</h2>
        <div class="controls">
          <div class="search-container">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              [(ngModel)]="searchTerm"
              class="search-input"
            />
            <span class="search-icon">🔍</span>
          </div>
          <select [(ngModel)]="filterStatus" class="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select [(ngModel)]="filterPriority" class="filter-select">
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div class="task-grid" *ngIf="(filteredTasks$ | async) as tasks">
        <div *ngIf="tasks.length === 0" class="empty-state">
          <div class="empty-icon">📝</div>
          <h3>No tasks found</h3>
          <p>Start by creating your first task</p>
          <a routerLink="/add-task" class="btn btn-primary">Add Task</a>
        </div>

        <div 
          *ngFor="let task of tasks" 
          class="task-card" 
          [class.completed]="task.status === 'completed'"
          [class.overdue]="isOverdue(task)"
        >
          <div class="task-header">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-actions">
              <button
                (click)="toggleTaskStatus(task)"
                class="btn btn-icon"
                [title]="task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'"
              >
                {{ task.status === 'completed' ? '↩️' : '✅' }}
              </button>
              <button
                (click)="toggleCommentForm(task.id)"
                class="btn btn-icon"
                [title]="commentFormOpen[task.id] ? 'Cancel comment' : 'Add comment'"
              >
                💬
              </button>
              <a
                [routerLink]="['/task', task.id]"
                class="btn btn-icon"
                title="View details"
              >
                👁️
              </a>
              <a
                [routerLink]="['/edit-task', task.id]"
                class="btn btn-icon"
                title="Edit task"
              >
                ✏️
              </a>
              <button
                (click)="deleteTask(task.id)"
                class="btn btn-icon btn-danger"
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          </div>

          <p class="task-description">{{ task.description }}</p>

          <div class="task-comments" *ngIf="task.comments && task.comments.length > 0">
            <div class="comment-count">💬 {{ task.comments.length }} comment{{ task.comments.length > 1 ? 's' : '' }}</div>
            <div class="latest-comment">
              <small>{{ task.comments[task.comments.length - 1].text | slice:0:50 }}{{ task.comments[task.comments.length - 1].text.length > 50 ? '...' : '' }}</small>
            </div>
          </div>

          <div class="comment-form" *ngIf="commentFormOpen[task.id]">
            <div class="comment-input-container">
              <textarea
                [(ngModel)]="newCommentText[task.id]"
                placeholder="Add a comment..."
                class="comment-input"
                rows="2"
                maxlength="500"
              ></textarea>
              <div class="comment-actions">
                <button
                  (click)="addComment(task.id)"
                  class="btn btn-small btn-primary"
                  [disabled]="!newCommentText[task.id]?.trim()"
                >
                  Add Comment
                </button>
                <button
                  (click)="toggleCommentForm(task.id)"
                  class="btn btn-small btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <div class="task-meta">
            <span class="priority-badge" [class]="'priority-' + task.priority">
              {{ task.priority | titlecase }}
            </span>
            <span class="status-badge" [class]="'status-' + task.status">
              {{ task.status | titlecase }}
            </span>
            <span class="due-date">
              Due: {{ task.dueDate | date:'mediumDate' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header h2 {
      color: #333;
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .controls {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-container {
      position: relative;
    }

    .search-input {
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      width: 250px;
      transition: border-color 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .search-icon {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #666;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      background: white;
      cursor: pointer;
      transition: border-color 0.3s ease;
    }

    .filter-select:focus {
      outline: none;
      border-color: #667eea;
    }

    .task-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .task-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      border: 1px solid #e1e5e9;
      transition: all 0.3s ease;
      position: relative;
    }

    .task-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }

    .task-card.completed {
      opacity: 0.7;
    }

    .task-card.completed .task-title {
      text-decoration: line-through;
      color: #666;
    }

    .task-card.overdue {
      border-left: 4px solid #ef4444;
    }

    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
      gap: 1rem;
    }

    .task-title {
      color: #333;
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      flex: 1;
      line-height: 1.4;
    }

    .task-actions {
      display: flex;
      gap: 0.5rem;
      flex-shrink: 0;
    }

    .task-description {
      color: #666;
      margin-bottom: 1rem;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .task-comments {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
    }

    .comment-count {
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .latest-comment small {
      color: #666;
      font-style: italic;
      line-height: 1.4;
    }

    .comment-form {
      margin-bottom: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e1e5e9;
    }

    .comment-input-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .comment-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e5e9;
      border-radius: 6px;
      font-family: inherit;
      font-size: 0.9rem;
      resize: vertical;
      min-height: 60px;
      transition: border-color 0.3s ease;
    }

    .comment-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .comment-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
    }

    .btn-small {
      padding: 0.5rem 1rem;
      font-size: 0.85rem;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
      color: #334155;
    }

    .priority-badge, .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority-high {
      background: #fee2e2;
      color: #dc2626;
    }

    .priority-medium {
      background: #fef3c7;
      color: #d97706;
    }

    .priority-low {
      background: #d1fae5;
      color: #059669;
    }

    .status-pending {
      background: #f3f4f6;
      color: #374151;
    }

    .status-in-progress {
      background: #dbeafe;
      color: #2563eb;
    }

    .status-completed {
      background: #d1fae5;
      color: #059669;
    }

    .due-date {
      color: #666;
      font-size: 0.9rem;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .btn-icon {
      padding: 0.4rem;
      font-size: 1rem;
      min-width: auto;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .btn-icon {
      background: #f8fafc;
      color: #64748b;
    }

    .btn-icon:hover {
      background: #e2e8f0;
      color: #475569;
    }

    .btn-danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: #666;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .empty-state p {
      margin-bottom: 2rem;
    }

    @media (max-width: 768px) {
      .task-list-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .controls {
        justify-content: center;
      }

      .search-input {
        width: 100%;
        min-width: 200px;
      }

      .task-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .task-header {
        flex-direction: column;
        gap: 0.5rem;
      }

      .task-actions {
        align-self: flex-end;
      }

      .task-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
    }
  `]
})
export class TaskListComponent implements OnInit {
  searchTerm: string = '';
  filterStatus: string = '';
  filterPriority: string = '';
  filteredTasks$: Observable<Task[]> = new Observable();
  commentFormOpen: { [taskId: string]: boolean } = {};
  newCommentText: { [taskId: string]: string } = {};

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.updateFilteredTasks();
  }

  private updateFilteredTasks(): void {
    this.filteredTasks$ = this.taskService.tasks$.pipe(
      map(tasks => this.filterTasks(tasks))
    );
  }

  private filterTasks(tasks: Task[]): Task[] {
    return tasks.filter(task => {
      const matchesSearch = !this.searchTerm || 
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.filterStatus || task.status === this.filterStatus;
      const matchesPriority = !this.filterPriority || task.priority === this.filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }

  ngAfterViewInit(): void {
    // Re-filter when search term or filters change
    this.updateFilteredTasks();
  }

  onSearchChange(): void {
    this.updateFilteredTasks();
  }

  onFilterChange(): void {
    this.updateFilteredTasks();
  }

  async toggleTaskStatus(task: Task): Promise<void> {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    await this.taskService.updateTask(task.id, {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: newStatus,
      dueDate: task.dueDate.toISOString().split('T')[0]
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    if (confirm('Are you sure you want to delete this task?')) {
      await this.taskService.deleteTask(taskId);
    }
  }

  isOverdue(task: Task): boolean {
    return task.status !== 'completed' && new Date() > task.dueDate;
  }

  toggleCommentForm(taskId: string): void {
    this.commentFormOpen[taskId] = !this.commentFormOpen[taskId];
    if (!this.commentFormOpen[taskId]) {
      this.newCommentText[taskId] = '';
    }
  }

  async addComment(taskId: string): Promise<void> {
    const commentText = this.newCommentText[taskId]?.trim();
    if (!commentText) return;

    await this.taskService.addComment(taskId, commentText);
    this.newCommentText[taskId] = '';
    this.commentFormOpen[taskId] = false;
  }
}