import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image as ImageIcon, Type, Sparkles, Wand2, Upload, 
  ChevronRight, CheckCircle2, Loader2, PlayCircle, Eye
} from "lucide-react";
import { Link } from "wouter";

// Components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// Mockup image for preview
import mockupImg from "@/assets/images/website-mockup.png";

type Step = "upload" | "details" | "generating" | "preview";

export default function CreateWebsite() {
  const [step, setStep] = useState<Step>("upload");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [aiTone, setAiTone] = useState("romantic");
  const [progress, setProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload - in a real app, we'd read the files using FileReader
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const handleGenerate = () => {
    setStep("generating");
    setProgress(0);
    
    // Simulate generation process
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setStep("preview"), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Progress Header */}
        <div className="mb-12">
           <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-serif font-medium">Create Website</h1>
              <div className="text-sm font-medium text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
                {step === 'upload' && "Step 1: Memories"}
                {step === 'details' && "Step 2: Message"}
                {step === 'generating' && "Step 3: Magic"}
                {step === 'preview' && "Step 4: Preview"}
              </div>
           </div>
           <div className="flex gap-2 h-2">
             <div className={`flex-1 rounded-full transition-colors ${step === 'upload' ? 'bg-primary' : 'bg-primary/20'}`} />
             <div className={`flex-1 rounded-full transition-colors ${step === 'details' ? 'bg-primary' : (step === 'generating' || step === 'preview' ? 'bg-primary/20' : 'bg-secondary')}`} />
             <div className={`flex-1 rounded-full transition-colors ${step === 'generating' ? 'bg-primary' : (step === 'preview' ? 'bg-primary/20' : 'bg-secondary')}`} />
             <div className={`flex-1 rounded-full transition-colors ${step === 'preview' ? 'bg-primary' : 'bg-secondary'}`} />
           </div>
        </div>

        <div className="bg-white/40 glass-card rounded-3xl p-6 md:p-10 shadow-sm border border-white/20">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD */}
            {step === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center max-w-xl mx-auto mb-8">
                  <h2 className="text-2xl font-serif font-medium mb-2">Upload your favorite memories</h2>
                  <p className="text-muted-foreground">Select photos that mean the most to you both. Our AI will automatically arrange them beautifully.</p>
                </div>

                <div 
                  className="border-2 border-dashed border-primary/30 rounded-2xl p-12 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Upload className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-medium text-lg mb-1">Click to upload photos</h3>
                  <p className="text-sm text-muted-foreground">JPG, PNG up to 10MB</p>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Selected Photos ({uploadedImages.length})</h4>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                      {uploadedImages.map((src, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <img src={src} alt="Uploaded" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      <div 
                        className="w-24 h-24 rounded-xl border border-dashed border-border flex items-center justify-center shrink-0 cursor-pointer hover:bg-secondary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setStep("details")}
                    disabled={uploadedImages.length === 0}
                    className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: DETAILS & AI */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-serif font-medium mb-2">Who is this for?</h2>
                      <p className="text-muted-foreground text-sm mb-6">Enter their name and your personalized message.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1.5 block">Their Name</label>
                          <Input 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Ishwari" 
                            className="bg-white/60 h-12"
                          />
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium">Your Message</label>
                            <button className="text-xs text-primary font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> Enhance with AI
                            </button>
                          </div>
                          <Textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Write something sweet from your heart..." 
                            className="bg-white/60 min-h-[150px] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Assistant Section */}
                  <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col">
                    <div className="flex items-center gap-2 mb-4 text-primary">
                      <Wand2 className="w-5 h-5" />
                      <h3 className="font-serif font-medium text-lg">AI Writing Assistant</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">Need help finding the right words? Select a tone and let our AI suggest a beautiful message.</p>
                    
                    <div className="space-y-3 mb-6">
                      {['Romantic & Sweet', 'Best Friend & Fun', 'Emotional & Deep'].map((tone) => (
                        <div 
                          key={tone}
                          onClick={() => setAiTone(tone.toLowerCase())}
                          className={`p-3 rounded-xl border cursor-pointer transition-all text-sm ${aiTone === tone.toLowerCase() ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white border-border hover:border-primary/30'}`}
                        >
                          {tone}
                        </div>
                      ))}
                    </div>
                    
                    <button className="mt-auto w-full bg-white border border-primary/20 text-primary py-2.5 rounded-xl text-sm font-medium hover:bg-primary/5 transition-colors">
                      Generate Message
                    </button>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border">
                  <button 
                    onClick={() => setStep("upload")}
                    className="text-muted-foreground px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleGenerate}
                    disabled={!name}
                    className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    Generate Website <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: GENERATING */}
            {step === "generating" && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative w-24 h-24 mb-8">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-2 border-primary border-opacity-50"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border-b-2 border-foreground border-opacity-20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-primary">
                    <Sparkles className="w-8 h-8 animate-pulse" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-serif font-medium mb-3">Crafting Magic...</h2>
                <p className="text-muted-foreground text-sm max-w-sm mb-8 h-6">
                  {progress < 30 && "Analyzing uploaded memories..."}
                  {progress >= 30 && progress < 60 && "Selecting the perfect color palette..."}
                  {progress >= 60 && progress < 90 && "Writing HTML and laying out the design..."}
                  {progress >= 90 && "Finalizing the beautiful details..."}
                </p>

                <div className="w-full max-w-md bg-secondary/50 rounded-full h-2 mb-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{progress}%</p>
              </motion.div>
            )}

            {/* STEP 4: PREVIEW */}
            {step === "preview" && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-serif font-medium mb-2">It's Ready!</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Your personalized website for {name} has been generated successfully. Review it below before publishing.
                </p>

                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/40 max-w-3xl mx-auto group bg-white">
                  <div className="h-8 bg-secondary/50 border-b flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mx-auto text-xs text-muted-foreground font-medium bg-white px-4 py-1 rounded-md shadow-sm">
                      {name.toLowerCase().replace(/\s+/g, '-')}-birthday.aura.site
                    </div>
                  </div>
                  <img src={mockupImg} alt="Preview" className="w-full h-auto" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                      <Eye className="w-4 h-4" /> Live Preview
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                  <button 
                    onClick={() => setStep("details")}
                    className="px-6 py-3 rounded-full font-medium hover:bg-secondary transition-colors"
                  >
                    Make Edits
                  </button>
                  <button className="bg-foreground text-background px-8 py-3 rounded-full font-medium hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-lg hover:-translate-y-1">
                    <PlayCircle className="w-5 h-5" /> Publish to GitHub
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">We will automatically create a repository and deploy via GitHub Pages.</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}