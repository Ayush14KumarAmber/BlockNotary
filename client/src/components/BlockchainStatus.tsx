import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface BlockchainStatusProps {
  account: string | null;
  isConnecting: boolean;
  onConnect: () => void;
}

export function BlockchainStatus({ account, isConnecting, onConnect }: BlockchainStatusProps) {
  if (account) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-1 pr-4 rounded-full bg-primary/10 border border-primary/20"
      >
        <div className="bg-primary/20 p-2 rounded-full">
          <CheckCircle2 className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-bold text-primary/70">Connected</span>
          <span className="text-xs font-mono text-primary font-medium">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onConnect}
      disabled={isConnecting}
      className="rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary gap-2"
    >
      <Wallet className="w-4 h-4" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
