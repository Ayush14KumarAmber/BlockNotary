import { useState, useRef } from "react";
import { ethers } from "ethers";
import { Upload, FileText, Check, Loader2, Hash, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface FileHasherProps {
  onHashCalculated: (hash: string) => void;
}

export function FileHasher({ onHashCalculated }: FileHasherProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const calculateHash = async (arrayBuffer: ArrayBuffer) => {
    setIsHashing(true);
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      // Standardize to 0x prefix for Ethereum
      const ethHash = `0x${hashHex}`;
      onHashCalculated(ethHash);
      return ethHash;
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Hashing Failed",
        description: "Could not calculate SHA-256 hash."
      });
      return null;
    } finally {
      setIsHashing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    await calculateHash(buffer);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleTextHash = async () => {
    if (!textInput) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(textInput);
    await calculateHash(data);
  };

  return (
    <Card className="glass-panel p-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Hash className="w-32 h-32" />
      </div>

      <h3 className="text-xl font-display font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Generate Evidence Hash
      </h3>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50 p-1 rounded-lg">
          <TabsTrigger value="file" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Upload File</TabsTrigger>
          <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md transition-all">Enter Text</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <div
            className={`
              border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
              ${isDragging 
                ? "border-primary bg-primary/10 scale-[1.02]" 
                : "border-white/10 hover:border-primary/50 hover:bg-white/5"
              }
            `}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            
            <AnimatePresence mode="wait">
              {isHashing ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center py-4"
                >
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                  <p className="text-muted-foreground font-medium">Calculating SHA-256...</p>
                </motion.div>
              ) : fileName ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-2"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-3">
                    <Check className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-lg font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-green-400 mt-1">Ready for Notarization</p>
                  <Button variant="link" className="text-muted-foreground hover:text-foreground mt-2" onClick={(e) => { e.stopPropagation(); setFileName(null); }}>
                    Change File
                  </Button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center py-4 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm opacity-70">Any file type (Images, PDFs, Docs)</p>
                  <p className="text-xs text-primary/60 mt-4 font-mono">Client-side hashing • Privacy preserved</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="text">
          <div className="space-y-4">
            <Textarea 
              placeholder="Enter text to notarize..." 
              className="min-h-[160px] bg-secondary/30 border-white/10 focus:border-primary/50 resize-none font-mono text-sm"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
            />
            <Button 
              onClick={handleTextHash} 
              disabled={!textInput || isHashing}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isHashing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Hash className="w-4 h-4 mr-2" />}
              Generate Hash
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
