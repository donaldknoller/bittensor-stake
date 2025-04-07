/**
 * API utilities for interacting with the Bittensor blockchain
 */
import { ApiPromise, WsProvider } from '@polkadot/api';
import { decodeAddress } from '@polkadot/util-crypto';

/**
 * Default Bittensor mainnet endpoint
 */
export const DEFAULT_ENDPOINT = 'wss://entrypoint-finney.opentensor.ai:443';

/**
 * API connection manager for Bittensor network
 */
export class BitensorApi {
  private api: ApiPromise | null = null;
  public readonly endpoint: string;
  private connectionPromise: Promise<ApiPromise> | null = null;
  private maxRetries: number;
  private retryCount: number = 0;

  /**
   * Creates a new BitensorApi instance
   * @param endpoint WebSocket endpoint URL
   * @param maxRetries Maximum number of connection retry attempts
   */
  constructor(endpoint: string = DEFAULT_ENDPOINT, maxRetries: number = 3) {
    this.endpoint = endpoint;
    this.maxRetries = maxRetries;
  }

  /**
   * Initializes the API connection
   * @returns Promise resolving to the API instance
   */
  public async connect(): Promise<ApiPromise> {
    if (this.api && this.api.isConnected) {
      return this.api;
    }

    if (!this.connectionPromise) {
      this.connectionPromise = this.initConnection();
    }

    return this.connectionPromise;
  }

  /**
   * Gets the API instance, connecting if necessary
   * @returns Promise resolving to the API instance
   */
  public async getApi(): Promise<ApiPromise> {
    return this.connect();
  }

  /**
   * Disconnects from the network
   */
  public async disconnect(): Promise<void> {
    if (this.api) {
      await this.api.disconnect();
      this.api = null;
    }
    this.connectionPromise = null;
  }

  /**
   * Initializes a new connection with retry logic
   * @private
   */
  private async initConnection(): Promise<ApiPromise> {
    try {
      const provider = new WsProvider(this.endpoint);
      this.api = await ApiPromise.create({ provider });
      this.retryCount = 0;
      return this.api;
    } catch (error) {
      this.retryCount++;
      if (this.retryCount <= this.maxRetries) {
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, this.retryCount - 1), 10000);
        console.warn(`Connection attempt ${this.retryCount} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        this.connectionPromise = null;
        return this.connect();
      }
      throw new Error(`Failed to connect after ${this.maxRetries} attempts: ${error}`);
    }
  }

  /**
   * Helper method to decode a hotkey address
   * @param hotkey Hotkey address string
   * @returns Decoded public key as Uint8Array
   */
  public static decodeHotkey(hotkey: string): Uint8Array {
    return decodeAddress(hotkey);
  }
} 