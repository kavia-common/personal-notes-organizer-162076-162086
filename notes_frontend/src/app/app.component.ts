import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { environment } from '../environments/environment';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = environment.appName;
  auth = inject(AuthService);
  private router = inject(Router);

  // PUBLIC_INTERFACE
  // Navigate to the notes list
  goNotes() {
    this.router.navigate(['/notes']).catch(() => {});
  }

  // PUBLIC_INTERFACE
  // Log the user out and redirect to login
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']).catch(() => {});
  }
}
