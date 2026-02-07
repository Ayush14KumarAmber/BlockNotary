import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type InsertEvidenceLog } from "@shared/routes";
import { ethers } from "ethers";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

// Placeholder contract address - user can override in settings or input
const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

const CONTRACT_ABI = [
  "function registerEvidence(bytes32 _evidenceHash) public",
  "function verifyEvidence(bytes32 _evidenceHash) public view returns (bool, address, uint256)",
  "event EvidenceRegistered(bytes32 indexed evidenceHash, address indexed submitter, uint256 timestamp)"
];

// Hook for fetching local logs
export function useEvidenceLogs() {
  return useQuery({
    queryKey: [api.evidence.list.path],
    queryFn: async () => {
      const res = await fetch(api.evidence.list.path);
      if (!res.ok) throw new Error("Failed to fetch logs");
      return api.evidence.list.responses[200].parse(await res.json());
    },
  });
}

// Hook for logging to backend (after blockchain success)
export function useLogEvidence() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertEvidenceLog) => {
      const res = await fetch(api.evidence.log.path, {
        method: api.evidence.log.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to log evidence");
      return api.evidence.log.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.evidence.list.path] });
    },
  });
}

// Hook for Blockchain Interactions
export function useBlockchain() {
  const { toast } = useToast();
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast({
        variant: "destructive",
        title: "MetaMask Not Found",
        description: "Please install MetaMask to interact with the blockchain.",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await _provider.send("eth_requestAccounts", []);
      setProvider(_provider);
      setAccount(accounts[0]);
      toast({
        title: "Wallet Connected",
        description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
      });
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet.",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const notarizeHash = async (hash: string, contractAddress: string = DEFAULT_CONTRACT_ADDRESS) => {
    if (!provider) throw new Error("Wallet not connected");
    
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
      
      // Ensure hash is 0x-prefixed
      const formattedHash = hash.startsWith("0x") ? hash : `0x${hash}`;
      
      const tx = await contract.registerEvidence(formattedHash);
      toast({
        title: "Transaction Sent",
        description: "Waiting for confirmation...",
      });
      
      const receipt = await tx.wait();
      return receipt;
    } catch (error: any) {
      console.error("Notarization error:", error);
      throw error;
    }
  };

  const verifyOnChain = async (hash: string, contractAddress: string = DEFAULT_CONTRACT_ADDRESS) => {
    // Read-only calls don't strictly need a signer, but provider is fine
    // Fallback to a default RPC if wallet not connected? For now require wallet or standard provider.
    let readProvider: ethers.Provider = provider || new ethers.JsonRpcProvider("http://localhost:8545"); // Fallback for dev
    
    // If user has metamask but not connected, try to wrap it for read-only
    if (!provider && window.ethereum) {
        readProvider = new ethers.BrowserProvider(window.ethereum);
    }

    try {
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, readProvider);
      const formattedHash = hash.startsWith("0x") ? hash : `0x${hash}`;
      
      const result = await contract.verifyEvidence(formattedHash);
      // result is [bool exists, address submitter, uint256 timestamp]
      return {
        exists: result[0],
        submitter: result[1],
        timestamp: Number(result[2]), // Convert BigInt to number (careful with overflow, but timestamps fit)
      };
    } catch (error: any) {
      console.error("Verification error:", error);
      // If contract doesn't exist or method fails
      throw new Error("Failed to verify on blockchain. Check contract address and network.");
    }
  };

  return {
    account,
    isConnecting,
    connectWallet,
    notarizeHash,
    verifyOnChain,
    isConnected: !!account
  };
}
