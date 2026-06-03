export interface CustomerProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImageUrl?: string;
}

export interface UpdateCustomerProfileRequest {
  firstName: string;
  lastName: string;
  phone: string;
}
