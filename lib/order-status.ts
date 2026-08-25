// Bez "server-only" — importowane też przez komponenty klienckie (select statusu w adminie).
export const ORDER_STATUSES = [
  "nowe",
  "w realizacji",
  "wysłane",
  "dostarczone",
  "anulowane",
] as const;
