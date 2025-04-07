/**
 * Main entry point for the Bittensor Stake library
 */
import { BitensorApi, DEFAULT_ENDPOINT } from '@/core/api';
import { StakeOptions, DelegatedStake } from '@/core/models';
import { StakeService } from '@/services/stakeService';
import { DelegationService } from '@/services/delegationService';
const DEFAULT_NETUID = 11;
/**
 * Main class for interacting with Bittensor stake information for a specific subnet
 */
export class BittensorStake {
  private api: BitensorApi;
  private stakeService: StakeService;
  private delegationService: DelegationService;
  private readonly netuid: number; // Changed to readonly and renamed
  private options: StakeOptions; // Remove pollingInterval from options type

  /**
   * Default options for the BittensorStake client
   */
  private static DEFAULT_OPTIONS: StakeOptions = { // Update default options type
    endpoint: DEFAULT_ENDPOINT,
    defaultNetuid: DEFAULT_NETUID, // Keep defaultNetuid for initialization
    maxRetries: 3,
    debug: false
  };

  /**
   * Creates a new BittensorStake client for a specific subnet
   * @param options Configuration options including the mandatory defaultNetuid
   */
  constructor(options: StakeOptions) { // Make defaultNetuid required

    this.options = { ...BittensorStake.DEFAULT_OPTIONS, ...options };
    this.netuid = this.options.defaultNetuid ?? DEFAULT_NETUID; 

    // Initialize API
    this.api = new BitensorApi(this.options.endpoint, this.options.maxRetries);

    // Initialize services with the fixed netuid
    this.stakeService = new StakeService(this.api, this.netuid);
    this.delegationService = new DelegationService(this.api, this.netuid);

    if (this.options.debug) {
      // console.log(`BittensorStake initialized for netuid ${this.netuid}`);
    }
  }

  /**
   * Gets raw stake amounts for all neurons in the configured subnet
   * @returns Map of hotkey addresses to stake amounts
   */
  public async getRawStakes(): Promise<Map<string, bigint>> {
    // Removed netuid parameter and related logic
    try {
      return await this.stakeService.getRawStakes();
    } catch (error) {
      // handleError(error, `Error getting raw stakes for netuid ${this.netuid}`, true);
      // return new Map<string, bigint>();
      const message = `Error getting raw stakes for netuid ${this.netuid}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }

  /**
   * Gets delegated stakes for all hotkeys with stake in the configured subnet
   * @returns Map of hotkey addresses to their delegations
   */
  public async getDelegatedStakes(): Promise<Map<string, DelegatedStake[]>> {
    // Removed netuid parameter and related logic
    try {
      // First get all hotkeys with stake for the configured netuid
      const rawStakes = await this.getRawStakes();
      const hotkeys = Array.from(rawStakes.keys());

      // Then get delegations for those hotkeys for the configured netuid
      return await this.delegationService.getDelegationsForHotkeys(hotkeys);
    } catch (error) {
      // handleError(error, `Error getting delegated stakes for netuid ${this.netuid}`, true);
      // return new Map<string, DelegatedStake[]>();
      const message = `Error getting delegated stakes for netuid ${this.netuid}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }

  /**
   * Gets information about the configured subnet
   * @returns Object containing subnet information
   */
  public async getSubnetInfo(): Promise<{ exists: boolean, size: number }> {
    // Removed netuid parameter and related logic
    try {
      return await this.stakeService.getSubnetInfo();
    } catch (error) {
      // handleError(error, `Error getting subnet info for netuid ${this.netuid}`, true);
      // return { exists: false, size: 0 };
      const message = `Error getting subnet info for netuid ${this.netuid}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }

  /**
   * Disconnects from the Bittensor network
   */
  public async disconnect(): Promise<void> {
    // Removed stopPolling call
    await this.api.disconnect();

    if (this.options.debug) {
      // console.log(`Disconnected from Bittensor network (netuid ${this.netuid})`);
    }
  }
} 