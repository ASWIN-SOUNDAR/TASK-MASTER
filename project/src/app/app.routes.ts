import { Routes } from '@angular/router';
import { TaskListComponent } from '../components/task-list/task-list.component';
import { TaskFormComponent } from '../components/task-form/task-form.component';
import { TaskDetailsComponent } from '../components/task-details/task-details.component';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks', pathMatch: 'full' },
  { path: 'tasks', component: TaskListComponent },
  { path: 'add-task', component: TaskFormComponent },
  { path: 'edit-task/:id', component: TaskFormComponent },
  { path: 'task/:id', component: TaskDetailsComponent },
  { path: '**', redirectTo: '/tasks' }
];