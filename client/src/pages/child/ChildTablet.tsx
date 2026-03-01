import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { HandHelping, Frown, Hand, Heart, Gamepad2, MessageSquare, ArrowLeft, Star } from "lucide-react";
import { useCreateSessionLog } from "@/hooks/use-session-logs";
import { useChildProfile } from "@/hooks/use-child-profile";
import { useToast } from "@/hooks/use-toast";

type Mode = "communicate" | "prompts" | "games";

export default function ChildTablet() {
  const [activeMode, setActiveMode] = useState<Mode>("communicate");
  const { mutate: logSession } = useCreateSessionLog();
  const { data: profile } = useChildProfile();
  const { toast } = useToast();
  
  // Audio feedback could be added here based on profile.sensoryPreferences

  const handleCommunicate = (intent: string, type: "need" | "distress" | "refusal" | "help") => {
    logSession({
      childId: 1, // MVP assumption
      eventType: "communication",
      details: intent,
    }, {
      onSuccess: () => {
        // Optional visual/toast feedback that isn't overwhelming
        const messages = {
          need: "I want that",
          distress: "I don't feel good",
          refusal: "No thank you",
          help: "Help me please"
        };
        
        toast({
          title: "Message Sent",
          description: messages[type],
          duration: 2000,
        });
      }
    });
  };

  const isCalm = profile?.theme === 'calm';

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col ${isCalm ? 'theme-calm bg-background' : 'bg-slate-50'}`}>
      {/* Top Navigation Bar */}
      <header className="h-20 bg-card border-b shadow-sm flex items-center justify-between px-6 z-20">
        <Link href="/" className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-secondary/20 hover:text-secondary-foreground transition-colors tablet-button-press">
          <ArrowLeft className="w-8 h-8" />
        </Link>
        
        <div className="flex gap-4">
          <TabButton 
            active={activeMode === "communicate"} 
            onClick={() => setActiveMode("communicate")}
            icon={<MessageSquare className="w-8 h-8" />}
            label="Talk"
            color="bg-primary text-primary-foreground"
          />
          {profile?.interfaceType !== 'simple' && (
            <TabButton 
              active={activeMode === "prompts"} 
              onClick={() => setActiveMode("prompts")}
              icon={<Star className="w-8 h-8" />}
              label="Learn"
              color="bg-accent text-accent-foreground"
            />
          )}
          <TabButton 
            active={activeMode === "games"} 
            onClick={() => setActiveMode("games")}
            icon={<Gamepad2 className="w-8 h-8" />}
            label="Play"
            color="bg-secondary text-secondary-foreground"
          />
        </div>
        
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary">
          <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.name || 'Child'}`} alt="Avatar" className="w-10 h-10" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative p-6">
        <AnimatePresence mode="wait">
          {activeMode === "communicate" && (
            <motion.div 
              key="communicate"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="h-full grid grid-cols-2 grid-rows-2 gap-6"
            >
              <CommunicationButton 
                icon={<Heart className="w-24 h-24 mb-4 text-white" />}
                label="I WANT..."
                color="from-primary to-blue-400"
                shadowColor="shadow-primary/30"
                onClick={() => handleCommunicate("I want something", "need")}
              />
              <CommunicationButton 
                icon={<Hand className="w-24 h-24 mb-4 text-white" />}
                label="NO / STOP"
                color="from-destructive to-red-400"
                shadowColor="shadow-destructive/30"
                onClick={() => handleCommunicate("No or Stop", "refusal")}
              />
              <CommunicationButton 
                icon={<Frown className="w-24 h-24 mb-4 text-white" />}
                label="I FEEL BAD"
                color="from-orange-400 to-amber-500"
                shadowColor="shadow-orange-500/30"
                onClick={() => handleCommunicate("Feeling bad/distress", "distress")}
              />
              <CommunicationButton 
                icon={<HandHelping className="w-24 h-24 mb-4 text-white" />}
                label="HELP ME"
                color="from-accent to-emerald-400"
                shadowColor="shadow-accent/30"
                onClick={() => handleCommunicate("Need help", "help")}
              />
            </motion.div>
          )}

          {activeMode === "prompts" && (
            <motion.div 
              key="prompts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center glass-card p-12 rounded-3xl max-w-2xl w-full">
                <Star className="w-20 h-20 text-accent mx-auto mb-6" />
                <h2 className="text-4xl font-display font-bold text-foreground mb-4">Learning Time!</h2>
                <p className="text-2xl text-muted-foreground mb-8">Tap to start your next learning prompt.</p>
                <button 
                  onClick={() => logSession({ childId: 1, eventType: "prompt_started", details: "Manual start" })}
                  className="px-12 py-6 text-2xl font-bold bg-accent text-white rounded-full shadow-xl shadow-accent/40 tablet-button-press hover:bg-emerald-500 transition-colors"
                >
                  Start Lesson
                </button>
              </div>
            </motion.div>
          )}

          {activeMode === "games" && (
            <motion.div 
              key="games"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center glass-card p-12 rounded-3xl max-w-2xl w-full border-secondary/50 shadow-secondary/20">
                <Gamepad2 className="w-20 h-20 text-secondary mx-auto mb-6" />
                <h2 className="text-4xl font-display font-bold text-foreground mb-4">Break Time</h2>
                <p className="text-2xl text-muted-foreground mb-8">Good job! You earned break time.</p>
                <button 
                  onClick={() => logSession({ childId: 1, eventType: "game_started", details: "Reward break" })}
                  className="px-12 py-6 text-2xl font-bold bg-secondary text-secondary-foreground rounded-full shadow-xl shadow-secondary/40 tablet-button-press hover:bg-yellow-400 transition-colors"
                >
                  Play Game
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Subcomponents

function TabButton({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-6 py-2 rounded-2xl flex items-center gap-3 transition-all duration-300 tablet-button-press
        ${active ? `${color} shadow-lg scale-105` : 'bg-muted text-muted-foreground hover:bg-card hover:shadow'}
      `}
    >
      {icon}
      <span className="font-display font-bold text-2xl hidden md:block">{label}</span>
    </button>
  );
}

function CommunicationButton({ icon, label, color, shadowColor, onClick }: { icon: React.ReactNode, label: string, color: string, shadowColor: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full h-full rounded-3xl bg-gradient-to-br ${color} ${shadowColor}
        shadow-xl flex flex-col items-center justify-center tablet-button-press
        border-4 border-white/20 relative overflow-hidden group
      `}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-y-full group-active:translate-y-0 transition-transform duration-500"></div>
      
      <motion.div whileTap={{ scale: 0.9 }}>
        {icon}
      </motion.div>
      <span className="text-white font-display font-bold text-4xl md:text-5xl drop-shadow-md tracking-wide">
        {label}
      </span>
    </button>
  );
}
