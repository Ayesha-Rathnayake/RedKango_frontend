import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewsService } from '../../services/review.service';
import { Review } from '../../models/review.model';

interface NewReview {
  rating: number;
  review: string;
  targetType: '' | 'product' | 'service';
  productName: string;
  service: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
})
export class ReviewsComponent implements OnInit {
  message = '';
  messageType: 'success' | 'error' | '' = '';

  modalMessage = '';
  modalMessageType: 'success' | 'error' | '' = '';

  loading = false;
  submitting = false;

  showReviewModal = false;
  filterType: 'all' | 'product' | 'service' = 'all';

  readonly initialVisibleCount = 3;
  visibleCount = this.initialVisibleCount;

  reviews: Review[] = [];

  newReview: NewReview = {
    rating: 0,
    review: '',
    targetType: '',
    productName: '',
    service: '',
  };

  constructor(
    private reviewsService: ReviewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchReviews();
  }

  get filteredReviewList(): Review[] {
    if (this.filterType === 'all') return this.reviews;
    return this.reviews.filter((review) => review.targetType === this.filterType);
  }

  get displayedReviews(): Review[] {
    return this.filteredReviewList.slice(0, this.visibleCount);
  }

  get hasMoreReviews(): boolean {
    return this.visibleCount < this.filteredReviewList.length;
  }

  get canShowLess(): boolean {
    return (
      this.filteredReviewList.length > this.initialVisibleCount &&
      this.visibleCount >= this.filteredReviewList.length
    );
  }

  get remainingReviewCount(): number {
    return Math.max(this.filteredReviewList.length - this.visibleCount, 0);
  }

  fetchReviews(): void {
    this.loading = true;

    this.reviewsService.getReviews().subscribe({
      next: (res) => {
        this.reviews = res || [];
        this.filterType = 'all';
        this.visibleCount = this.initialVisibleCount;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load reviews', err);
        this.loading = false;
        this.showMessage('Failed to load reviews. Please try again.', 'error');
        this.cdr.detectChanges();
      },
    });
  }

  loadMore(): void {
    this.visibleCount = Math.min(
      this.visibleCount + this.initialVisibleCount,
      this.filteredReviewList.length
    );
  }

  showLess(): void {
    this.visibleCount = this.initialVisibleCount;
  }

  changeFilter(type: 'all' | 'product' | 'service'): void {
    this.filterType = type;
    this.visibleCount = this.initialVisibleCount;
  }

  openReviewModal(): void {
    this.showReviewModal = true;
    this.message = '';
    this.messageType = '';
    this.modalMessage = '';
    this.modalMessageType = '';
  }

  closeReviewModal(): void {
    this.showReviewModal = false;
    this.resetForm();
    this.modalMessage = '';
    this.modalMessageType = '';
  }

  toggleStar(star: number): void {
    this.newReview.rating = this.newReview.rating === star ? 0 : star;
  }

  submitReview(event: Event): void {
    event.preventDefault();

    this.modalMessage = '';
    this.modalMessageType = '';

    if (!this.newReview.targetType) {
      this.showModalMessage('Please select what you are rating.', 'error');
      return;
    }

    if (this.newReview.targetType === 'product' && !this.newReview.productName.trim()) {
      this.showModalMessage('Please enter the product name.', 'error');
      return;
    }

    if (this.newReview.targetType === 'service' && !this.newReview.service) {
      this.showModalMessage('Please select the service.', 'error');
      return;
    }

    if (!this.newReview.rating) {
      this.showModalMessage('Please select a star rating.', 'error');
      return;
    }

    if (!this.newReview.review.trim()) {
      this.showModalMessage('Please write your review.', 'error');
      return;
    }

    this.submitting = true;

    this.reviewsService
      .createReview({
        targetType: this.newReview.targetType,
        productName:
          this.newReview.targetType === 'product'
            ? this.newReview.productName.trim()
            : undefined,
        service:
          this.newReview.targetType === 'service'
            ? this.newReview.service
            : undefined,
        rating: this.newReview.rating,
        review: this.newReview.review.trim(),
      })
      .subscribe({
        next: (savedReview) => {
          this.reviews.unshift(savedReview);

          this.resetForm();
          this.filterType = 'all';
          this.visibleCount = this.initialVisibleCount;
          this.submitting = false;

          this.showModalMessage(
            'Review submitted successfully. Thank you for sharing your experience!',
            'success'
          );

          this.cdr.detectChanges();

          setTimeout(() => {
            this.showReviewModal = false;
            this.modalMessage = '';
            this.modalMessageType = '';
            this.cdr.detectChanges();
          }, 2000);
        },
        error: (err) => {
          console.error('Failed to submit review', err);
          this.submitting = false;

          if (err.status === 401 || err.status === 403) {
            this.showModalMessage('Please login before submitting a review.', 'error');
          } else {
            this.showModalMessage('Failed to submit review. Please try again.', 'error');
          }

          this.cdr.detectChanges();
        },
      });
  }

  resetForm(): void {
    this.newReview = {
      rating: 0,
      review: '',
      targetType: '',
      productName: '',
      service: '',
    };
  }

  showMessage(text: string, type: 'success' | 'error'): void {
    this.message = text;
    this.messageType = type;

    setTimeout(() => {
      this.message = '';
      this.messageType = '';
    }, 4000);
  }

  showModalMessage(text: string, type: 'success' | 'error'): void {
    this.modalMessage = text;
    this.modalMessageType = type;
  }

  getInitial(name: string): string {
    return name?.charAt(0)?.toUpperCase() || 'U';
  }

  getTargetLabel(review: Review): string {
    if (review.targetType === 'product') return review.productName || 'Product';
    return review.service || 'Service';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}