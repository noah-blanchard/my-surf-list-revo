/* Steam ID helpers (Steam2 / Steam3 / Steam64) — sans littéraux 2n
   -> utilise uniquement BigInt("...") et BigInt(2)
*/

const STEAMID64_BASE = BigInt("76561197960265728"); // Valve offset

// -----------------------------
// Types & Regex
// -----------------------------
export type Steam2 = `STEAM_${0 | 1}:${0 | 1}:${number}`;
export type Steam3 = `[U:1:${number}]`;
export type Steam64 = string; // 17-digit string

const R_STEAM2 = /^STEAM_([01]):([01]):(\d+)$/;
const R_STEAM3_SIMPLE = /^\[U:1:(\d+)\]$/;
const R_STEAM64 = /^\d{17}$/;

// -----------------------------
// Validations
// -----------------------------
export function isSteam2(input: string): input is Steam2 {
  return R_STEAM2.test(input);
}
export function isSteam3(input: string): input is Steam3 {
  return R_STEAM3_SIMPLE.test(input);
}
export function isSteam64(input: string): input is Steam64 {
  return R_STEAM64.test(input);
}

// -----------------------------
// AccountID (32-bit) helpers
// -----------------------------
export function steam64ToAccountId(steam64: string): number {
  if (!isSteam64(steam64)) throw new Error("Invalid Steam64");
  const n = BigInt(steam64) - STEAMID64_BASE;
  if (n < BigInt(0)) throw new Error("Steam64 below base");
  const asNumber = Number(n);
  if (!Number.isSafeInteger(asNumber)) {
    throw new Error("AccountID overflows JS safe integer");
  }
  return asNumber;
}

export function accountIdToSteam64(accountId: number | string): Steam64 {
  const n = BigInt(accountId);
  if (n < BigInt(0)) throw new Error("AccountID must be >= 0");
  return (STEAMID64_BASE + n).toString();
}

export function accountIdToSteam2(
  accountId: number | string,
  universe: 0 | 1 = 1
): Steam2 {
  const n = BigInt(accountId);
  if (n < BigInt(0)) throw new Error("AccountID must be >= 0");
  const Y = Number(n % BigInt(2)) as 0 | 1;
  const Z = Number(n / BigInt(2));
  return `STEAM_${universe}:${Y}:${Z}`;
}

export function steam2ToAccountId(steam2: string): number {
  const m = R_STEAM2.exec(steam2);
  if (!m) throw new Error("Invalid Steam2");
  const Y = BigInt(m[2]);
  const Z = BigInt(m[3]);
  const accountId = Z * BigInt(2) + Y;
  const asNumber = Number(accountId);
  if (!Number.isSafeInteger(asNumber)) {
    throw new Error("AccountID overflows JS safe integer");
  }
  return asNumber;
}

// -----------------------------
// Conversions 2 <-> 64
// -----------------------------
export function steam2ToSteam64(steam2: string): Steam64 {
  const accountId = steam2ToAccountId(steam2);
  return accountIdToSteam64(accountId);
}

export function steam64ToSteam2(
  steam64: string,
  universe: 0 | 1 = 1
): Steam2 {
  const accountId = steam64ToAccountId(steam64);
  return accountIdToSteam2(accountId, universe);
}

// -----------------------------
// Conversions 3 <-> 64
// -----------------------------
export function steam3ToSteam64(steam3: string): Steam64 {
  const m = R_STEAM3_SIMPLE.exec(steam3);
  if (!m) throw new Error("Invalid Steam3 (expected like [U:1:123456])");
  const accountId = m[1];
  return accountIdToSteam64(accountId);
}

export function steam64ToSteam3(steam64: string): Steam3 {
  const accountId = steam64ToAccountId(steam64);
  return `[U:1:${accountId}]`;
}

// -----------------------------
// Conversions 2 <-> 3
// -----------------------------
export function steam2ToSteam3(steam2: string): Steam3 {
  const accountId = steam2ToAccountId(steam2);
  return `[U:1:${accountId}]`;
}

export function steam3ToSteam2(steam3: string, universe: 0 | 1 = 1): Steam2 {
  const m = R_STEAM3_SIMPLE.exec(steam3);
  if (!m) throw new Error("Invalid Steam3 (expected like [U:1:123456])");
  const accountId = Number(m[1]);
  return accountIdToSteam2(accountId, universe);
}

// -----------------------------
// Normalization & helpers
// -----------------------------
export type NormalizedSteam = {
  steam2: Steam2;
  steam3: Steam3;
  steam64: Steam64;
  accountId: number; // 32-bit
};

export function normalizeSteam(input: string, universe: 0 | 1 = 1): NormalizedSteam {
  if (isSteam64(input)) {
    const steam2 = steam64ToSteam2(input, universe);
    return {
      steam2,
      steam3: steam2ToSteam3(steam2),
      steam64: input,
      accountId: steam64ToAccountId(input),
    };
  }
  if (isSteam2(input)) {
    const steam64 = steam2ToSteam64(input);
    return {
      steam2: input,
      steam3: steam2ToSteam3(input),
      steam64,
      accountId: steam2ToAccountId(input),
    };
  }
  if (isSteam3(input)) {
    const steam64 = steam3ToSteam64(input);
    return {
      steam2: steam3ToSteam2(input, universe),
      steam3: input,
      steam64,
      accountId: steam64ToAccountId(steam64),
    };
  }
  throw new Error("Input is not a valid Steam2 / Steam3 / Steam64");
}

// -----------------------------
// URLs pratiques
// -----------------------------
export function steamProfileUrl(steam64: string): string {
  if (!isSteam64(steam64)) throw new Error("Invalid Steam64");
  return `https://steamcommunity.com/profiles/${steam64}`;
}

export function steamRepUrl(steam64: string): string {
  if (!isSteam64(steam64)) throw new Error("Invalid Steam64");
  return `https://steamrep.com/profiles/${steam64}`;
}
