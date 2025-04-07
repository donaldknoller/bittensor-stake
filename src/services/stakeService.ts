/**
 * Service for retrieving stake information from the Bittensor network
 */
import { BitensorApi } from '@/core/api';

/**
 * Service for retrieving stake information
 */
export class StakeService {
  private api: BitensorApi;
  private netuid: number;

  /**
   * Creates a new StakeService instance
   * @param api BitensorApi instance
   * @param netuid Network UID to query
   */
  constructor(api: BitensorApi, netuid: number) {
    this.api = api;
    this.netuid = netuid;
  }

  /**
   * Gets the raw stake amounts for all neurons in the subnet
   * @returns Map of hotkey addresses to stake amounts
   */
  public async getRawStakes(): Promise<Map<string, bigint>> {
    const stakes = new Map<string, bigint>();
    try {
      const polkadotApi = await this.api.getApi();
      
      // Verify the subnet exists
      const subnetExists = await polkadotApi.query.subtensorModule.networksAdded(this.netuid);
      if (!subnetExists.toJSON()) {
        throw new Error(`Subnet ${this.netuid} does not exist`);
      }

      // Get subnet size
      const subnetSize = await polkadotApi.query.subtensorModule.subnetworkN(this.netuid);
      const size = (subnetSize as any).toNumber();

      // Get all neurons in parallel
      const uids = Array.from({ length: size }, (_, i) => i);
      const neurons = await Promise.all(
        uids.map(async (uid) => {
          try {
            const hotkey = await polkadotApi.query.subtensorModule.keys(this.netuid, uid);
            if (!hotkey.toString()) return null;

            // Get total hotkey alpha and shares
            const totalHotkeyAlpha = await polkadotApi.query.subtensorModule.totalHotkeyAlpha(hotkey.toString(), this.netuid);
            const totalHotkeyShares = await polkadotApi.query.subtensorModule.totalHotkeyShares(hotkey.toString(), this.netuid);

            // Convert shares to float (assuming 18 decimal places)
            const sharesAsFloat = Number(totalHotkeyShares.toString()) / 1e18;
            
            // Calculate stake
            const stake = sharesAsFloat === 0 ? 0n : BigInt(totalHotkeyAlpha.toString());
            
            return { hotkey: hotkey.toString(), stake };
          } catch (error) {
            console.error(`Error getting neuron ${uid}:`, error);
            return null;
          }
        })
      );

      // Filter out null values and add to map
      neurons.forEach(neuron => {
        if (neuron && neuron.hotkey) {
          stakes.set(neuron.hotkey, neuron.stake);
        }
      });

      return stakes;
    } catch (error) {
      const message = `Error getting raw stakes for subnet ${this.netuid}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }

  /**
   * Gets information about the subnet
   * @returns Object containing subnet information
   */
  public async getSubnetInfo(): Promise<{ exists: boolean, size: number }> {
    try {
      const polkadotApi = await this.api.getApi();
      
      const subnetExists = await polkadotApi.query.subtensorModule.networksAdded(this.netuid);
      const exists = !!subnetExists.toJSON();
      
      if (!exists) {
        return { exists, size: 0 };
      }
      
      const subnetSize = await polkadotApi.query.subtensorModule.subnetworkN(this.netuid);
      const size = (subnetSize as any).toNumber();
      
      return { exists, size };
    } catch (error) {
      const message = `Error getting subnet info for subnet ${this.netuid}`;
      throw error instanceof Error ? new Error(`${message}: ${error.message}`) : new Error(`${message}: ${String(error)}`);
    }
  }
} 