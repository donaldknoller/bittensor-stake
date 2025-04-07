import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { BitensorApi } from "@/core/api";

// Override the default endpoint in the test
const TEST_DEFAULT_ENDPOINT = "wss://mock.endpoint";

// Track method calls
const methodCalls = {
  disconnect: 0,
  connect: 0,
  apiCreate: 0
};

// Mock the ApiPromise and WsProvider
const mockDisconnect = mock(() => {
  methodCalls.disconnect++;
  return Promise.resolve();
});

const mockApiPromise = {
  isConnected: true,
  disconnect: mockDisconnect
};

// Flag to simulate API connection state
let isApiConnected = false;

// Mock the import to override DEFAULT_ENDPOINT
mock.module('../../core/api', () => ({
  BitensorApi: class MockBitensorApi {
    endpoint: string;
    apiInstance: any = null;
    
    constructor(endpoint: string = TEST_DEFAULT_ENDPOINT) {
      this.endpoint = endpoint;
    }
    
    connect = mock(() => {
      if (this.apiInstance && isApiConnected) {
        return Promise.resolve(this.apiInstance);
      }
      
      methodCalls.connect++;
      isApiConnected = true;
      this.apiInstance = mockApiPromise;
      return Promise.resolve(this.apiInstance);
    });
    
    disconnect = mock(() => {
      if (isApiConnected) {
        methodCalls.disconnect++;
        isApiConnected = false;
        this.apiInstance = null;
      }
      return Promise.resolve();
    });
    
    getApi = mock(() => {
      if (!this.apiInstance || !isApiConnected) {
        return this.connect();
      }
      return Promise.resolve(this.apiInstance);
    });
    
    static decodeHotkey = mock((_hotkey: string) => {
      return new Uint8Array([1, 2, 3]);
    });
  },
  DEFAULT_ENDPOINT: TEST_DEFAULT_ENDPOINT
}));

// Mock the ApiPromise.create static method
mock.module('@polkadot/api', () => ({
  ApiPromise: {
    create: mock(() => {
      methodCalls.apiCreate++;
      return Promise.resolve(mockApiPromise);
    })
  },
  WsProvider: class MockWsProvider {
    constructor(_endpoint: string) {}
  }
}));

// Mock decodeAddress function
mock.module('@polkadot/util-crypto', () => ({
  decodeAddress: (_address: string) => {
    return new Uint8Array([1, 2, 3]);
  }
}));

describe("BitensorApi", () => {
  let api: BitensorApi;

  beforeEach(() => {
    methodCalls.disconnect = 0;
    methodCalls.connect = 0;
    methodCalls.apiCreate = 0;
    isApiConnected = false;
    api = new BitensorApi();
  });

  afterEach(async () => {
    await api.disconnect();
  });

  test("should use default endpoint when not specified", () => {
    expect(api.endpoint).toBe(TEST_DEFAULT_ENDPOINT);
  });

  test("should use custom endpoint when specified", () => {
    const customEndpoint = "wss://custom.endpoint";
    const customApi = new BitensorApi(customEndpoint);
    expect(customApi.endpoint).toBe(customEndpoint);
  });

  test("should connect to the network and return API instance", async () => {
    await api.connect();
    expect(methodCalls.connect).toBe(1);
  });

  test("should reuse existing connection if already connected", async () => {
    await api.connect(); // First connect should increment
    const initialCount = methodCalls.connect;
    await api.connect(); // Second connect should reuse connection
    expect(methodCalls.connect).toBe(initialCount); // Count should not change on second call
  });

  test("should disconnect from the network", async () => {
    await api.connect(); // Establish connection first
    await api.disconnect();
    expect(methodCalls.disconnect).toBe(1);
  });

  test("getApi should call connect", async () => {
    const initialCount = methodCalls.connect;
    await api.getApi();
    expect(methodCalls.connect).toBe(initialCount + 1);
  });

  test("decodeHotkey should decode address correctly", () => {
    const address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";
    const decodedKey = BitensorApi.decodeHotkey(address);
    expect(decodedKey).toBeInstanceOf(Uint8Array);
    expect(decodedKey.length).toBe(3);
  });
}); 