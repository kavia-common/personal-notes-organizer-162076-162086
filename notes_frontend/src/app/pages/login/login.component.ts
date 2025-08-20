import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * PUBLIC_INTERFACE
 * LoginComponent provides a minimal login form integrated with the AuthService.
 * On success, it redirects to the intended route or notes page.
 */
@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="card" style="max-width:420px;margin:40px auto;padding:20px;">
      <h2 style="margin-bottom:12px;color:#111827;">Welcome back</h2>
      <p class="helper" style="margin-bottom:14px;">Sign in to manage your notes.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <label for="email">Email</label>
          <input id="email" class="input" type="email" formControlName="email" placeholder="you@example.com" />
          <div class="helper" *ngIf="form.controls.email.touched && form.controls.email.invalid">Please enter a valid email.</div>
        </div>

        <div>
          <label for="password">Password</label>
          <input id="password" class="input" type="password" formControlName="password" placeholder="••••••••" />
          <div class="helper" *ngIf="form.controls.password.touched && form.controls.password.invalid">Password is required (min 6).</div>
        </div>

        <button class="btn primary" type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
        <div class="helper">Don't have an account? <a class="link" routerLink="/register">Create one</a>.</div>
        <div class="helper" style="color:#d32f2f" *ngIf="error">{{ error }}</div>
      </form>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value as { email: string; password: string; };

    this.auth.login(email, password).subscribe({
      next: () => {
        const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/notes';
        this.router.navigateByUrl(redirect).catch(() => {});
      },
      error: (err) => {
        this.error = err?.friendlyMessage || 'Login failed';
        this.loading = false;
      }
    });
  }
}
