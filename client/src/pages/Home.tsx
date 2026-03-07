import { Link } from "wouter";
import { TabletSmartphone, LayoutDashboard, ClipboardList, Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#eff6ff]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md bg-sky-400 text-white">
            <Compass className="w-7 h-7" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-800">
            AuXel
          </h1>
        </div>
        <p className="text-lg md:text-xl text-slate-600 max-w-lg mx-auto font-medium">
          Evidence-based support across the autism spectrum: AAC communication, ABA-aligned skill assessment, and caregiver tools in one place.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link href="/child" className="block h-full">
            <div className="h-full rounded-2xl p-8 flex flex-col items-center text-center transition-all duration-200 border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-sky-200 hover:-translate-y-0.5">
              <div className="w-20 h-20 rounded-2xl bg-sky-400 flex items-center justify-center mb-6 text-white">
                <TabletSmartphone className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-3 text-slate-800">Child Tablet</h2>
              <p className="text-slate-600 mb-8 text-base">AAC-style communication board and ABA practice (needs, distress, refusal, help) plus lesson and game modes tailored to your child’s profile.</p>
              <div className="mt-auto flex items-center text-sky-600 font-bold text-lg">
                Launch Tablet <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Link href="/assessment" className="block h-full">
            <div className="h-full rounded-2xl p-8 flex flex-col items-center text-center border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-20 h-20 rounded-2xl bg-emerald-600 flex items-center justify-center mb-6 text-white">
                <ClipboardList className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-3 text-slate-800">Skill Assessment</h2>
              <p className="text-slate-600 mb-8 text-base">In-depth, ABA-aligned questionnaire across communication, social, adaptive, and play domains to map support needs and recommend tablet complexity.</p>
              <div className="mt-auto flex items-center text-emerald-600 font-bold text-lg">
                Start Assessment <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link href="/dashboard" className="block h-full">
            <div className="h-full rounded-2xl p-8 flex flex-col items-center text-center border border-slate-200 bg-white shadow-sm hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-20 h-20 rounded-2xl bg-slate-600 flex items-center justify-center mb-6 text-white">
                <LayoutDashboard className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-display font-bold mb-3 text-slate-800">Caregiver Dashboard</h2>
              <p className="text-slate-600 mb-8 text-base">Overview and analytics, skill assessment results and spectrum placement, configuration (theme, complexity, sensory preferences), and activity logs.</p>
              <div className="mt-auto flex items-center text-slate-600 font-bold text-lg">
                Open Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
