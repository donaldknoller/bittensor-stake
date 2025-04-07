# Bittensor Stake Library [WIP]

A TypeScript library for interacting with stake and delegation information on the Bittensor network.

[![CI](https://github.com/yourusername/bittensor-stake/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/bittensor-stake/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Query raw stake amounts for neurons in any subnet
- Retrieve delegation information for hotkeys
- Monitor stake changes over time with automatic polling
- Full TypeScript support with detailed type definitions
- Comprehensive error handling and retry mechanisms
- Configurable connection options

## Installation

```bash
# npm
npm install bittensor-stake

# yarn
yarn add bittensor-stake

# pnpm
pnpm add bittensor-stake

# bun
bun add bittensor-stake
```

## Basic Usage

```typescript
import { BittensorStake } from 'bittensor-stake';

async function main() {
  // Create a client for subnet 11
  const stakeClient = new BittensorStake({
    defaultNetuid: 11
  });

  try {
    // Get raw stakes for all neurons
    const rawStakes = await stakeClient.getRawStakes();
    console.log(`Found ${rawStakes.size} neurons with stake`);

    // Get delegation information
    const delegations = await stakeClient.getDelegatedStakes();
    console.log(`Found ${delegations.size} neurons with delegations`);

    // Start polling for updates every hour
    stakeClient.startPolling();

    // Later, get the history of stake snapshots
    const history = stakeClient.getStakeHistory();
    console.log(`Collected ${history.length} snapshots`);

  } finally {
    // Clean up resources
    await stakeClient.disconnect();
  }
}
```

## Configuration Options

```typescript
const stakeClient = new BittensorStake({
  // Bittensor network endpoint (defaults to mainnet)
  endpoint: 'wss://entrypoint-finney.opentensor.ai:443',
  
  // Default subnet ID to query
  defaultNetuid: 11,
  
  // Polling interval in milliseconds (default: 1 hour)
  pollingInterval: 3600000,
  
  // Maximum number of connection retry attempts
  maxRetries: 3,
  
  // Enable debug logging
  debug: false
});
```

## API Reference

### BittensorStake

The main class for interacting with the Bittensor network.

#### Constructor

```typescript
constructor(options?: StakeOptions)
```

Creates a new BittensorStake client with the specified options.

#### Methods

```typescript
async getRawStakes(netuid?: number): Promise<Map<string, bigint>>
```

Gets raw stake amounts for all neurons in the subnet.

```typescript
async getDelegatedStakes(netuid?: number): Promise<Map<string, DelegatedStake[]>>
```

Gets delegated stakes for all hotkeys with stake.

```typescript
async updateState(): Promise<StakeSnapshot>
```

Updates the stake state and adds a new snapshot to the history.

```typescript
startPolling(intervalMs?: number): void
```

Starts automatic polling for stake updates.

```typescript
stopPolling(): void
```

Stops automatic polling for stake updates.

```typescript
getStakeHistory(): StakeSnapshot[]
```

Gets the history of stake snapshots.

```typescript
async getSubnetInfo(netuid?: number): Promise<{ exists: boolean, size: number }>
```

Gets information about a subnet.

```typescript
setNetuid(netuid: number): void
```

Changes the network UID to query.

```typescript
getNetuid(): number
```

Gets the current network UID.

```typescript
async disconnect(): Promise<void>
```

Disconnects from the Bittensor network.

## Types

### StakeOptions

```typescript
interface StakeOptions {
  endpoint?: string;
  defaultNetuid?: number;
  pollingInterval?: number;
  maxRetries?: number;
  debug?: boolean;
}
```

### DelegatedStake

```typescript
interface DelegatedStake {
  hotkey: string;
  stake: number;
  netuid: number;
}
```

### StakeSnapshot

```typescript
interface StakeSnapshot {
  timestamp: number;
  stakes: Map<string, DelegatedStake[]>;
}
```

## Development

```bash
# Clone the repository
git clone https://github.com/yourusername/bittensor-stake.git
cd bittensor-stake

# Install dependencies
bun install

# Build the library
bun run build

# Run tests
bun test

# Run linting
bun run lint
```

## Continuous Integration

This project uses GitHub Actions for continuous integration and deployment:

- **CI Pipeline**: Runs on every push to main and pull request
  - Lints the code
  - Runs tests
  - Builds the library
  - Uploads build artifacts

- **Publish Pipeline**: Runs when a new release is created
  - Builds and tests the library
  - Publishes to npm

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure your code passes the existing tests and linting rules.

## License

MIT
