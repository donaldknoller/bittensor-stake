/**
 * Service for retrieving delegation information from the Bittensor network
 */
import { BitensorApi } from '@/core/api';
import { DelegatedStake } from '@/core/models';

/**
 * Service for retrieving delegation information
 */
export class DelegationService {
  private api: BitensorApi;
  private netuid: number;

  /**
   * Creates a new DelegationService instance
   * @param api BitensorApi instance
   * @param netuid Network UID to query
   */
  constructor(api: BitensorApi, netuid: number) {
    this.api = api;
    this.netuid = netuid;
  }

  /**
   * Gets delegations for a specific set of hotkeys
   * @param hotkeys Array of hotkey addresses to check
   * @returns Map of hotkey addresses to their delegations
   */
  public async getDelegationsForHotkeys(hotkeys: string[]): Promise<Map<string, DelegatedStake[]>> {
    const delegatedStakes = new Map<string, DelegatedStake[]>();
    
    try {
      const polkadotApi = await this.api.getApi();
      
      // Process each hotkey in parallel
      await Promise.all(hotkeys.map(async (hotkey) => {
        try {
          const publicKey = BitensorApi.decodeHotkey(hotkey);
          const delegateInfo = await polkadotApi.call.delegateInfoRuntimeApi.getDelegate(publicKey);
          const delegateJson = delegateInfo?.toJSON?.() as { nominators: any[] } | undefined;

          if (delegateJson?.nominators) {
            const nominators: DelegatedStake[] = [];
            
            for (const [nomHotkey, stakes] of delegateJson.nominators) {
              for (const [netuid, stake] of stakes) {
                if (Number(netuid) === this.netuid) {
                  nominators.push({
                    hotkey: nomHotkey,
                    stake: Number(stake),
                    netuid: Number(netuid)
                  });
                }
              }
            }

            if (nominators.length > 0) {
              delegatedStakes.set(hotkey, nominators);
            }
          }
        } catch (error) {
          console.error(`Error processing delegate info for ${hotkey}:`, error);
        }
      }));

      return delegatedStakes;
    } catch (error) {
      const message = `Error getting delegated stakes for subnet ${this.netuid}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }

  /**
   * Gets all delegations in the network
   * @param hotkeys Optional list of hotkeys to check (if not provided, uses all hotkeys with stake)
   * @returns Map of hotkey addresses to their delegations
   */
  public async getAllDelegations(hotkeys?: string[]): Promise<Map<string, DelegatedStake[]>> {
    try {
      if (!hotkeys || hotkeys.length === 0) {
        // No hotkeys provided, get them from stake service
        // This would require a dependency on StakeService, which we're not implementing here
        // for circular dependency prevention. In a real implementation, you'd inject this or
        // use a different pattern.
        throw new Error('No hotkeys provided and automatic discovery not implemented');
      }
      
      return this.getDelegationsForHotkeys(hotkeys);
    } catch (error) {
      const message = `Error getting all delegations for subnet ${this.netuid}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }

  /**
   * Checks if a hotkey has delegations
   * @param hotkey Hotkey address to check
   * @returns True if the hotkey has delegations, false otherwise
   */
  public async hasDelegations(hotkey: string): Promise<boolean> {
    try {
      const delegations = await this.getDelegationsForHotkeys([hotkey]);
      return delegations.has(hotkey);
    } catch (error) {
      const message = `Error checking delegations for hotkey ${hotkey}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }
} 