export const SOCIAL_FEED_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with real deployed Polygon Amoy address

export const SOCIAL_FEED_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "contentHash",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "PostAnchored",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "contentHash",
        "type": "string"
      }
    ],
    "name": "anchorPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
