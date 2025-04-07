// Import the main class and necessary types
// Note: Replace '7b67e167' with the actual package name if it differs after publishing
import { BittensorStake } from './src/index'; // Use local path for testing before publishing
// import { BittensorStake } from '7b67e167'; // Use this line after installing the package

// Main asynchronous function to run the example
async function runExample() {
  console.log('Initializing BittensorStake client...');

  // Instantiate the client. You can optionally provide configuration options:
  // const stakeClient = new BittensorStake({
  //   endpoint: 'wss://your-custom-endpoint', // Optional: custom Bittensor endpoint
  //   defaultNetuid: 1,                      // Optional: default subnet ID to query
  //   debug: true                            // Optional: enable debug logging
  // });
  const stakeClient = new BittensorStake();

  try {
    // --- Get Subnet Info ---
    const defaultNetuid = stakeClient.getNetuid();
    console.log(`\nFetching info for default subnet: ${defaultNetuid}`);
    const subnetInfo = await stakeClient.getSubnetInfo();
    if (subnetInfo.exists) {
      console.log(`Subnet ${defaultNetuid} exists with size: ${subnetInfo.size}`);
    } else {
      console.log(`Subnet ${defaultNetuid} does not exist.`);
    }

    // --- Get Raw Stakes ---
    console.log(`\nFetching raw stakes for subnet ${defaultNetuid}...`);
    // You can also specify a different netuid: await stakeClient.getRawStakes(10);
    const rawStakes = await stakeClient.getRawStakes();
    console.log(`Found raw stakes for ${rawStakes.size} hotkeys.`);

    // Display the top 5 stakes
    const topStakes = Array.from(rawStakes.entries())
      .sort(([, stakeA], [, stakeB]) => Number(stakeB - stakeA)) // Sort descending
      .slice(0, 5);

    if (topStakes.length > 0) {
        console.log(`Top ${topStakes.length} hotkeys by stake:`);
        topStakes.forEach(([hotkey, stake]) => {
            // Convert stake (bigint) to TAO (assuming 9 decimal places)
            const taoAmount = Number(stake) / 1e9;
            console.log(`  Hotkey: ${hotkey}, Stake: ${taoAmount.toFixed(4)} TAO`);
        });
    }


    // --- Get Delegated Stakes (Example) ---
    // console.log(`\nFetching delegated stakes for subnet ${defaultNetuid}...`);
    // const delegatedStakes = await stakeClient.getDelegatedStakes();
    // console.log(`Found delegations involving ${delegatedStakes.size} hotkeys.`);
    // // Log details for the first hotkey found with delegations
    // const firstHotkeyWithDelegation = Array.from(delegatedStakes.entries())[0];
    // if (firstHotkeyWithDelegation) {
    //     const [hotkey, delegations] = firstHotkeyWithDelegation;
    //     console.log(`Delegations for hotkey ${hotkey}:`);
    //     delegations.slice(0, 3).forEach(d => {
    //         const taoAmount = Number(d.amount) / 1e9;
    //         console.log(`  -> Delegate: ${d.delegate}, Amount: ${taoAmount.toFixed(4)} TAO`);
    //     });
    //     if (delegations.length > 3) console.log('     ...');
    // }


    // --- Polling Example (Optional) ---
    // To automatically fetch updates periodically:
    // console.log('\nStarting stake polling...');
    // stakeClient.startPolling(60000); // Poll every 60 seconds
    // // Let it run for a bit
    // await new Promise(resolve => setTimeout(resolve, 130000));
    // stakeClient.stopPolling();
    // console.log('Stopped polling.');
    // const history = stakeClient.getStakeHistory();
    // console.log(`Captured ${history.length} stake snapshots during polling.`);


  } catch (error) {
    console.error('\nAn error occurred during the example execution:');
    console.error(error);
  } finally {
    // --- Disconnect ---
    // It's important to disconnect the client when done to close the WebSocket connection
    console.log('\nDisconnecting BittensorStake client...');
    await stakeClient.disconnect();
    console.log('Client disconnected successfully.');
  }
}

// Execute the main function
runExample();

/*
How to Run This Example:

1.  **Build the Library:**
    Since the import uses './src/index', ensure the library code is accessible. If you haven't built it yet, run:
    `bun run build`

2.  **Install Dependencies:**
    Make sure you have bun installed. The necessary dependencies (@polkadot/*) should be listed in your package.json. If not already installed:
    `bun install`

3.  **Run the Example:**
    Execute the script using bun:
    `bun run example.ts`

    Alternatively, if you prefer Node.js and have ts-node installed:
    `npx ts-node example.ts`

    (You might need `bun add -d ts-node @types/node` first if using ts-node)

*/ 