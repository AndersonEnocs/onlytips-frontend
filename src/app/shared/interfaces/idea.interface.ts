export enum IdeaStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  RECEIVED = 'RECEIVED',
  REVIEWED = 'REVIEWED',
  SELECTED = 'SELECTED',
  NOT_SELECTED = 'NOT_SELECTED'
}

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  APPLE_PAY = 'APPLE_PAY'
}

export interface IIdea {
  id: string;
  title: string;
  description: string;
  email: string;
  status: IdeaStatus;
  isPublic: boolean;
  createdAt: string;
  reviewerFeedback?: string;
  decisionDate?: string;
  stripeSessionId?: string;
}

export interface ISubmitIdeaResponse {
  idea: IIdea;
  checkoutUrl: string;
}