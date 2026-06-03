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
import { AuthIntentComponent } from './pages/auth/auth-intent.component';

import { CheckoutComponent } from './pages/checkout/checkout.component';
import { CustomerComponent } from './pages/customer/customer.component';
import { GuideDetailComponent } from './pages/guides/guide-detail.component';
import { OrderSummaryComponent } from './pages/order-summary/order-summary.component';
import { PurchaseCartComponent } from './pages/purchase-cart/purchase-cart.component';
import { CustomerOrdersComponent } from './pages/customer-orders/customer-orders.component';
import { PaymentSuccessComponent } from './pages/payment-success/payment-success.component';
import { PaymentCancelComponent } from './pages/payment-cancel/payment-cancel.component';
import { RentalCheckoutComponent } from './pages/rental-checkout/rental-checkout.component';
import { CustomerRentalsComponent } from './pages/customer-rentals/customer-rentals.component';

import { authGuard, roleGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'rentals', component: RentalsComponent },
      { path: 'shop', component: ShopComponent },
      { path: 'camping-tips', component: GuidesComponent },
      { path: 'camping-tips/:id', component: GuideDetailComponent },
      { path: 'reviews', component: ReviewsComponent },

      {
        path: 'purchase-cart',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: PurchaseCartComponent,
      },
      {
        path: 'checkout',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: CheckoutComponent,
      },
      {
        path: 'rental-checkout',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: RentalCheckoutComponent,
      },
      {
        path: 'payment/success',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: PaymentSuccessComponent,
      },
      {
        path: 'payment/cancel',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: PaymentCancelComponent,
      },
      {
        path: 'order-summary/:orderId',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: OrderSummaryComponent,
      },
      {
        path: 'customer',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: CustomerComponent,
      },
      {
        path: 'customer/orders',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: CustomerOrdersComponent,
      },
      {
        path: 'customer/rentals',
        canActivate: [authGuard, roleGuard('ROLE_CUSTOMER')],
        component: CustomerRentalsComponent,
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', canActivate: [guestGuard], component: LoginComponent },
      { path: 'signup', canActivate: [guestGuard], component: SignupComponent },
      {
        path: 'forgot-password',
        canActivate: [guestGuard],
        component: ForgotPasswordComponent,
      },
      {
        path: 'reset-password',
        canActivate: [guestGuard],
        component: ResetPasswordComponent,
      },
      { path: 'auth-intent', component: AuthIntentComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];