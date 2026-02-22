import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Extended Guide type
 * - type: 'image' | 'youtube' | 'video'
 * - image: used when type = 'image'
 * - url:   used when type = 'youtube' (YouTube page URL) or 'video' (direct video file URL)
 */
interface Guide {
  id: number;
  title: string;
  description: string;
  type?: 'image' | 'youtube' | 'video';
  image?: string;
  url?: string;

  content?: string;
  author?: string;
  date?: string;
  readTime?: string;
}

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guides.component.html'
})
export class GuidesComponent {
  newsletterEmail = '';

  // You can mix types here:
  guides: Guide[] = [
    // Image guide (legacy items kept as image)
    {
      id: 1,
      title: 'Complete Guide to Camping in Sri Lanka',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod velit at cursus tempor, justo as finibus porttitor. Nullam quis ante sit amet tellus condimentum volutpat.',
      type: 'image',
      image: 'images/guides/camping-sri-lanka.jpg',
      author: 'John Doe',
      date: '2024-01-15',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'Camping Trip Packing List: All Of The Essentials You Need To Bring',
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed eiusmod velit at cursus tempor, justo as finibus porttitor. Nullam quis ante sit amet tellus condimentum volutpat.',
      type: 'image',
      image: 'images/guides/packing-list.jpg',
      author: 'Jane Smith',
      date: '2024-01-10',
      readTime: '7 min read'
    },
    // Example YouTube guide
    {
      id: 3,
      title: 'How to Pitch a Tent in 5 Minutes',
      description: 'Short video guide on quick tent setup.',
      type: 'youtube',
      // can be full YouTube link; sanitizer helper will extract ID
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      author: 'Mike Johnson',
      date: '2024-01-05',
      readTime: '3 min watch'
    },
    // Example hosted video guide
    {
      id: 4,
      title: 'Campfire Safety Basics',
      description: 'A quick overview of safety tips for campfires.',
      type: 'video',
      url: 'videos/campfire-safety.mp4',
      author: 'Sarah Williams',
      date: '2023-12-28',
      readTime: '4 min watch'
    }
  ];

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  subscribeNewsletter() {
    if (!this.newsletterEmail) {
      alert('Please enter your email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.newsletterEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    // Typically call an API to subscribe the user
    alert(`Thank you for subscribing! We'll send camping tips to ${this.newsletterEmail}`);
    this.newsletterEmail = '';
  }

  readGuide(guide: Guide) {
    // Navigate to detailed guide page
    // For now, just show an alert
    alert(`Opening guide: ${guide.title}`);
    // In a real app:
    // this.router.navigate(['/guides', guide.id]);
  }

  /**
   * Convert a YouTube watch/share URL into a safe embed URL
   */
  sanitizeYoutube(url: string): SafeResourceUrl {
    const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
    const id = match ? match[1] : '';
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${id}`);
  }
}