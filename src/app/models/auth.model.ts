export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  email: string;
  fullName: string;
  roles: string[];
}

export interface ApiMessage {
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string>;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface JwtPayload {
  exp: number;
  sub?: string;
  email?: string;
  roles?: string[];
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}