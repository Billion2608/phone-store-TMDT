export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";
export type PaymentMethod = "COD" | "BANK_TRANSFER" | "VNPAY" | "MOMO";

export type CheckoutInput = {
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  couponCode?: string;
  note?: string;
  paymentMethod: PaymentMethod;
  saveAddress?: boolean;
};

export type OrderListItem = {
  id: string;
  orderCode: string;
  createdAt: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  itemCount: number;
};

export type OrderDetail = OrderListItem & {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  note: string | null;
  cancelledReason: string | null;
  items: Array<{
    id: string;
    variantId: string;
    productId: string;
    productName: string;
    productSlug: string;
    variantName: string | null;
    sku: string | null;
    image: string | null;
    price: number;
    quantity: number;
    totalPrice: number;
    canReview: boolean;
    reviewId: string | null;
  }>;
  payment: { method: PaymentMethod; status: string; amount: number } | null;
  timeline: Array<{ status: string; note: string | null; createdAt: string }>;
};
