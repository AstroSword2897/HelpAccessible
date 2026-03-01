import { Link } from "wouter";
import { TabletSmartphone, LayoutDashboard, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-grid-pattern flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">CommuBuddy</h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto font-medium">
          Empowering communication and connection through accessible ABA therapy tools.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/child" className="block h-full">
            <div className="h-full glass-card rounded-3xl p-8 flex flex-col items-center text-center group hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                <TabletSmartphone className="w-10 h-10 text-primary group-hover:text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-3 text-foreground group-hover:text-primary transition-colors">Child Tablet Mode</h2>
              <p className="text-muted-foreground mb-8 text-lg">Launch the accessible AAC communication interface tailored for the child.</p>
              
              <div className="mt-auto flex items-center text-primary font-bold text-lg group-hover:translate-x-2 transition-transform">
                Launch Tablet <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/dashboard" className="block h-full">
            <div className="h-full glass-card rounded-3xl p-8 flex flex-col items-center text-center group hover:border-accent/50 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/10">
              <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-accent transition-all duration-300">
                <LayoutDashboard className="w-10 h-10 text-accent group-hover:text-accent-foreground" />
              </div>
              <h2 className="text-3xl font-display font-bold mb-3 text-foreground group-hover:text-accent transition-colors">Caregiver Dashboard</h2>
              <p className="text-muted-foreground mb-8 text-lg">Access settings, view session analytics, and manage prompts.</p>
              
              <div className="mt-auto flex items-center text-accent font-bold text-lg group-hover:translate-x-2 transition-transform">
                Open Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
