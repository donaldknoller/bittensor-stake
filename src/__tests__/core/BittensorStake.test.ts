/// <reference types="bun-types" />
import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { BittensorStake } from "@/core/BittensorStake";
import { DelegatedStake } from "@/core/models";

// Track method calls instead of using spies
const methodCalls = {
  disconnect: 0
};

// Mock the dependencies
mock.module("../../core/api", () => ({
  BitensorApi: class MockBitensorApi {
    connect = mock(() => Promise.resolve());
    disconnect = mock(() => {
      methodCalls.disconnect++;
      return Promise.resolve();
    });
    getApi = mock(() => Promise.resolve());
  },
  DEFAULT_ENDPOINT: 'wss://mock.endpoint'
}));

mock.module("@/services/stakeService", () => ({
  StakeService: class MockStakeService {
    getRawStakes = mock(() => Promise.resolve(new Map<string, bigint>([
      ["hotkey1", 1000000000n],
      ["hotkey2", 2000000000n]
    ])));
    getSubnetInfo = mock(() => Promise.resolve({ exists: true, size: 2 }));
  }
}));

mock.module("@/services/delegationService", () => {
  const mockDelegations: DelegatedStake[] = [
    { hotkey: "delegator1", stake: 500000000, netuid: 1 }
  ];
  
  return {
    DelegationService: class MockDelegationService {
      getDelegationsForHotkeys = mock(() => Promise.resolve(new Map<string, DelegatedStake[]>([
        ["hotkey1", mockDelegations]
      ])));
    }
  };
});

describe("BittensorStake", () => {
  let stakeClient: BittensorStake;

  beforeEach(() => {
    methodCalls.disconnect = 0;
    stakeClient = new BittensorStake({ defaultNetuid: 1, debug: true });
  });

  afterEach(async () => {
    await stakeClient.disconnect();
  });

  test("should get raw stakes", async () => {
    const stakes = await stakeClient.getRawStakes();
    expect(stakes).toBeInstanceOf(Map);
    expect(stakes.size).toBe(2);
    expect(stakes.get("hotkey1")).toBe(1000000000n);
  });

  test("should get delegated stakes", async () => {
    const delegations = await stakeClient.getDelegatedStakes();
    expect(delegations).toBeInstanceOf(Map);
    expect(delegations.size).toBe(1);
    expect(delegations.get("hotkey1")).toBeDefined();
  });

  test("should get subnet info", async () => {
    const info = await stakeClient.getSubnetInfo();
    expect(info.exists).toBe(true);
    expect(info.size).toBe(2);
  });

  test("should disconnect", async () => {
    await stakeClient.disconnect();
    expect(methodCalls.disconnect).toBe(1);
  });
}); 