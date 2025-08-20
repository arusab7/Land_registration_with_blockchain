# Land Registry (Ethereum + React + Truffle)

This is a minimal, working starter for your blockchain Land Registration System.

## Prereqs
- Node.js 18+
- MetaMask in your browser
- Ganache (GUI) or `ganache` CLI running at http://127.0.0.1:7545
- Truffle (`npm i -g truffle`)

## 1) Install & Compile
```bash
cd land-registry
npm install   # installs dev dep truffle in this workspace (optional if installed globally)
truffle compile
```

## 2) Start Ganache
Launch Ganache GUI (port 7545) or run:
```bash
npx ganache -p 7545
```

## 3) Deploy Contracts
```bash
truffle migrate --reset --network development
node scripts/postmigrate.js  # copies ABI to client
```

Note the **LandRegistry deployed address** printed by Truffle, and set it in:
```
client/src/config.js  ->  export const CONTRACT_ADDRESS = "<DEPLOYED_ADDRESS>";
```

## 4) Run Frontend
```bash
cd client
npm install
npm run dev
```
Open the shown URL (default http://localhost:5173) and connect MetaMask to the **Localhost 8545** or **Ganache** network.

## Inspector (Admin) account
The account that deployed the contract is the **inspector** (admin). Use Truffle console to verify users:
```bash
truffle console
// replace with actual deployed address
const lr = await LandRegistry.deployed()
// verify a user address
await lr.verifyUser("0xBuyerOrSellerAddress")
```

## Notes
- For real file storage (images/docs) use IPFS and put the hashes in the UI fields.
- This starter keeps logic simple: one active purchase request per land.
- Add your own role-based UI for Inspector to verify users from the frontend if desired.
