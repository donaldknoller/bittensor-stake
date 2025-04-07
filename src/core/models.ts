/**
 * Core data models for the Bittensor Stake library
 */

/**
 * Represents a delegation from one hotkey to another
 */
export interface DelegatedStake {
  /** The hotkey address of the delegator */
  hotkey: string;
  /** The amount of stake delegated in raw units */
  stake: number;
  /** The network UID the delegation applies to */
  netuid: number;
}

/**
 * A snapshot of stake state at a point in time
 */
export interface StakeSnapshot {
  /** Timestamp when the snapshot was taken (milliseconds since epoch) */
  timestamp: number;
  /** Map of hotkey addresses to their delegated stakes */
  stakes: Map<string, DelegatedStake[]>;
}

/**
 * Configuration options for the Bittensor Stake client
 */
export interface StakeOptions {
  /** WebSocket endpoint URL for the Bittensor network */
  endpoint?: string;
  /** Default subnet ID to query */
  defaultNetuid?: number;
  /** Maximum number of connection retry attempts */
  maxRetries?: number;
  /** Whether to enable debug logging */
  debug?: boolean;
} 