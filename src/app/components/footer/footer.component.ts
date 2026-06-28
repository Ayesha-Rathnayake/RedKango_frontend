import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SiteSettingsService, DEFAULT_SITE_SETTINGS } from '../../services/site-settings.service';
import { SiteSettings } from '../../models/site-settings.model';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  settings: SiteSettings = DEFAULT_SITE_SETTINGS;

  constructor(
    private siteSettingsService: SiteSettingsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.siteSettingsService.get().subscribe({
      next: (s) => {
        this.settings = s;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[Footer] unexpected error:', err);
      }
    });
  }

  get whatsappLink(): string {
    return `https://wa.me/${this.settings.whatsappNumber}`;
  }

  get phoneLink(): string {
    return `tel:${this.settings.phone}`;
  }

  get emailLink(): string {
    return `mailto:${this.settings.email}`;
  }
}
