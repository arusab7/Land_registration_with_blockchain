import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS } from './config.js';
import abiJson from './abi/LandRegistry.json';

export default function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [lands, setLands] = useState([]);
  const [role, setRole] = useState('1'); // 1 Buyer, 2 Seller
  const [user, setUser] = useState({name:'', email:'', city:''});
  const [form, setForm] = useState({location:'', areaSqYards:'', priceWei:'', documentHash:'', imageHash:''});
  const [selectedLandId, setSelectedLandId] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      const p = new ethers.BrowserProvider(window.ethereum);
      setProvider(p);
    } else {
      alert('Please install MetaMask.');
    }
  }, []);

  const connect = async () => {
    const accs = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accs[0]);
    const s = await provider.getSigner();
    setSigner(s);
    if (!CONTRACT_ADDRESS) {
      alert('Set CONTRACT_ADDRESS in client/src/config.js after deploying with Truffle.');
      return;
    }
    const c = new ethers.Contract(CONTRACT_ADDRESS, abiJson.abi, s);
    setContract(c);
    await loadLands(c);
  };

  const loadLands = async (c) => {
    const arr = await c.getAllLands();
    setLands(arr);
  };

  // --- User flows ---
  const register = async () => {
    if (!contract) return;
    const tx = await contract.register(user.name, user.email, user.city, parseInt(role));
    await tx.wait();
    alert('Registered. Ask Inspector to verify you.');
  };

  const addLand = async () => {
    const tx = await contract.addLand(
      form.location, 
      ethers.toNumber(form.areaSqYards), 
      ethers.toBigInt(form.priceWei), 
      form.documentHash, 
      form.imageHash);
    await tx.wait();
    await loadLands(contract);
    alert('Land added (pending sale).');
  };

  const requestToBuy = async (id) => {
    const tx = await contract.requestToBuy(id);
    await tx.wait();
    alert('Request sent to seller.');
  };

  const approveRequest = async (id) => {
    const tx = await contract.approveRequest(id);
    await tx.wait();
    alert('Request approved.');
  };

  const buy = async (id, priceWei) => {
    const tx = await contract.buy(id, { value: priceWei });
    await tx.wait();
    await loadLands(contract);
    alert('Purchased! Ownership transferred.');
  };

  return (
    <div style={{maxWidth: 900, margin: '24px auto', fontFamily: 'system-ui'}}>
      <h1>🏡 Land Registry (Ethereum)</h1>
      {!account ? <button onClick={connect}>Connect MetaMask</button> : <p>Connected: {account}</p>}

      <section style={{marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 12}}>
        <h2>Register / Edit Profile</h2>
        <label>Role:&nbsp;
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="1">Buyer</option>
            <option value="2">Seller</option>
          </select>
        </label>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8, marginTop: 8}}>
          <input placeholder="Name" value={user.name} onChange={e=>setUser({...user, name:e.target.value})}/>
          <input placeholder="Email" value={user.email} onChange={e=>setUser({...user, email:e.target.value})}/>
          <input placeholder="City" value={user.city} onChange={e=>setUser({...user, city:e.target.value})}/>
        </div>
        <button onClick={register} style={{marginTop: 8}}>Register</button>
        <p style={{fontSize:12, color:'#666'}}>Note: The Land Inspector (deployer) must verify your account on-chain.</p>
      </section>

      <section style={{marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 12}}>
        <h2>Seller: Add Land</h2>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8}}>
          <input placeholder="Location" value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
          <input placeholder="Area (sq yards)" value={form.areaSqYards} onChange={e=>setForm({...form, areaSqYards:e.target.value})}/>
          <input placeholder="Price (wei)" value={form.priceWei} onChange={e=>setForm({...form, priceWei:e.target.value})}/>
          <input placeholder="Document Hash (IPFS)" value={form.documentHash} onChange={e=>setForm({...form, documentHash:e.target.value})}/>
          <input placeholder="Image Hash (IPFS)" value={form.imageHash} onChange={e=>setForm({...form, imageHash:e.target.value})}/>
        </div>
        <button onClick={addLand} style={{marginTop: 8}}>Add Land</button>
      </section>

      <section style={{marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 12}}>
        <h2>All Lands</h2>
        {!lands.length && <p>No lands yet.</p>}
        <div style={{display:'grid', gridTemplateColumns:'1fr', gap: 12}}>
        {lands.map(l => (
          <div key={Number(l.id)} style={{border:'1px solid #eee', padding: 12, borderRadius: 10}}>
            <b>ID:</b> {String(l.id)} &nbsp; <b>Owner:</b> {l.owner}
            <div><b>Location:</b> {l.location} | <b>Area:</b> {String(l.areaSqYards)} sq yd</div>
            <div><b>Price (wei):</b> {String(l.priceWei)} | <b>For Sale:</b> {l.isForSale ? 'Yes' : 'No'}</div>
            <div><b>Docs:</b> {l.documentHash} | <b>Image:</b> {l.imageHash}</div>
            <div style={{marginTop: 8, display:'flex', gap: 8, flexWrap:'wrap'}}>
              <button onClick={()=>requestToBuy(l.id)}>Request to Buy</button>
              <button onClick={()=>approveRequest(l.id)}>Seller: Approve Request</button>
              <button onClick={()=>buy(l.id, l.priceWei)}>Buy (pay exact wei)</button>
            </div>
          </div>
        ))}
        </div>
      </section>

      <section style={{marginTop: 24, padding: 16, border: '1px solid #ddd', borderRadius: 12}}>
        <h2>Inspector Actions (deployer account)</h2>
        <p>In MetaMask, switch to the account that deployed the contract to use these functions via a script/console,
          or add buttons here by importing and calling <code>verifyUser(address)</code> on the contract.</p>
      </section>
    </div>
  );
