import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-auth-intent',
  imports: [CommonModule],
  template: `
  <div class="min-h-[60vh] grid place-items-center p-6">
    <div class="bg-white rounded-lg shadow p-8 w-full max-w-md text-center">
      <h2 class="text-xl font-semibold mb-2">Continue to {{ intent === 'book' ? 'booking' : 'renting' }}</h2>
      <p class="text-sm text-gray-600 mb-6">You need an account to proceed.</p>
      <div class="space-y-3">
        <button (click)="go('signup')" class="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800">Sign up</button>
        <button (click)="go('login')" class="w-full border border-gray-300 py-2 rounded hover:bg-gray-50">I already have an account</button>
      </div>
    </div>
  </div>
  `
})
export class AuthIntentComponent {
  intent = 'rent';
  returnUrl = '/';
  constructor(private route: ActivatedRoute, private router: Router) {
    const q = this.route.snapshot.queryParamMap;
    this.intent = q.get('intent') || 'rent';
    this.returnUrl = q.get('returnUrl') || '/';
  }
  go(which: 'signup' | 'login') {
    this.router.navigate(['/' + which], { queryParams: { returnUrl: this.returnUrl } });
  }
}