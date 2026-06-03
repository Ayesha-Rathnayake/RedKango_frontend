export type ReviewTargetType = 'product' | 'service';

export interface Review {
  id: number;

  name: string;

  email?: string | null;

  rating: number;

  review: string;

  date: string;

  service?: string | null;

  productName?: string | null;

  targetType?: ReviewTargetType | null;

  reply?: string | null;
}

export interface CreateReviewRequest {
  rating: number;

  review: string;

  targetType: ReviewTargetType;

  productName?: string;

  service?: string;
}