import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Review {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  review: string;
  date: string;
  // What was rated (kept for compatibility)
  service?: string;         // when targetType === 'service'
  productName?: string;     // when targetType === 'product'
  targetType?: 'product' | 'service';
}

interface NewReview {
  name: string;
  rating: number;
  review: string;
  targetType: '' | 'product' | 'service'; //  NEW
  productName: string;                     // NEW (required if targetType='product')
  service: string;                         //     (required if targetType='service')
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html'
})
export class ReviewsComponent implements OnInit {
  overallRating = 5.0;
  totalReviews = 124;

  ratingPercentages: { [key: number]: number } = {
    5: 85,
    4: 10,
    3: 3,
    2: 1,
    1: 1
  };

  //  Initialize with extended fields
  newReview: NewReview = {
    name: '',
    rating: 0,
    review: '',
    targetType: '',
    productName: '',
    service: ''
  };

  reviews: Review[] = [
    {
      id: 1,
      name: 'James Collins',
      avatar: 'images/avatars/user1.jpg',
      rating: 5,
      review:
        "This camping gear exceeded my expectations! The quality is incredible and it made our camping trip so much easier. The setup was quick, comfortable, and very easy to use. I've never had any problems with it. I highly recommend this!",
      date: '2024-01-15',
      service: 'Equipment Purchase',
      targetType: 'service'
    },
    {
      id: 2,
      name: 'Sarah Thompson',
      avatar: 'images/avatars/user2.jpg',
      rating: 5,
      review:
        'This camping tent is just a game changer!! I have been camped in it for a whole week. It kept me dry and warm, the attention to detail and quality was perfect. The tent held up perfectly despite heavy rains. Highly recommend!',
      date: '2024-01-12',
      service: 'Tent Rental',
      targetType: 'service'
    },
    {
      id: 3,
      name: 'Carol Rodriguez',
      avatar: 'images/avatars/user3.jpg',
      rating: 4,
      review:
        'Overall an awesome camping experience. The quality is excellent and it is very functional. Red Kango went above and beyond to make sure we had everything we needed. Great customer service!',
      date: '2024-01-10',
      service: 'Camping Trip',
      targetType: 'service'
    },
    {
      id: 4,
      name: 'Michael Carter',
      avatar: 'images/avatars/user4.jpg',
      rating: 5,
      review:
        'What a find! Awesome gear! I really like my outdoor tent. I have been using it for weeks, and it has exceeded my expectations. Very durable, spacious and easy to set up. The design is intelligent, and I love every minute camping on this! I would recommend this to everyone.',
      date: '2024-01-08',
      service: 'Tent Rental',
      targetType: 'service'
    },
    {
      id: 5,
      name: 'Emily Watson',
      avatar: 'images/avatars/user5.jpg',
      rating: 5,
      review:
        'Excellent service and quality products! The staff was knowledgeable and helped me choose the perfect gear for my needs. Everything worked flawlessly during our camping trip.',
      date: '2024-01-05',
      service: 'Equipment Purchase',
      targetType: 'service'
    },
    {
      id: 6,
      name: 'David Martinez',
      avatar: 'images/avatars/user6.jpg',
      rating: 4,
      review:
        'Great experience overall. The equipment was in excellent condition and the rental process was smooth. Only minor suggestion would be to include more detailed setup instructions.',
      date: '2024-01-03',
      service: 'Tent Rental',
      targetType: 'service'
    }
  ];

  displayedReviews: Review[] = [];
  reviewsPerPage = 4;
  currentPage = 1;

  ngOnInit() {
    this.loadReviews();
    this.calculateRatings();
  }

  loadReviews() {
    const endIndex = this.currentPage * this.reviewsPerPage;
    this.displayedReviews = this.reviews.slice(0, endIndex);
  }

  loadMore() {
    this.currentPage++;
    this.loadReviews();
  }

  /**
   * ⭐ Star toggle:
   * - Clicking first star (1★) again turns rating back to 0
   */
  toggleStar(star: number) {
    if (star === 1 && this.newReview.rating === 1) {
      this.newReview.rating = 0;
    } else {
      this.newReview.rating = star;
    }
  }

  /**
   * (Optional) Old helper remained for backward compatibility.
   * If your template no longer calls setRating(), you can remove it.
   */
  setRating(rating: number) {
    this.newReview.rating = rating;
  }

  submitReview(event: Event) {
    event.preventDefault();

    //  Validate common fields
    if (
      !this.newReview.name ||
      !this.newReview.rating ||
      !this.newReview.review ||
      !this.newReview.targetType
    ) {
      alert('Please complete all fields and provide a rating');
      return;
    }

    //  Validate specific target selection
    if (this.newReview.targetType === 'product' && !this.newReview.productName) {
      alert('Please specify the product name');
      return;
    }
    if (this.newReview.targetType === 'service' && !this.newReview.service) {
      alert('Please choose the service');
      return;
    }

    // Build review object depending on targetType
    const review: Review = {
      id: this.reviews.length + 1,
      name: this.newReview.name,
      avatar: 'images/avatars/default.jpg',
      rating: this.newReview.rating,
      review: this.newReview.review,
      date: new Date().toISOString().split('T')[0],
      targetType: this.newReview.targetType
    };

    if (this.newReview.targetType === 'product') {
      review.productName = this.newReview.productName;
    } else {
      review.service = this.newReview.service;
    }

    // Insert at the top
    this.reviews.unshift(review);

    // Update stats and reset paging
    this.calculateRatings();
    this.currentPage = 1;
    this.loadReviews();

    // Reset the form
    this.newReview = {
      name: '',
      rating: 0,
      review: '',
      targetType: '',
      productName: '',
      service: ''
    };

    alert('Thank you for your review! 🎉');

    // Smooth scroll to the list
    setTimeout(() => {
      const reviewsSection = document.querySelector(
        '.bg-white.rounded-lg.shadow-lg:last-child'
      );
      reviewsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  private calculateRatings() {
    this.totalReviews = this.reviews.length;

    if (this.totalReviews === 0) {
      this.overallRating = 0;
      this.ratingPercentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      return;
    }

    // Overall average
    const totalRating = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.overallRating = Math.round((totalRating / this.totalReviews) * 10) / 10;

    // Percentages per star
    const ratingCounts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    this.reviews.forEach((r) => {
      ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    });

    this.ratingPercentages = {
      5: Math.round((ratingCounts[5] / this.totalReviews) * 100),
      4: Math.round((ratingCounts[4] / this.totalReviews) * 100),
      3: Math.round((ratingCounts[3] / this.totalReviews) * 100),
      2: Math.round((ratingCounts[2] / this.totalReviews) * 100),
      1: Math.round((ratingCounts[1] / this.totalReviews) * 100)
    };
  }
}