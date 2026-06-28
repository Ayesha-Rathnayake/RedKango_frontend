import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { HttpErrorResponse } from '@angular/common/http';
import { CampingTipService } from '../../services/camping-tip.service';
import { CampingTip } from '../../models/camping-tip.model';

@Component({
  selector: 'app-guide-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guide-detail.component.html',
})
export class GuideDetailComponent implements OnInit {
  guide: CampingTip | null = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private campingTipService: CampingTipService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const slugOrId = this.route.snapshot.paramMap.get('id');

    if (!slugOrId) {
      this.router.navigate(['/camping-tips']);
      return;
    }

    const isNumeric = /^\d+$/.test(slugOrId);

    const request = isNumeric
      ? this.campingTipService.getPublicTipById(Number(slugOrId))
      : this.campingTipService.getPublicTipBySlug(slugOrId);

    request.subscribe({
      next: (res: CampingTip) => {
        this.guide = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Failed to load guide', err);

        this.loading = false;

        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.error = 'Article not found.';
        } else {
          this.error = 'Cannot reach the server.';
        }

        this.cdr.detectChanges();
      },
    });
  }

  safeContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
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

  goBack(): void {
    this.router.navigate(['/camping-tips']);
  }
}