import React, { useEffect, useState } from 'react';
import { WalletKitProvider, ConnectButton, useWalletKit } from '@mysten/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';

// NFT Minting Component
function MintNFTForm() {
  const { signAndExecuteTransactionBlock } = useWalletKit();
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    imageUrl: ''
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${import.meta.env.VITE_PACKAGE_ID}::reputation_package::mint_and_register`,
        arguments: [
          tx.object(import.meta.env.VITE_REGISTRY_ID),
          tx.pure(formData.name),
          tx.pure(formData.description),
          tx.pure(formData.imageUrl),
        ],
      });

      await signAndExecuteTransactionBlock({
        transactionBlock: tx
      });
      alert('NFT Minted Successfully!');
      setFormData({ name: '', description: '', imageUrl: '' });
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Failed to mint NFT');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4 p-6">
      <h2 className="text-xl font-bold mb-4">Mint New NFT</h2>
      <form onSubmit={handleMint}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="NFT Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <input
            type="url"
            placeholder="Image URL"
            value={formData.imageUrl}
            onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Mint NFT
        </button>
      </form>
    </div>
  );
}

// Add interface for NFT data
interface NFTData {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  reputationPoints: number;
  suiName: string;
}

// Add NFT Display Component
function NFTDisplay() {
  const [nfts, setNfts] = useState<NFTData[]>([]);
  const { currentAccount } = useWalletKit();
  
  useEffect(() => {
    console.log('Current account:', currentAccount); // Debug log
    const fetchAllNFTs = async () => {
      const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io' });
      
      if (!currentAccount) {
        console.log('Wallet not connected');
        return;
      }

      try {
        // Query all ReputationNFT objects
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            MoveModule: {
              package: '0xacf24e393ccfcb4be583a48b990643dc6dd46ed4dbc2a0420e0f6672f3d3abd5',
              module: 'reputation_package'
            }
          },
          options: {
            showContent: true,
            showDisplay: true,
            showOwner: true,
            showType: true,
          }
        });

        console.log('Found NFTs:', objects);

        const nftData = objects
          .filter(obj => obj.data?.type?.includes('::ReputationNFT'))
          .map(obj => {
            const content = (obj.data?.content as any)?.fields || {};
            const owner = obj.data?.owner as any;
            
            return {
              id: obj.data?.objectId || '',
              name: content.name || 'Unnamed',
              description: content.description || '',
              imageUrl: content.image_url || '',
              reputationPoints: content.reputation_points || 0,
              suiName: owner?.AddressOwner ? 
                `${owner.AddressOwner.slice(0, 6)}...${owner.AddressOwner.slice(-4)}` : 
                'Unknown'
            };
          });

        console.log('Processed NFT data:', nftData);
        setNfts(nftData);
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      }
    };

    fetchAllNFTs();
  }, [currentAccount]); // Add currentAccount as dependency

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {nfts.map((nft) => (
        <div key={nft.id} className="bg-white rounded-xl shadow-md overflow-hidden">
          <img 
            src={nft.imageUrl} 
            alt={nft.name}
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <h3 className="font-bold text-lg mb-2">{nft.name}</h3>
            <p className="text-gray-600 mb-2">{nft.description}</p>
            <p className="text-sm text-gray-500">Owner: {nft.suiName}</p>
            <p className="text-sm font-semibold text-blue-600">
              Reputation Points: {nft.reputationPoints}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Update App component to include NFTDisplay
function App() {
  return (
    <WalletKitProvider>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Reputation NFT Dashboard
              </h1>
              <ConnectButton />
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <MintNFTForm />
            <NFTDisplay />
          </div>
        </main>
      </div>
    </WalletKitProvider>
  );
}

export default App;