import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * PUBLIC_INTERFACE
 * RegisterComponent lets new users create an account and redirects to notes upon success.
 */
@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="card" style="max-width:460px;margin:40px auto;padding:20px;">
      <h2 style="margin-bottom:12px;color:#111827;">Create your account</h2>
      <p class="helper" style="margin-bottom:14px;">Get started with your personal notes.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate style="display:flex;flex-direction:column;gap:12px;">
        <div>
          <label for="email">Email</label>
          <input id="email" class="input" type="email" formControlName="email" placeholder="you@example.com" />
          <div class="helper" *ngIf="form.controls['email'].touched && form.controls['email'].invalid">Please enter a valid email.</div>
        </div>

        <div>
          <label for="password">Password</label>
          <input id="password" class="input" type="password" formControlName="password" placeholder="At least 6 characters" />
          <div class="helper" *ngIf="form.controls['password'].touched && form.controls['password'].invalid">Password must be at least 6 characters.</div>
        </div>

        <div>
          <label for="confirm">Confirm password</label>
          <input id="confirm" class="input" type="password" formControlName="confirm" placeholder="Re-enter your password" />
          <div class="helper" *ngIf="form.errors?.['mismatch'] && form.controls['confirm'].touched">Passwords do not match.</div>
        </div>

        <button class="btn primary" type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
        <div class="helper">Already have an account? <a class="link" routerLink="/login">Sign in</a>.</div>
        <div class="helper" style="color:#d32f2f" *ngIf="error">{{ error }}</div>
      </form>
    </div>
  `
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]],
  }, { validators: (group: any) => {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p && c && p === c ? null : { mismatch: true } as any;
  } });

  onSubmit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value as { email: string; password: string; };

    this.auth.register(email, password).subscribe({
      next: () => {
        this.router.navigate(['/notes']).catch(() => {});
      },
      error: (err) => {
        this.error = err?.friendlyMessage || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
