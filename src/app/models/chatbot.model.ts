export interface ChatbotResponse {
  status: number;
  message: string;
  code: string;
  resultData: string;
}

export interface ChatMessage {
  text: string;
  role: 'user' | 'bot';
  timestamp: Date;
}