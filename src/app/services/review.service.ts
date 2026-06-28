import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Review,
  CreateReviewRequest,
} from '../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private api = 'http://localhost:8080/api/reviews';

  constructor(private http: HttpClient) {}

  getReviews(): Observable<Review[]> {
    return this.http.get<Review[]>(this.api);
  }

  createReview(data: CreateReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.api, data);
  }
}