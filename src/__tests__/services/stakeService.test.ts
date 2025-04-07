import { describe, test, expect, mock, beforeEach } from "bun:test";
import { StakeService } from "@/services/stakeService";
import { BitensorApi } from "@/core/api";

// Store current netuid for the mock
// let currentNetuid = 1; // No longer needed as netuid is fixed per instance

// Mock BitensorApi
mock.module('@/core/api', () => {
  const mockGetApi = mock(() => Promise.resolve({
    query: {
      subtensorModule: {
        networksAdded: mock(async (_netuid: number) => {
          return _netuid === 1;
        }),
        subnetworkN: mock((_netuid: number) => Promise.resolve({
          toNumber: () => _netuid === 1 ? 2 : 0  // Subnet 1 has 2 neurons
        })),
        keys: mock((_netuid: number, uid: number) => Promise.resolve({
          toString: () => uid === 0 ? "hotkey1" : "hotkey2"
        })),
        totalHotkeyAlpha: mock((_hotkey: string, _netuid: number) => Promise.resolve({
          toString: () => _hotkey === "hotkey1" ? "1000000000" : "2000000000"
        })),
        totalHotkeyShares: mock((_hotkey: string, _netuid: number) => Promise.resolve({
          toString: () => "1000000000000000000"  // 1.0 shares
        }))
      }
    }
  }));

  return {
    BitensorApi: class MockBitensorApi {
      getApi = mockGetApi;
      constructor(_endpoint?: string, _maxRetries?: number) {}
    },
    DEFAULT_ENDPOINT: 'wss://mock.endpoint'
  };
});


describe("StakeService", () => {
  let stakeService: StakeService;
  let api: BitensorApi;

  beforeEach(() => {
    api = new BitensorApi(); // The mock instance
    stakeService = new StakeService(api, 1); // Instantiate with netuid 1
  });

  test("should get raw stakes for a valid subnet", async () => {
    const stakes = await stakeService.getRawStakes();
    
    expect(stakes).toBeInstanceOf(Map);
    expect(stakes.size).toBe(2);
    expect(stakes.get("hotkey1")).toBe(1000000000n);
    expect(stakes.get("hotkey2")).toBe(2000000000n);
  });

  test("should get subnet info for a valid subnet", async () => {
    const info = await stakeService.getSubnetInfo();
    
    expect(info.exists).toBe(true);
    expect(info.size).toBe(2);
  });

}); 