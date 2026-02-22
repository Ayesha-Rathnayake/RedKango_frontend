

import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { HomeComponent } from './pages/home/home.component';
import { RentalsComponent } from './pages/rentals/rentals.component';
import { ShopComponent } from './pages/shop/shop.component';
import { GuidesComponent } from './pages/guides/guides.component';
import { ReviewsComponent } from './pages/reviews/reviews.component';

import { LoginComponent } from './pages/auth/login/login.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password.component';

import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { AuthIntentComponent } from './pages/auth/auth-intent.component';
import { CustomerComponent } from './pages/customer/customer.component';


export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'rentals', component: RentalsComponent },
      { path: 'shop', component: ShopComponent },
      { path: 'guides', component: GuidesComponent },
      { path: 'reviews', component: ReviewsComponent },
      { path: 'checkout', canActivate: [authGuard], component: CheckoutComponent },
            { path: 'customer', canActivate: [authGuard], component: CustomerComponent }

    ]
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', canActivate: [guestGuard], component: LoginComponent },
      { path: 'signup', canActivate: [guestGuard], component: SignupComponent },
      { path: 'forgot-password', canActivate: [guestGuard], component: ForgotPasswordComponent },
      { path: 'reset-password', canActivate: [guestGuard], component: ResetPasswordComponent },
      { path: 'auth-intent', component: AuthIntentComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
