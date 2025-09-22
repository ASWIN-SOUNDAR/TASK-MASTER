# Angular Task Manager

A modern, responsive task management web application built with Angular 20, featuring a clean interface and comprehensive task management capabilities.

## Features

### Core Functionality
- **Task Management**: Create, read, update, and delete tasks
- **Task Status Tracking**: Manage tasks through different states (Pending, In Progress, Completed)
- **Priority Levels**: Set task priorities (Low, Medium, High) with visual indicators
- **Due Date Management**: Set and track task due dates with overdue notifications
- **Search & Filter**: Search tasks by title/description and filter by status/priority

### User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with smooth animations
- **Multiple Views**: 
  - Task List: Grid view with search and filtering
  - Task Details: Comprehensive task information with timeline
  - Task Form: Create and edit tasks with validation
- **Visual Feedback**: Status badges, priority indicators, and overdue warnings

### Technical Features
- **Angular 20**: Built with the latest Angular version
- **Reactive Forms**: Form validation and real-time feedback
- **Angular Router**: Navigation between different views
- **Supabase Integration**: Real-time database with PostgreSQL backend
- **TypeScript**: Full type safety throughout the application
- **Standalone Components**: Modern Angular architecture

## Setup Instructions

### Prerequisites
- Node.js (version 18 or higher)
- npm (comes with Node.js)

### Installation
1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up Supabase database:
   - Create a new project at https://supabase.com
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL commands from `supabase-schema.sql` to create the tasks table
   - Copy your project URL and anon key from Settings > API
   - Update the credentials in `src/services/task.service.ts`

### Running the Application
1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:4200`
3. The application will automatically reload when you make changes

### Building for Production
To build the project for production:
```bash
npm run build
```
The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── navigation/           # Navigation component
│   ├── task-list/           # Task list view with filtering
│   ├── task-form/           # Create/edit task form
│   └── task-details/        # Detailed task view
├── models/
│   └── task.model.ts        # Task interface and types
├── services/
│   └── task.service.ts      # Task data management service
├── app/
│   └── app.routes.ts        # Application routing configuration
├── global_styles.css        # Global styles and utilities
└── main.ts                  # Application bootstrap
```

## Usage Guide

### Creating Tasks
1. Click "Add Task" in the navigation or the "Add Task" button
2. Fill in the required fields:
   - Task Title (minimum 3 characters)
   - Description (minimum 10 characters)
   - Priority level
   - Status
   - Due date
3. Click "Create Task" to save

### Managing Tasks
- **View All Tasks**: Navigate to the Tasks page to see all your tasks
- **Search**: Use the search bar to find tasks by title or description
- **Filter**: Use dropdown filters to show tasks by status or priority
- **Quick Actions**: From the task list, you can:
  - Mark tasks as complete/incomplete
  - View task details
  - Edit tasks
  - Delete tasks

### Task Details
- Click the eye icon or task title to view detailed information
- See task timeline, metadata, and full description
- Edit or delete tasks from the details page

### Responsive Design
- **Desktop**: Full grid layout with side-by-side controls
- **Tablet**: Adjusted layout with stacked controls
- **Mobile**: Single-column layout with touch-friendly interface

## Technical Implementation

### Data Management
- Tasks are stored in Supabase PostgreSQL database for persistence
- Real-time data synchronization across devices
- TaskService manages all CRUD operations
- Reactive data flow using RxJS observables

### Form Validation
- Required field validation
- Minimum length validation
- Date validation (no past dates)
- Real-time validation feedback

### Routing
- Clean URLs for all views
- Route parameters for task editing and details
- Navigation guards and redirects

### Styling
- Mobile-first responsive design
- CSS Grid and Flexbox layouts
- Custom CSS properties for theming
- Smooth animations and transitions

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements
- User authentication and multi-user support
- Task categories and tags
- Task attachments
- Due date reminders
- Export functionality
- Dark mode theme
- Drag and drop task reordering

## Contributing
This is a demo application. For production use, consider adding:
- Unit and integration tests
- Error handling and logging
- Backend API integration
- User authentication
- Performance optimizations

---

Built with ❤️ using Angular 20