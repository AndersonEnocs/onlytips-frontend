export interface IAdminStatistics {
  totalIdeas: number;
  pendingPayment: number;
  received: number;
  reviewed: number;
  selected: number;
  notSelected: number;
}

export interface IAdminStatisticsResponse {
  statusCode: number;
  message: string;
  data: IAdminStatistics;
}

