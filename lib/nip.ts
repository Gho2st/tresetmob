// Bez "server-only" — ta sama walidacja działa w formularzu kasy i w Server Action.

const WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7];

/** „PL 123-456-32-18” → „1234563218”. Prefiks kraju i separatory odrzucamy. */
export function normalizeNip(input: string) {
  return input.replace(/^\s*PL/i, "").replace(/[\s-]/g, "");
}

/**
 * Polski NIP: 10 cyfr, ostatnia to suma kontrolna — ważona suma pierwszych
 * dziewięciu modulo 11 (wynik 10 oznacza numer, którego nie da się nadać).
 */
export function isValidNip(input: string) {
  const nip = normalizeNip(input);
  if (!/^\d{10}$/.test(nip)) return false;
  const sum = WEIGHTS.reduce((acc, w, i) => acc + w * Number(nip[i]), 0);
  const control = sum % 11;
  return control !== 10 && control === Number(nip[9]);
}
