import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="form-container">
      <div class="form-header">
        <h2>{{ isEditMode ? 'Edit Task' : 'Create New Task' }}</h2>
        <button 
          type="button" 
          (click)="goBack()" 
          class="btn btn-secondary"
        >
          ← Back to Tasks
        </button>
      </div>

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
        <div class="form-row">
          <div class="form-group">
            <label for="title">Task Title *</label>
            <input
              type="text"
              id="title"
              formControlName="title"
              class="form-input"
              [class.error]="isFieldInvalid('title')"
              placeholder="Enter task title"
            />
            <div 
              *ngIf="isFieldInvalid('title')" 
              class="error-message"
            >
              <span *ngIf="taskForm.get('title')?.errors?.['required']">
                Task title is required
              </span>
              <span *ngIf="taskForm.get('title')?.errors?.['minlength']">
                Title must be at least 3 characters long
              </span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              formControlName="description"
              class="form-textarea"
              [class.error]="isFieldInvalid('description')"
              placeholder="Describe your task in detail"
              rows="4"
            ></textarea>
            <div 
              *ngIf="isFieldInvalid('description')" 
              class="error-message"
            >
              <span *ngIf="taskForm.get('description')?.errors?.['required']">
                Description is required
              </span>
              <span *ngIf="taskForm.get('description')?.errors?.['minlength']">
                Description must be at least 10 characters long
              </span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="priority">Priority *</label>
            <select
              id="priority"
              formControlName="priority"
              class="form-select"
              [class.error]="isFieldInvalid('priority')"
            >
              <option value="">Select Priority</option>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            <div 
              *ngIf="isFieldInvalid('priority')" 
              class="error-message"
            >
              Priority is required
            </div>
          </div>

          <div class="form-group">
            <label for="status">Status *</label>
            <select
              id="status"
              formControlName="status"
              class="form-select"
              [class.error]="isFieldInvalid('status')"
            >
              <option value="pending">📋 Pending</option>
              <option value="in-progress">⚡ In Progress</option>
              <option value="completed">✅ Completed</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="dueDate">Due Date *</label>
            <input
              type="date"
              id="dueDate"
              formControlName="dueDate"
              class="form-input"
              [class.error]="isFieldInvalid('dueDate')"
              [min]="minDate"
            />
            <div 
              *ngIf="isFieldInvalid('dueDate')" 
              class="error-message"
            >
              <span *ngIf="taskForm.get('dueDate')?.errors?.['required']">
                Due date is required
              </span>
              <span *ngIf="taskForm.get('dueDate')?.errors?.['dateInPast']">
                Due date cannot be in the past
              </span>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button 
            type="button" 
            (click)="resetForm()" 
            class="btn btn-secondary"
            [disabled]="!taskForm.dirty"
          >
            Reset
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="taskForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e1e5e9;
    }

    .form-header h2 {
      color: #333;
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .task-form {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
      border: 1px solid #e1e5e9;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-row:has(.form-group:nth-child(2)) {
      grid-template-columns: 1fr 1fr;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    label {
      font-weight: 600;
      color: #374151;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .form-input,
    .form-textarea,
    .form-select {
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.error,
    .form-textarea.error,
    .form-select.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 100px;
    }

    .form-select {
      cursor: pointer;
    }

    .error-message {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-weight: 500;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e1e5e9;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }

    .btn-secondary {
      background: #f8fafc;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e2e8f0;
      color: #475569;
      transform: translateY(-1px);
    }

    @media (max-width: 768px) {
      .form-container {
        padding: 1rem;
      }

      .form-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .task-form {
        padding: 1.5rem;
      }

      .form-row:has(.form-group:nth-child(2)) {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  taskId: string | null = null;
  minDate: string;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.taskForm = this.createForm();
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.taskId;

    if (this.isEditMode && this.taskId) {
      this.loadTaskForEdit(this.taskId);
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority: ['', Validators.required],
      status: ['pending', Validators.required],
      dueDate: ['', [Validators.required, this.dateValidator]]
    });
  }

  private dateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { dateInPast: true };
    }
    return null;
  }

  private loadTaskForEdit(taskId: string): void {
    const task = this.taskService.getTaskById(taskId);
    if (task) {
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toISOString().split('T')[0]
      });
    } else {
      this.router.navigate(['/tasks']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.taskForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      try {
        if (this.isEditMode && this.taskId) {
          await this.taskService.updateTask(this.taskId, this.taskForm.value);
        } else {
          await this.taskService.addTask(this.taskForm.value);
        }

        this.router.navigate(['/tasks']);
      } catch (error) {
        console.error('Error saving task:', error);
        this.isSubmitting = false;
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.taskForm.controls).forEach(key => {
        this.taskForm.get(key)?.markAsTouched();
      });
    }
  }

  resetForm(): void {
    if (this.isEditMode && this.taskId) {
      this.loadTaskForEdit(this.taskId);
    } else {
      this.taskForm.reset({
        priority: '',
        status: 'pending'
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }
}