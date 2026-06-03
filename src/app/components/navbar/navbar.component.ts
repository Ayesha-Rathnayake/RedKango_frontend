import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  NavigationEnd,
} from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

interface StoredCartItem {
  quantity?: number;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  profileOpen = false;
  cartOpen = false;

  isLoggedIn = false;
  purchaseCartCount = 0;
  rentalCartCount = 0;

  private sub = new Subscription();

  constructor(
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.refreshNavbarState();

    this.sub.add(
      this.router.events
        .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
        .subscribe(() => {
          this.refreshNavbarState();
          this.profileOpen = false;
          this.cartOpen = false;
          this.menuOpen = false;
        })
    );

    window.addEventListener('storage', this.handleStorageChange);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.profileOpen = false;
    this.cartOpen = false;
  }

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;
    this.cartOpen = false;
  }

  toggleCart(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: this.router.url,
          intent: 'cart',
        },
      });
      return;
    }

    this.cartOpen = !this.cartOpen;
    this.profileOpen = false;
  }

  goToPurchaseCart(): void {
    this.cartOpen = false;
    this.router.navigate(['/cart'], {
      queryParams: {
        type: 'purchase',
      },
    });
  }

  goToRentalCart(): void {
    this.cartOpen = false;
    this.router.navigate(['/cart'], {
      queryParams: {
        type: 'rental',
      },
    });
  }

  onLogout(): void {
    this.profileOpen = false;
    this.cartOpen = false;
    this.auth.logout(true);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    window.removeEventListener('storage', this.handleStorageChange);
  }

  private refreshNavbarState(): void {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.purchaseCartCount = this.getCartCount('cart');
    this.rentalCartCount = this.getCartCount('rentalCart');
  }

  private get totalCartCount(): number {
    return this.purchaseCartCount + this.rentalCartCount;
  }

  get cartCount(): number {
    return this.totalCartCount;
  }

  private getCartCount(storageKey: 'cart' | 'rentalCart'): number {
    const savedCart = localStorage.getItem(storageKey);

    if (!savedCart) return 0;

    try {
      const items = JSON.parse(savedCart) as StoredCartItem[];

      if (!Array.isArray(items)) return 0;

      return items.reduce((total, item) => total + (item.quantity ?? 1), 0);
    } catch {
      return 0;
    }
  }

  private handleStorageChange = (): void => {
    this.refreshNavbarState();
  };
}