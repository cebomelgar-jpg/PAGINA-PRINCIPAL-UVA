import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_STYLES,
} from "@/lib/format";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("badge", ORDER_STATUS_STYLES[status])}>
      <span className="size-1.5 rounded-full bg-current opacity-80" />
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("badge", PAYMENT_STATUS_STYLES[status])}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
