import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-guide-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './guide-detail.component.html',
})
export class GuideDetailComponent implements OnInit {
  guide: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const slugOrId = this.route.snapshot.paramMap.get('id');

    if (!slugOrId) {
      this.router.navigate(['/camping-tips']);
      return;
    }

    const isNumeric = /^\d+$/.test(slugOrId);

    const url = isNumeric
      ? `http://localhost:8080/api/camping-tips/id/${slugOrId}`
      : `http://localhost:8080/api/camping-tips/${slugOrId}`;

    fetch(url)
      .then(async (res) => {
        this.loading = false;

        if (res.ok) {
          this.guide = await res.json();
        } else {
          this.error = 'Article not found.';
        }

        this.cdr.detectChanges();
      })
      .catch(() => {
        this.loading = false;
        this.error = 'Cannot reach the server.';
        this.cdr.detectChanges();
      });
  }

  safeContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  sanitizeYoutube(url: string): SafeResourceUrl {
    const id = this.extractYoutubeId(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
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

  formatDate(dateStr: string): string {
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
