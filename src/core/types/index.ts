export interface Society {
  id: number;
  name: string;
  default_amount: number;
  created_at: string;
}

export interface Member {
  id: number;
  society_id: number;
  name: string;
  flat_number: string;
  phone: string;
  is_paid: number; // 0 or 1
}

export interface Payment {
  id: number;
  member_id: number;
  amount: number;
  mode: 'UPI' | 'CASH';
  timestamp: string;
}

export interface DashboardMetrics {
  totalCollected: number;
  totalPending: number;
  paidPercentage: number;
}
