import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guides.component.html',
})
export class GuidesComponent implements OnInit {
  guides: any[] = [];
  loading = true;
  error = '';
  newsletterEmail = '';
  newsletterSent = false;
  newsletterError = '';

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGuides();
  }

  loadGuides(): void {
    fetch('http://localhost:8080/api/camping-tips')
      .then(async (res) => {
        const data = await res.json();
        this.loading = false;

        if (res.ok) {
          this.guides = data;
        } else {
          this.error = data?.message || 'Failed to load articles.';
        }

        this.cdr.detectChanges();
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Cannot reach the server.';
        this.cdr.detectChanges();
      });
  }

  readGuide(guide: any): void {
    this.router.navigate(['/camping-tips', guide.slug || guide.id]);
  }

  sanitizeYoutube(url: string): SafeResourceUrl {
    const id = this.extractYoutubeId(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}`
    );
  }

  sanitizeVideo(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url || '');
  }

  extractYoutubeId(url: string): string {
    if (!url) return '';

    const regex =
      /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

    const match = url.match(regex);
    return match ? match[1] : '';
  }

  subscribeNewsletter(): void {
    this.newsletterError = '';
    this.newsletterSent = false;

    if (!this.newsletterEmail) {
      this.newsletterError = 'Please enter your email address.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(this.newsletterEmail)) {
      this.newsletterError = 'Please enter a valid email address.';
      return;
    }

    this.newsletterSent = true;
    this.newsletterEmail = '';
    this.cdr.detectChanges();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';

    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}