import React, { useMemo, useEffect, useState } from 'react';
import {
  WalletProvider,
  ConnectionProvider,
  useWallet,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import './App.css'


// Import default styles for the wallet modal
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletComponent: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [recipient, setRecipient] = useState<string>('');
  const [amount, setAmount] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connection = new Connection(clusterApiUrl('devnet'));

    const fetchBalance = async () => {
      if (publicKey) {
        const balance = await connection.getBalance(publicKey);
        setBalance(balance / 1e9); // Convert lamports to SOL
      }
    };

    fetchBalance();
  }, [publicKey]);

  const handleSend = async () => {
    if (!publicKey) {
      setError('Wallet not connected');
      return;
    }

    if (!recipient || !amount) {
      setError('Recipient and amount are required');
      return;
    }

    try {
      const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: amount * 1e9, // Convert SOL to lamports
        })
      );

      // Sign and send the transaction
      const signature = await sendTransaction(tx, connection);
      await sendAndConfirmTransaction(connection, tx, [signature]);

      // Reset form
      setRecipient('');
      setAmount('');
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Transaction failed');
    }
  };

  return (
    <div className='body'>
      <h2>Solana Wallet</h2>
      <WalletMultiButton />
      {publicKey && (
        <div>
          <p><strong>Public Key:</strong> {publicKey.toBase58()}</p>
          <p><strong>Balance:</strong> {balance} SOL</p>
          <div className="tranfer_box">

          
          <h3>Send SOL</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className='label_in'>
              <label>
                Recipient Public Key:
                <input
                  type="text"
                  className='input'
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </label>
            </div>
            <div className='label_in'>
              <label>
                Amount (SOL):
                <input
                  type="number"
                  className='input'
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                />
              </label>
            </div>
            <button className='btn' type="submit">Send</button>
          </form>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={clusterApiUrl('devnet')}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletComponent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;
