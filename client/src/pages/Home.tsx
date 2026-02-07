import { useState } from "react";
import { useEvidenceLogs, useLogEvidence, useBlockchain } from "@/hooks/use-evidence";
import { FileHasher } from "@/components/FileHasher";
import { BlockchainStatus } from "@/components/BlockchainStatus";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, ArrowRight, ExternalLink, Activity, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function Home() {
  const { account, isConnecting, connectWallet, notarizeHash, verifyOnChain, isConnected } = useBlockchain();
  const { data: logs, isLoading: isLoadingLogs } = useEvidenceLogs();
  const logEvidence = useLogEvidence();
  const { toast } = useToast();

  const [currentHash, setCurrentHash] = useState<string | null>(null);
  const [isNotarizing, setIsNotarizing] = useState(false);
  const [verifyInput, setVerifyInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    exists: boolean;
    submitter: string;
    timestamp: number;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // --- Actions ---

  const handleNotarize = async () => {
    if (!currentHash || !account) return;
    
    setIsNotarizing(true);
    try {
      // 1. Blockchain Transaction
      const receipt = await notarizeHash(currentHash);
      
      // 2. Log to Backend (for UI history)
      await logEvidence.mutateAsync({
        evidenceHash: currentHash,
        txHash: receipt.hash,
        submitter: account
      });

      toast({
        title: "Success! Evidence Notarized",
        description: "Your digital evidence is now immutable on the blockchain.",
      });
      
      setCurrentHash(null); // Reset
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error.message || "Something went wrong"
      });
    } finally {
      setIsNotarizing(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyInput) return;
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const result = await verifyOnChain(verifyInput);
      setVerificationResult(result);
      if (!result.exists) {
        toast({
          variant: "destructive",
          title: "Not Found",
          description: "This hash has not been notarized on this contract."
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Error",
        description: error.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ description: "Copied to clipboard" });
  };

  // --- Animations ---
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-background" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">BlockNotary</span>
          </div>
          <BlockchainStatus 
            account={account} 
            isConnecting={isConnecting} 
            onConnect={connectWallet} 
          />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 container mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
            <Activity className="w-3 h-3" />
            Ethereum Powered Forensics
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight">
            Immutable Proof of <br/>
            <span className="text-gradient">Digital Existence</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Securely notarize documents, files, and contracts on the Ethereum blockchain. 
            Create cryptographic proof of ownership and existence without revealing content.
          </p>
        </motion.div>
      </section>

      {/* Main App Area */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        
        {/* Left Column: Actions */}
        <div className="lg:col-span-7 space-y-8">
          <Tabs defaultValue="notarize" className="w-full">
            <TabsList className="w-full bg-secondary/30 border border-white/5 p-1 h-14 rounded-2xl mb-8">
              <TabsTrigger 
                value="notarize" 
                className="flex-1 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display font-medium text-base transition-all"
              >
                Notarize
              </TabsTrigger>
              <TabsTrigger 
                value="verify" 
                className="flex-1 h-full rounded-xl data-[state=active]:bg-card data-[state=active]:text-foreground font-display font-medium text-base transition-all"
              >
                Verify
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notarize" className="space-y-6">
              <motion.div variants={item}>
                <FileHasher onHashCalculated={setCurrentHash} />
              </motion.div>

              {currentHash && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card border border-primary/30 rounded-2xl p-6 shadow-lg shadow-primary/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Generated Hash (SHA-256)</h4>
                      <p className="font-mono text-xs md:text-sm text-muted-foreground break-all">{currentHash}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(currentHash)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-col gap-3">
                    {!isConnected ? (
                      <Button onClick={connectWallet} className="w-full py-6 text-lg font-display">
                        Connect Wallet to Notarize
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleNotarize} 
                        disabled={isNotarizing}
                        className="w-full py-6 text-lg font-display bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      >
                        {isNotarizing ? "Processing on Blockchain..." : "Notarize on Ethereum"}
                        {!isNotarizing && <ArrowRight className="ml-2 w-5 h-5" />}
                      </Button>
                    )}
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Transaction will cost a small amount of Gas (ETH).
                    </p>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="verify">
              <motion.div variants={item}>
                <Card className="glass-panel p-8">
                  <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                    <Search className="w-5 h-5 text-accent" />
                    Verify Authenticity
                  </h3>
                  <div className="flex gap-4 mb-8">
                    <Input 
                      placeholder="Enter SHA-256 Hash (0x...)" 
                      className="bg-secondary/50 border-white/10 h-12 font-mono text-sm"
                      value={verifyInput}
                      onChange={(e) => setVerifyInput(e.target.value)}
                    />
                    <Button 
                      onClick={handleVerify} 
                      disabled={isVerifying || !verifyInput}
                      className="h-12 px-6 bg-accent text-white hover:bg-accent/90"
                    >
                      {isVerifying ? "Checking..." : "Verify"}
                    </Button>
                  </div>

                  {verificationResult && (
                    <div className={`rounded-xl border p-6 ${verificationResult.exists ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        {verificationResult.exists ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-500" />
                        )}
                        <h4 className={`text-lg font-bold ${verificationResult.exists ? 'text-green-500' : 'text-red-500'}`}>
                          {verificationResult.exists ? "Evidence Verified" : "Hash Not Found"}
                        </h4>
                      </div>
                      
                      {verificationResult.exists && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-background/50 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground uppercase mb-1">Timestamp</p>
                              <p className="text-sm font-medium">
                                {format(new Date(verificationResult.timestamp * 1000), "PPpp")}
                              </p>
                            </div>
                            <div className="bg-background/50 p-3 rounded-lg col-span-2">
                              <p className="text-xs text-muted-foreground uppercase mb-1">Submitter Address</p>
                              <p className="text-xs font-mono font-medium truncate">{verificationResult.submitter}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Recent Activity Log */}
        <div className="lg:col-span-5">
          <motion.div variants={item} className="h-full">
            <Card className="h-full glass-panel border-l-4 border-l-primary/50 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/5 bg-secondary/20">
                <h3 className="font-display font-bold text-lg">Recent Notarizations</h3>
                <p className="text-sm text-muted-foreground">Live feed from this node</p>
              </div>
              
              <div className="flex-1 overflow-auto max-h-[600px] p-0">
                {isLoadingLogs ? (
                  <div className="p-8 text-center text-muted-foreground">Loading history...</div>
                ) : logs && logs.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {logs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-white/5 transition-colors group">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className="font-mono text-[10px] text-primary border-primary/20">
                            {format(new Date(log.createdAt || 0), "MMM d, HH:mm")}
                          </Badge>
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${log.txHash}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View TX <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="mb-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Hash</p>
                          <p className="font-mono text-xs text-foreground truncate">{log.evidenceHash}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Submitter</p>
                          <p className="font-mono text-xs text-accent truncate">{log.submitter}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No local logs found.</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
