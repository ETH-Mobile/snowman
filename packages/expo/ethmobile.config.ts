export type Config = {
  defaultNetwork: string;
  networks: NetworkConfig;
};

export type Token = {
  decimals: number;
  symbol: string;
};

export type Network = {
  name: string;
  provider: string;
  id: number;
  token: Token;
  coingeckoPriceId: string;
  blockExplorer: string | null;
};

export type NetworkConfig = {
  [key: string]: Network;
};

/* 
  This is our default Alchemy API key.
  You can get your own at https://dashboard.alchemyapi.io
*/
const ALCHEMY_KEY = '_yem4FCVzmN6wbB44mPtF';

/*
  Get the `coingeckoPriceId` of your network from https://docs.google.com/spreadsheets/d/1wTTuxXt8n9q7C4NDXqQpI3wpKu1_5bGVmP9Xz0XGSyU/edit?gid=0#gid=0
*/

const config: Config = {
  defaultNetwork: 'sepolia',
  // The networks on which your DApp is live
  networks: {
    sepolia: {
      name: 'Sepolia',
      provider: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`,
      id: 11155111,
      token: {
        decimals: 18,
        symbol: 'SepoliaETH'
      },
      coingeckoPriceId: 'ethereum',
      blockExplorer: 'https://sepolia.etherscan.io'
    }
  }
};

export default config satisfies Config;
