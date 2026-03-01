import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useChildProfile, useUpdateChildProfile } from "@/hooks/use-child-profile";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Settings2 } from "lucide-react";

export default function Configuration() {
  const { data: profile, isLoading } = useChildProfile();
  const { mutate: updateProfile, isPending } = useUpdateChildProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    theme: "playful",
    complexityLevel: 1,
    interfaceType: "hybrid",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        theme: profile.theme,
        complexityLevel: profile.complexityLevel,
        interfaceType: profile.interfaceType,
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(formData, {
      onSuccess: () => {
        toast({
          title: "Profile Updated",
          description: "Changes have been saved successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    });
  };

  if (isLoading) return <DashboardLayout><div className="animate-spin w-8 h-8 border-2 border-primary rounded-full mx-auto mt-20"></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage the tablet experience and child profile settings.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Card */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
              <User className="text-primary w-5 h-5" />
              <h2 className="font-semibold text-lg">Basic Information</h2>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium mb-2">Child's Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                required
              />
            </div>
          </div>

          {/* Experience Card */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
              <Settings2 className="text-primary w-5 h-5" />
              <h2 className="font-semibold text-lg">Tablet Experience</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Visual Theme</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    border-2 rounded-xl p-4 cursor-pointer transition-all
                    ${formData.theme === 'playful' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}>
                    <input type="radio" name="theme" value="playful" className="sr-only" 
                      checked={formData.theme === 'playful'} onChange={() => setFormData({...formData, theme: 'playful'})} 
                    />
                    <div className="font-semibold text-primary mb-1">Playful</div>
                    <div className="text-sm text-muted-foreground">High contrast, vibrant colors.</div>
                  </label>
                  
                  <label className={`
                    border-2 rounded-xl p-4 cursor-pointer transition-all
                    ${formData.theme === 'calm' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  `}>
                    <input type="radio" name="theme" value="calm" className="sr-only" 
                      checked={formData.theme === 'calm'} onChange={() => setFormData({...formData, theme: 'calm'})} 
                    />
                    <div className="font-semibold text-teal-600 mb-1">Calm</div>
                    <div className="text-sm text-muted-foreground">Muted colors, low sensory input.</div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Interface Complexity</label>
                <select 
                  value={formData.interfaceType}
                  onChange={e => setFormData({...formData, interfaceType: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="simple">Simple (Communication Only)</option>
                  <option value="hybrid">Hybrid (Comm + Learning)</option>
                  <option value="advanced">Advanced (All Features)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isPending}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-5 h-5" />}
              {isPending ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
