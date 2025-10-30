export interface OrderItem {
  id: number;
  material: string;
  quantity: number;
  size: string;
  color: string;
  completed_quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}
