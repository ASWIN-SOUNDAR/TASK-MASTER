import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="details-container" *ngIf="task; else notFound">
      <div class="details-header">
        <div class="header-content">
          <h2>{{ task.title }}</h2>
          <div class="task-badges">
            <span class="priority-badge" [class]="'priority-' + task.priority">
              {{ task.priority | titlecase }} Priority
            </span>
            <span class="status-badge" [class]="'status-' + task.status">
              {{ task.status | titlecase }}
            </span>
            <span *ngIf="isOverdue()" class="overdue-badge">
              Overdue
            </span>
          </div>
        </div>
        <div class="header-actions">
          <button 
            (click)="toggleTaskStatus()"
            class="btn btn-primary"
          >
            {{ task.status === 'completed' ? '↩️ Mark Incomplete' : '✅ Mark Complete' }}
          </button>
          <a 
            [routerLink]="['/edit-task', task.id]" 
            class="btn btn-secondary"
          >
            ✏️ Edit Task
          </a>
          <button 
            (click)="deleteTask()"
            class="btn btn-danger"
          >
            🗑️ Delete
          </button>
          <button 
            (click)="goBack()" 
            class="btn btn-outline"
          >
            ← Back to Tasks
          </button>
        </div>
      </div>

      <div class="details-content">
        <div class="content-section">
          <h3>Description</h3>
          <div class="description-box">
            <p>{{ task.description }}</p>
          </div>
        </div>

        <div class="details-grid">
          <div class="detail-card">
            <div class="detail-icon">📅</div>
            <div class="detail-content">
              <h4>Due Date</h4>
              <p class="detail-value" [class.overdue]="isOverdue()">
                {{ task.dueDate | date:'fullDate' }}
              </p>
              <small class="detail-time">{{ task.dueDate | date:'shortTime' }}</small>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">🏷️</div>
            <div class="detail-content">
              <h4>Priority Level</h4>
              <p class="detail-value priority-text" [class]="'priority-' + task.priority">
                {{ task.priority | titlecase }}
              </p>
              <small class="detail-description">
                {{ getPriorityDescription() }}
              </small>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">⏱️</div>
            <div class="detail-content">
              <h4>Current Status</h4>
              <p class="detail-value status-text" [class]="'status-' + task.status">
                {{ task.status | titlecase }}
              </p>
              <small class="detail-description">
                {{ getStatusDescription() }}
              </small>
            </div>
          </div>

          <div class="detail-card">
            <div class="detail-icon">📊</div>
            <div class="detail-content">
              <h4>Time Tracking</h4>
              <p class="detail-value">
                {{ getDaysUntilDue() }}
              </p>
              <small class="detail-description">
                Created {{ task.createdAt | date:'mediumDate' }}
              </small>
            </div>
          </div>
        </div>

        <div class="timeline-section">
          <h3>Task Timeline</h3>
          <div class="timeline">
            <div class="timeline-item completed">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h4>Task Created</h4>
                <p>{{ task.createdAt | date:'medium' }}</p>
              </div>
            </div>
            
            <div class="timeline-item" [class.completed]="task.status !== 'pending'">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h4>In Progress</h4>
                <p *ngIf="task.status === 'pending'">Not started yet</p>
                <p *ngIf="task.status !== 'pending'">Task is being worked on</p>
              </div>
            </div>
            
            <div class="timeline-item" [class.completed]="task.status === 'completed'">
              <div class="timeline-marker"></div>
              <div class="timeline-content">
                <h4>Completed</h4>
                <p *ngIf="task.status === 'completed'">Task completed successfully!</p>
                <p *ngIf="task.status !== 'completed'">Pending completion</p>
              </div>
            </div>
          </div>
        </div>

        <div class="metadata-section">
          <div class="metadata-grid">
            <div class="metadata-item">
              <strong>Created:</strong>
              <span>{{ task.createdAt | date:'medium' }}</span>
            </div>
            <div class="metadata-item">
              <strong>Last Updated:</strong>
              <span>{{ task.updatedAt | date:'medium' }}</span>
            </div>
            <div class="metadata-item">
              <strong>Task ID:</strong>
              <span class="task-id">{{ task.id }}</span>
            </div>
          </div>
        </div>

        <div class="comments-section">
          <h3>Comments</h3>
          <div class="comments-list">
            <div *ngFor="let comment of task.comments" class="comment">
              <p>{{ comment.text }}</p>
              <div class="comment-meta">
                <small>{{ comment.createdAt | date:'medium' }}</small>
                <button (click)="deleteComment(comment.id)" class="btn btn-danger btn-sm">🗑️ Delete</button>
              </div>
            </div>
          </div>
          <div class="add-comment">
            <textarea
              [(ngModel)]="newComment"
              placeholder="Add a comment..."
              rows="3"
              class="comment-input"
            ></textarea>
            <button (click)="addComment()" class="btn btn-primary">Add Comment</button>
          </div>
        </div>
      </div>
    </div>

    <ng-template #notFound>
      <div class="not-found">
        <div class="not-found-content">
          <div class="not-found-icon">🔍</div>
          <h2>Task Not Found</h2>
          <p>The task you're looking for doesn't exist or has been deleted.</p>
          <a routerLink="/tasks" class="btn btn-primary">Return to Tasks</a>
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .details-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    .details-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
    }

    .header-content {
      margin-bottom: 1.5rem;
    }

    .details-header h2 {
      margin: 0 0 1rem 0;
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .task-badges {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .priority-badge, .status-badge, .overdue-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .priority-high { background: rgba(255, 255, 255, 0.2); }
    .priority-medium { background: rgba(255, 255, 255, 0.15); }
    .priority-low { background: rgba(255, 255, 255, 0.1); }
    .status-pending { background: rgba(255, 255, 255, 0.1); }
    .status-in-progress { background: rgba(255, 255, 255, 0.15); }
    .status-completed { background: rgba(255, 255, 255, 0.2); }
    .overdue-badge { background: rgba(239, 68, 68, 0.8); }

    .header-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .details-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .content-section h3 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .description-box {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .description-box p {
      color: #666;
      line-height: 1.6;
      margin: 0;
      font-size: 1.1rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .detail-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .detail-card:hover {
      transform: translateY(-2px);
    }

    .detail-icon {
      font-size: 2rem;
      flex-shrink: 0;
    }

    .detail-content h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1rem;
      font-weight: 600;
    }

    .detail-value {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .detail-value.overdue {
      color: #ef4444;
    }

    .detail-time, .detail-description {
      color: #666;
      font-size: 0.9rem;
      margin: 0;
    }

    .priority-text.priority-high { color: #dc2626; }
    .priority-text.priority-medium { color: #d97706; }
    .priority-text.priority-low { color: #059669; }

    .status-text.status-pending { color: #374151; }
    .status-text.status-in-progress { color: #2563eb; }
    .status-text.status-completed { color: #059669; }

    .timeline-section h3 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 1rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e1e5e9;
    }

    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .timeline-marker {
      position: absolute;
      left: -2.5rem;
      top: 1.5rem;
      width: 1rem;
      height: 1rem;
      border-radius: 50%;
      background: #e1e5e9;
      border: 3px solid white;
    }

    .timeline-item.completed .timeline-marker {
      background: #059669;
    }

    .timeline-content h4 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-weight: 600;
    }

    .timeline-content p {
      margin: 0;
      color: #666;
    }

    .metadata-section {
      background: #f8fafc;
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid #e1e5e9;
    }

    .metadata-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .metadata-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e1e5e9;
    }

    .metadata-item:last-child {
      border-bottom: none;
    }

    .comments-section h3 {
      color: #333;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .comments-list {
      margin-bottom: 2rem;
    }

    .comment {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      margin-bottom: 1rem;
    }

    .comment p {
      margin: 0 0 1rem 0;
      color: #333;
      line-height: 1.6;
    }

    .comment-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .comment-meta small {
      color: #666;
    }

    .add-comment {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid #e1e5e9;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .comment-input {
      width: 100%;
      padding: 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      margin-bottom: 1rem;
      resize: vertical;
    }

    .comment-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.8rem;
    }

    .task-id {
      font-family: monospace;
      background: #e1e5e9;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.85rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.95rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      gap: 0.5rem;
    }

    .btn-primary {
      background: #059669;
      color: white;
    }

    .btn-primary:hover {
      background: #047857;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: #667eea;
      color: white;
    }

    .btn-secondary:hover {
      background: #5a67d8;
      transform: translateY(-1px);
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .not-found {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 60vh;
      padding: 2rem;
    }

    .not-found-content {
      text-align: center;
      max-width: 500px;
    }

    .not-found-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .not-found h2 {
      color: #333;
      margin-bottom: 1rem;
      font-size: 2rem;
    }

    .not-found p {
      color: #666;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .details-container {
        padding: 1rem;
      }

      .details-header {
        padding: 1.5rem;
      }

      .details-header h2 {
        font-size: 1.8rem;
      }

      .header-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .task-badges {
        flex-direction: column;
        align-items: flex-start;
      }

      .metadata-grid {
        grid-template-columns: 1fr;
      }

      .metadata-item {
        flex-direction: column;
        gap: 0.5rem;
      }

      .timeline {
        padding-left: 1.5rem;
      }

      .timeline-marker {
        left: -2rem;
      }
    }
  `]
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
  task: Task | undefined;
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const taskId = this.route.snapshot.paramMap.get('id');
    if (taskId) {
      // Subscribe to tasks observable to get the task once loaded
      this.subscription = this.taskService.tasks$.subscribe(tasks => {
        this.task = tasks.find(task => task.id === taskId);
      });
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  isOverdue(): boolean {
    return this.task ? 
      (this.task.status !== 'completed' && new Date() > this.task.dueDate) : 
      false;
  }

  getPriorityDescription(): string {
    if (!this.task) return '';
    
    const descriptions = {
      high: 'Urgent - needs immediate attention',
      medium: 'Important - should be completed soon',
      low: 'Normal - can be completed when convenient'
    };
    return descriptions[this.task.priority];
  }

  getStatusDescription(): string {
    if (!this.task) return '';
    
    const descriptions = {
      pending: 'Task is waiting to be started',
      'in-progress': 'Currently being worked on',
      completed: 'Task has been finished'
    };
    return descriptions[this.task.status];
  }

  getDaysUntilDue(): string {
    if (!this.task) return '';
    
    const now = new Date();
    const dueDate = new Date(this.task.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `${diffDays} days remaining`;
    }
  }

  toggleTaskStatus(): void {
    if (!this.task) return;
    
    const newStatus = this.task.status === 'completed' ? 'pending' : 'completed';
    this.taskService.updateTask(this.task.id, {
      title: this.task.title,
      description: this.task.description,
      priority: this.task.priority,
      status: newStatus,
      dueDate: this.task.dueDate.toISOString().split('T')[0]
    });
    
    // Refresh task data
    this.task = this.taskService.getTaskById(this.task.id);
  }

  deleteTask(): void {
    if (!this.task) return;
    
    if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      this.taskService.deleteTask(this.task.id);
      this.router.navigate(['/tasks']);
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  newComment: string = '';

  addComment(): void {
    if (!this.task || !this.newComment.trim()) return;

    this.taskService.addComment(this.task.id, this.newComment.trim());
    this.newComment = '';
  }

  deleteComment(commentId: string): void {
    if (!this.task) return;

    if (confirm('Are you sure you want to delete this comment?')) {
      this.taskService.deleteComment(this.task.id, commentId);
    }
  }
}