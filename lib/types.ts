export type MenuItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string | null;
  image_url: string | null;
  available: boolean;
  sort?: number;
};

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  pax: number;
  note: string | null;
  status: "pending" | "confirmed" | "cancelled";
  created_at: string;
  preorder_total: number | null;
  reservation_items: { qty: number; price: number; menu_items: { name: string } | null }[];
};

export type OrderStatus = "new" | "preparing" | "served" | "cancelled";

export type Order = {
  id: string;
  table_number: number;
  note: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  order_items: { qty: number; price: number; menu_items: { name: string } | null }[];
};