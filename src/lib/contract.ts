import abi from '../abi.json';

export const PINNACLE_CONTRACT_ADDRESS = '0xd0C6439C34aC0588D3b5786C3E087e06c317ee8e';
export const PINNACLE_ABI = abi;

// Helper to easily pass to wagmi hooks
export const pinnacleContractConfig = {
  address: PINNACLE_CONTRACT_ADDRESS as `0x${string}`,
  abi: PINNACLE_ABI,
};
