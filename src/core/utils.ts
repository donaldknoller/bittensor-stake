/**
 * Utility functions for the Bittensor Stake library
 */

/**
 * Formats a RAO value (native token units) to a human-readable string
 * @param value RAO value as bigint or number
 * @param includeSymbol Whether to include the TAO symbol
 * @returns Formatted string with commas
 */
export function formatRao(value: bigint | number, includeSymbol: boolean = true): string {
  const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return includeSymbol ? `${formatted} RAO` : formatted;
}

/**
 * Converts RAO (10^9 precision) to TAO (whole tokens)
 * @param rao Amount in RAO
 * @returns Amount in TAO as a floating point number
 */
export function raoToTao(rao: bigint | string | number): number {
  const raoValue = typeof rao === 'bigint' ? rao : BigInt(rao.toString());
  return Number(raoValue) / 1e9;
}

/**
 * Converts TAO (whole tokens) to RAO (10^9 precision)
 * @param tao Amount in TAO
 * @returns Amount in RAO as a bigint
 */
export function taoToRao(tao: number): bigint {
  return BigInt(Math.floor(tao * 1e9));
} 