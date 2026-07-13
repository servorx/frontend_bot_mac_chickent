export type OrderStatus = "CONFIRMED" | "PREPARING" | "DELIVERED" | "CANCELLED";
export type FulfillmentType = "DELIVERY" | "PICKUP";

export type OrderCustomer = {
  fullName: string;
  phone: string;
  address: string;
  neighborhood: string;
};

export type OrderItem = {
  id: string;
  productCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  invoiceNumber?: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  customer: OrderCustomer;
  paymentMethod: string;
  observations?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
  paymentProofRequired?: boolean;
  paymentProofReceived?: boolean;
  paymentProofReceivedAt?: string | null;
  paymentProofMissing?: boolean;
  canMoveToPreparing?: boolean;
  acceptedAt?: string;
  rejectedAt?: string;
  deliveredAt?: string;
  printedAt?: string;
  rejectionReason?: string;
};

export type OrderListKind = "incoming" | "pickup" | "accepted" | "rejected";
