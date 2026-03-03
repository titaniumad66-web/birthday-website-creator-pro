import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Image as ImageIcon, Type, Layout, Wand2, Heart, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Images
import heroBg from "@/assets/images/hero-bg.png";
import story1 from "@/assets/images/story-1.png";
import story2 from "@/assets/images/story-2.png";
import gift1 from "@/assets/images/gift-1.png";
import gift2 from "@/assets/images/gift-2.png";
import mockupImg from "@/assets/images/website-mockup.png";

export default function Home() {
  const [activeTab, setActiveTab] = useState("romantic");

  const wishes = {
    romantic: [
      "Every moment with you is a beautiful dream. Happy Birthday, my love. Let's make today as unforgettable as you are.",
      "To the one who holds my heart: Happy Birthday. You are the poetry I never knew I could write.",
    ],
    friend: [
      "Happy birthday to my partner in crime! Here's to more late-night talks, endless laughter, and memories we'll never forget.",
      "You're not just a friend; you're family. Happy birthday to the one who knows me best!",
    ],
    funny: [
      "Happy Birthday! I'm so glad we're going to grow old together, and that you have a head start.",
      "You're older today than yesterday but younger than tomorrow. Happy Birthday!",
    ],
    emotional: [
      "On your special day, I just want you to know how much light you bring into this world. Happy Birthday.",
      "Your kindness is a gift to everyone who meets you. Wishing you a birthday as beautiful as your soul.",
    ]
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="Background" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center max-w-4xl pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-sm font-medium mb-8 text-foreground/80">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Make their day unforgettable</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-6 text-foreground">
              Craft a Beautiful Birthday Experience
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto font-sans leading-relaxed">
              We turn your precious memories and heartfelt words into a stunning, personalized website. A digital gift that lasts forever, created in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create">
                <button className="h-14 px-8 rounded-full bg-foreground text-background hover:bg-foreground/90 transition-all font-medium text-lg flex items-center gap-2 shadow-lg hover:-translate-y-1">
                  Create Birthday Website <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works / Onboarding */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Four simple steps to a perfect digital gift.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-border -z-10 transform -translate-y-1/2"></div>
            
            {[
              { icon: ImageIcon, title: "Upload Photos", desc: "Select your favorite memories together." },
              { icon: Type, title: "Write a Message", desc: "Add your heartfelt wishes and inside jokes." },
              { icon: Wand2, title: "AI Generation", desc: "Our AI crafts a beautiful HTML website." },
              { icon: Layout, title: "Preview & Share", desc: "Review, deploy, and send them the link!" }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="bg-background glass-card rounded-2xl p-6 text-center h-full hover:-translate-y-2 transition-all duration-300">
                  <div className="w-14 h-14 mx-auto bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl font-medium mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Website Mockup Feature */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Wand2 className="w-4 h-4" />
                <span>AI Assistant</span>
              </div>
              <h2 className="text-4xl font-serif font-medium leading-tight">
                Not sure what to say?<br/> Let AI help you write.
              </h2>
              <p className="text-lg text-muted-foreground">
                Our personalized AI assistant guides you through the creation process. It helps you craft the perfect message, suggests layout improvements, and ensures your website feels uniquely yours.
              </p>
              <ul className="space-y-4 mt-8">
                {['Tone matching (funny, romantic, casual)', 'Layout recommendations based on your photos', 'Automatic styling and color palette selection'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Heart className="w-3 h-3" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6">
                <Link href="/create">
                  <button className="text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-2 border-b border-primary/30 pb-1">
                    Try the AI Assistant <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/20">
                  <img src={mockupImg} alt="Website Mockup" className="w-full h-auto object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-8">
                    <div className="glass-card w-full p-4 rounded-xl flex items-center justify-between">
                       <div>
                         <p className="text-white font-medium">ishwaris-birthday.aura.site</p>
                         <p className="text-white/70 text-xs">Ready to publish</p>
                       </div>
                       <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-white/90">
                         Publish
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Ideas & Templates */}
      <section id="stories" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Instagram Story Ideas</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Beautiful templates to tease their special day on social media.</p>
            </div>
            <button className="text-sm font-medium hover:text-primary transition-colors mt-4 md:mt-0 flex items-center gap-1">
              View all templates <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { img: story1, title: "Polaroid Memories" },
              { img: story2, title: "Minimal Sparkle" },
              { img: story1, title: "Vintage Film" },
              { img: story2, title: "Soft Gradient" }
            ].map((story, i) => (
              <div key={i} className="group relative rounded-xl overflow-hidden aspect-[9/16] cursor-pointer">
                <img src={story.img} alt={story.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                  <Download className="w-8 h-8 text-white mb-2" />
                  <p className="text-white font-medium text-sm">{story.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Texts & Wishes Collection */}
      <section id="wishes" className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Curated Words of Love</h2>
          <p className="text-muted-foreground text-lg mb-12">Find the perfect words when you don't know what to say.</p>

          <Tabs defaultValue="romantic" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="mb-8 bg-white/50 backdrop-blur-sm p-1 rounded-full border border-white/20">
              <TabsTrigger value="romantic" className="rounded-full px-6 text-sm">Romantic</TabsTrigger>
              <TabsTrigger value="friend" className="rounded-full px-6 text-sm">Best Friend</TabsTrigger>
              <TabsTrigger value="funny" className="rounded-full px-6 text-sm">Funny</TabsTrigger>
              <TabsTrigger value="emotional" className="rounded-full px-6 text-sm">Emotional</TabsTrigger>
            </TabsList>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value={activeTab} className="mt-0">
                  <div className="grid md:grid-cols-2 gap-6 text-left">
                    {wishes[activeTab as keyof typeof wishes].map((wish, i) => (
                      <Card key={i} className="glass-card border-none bg-white/80 hover:bg-white transition-colors cursor-pointer group">
                        <CardContent className="p-6">
                          <p className="font-serif text-lg leading-relaxed text-foreground/80 group-hover:text-foreground transition-colors italic">
                            "{wish}"
                          </p>
                          <div className="mt-4 flex justify-end">
                             <button className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                               Copy text
                             </button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </section>

      {/* Gift Shop Teaser */}
      <section id="shop" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-medium mb-4">Aesthetic Gift Shop</h2>
            <p className="text-muted-foreground text-lg">Pair your digital website with a physical gift.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: gift1, name: "The Signature Box", price: "$45", desc: "Curated aesthetic self-care items in a premium ribbon box." },
              { img: gift2, name: "Peony Bouquet", price: "$60", desc: "Fresh seasonal pastels wrapped in elegant paper." },
              { img: gift1, name: "Memory Keepsake", price: "$35", desc: "A physical photo album complementing your website." }
            ].map((product, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4 bg-secondary/50">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply" />
                </div>
                <h3 className="font-medium text-lg font-serif">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-2">{product.desc}</p>
                <p className="font-medium">{product.price}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
             <button className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-full text-sm font-medium transition-colors">
               Explore Full Shop
             </button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 bg-foreground text-background text-center px-4">
        <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to make them smile?</h2>
        <p className="text-background/70 mb-10 max-w-xl mx-auto">Create a beautiful, personalized birthday experience in minutes.</p>
        <Link href="/create">
          <button className="h-14 px-8 rounded-full bg-background text-foreground hover:bg-primary hover:text-white transition-all font-medium text-lg flex items-center gap-2 shadow-lg mx-auto">
            Start Creating <Wand2 className="w-5 h-5" />
          </button>
        </Link>
      </section>
    </div>
  );
}