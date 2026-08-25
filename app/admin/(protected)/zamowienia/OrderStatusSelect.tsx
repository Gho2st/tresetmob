"use client";

import { useTransition } from "react";
import { ORDER_STATUSES } from "@/lib/order-status";
import { updateOrderStatus } from "./actions";

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => {
          updateOrderStatus(orderId, e.target.value);
        })
      }
      className="border border-black/20 bg-white px-3 py-1.5 text-xs tracking-widest uppercase focus:border-black focus:outline-none disabled:opacity-50"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
