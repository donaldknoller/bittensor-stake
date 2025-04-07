/**
 * Basic usage example for the Bittensor Stake library
 * 
 * Run with: bun run src/examples/basic-usage.ts
 */
import { BittensorStake } from '@/index';
import { formatRao, raoToTao } from '@/core/utils';

async function main() {
  // Create a new BittensorStake client for subnet 11
  const stakeClient = new BittensorStake({
    defaultNetuid: 11,
    debug: true
  });

  try {
    console.log('Connecting to Bittensor network...');
    
    // Get subnet info
    const subnetInfo = await stakeClient.getSubnetInfo();
    console.log(`\nSubnet 11 info:`);
    console.log(`- Exists: ${subnetInfo.exists}`);
    console.log(`- Size: ${subnetInfo.size} neurons`);

    // Get raw stakes
    console.log('\nFetching raw stakes...');
    const rawStakes = await stakeClient.getRawStakes();
    
    let totalRawStake = 0n;
    const nonZeroStakes = Array.from(rawStakes.entries())
      .filter(([_, stake]) => stake > 0n)
      .sort((a, b) => Number(b[1] - a[1])); // Sort by stake descending

    console.log(`\nFound ${nonZeroStakes.length} neurons with non-zero stake`);
    console.log('\nTop 5 Raw Stakes:');
    console.log('----------------------------------------');
    
    for (const [hotkey, stake] of nonZeroStakes.slice(0, 5)) {
      totalRawStake += stake;
      console.log(`Hotkey: ${hotkey}`);
      console.log(`Stake:  ${formatRao(stake)}`);
      console.log(`Stake (TAO): ${raoToTao(stake)} TAO`);
      console.log('----------------------------------------');
    }

    console.log(`\nTotal Raw Stake: ${formatRao(totalRawStake)}`);
    
    // Get delegated stakes
    console.log('\nFetching delegated stakes...');
    const delegatedStakes = await stakeClient.getDelegatedStakes();
    
    const delegateCount = delegatedStakes.size;
    console.log(`\nFound ${delegateCount} delegates with delegations`);

    if (delegateCount > 0) {
      console.log('\nTop 3 Delegates by Number of Nominators:');
      console.log('----------------------------------------');
      
      const sortedDelegates = Array.from(delegatedStakes.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 3);

      for (const [hotkey, nominators] of sortedDelegates) {
        const totalDelegated = nominators.reduce((sum, nom) => sum + BigInt(nom.stake), 0n);
        
        console.log(`Delegate: ${hotkey}`);
        console.log(`Number of Nominators: ${nominators.length}`);
        console.log(`Total Delegated: ${formatRao(totalDelegated)}`);
        console.log('----------------------------------------');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Clean up
    await stakeClient.disconnect();
    console.log('\nDisconnected from Bittensor network');
  }
}

main().catch(console.error); 