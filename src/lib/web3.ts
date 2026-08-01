import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

export const giwaSepolia = defineChain({
  id: 91342,
  name: 'GIWA Sepolia',
  network: 'giwa-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia-rpc.giwa.io'],
    },
    public: {
      http: ['https://sepolia-rpc.giwa.io'],
    },
  },
  blockExplorers: {
    default: { name: 'GIWA Explorer', url: 'https://sepolia-explorer.giwa.io' },
  },
});

export const config = getDefaultConfig({
  appName: 'Pinnacle Marketplace',
  projectId: 'YOUR_PROJECT_ID', // Replaced with dummy or ask user to setup walletconnect if needed, or omit if not strictly required, but rainbowkit 2+ requires projectId
  chains: [giwaSepolia],
  ssr: false, 
});
