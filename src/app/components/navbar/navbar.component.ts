import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnDestroy {

  menuOpen = false;
  profileOpen = false;
  isLoggedIn = false;
  cartCount = 0;

  private sub = new Subscription();

  constructor(private router: Router, private auth: AuthService) {

    this.sub.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe(() => {
          this.isLoggedIn = this.auth.isLoggedIn();
          this.profileOpen = false;
        })
    );

    this.isLoggedIn = this.auth.isLoggedIn();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  onLogout() {
    this.profileOpen = false;
    this.auth.logout(true);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}