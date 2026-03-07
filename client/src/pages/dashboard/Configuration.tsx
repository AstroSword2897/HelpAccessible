import { useState, useEffect } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useChildProfile, useUpdateChildProfile } from "@/hooks/use-child-profile";
import { useSkillAssessment, useSubmitSkillAssessment } from "@/hooks/use-skill-assessment";
import { useToast } from "@/hooks/use-toast";
import { Save, User, Settings2, ClipboardList, ArrowRight } from "lucide-react";
import type { AssessmentDomainScores } from "@shared/schema";

const ASSESSMENT_DOMAIN_KEYS: (keyof AssessmentDomainScores)[] = [
  "communication",
  "social",
  "adaptive",
  "play",
  "physical",
  "advanced",
];

const DOMAIN_LABELS: Record<string, string> = {
  communication: "Communication",
  social: "Social",
  adaptive: "Adaptive / self-help",
  play: "Play",
  physical: "Physical & sensory-motor",
  advanced: "Advanced (executive function)",
};

const SUPPORT_LEVEL_LABELS: Record<number, string> = {
  1: "Level 1: Requiring support",
  2: "Level 2: Requiring substantial support",
  3: "Level 3: Requiring very substantial support",
};

export default function Configuration() {
  const { data: profile, isLoading } = useChildProfile();
  const { mutate: updateProfile, isPending } = useUpdateChildProfile();
  const { data: latestAssessment, isLoading: assessmentLoading } = useSkillAssessment();
  const { mutateAsync: submitAssessment, isPending: assessmentSaving } = useSubmitSkillAssessment();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    theme: "playful",
    complexityLevel: 1,
    interfaceType: "hybrid",
    sensoryPreferences: {
      sound: true,
      vibration: true,
      visualFeedback: true,
    },
  });

  const [assessmentForm, setAssessmentForm] = useState<{
    domainScores: AssessmentDomainScores;
    supportLevel: number;
    recommendedComplexity: number;
  }>({
    domainScores: { communication: 1, social: 1, adaptive: 1, play: 1 },
    supportLevel: 2,
    recommendedComplexity: 2,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        theme: profile.theme,
        complexityLevel: profile.complexityLevel,
        interfaceType: profile.interfaceType,
        sensoryPreferences: {
          sound: profile.sensoryPreferences?.sound ?? true,
          vibration: profile.sensoryPreferences?.vibration ?? true,
          visualFeedback: profile.sensoryPreferences?.visualFeedback ?? true,
        },
      });
    }
  }, [profile]);

  useEffect(() => {
    if (latestAssessment) {
      setAssessmentForm({
        domainScores: latestAssessment.domainScores,
        supportLevel: latestAssessment.supportLevel,
        recommendedComplexity: latestAssessment.recommendedComplexity,
      });
    }
  }, [latestAssessment]);

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

  const handleSaveAssessment = async () => {
    try {
      await submitAssessment({
        childId: 1,
        domainScores: assessmentForm.domainScores,
        supportLevel: assessmentForm.supportLevel,
        recommendedComplexity: assessmentForm.recommendedComplexity,
      });
      updateProfile(
        { complexityLevel: assessmentForm.recommendedComplexity },
        {
          onSuccess: () => {
            toast({
              title: "Skill assessment updated",
              description: "Spectrum placement and tablet complexity have been saved.",
            });
          },
          onError: (e) => {
            toast({ title: "Error", description: e.message, variant: "destructive" });
          },
        },
      );
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Could not save assessment.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <DashboardLayout><div className="animate-spin w-8 h-8 border-2 border-primary rounded-full mx-auto mt-20"></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground">Configuration</h1>
          <p className="text-muted-foreground mt-1">Child profile, spectrum placement from skill assessment, tablet complexity, theme, and sensory preferences.</p>
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
                <label className="block text-sm font-medium mb-3">Learning Complexity</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={1}
                  value={formData.complexityLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      complexityLevel: Number(e.target.value),
                    })
                  }
                  className="w-full accent-primary"
                />
                <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                  <span>Level 1: foundational</span>
                  <span className="font-semibold text-foreground">
                    Level {formData.complexityLevel}
                  </span>
                  <span>Level 3: advanced</span>
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

              <div>
                <label className="block text-sm font-medium mb-3">Feedback Preferences</label>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    {
                      key: "visualFeedback",
                      title: "Visual feedback",
                      description: "Show success and retry messages on the tablet.",
                    },
                    {
                      key: "sound",
                      title: "Sound",
                      description: "Reserve space for spoken or audio feedback.",
                    },
                    {
                      key: "vibration",
                      title: "Vibration",
                      description: "Reserve space for haptic feedback on supported devices.",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background px-4 py-4"
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-muted-foreground">{item.description}</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={
                          formData.sensoryPreferences[
                            item.key as keyof typeof formData.sensoryPreferences
                          ]
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sensoryPreferences: {
                              ...formData.sensoryPreferences,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="mt-1 h-5 w-5 rounded border-border accent-primary"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skill assessment (spectrum placement) */}
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-3">
              <ClipboardList className="text-primary w-5 h-5" />
              <h2 className="font-semibold text-lg">Skill assessment (spectrum placement)</h2>
            </div>
            <div className="p-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                These values come from the AuXel Skill Assessment and describe your child’s placement across communication, social, adaptive, and play domains on the autism spectrum. Edit them here to adjust support level and tablet complexity; the child tablet uses the recommended complexity for lessons and games.
              </p>

              {assessmentLoading ? (
                <div className="py-4 text-center text-muted-foreground text-sm">Loading assessment…</div>
              ) : !latestAssessment ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
                  <p className="text-muted-foreground mb-4">No assessment saved yet.</p>
                  <Link href="/assessment">
                    <button type="button" className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 mx-auto">
                      Run Skill Assessment <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-3">Domain scores (1 = limited, 3 = strong)</label>
                    <div className="grid grid-cols-2 gap-4">
                      {ASSESSMENT_DOMAIN_KEYS.map((key) => (
                        <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3">
                          <span className="text-sm font-medium">{DOMAIN_LABELS[key]}</span>
                          <select
                            value={assessmentForm.domainScores[key]}
                            onChange={(e) =>
                              setAssessmentForm((prev) => ({
                                ...prev,
                                domainScores: {
                                  ...prev.domainScores,
                                  [key]: Number(e.target.value) as 1 | 2 | 3,
                                },
                              }))
                            }
                            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Support level</label>
                    <select
                      value={assessmentForm.supportLevel}
                      onChange={(e) =>
                        setAssessmentForm((prev) => ({
                          ...prev,
                          supportLevel: Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-xl border bg-background px-4 py-3 text-foreground focus:ring-2 focus:ring-primary/20"
                    >
                      {[1, 2, 3].map((n) => (
                        <option key={n} value={n}>
                          {SUPPORT_LEVEL_LABELS[n]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Recommended tablet complexity</label>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={1}
                      value={assessmentForm.recommendedComplexity}
                      onChange={(e) =>
                        setAssessmentForm((prev) => ({
                          ...prev,
                          recommendedComplexity: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-primary"
                    />
                    <p className="mt-1 text-sm text-muted-foreground">
                      Level {assessmentForm.recommendedComplexity} (used by the tablet)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAssessment}
                    disabled={assessmentSaving}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium flex items-center gap-2 disabled:opacity-50"
                  >
                    {assessmentSaving ? "Saving…" : "Save assessment & apply to profile"}
                  </button>
                </>
              )}
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
