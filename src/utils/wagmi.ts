import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy, polygon } from 'wagmi/chains';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '1234567890'; // Default fallback

export const wagmiConfig = getDefaultConfig({
  appName: 'Web3 Social Feed',
  projectId: projectId,
  chains: [polygonAmoy, polygon],
  ssr: true, // If your dApp uses server side rendering (SSR)
});
