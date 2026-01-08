export interface IRecentDecision {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
  decision_date: string;
  masked_owner: string;
}

export interface IPublicStatus {
  fundTotal: number;
  currency: string;
  recentDecisions: IRecentDecision[];
  submissionFee: number;
}