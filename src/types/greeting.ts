export interface GeneratedImage {
  row: number;
  templateId: string;
  image: {
    width: number;
    height: number;
    url: string;
  };
}

export interface GenerationResponse {
  status: 'SUCCESS' | 'ERROR';
  total: number;
  generated: number;
  results: GeneratedImage[];
}

export interface SingleGreetingRequest {
  templateId: string;
  recipientName: string;
  occasion: string;
  message: string;
  senderName: string;
}