import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { routes } from './app/app.routes';
import { NavigationComponent } from './components/navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavigationComponent],
  template: `
    <div class="app-container">
      <app-navigation></app-navigation>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    .main-content {
      min-height: calc(100vh - 80px);
      padding-top: 0;
    }

    @media (max-width: 768px) {
      .main-content {
        min-height: calc(100vh - 70px);
      }
    }
  `]
})
export class App {}

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(ReactiveFormsModule)
  ]
});