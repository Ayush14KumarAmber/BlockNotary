# Deployment Instructions

## 1. Smart Contract Deployment

To deploy the `EvidenceNotary` smart contract to the Sepolia testnet:

1.  **Open Remix IDE**: Go to [https://remix.ethereum.org/](https://remix.ethereum.org/).
2.  **Create File**: Create a new file named `EvidenceNotary.sol`.
3.  **Copy Code**: Copy the content from `contract/EvidenceNotary.sol` in this project and paste it into Remix.
4.  **Compile**:
    *   Go to the "Solidity Compiler" tab.
    *   Select Compiler version `0.8.x`.
    *   Click "Compile EvidenceNotary.sol".
5.  **Deploy**:
    *   Go to the "Deploy & Run Transactions" tab.
    *   Select "Injected Provider - MetaMask" as the Environment.
    *   Ensure your MetaMask is connected to **Sepolia Testnet**.
    *   Click "Deploy".
    *   Confirm the transaction in MetaMask.
6.  **Get Address**: Once deployed, copy the **Deployed Contract Address** from Remix.

## 2. Connect Frontend

1.  Open `client/src/lib/contract.ts` (or wherever the contract address is defined - check the code).
    *   *Note: If the frontend generator hardcoded it, you might need to find it in the React components, usually in a `constants` file or directly in the component.*
2.  Replace the placeholder address (e.g., `0x00...`) with your new contract address.
3.  The app is now ready to interact with your deployed contract!
