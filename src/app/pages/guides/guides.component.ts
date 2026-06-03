import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { CampingTipService } from '../../services/camping-tip.service';
import { CampingTip } from '../../models/camping-tip.model';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guides.component.html',
})
export class GuidesComponent implements OnInit {
  guides: CampingTip[] = [];
  loading = true;
  error = '';

  visibleCount = 3;

  constructor(
    private router: Router,
    private sanitizer: DomSanitizer,
    private campingTipService: CampingTipService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGuides();
  }

  get displayedGuides(): CampingTip[] {
    return this.guides.slice(0, this.visibleCount);
  }

  loadGuides(): void {
    this.loading = true;
    this.error = '';

    this.campingTipService.getPublicTips().subscribe({
      next: (res: CampingTip[]) => {
        this.guides = res || [];
        this.visibleCount = 3;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Failed to load guides', err);

        this.loading = false;

        if (err instanceof HttpErrorResponse) {
          this.error = err.error?.message || 'Failed to load articles.';
        } else {
          this.error = 'Cannot reach the server.';
        }

        this.cdr.detectChanges();
      },
    });
  }

  loadMore(): void {
    this.visibleCount += 3;
  }
  showLess(): void {
  this.visibleCount = 3;
}

  readGuide(guide: CampingTip): void {
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

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';

    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}