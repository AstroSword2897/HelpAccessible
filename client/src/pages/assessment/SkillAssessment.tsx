import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Users,
  Heart,
  Gamepad2,
  Sparkles,
  Activity,
  Brain,
  Loader2,
} from "lucide-react";
import { useSubmitSkillAssessment, useAssessmentAnalyze } from "@/hooks/use-skill-assessment";
import { useChildProfile, useUpdateChildProfile } from "@/hooks/use-child-profile";
import { useToast } from "@/hooks/use-toast";
import type { AssessmentDomainScores } from "@shared/schema";

const DOMAINS: Array<{
  key: keyof AssessmentDomainScores;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: string[];
}> = [
  {
    key: "communication",
    title: "Communication",
    description: "How the child uses language, gestures, and other means to express needs and understand others.",
    icon: <MessageSquare className="w-8 h-8" />,
    questions: [
      "Initiates requests for preferred items or activities (e.g., points, reaches, uses a word or device)?",
      "Responds consistently when name is called (e.g., looks, orients, or vocalizes)?",
      "Follows simple one-step directions (e.g., 'Come here', 'Give me the cup')?",
      "Follows two-step or multi-step directions when given in order?",
      "Uses single words, signs, or pictures to communicate wants and needs?",
      "Uses two-word combinations or short phrases (e.g., 'more juice', 'want toy')?",
      "Asks questions to get information (e.g., 'What's that?', 'Where going?')?",
      "Uses or understands nonverbal communication (e.g., pointing, nodding, shaking head)?",
      "Expresses emotions or discomfort using words, sounds, or gestures?",
      "Requests help when stuck or when something is wrong?",
      "Makes comments or shares information without being prompted (e.g., 'Big truck', 'Hot')?",
      "Understands simple questions (e.g., 'Where is…?', 'What do you want?') and responds appropriately?",
    ],
  },
  {
    key: "social",
    title: "Social",
    description: "Interaction with others, turn-taking, joint attention, and reading social cues.",
    icon: <Users className="w-8 h-8" />,
    questions: [
      "Shows joint attention (e.g., looks at what you point to, or shows you something)?",
      "Makes or maintains eye contact during interactions when comfortable?",
      "Takes turns in simple games, conversations, or back-and-forth exchanges?",
      "Responds to others’ emotions (e.g., checks on someone who is upset, or matches affect)?",
      "Initiates social interaction (e.g., waves, says hi, approaches a familiar person)?",
      "Plays or works alongside peers with some awareness of them (parallel or simple cooperative play)?",
      "Imitates actions or words from others in social contexts?",
      "Understands or respects personal space in typical situations?",
      "Responds to greetings or farewells (e.g., hi, bye) appropriately?",
      "Shares or offers items to others when prompted or in structured situations?",
      "Engages in a short back-and-forth exchange (e.g., 2–3 turns) with a partner?",
      "Recognizes familiar people and shows different behavior with strangers vs. familiar adults?",
    ],
  },
  {
    key: "adaptive",
    title: "Adaptive / Self-help",
    description: "Daily living skills, routines, transitions, and self-regulation.",
    icon: <Heart className="w-8 h-8" />,
    questions: [
      "Follows familiar daily routines (e.g., wash hands, get dressed, brush teeth) with minimal prompting?",
      "Tolerates transitions between activities (e.g., from play to table work) with preparation?",
      "Waits for a short period when asked (e.g., 'Wait', 'One minute') without major distress?",
      "Accepts 'no' or denied access to a preferred item without prolonged meltdown?",
      "Uses the toilet or communicates need to use the toilet with consistency?",
      "Feeds self with utensils or fingers with minimal mess or support?",
      "Dresses or undresses with minimal help (e.g., pulls on shirt, takes off shoes)?",
      "Seeks or accepts comfort from a caregiver when upset or hurt?",
      "Uses simple self-regulation strategies when prompted (e.g., deep breath, break, squeeze ball)?",
      "Shows awareness of common dangers (e.g., hot, street) and avoids when reminded?",
      "Completes a short non-preferred task when asked (e.g., put one toy away)?",
      "Handles small changes in routine (e.g., different seat, different order) with support?",
    ],
  },
  {
    key: "play",
    title: "Play",
    description: "Exploration, functional and pretend play, and engagement with activities.",
    icon: <Gamepad2 className="w-8 h-8" />,
    questions: [
      "Explores new toys or materials (e.g., touches, mouths, or tries to use them)?",
      "Uses toys in a functional way (e.g., rolls a car, stacks blocks, pushes a button)?",
      "Engages in pretend or symbolic play (e.g., feeds a doll, talks on a toy phone)?",
      "Sustains play with one activity for several minutes with or without support?",
      "Plays alongside another person (parallel play) without leaving immediately?",
      "Participates in simple turn-taking play (e.g., rolling a ball back and forth)?",
      "Imitates a play action shown by an adult or peer?",
      "Shows variety in play (e.g., more than one type of toy or activity in a session)?",
      "Accepts or chooses new activities when offered (e.g., new game, new toy)?",
      "Uses play to express ideas or reenact experiences (e.g., replaying a trip)?",
      "Engages in cause-and-effect play (e.g., pop-up, switch toys) with interest?",
      "Shows preference for certain toys or activities and returns to them across sessions?",
    ],
  },
  {
    key: "physical",
    title: "Physical & sensory-motor",
    description: "Motor skills, coordination, sensory responses, and physical regulation.",
    icon: <Activity className="w-8 h-8" />,
    questions: [
      "Uses hands for fine motor tasks (e.g., stacking, drawing, pointing) with coordination?",
      "Tolerates or seeks movement (e.g., swinging, running, climbing) without excessive distress or seeking?",
      "Responds to touch (e.g., hugs, textures) in a way that is manageable with support?",
      "Tolerates typical sounds (e.g., vacuum, crowd) without prolonged meltdown or shutdown?",
      "Shows awareness of body position and balance in everyday activities?",
      "Can imitate gross motor actions (e.g., clap, stomp, jump) when modeled?",
      "Uses utensils or tools (e.g., spoon, crayon) with emerging or consistent grasp?",
      "Tolerates transitions that involve physical movement (e.g., leaving the house) with preparation?",
      "Shows regulated response to bright lights or visual stimuli in typical environments?",
      "Engages in physical play (e.g., ball, chase) with some reciprocity?",
      "Seeks or avoids sensory input in ways that caregivers can predict and support?",
      "Completes multi-step physical routines (e.g., wash hands, get coat) with minimal prompting?",
    ],
  },
  {
    key: "advanced",
    title: "Advanced (executive function & readiness)",
    description: "Attention, flexibility, planning, and skills that support learning and daily demands.",
    icon: <Brain className="w-8 h-8" />,
    questions: [
      "Sustains attention to a preferred or non-preferred task for a few minutes with support?",
      "Switches between activities when given a clear cue or transition warning?",
      "Remembers and follows a short sequence (e.g., first X, then Y) when rehearsed?",
      "Tolerates small changes in a familiar activity (e.g., different order, new step)?",
      "Shows interest in letters, numbers, or early academic concepts when presented?",
      "Uses or benefits from visual supports (e.g., schedule, first-then) when introduced?",
      "Initiates or completes a simple plan (e.g., get a snack, put shoes on) with prompts?",
      "Waits or delays gratification for a short time when prepared (e.g., timer, countdown)?",
      "Organizes or puts items in a designated place when asked?",
      "Shows awareness of cause and effect in daily situations (e.g., if I do X, Y happens)?",
      "Engages in a non-preferred task for a set duration when reinforced?",
      "Uses a communication device or AAC for at least one function (request, comment, refuse)?",
    ],
  },
];

const SCALE_LABELS = ["Limited / rarely", "Sometimes / emerging", "Often / consistently"];

// Detailed support tier descriptions (no numeric level labels in UI)
const SUPPORT_TIERS: Record<number, { title: string; description: string }> = {
  1: {
    title: "Requiring support — minimal",
    description:
      "Some support needed in social communication and flexibility. Strengths in many areas; therapy and daily supports can focus on specific goals. AAC and structure help when useful.",
  },
  2: {
    title: "Requiring substantial support",
    description:
      "Marked differences in social communication and flexibility. Benefits from structured, consistent interventions, visual supports, and predictable routines. Often benefits from AAC and sensory accommodations.",
  },
  3: {
    title: "Requiring very substantial support",
    description:
      "Significant support needed across communication, social, adaptive, and daily living areas. Best supported with highly structured, individualized approaches, AAC, and text-to-speech (TTS) for clarity and access.",
  },
};

function computeSupportLevel(scores: AssessmentDomainScores): number {
  const keys = (["communication", "social", "adaptive", "play", "physical", "advanced"] as const).filter(
    (k) => scores[k] != null
  );
  if (keys.length === 0) return 2;
  const sum = keys.reduce((a, k) => a + (scores[k] ?? 0), 0);
  const avg = sum / keys.length;
  if (avg <= 1.5) return 3;
  if (avg <= 2.5) return 2;
  return 1;
}

function computeRecommendedComplexity(supportLevel: number): number {
  return Math.max(1, Math.min(3, 4 - supportLevel)); // level 3 → complexity 1, level 1 → complexity 3
}

const FREE_RESPONSE_PROMPT = "Anything else you'd like to add about this area (observations, examples, or context for the assessor)?";

export default function SkillAssessment() {
  const [step, setStep] = useState<"intro" | "domain" | "results">("intro");
  const [domainIndex, setDomainIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [freeResponses, setFreeResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<{
    domainScores: AssessmentDomainScores;
    supportLevel: number;
    recommendedComplexity: number;
    aiSummary?: string;
  } | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    summary: string;
    suggestedDomainScores?: Record<string, number>;
    suggestedSupportLevel?: number;
  } | null>(null);
  const { mutateAsync: submitAssessment, isPending: isSubmitting } = useSubmitSkillAssessment();
  const { mutateAsync: runAnalyze, isPending: isAnalyzing } = useAssessmentAnalyze();
  const { data: profile } = useChildProfile();
  const { mutate: updateProfile } = useUpdateChildProfile();
  const { toast } = useToast();

  const domain = DOMAINS[domainIndex];
  const isLastDomain = domainIndex === DOMAINS.length - 1;

  const allDomainScores = (): AssessmentDomainScores | null => {
    const scores: Partial<AssessmentDomainScores> = {};
    for (const d of DOMAINS) {
      const qs = d.questions.map((_, i) => answers[`${d.key}-${i}`]);
      if (qs.some((v) => v == null)) return null;
      const avg = qs.reduce((a, b) => a! + b!, 0)! / qs.length;
      (scores as Record<string, number>)[d.key] = Math.round(avg) as 1 | 2 | 3;
    }
    return scores as AssessmentDomainScores;
  };

  const handleNextDomain = () => {
    if (isLastDomain) {
      const scores = allDomainScores();
      if (!scores) return;
      const supportLevel = computeSupportLevel(scores);
      const recommendedComplexity = computeRecommendedComplexity(supportLevel);
      setLastResult({ domainScores: scores, supportLevel, recommendedComplexity });
      setStep("results");
      const freeResponseData = Object.keys(freeResponses).length
        ? Object.fromEntries(
            Object.entries(freeResponses).filter(([, v]) => v != null && String(v).trim() !== "")
          )
        : undefined;
      submitAssessment({
        childId: 1,
        domainScores: scores,
        supportLevel,
        recommendedComplexity,
        ...(freeResponseData && { freeResponseData }),
      }).catch((e) => {
        toast({
          title: "Error saving assessment",
          description: e instanceof Error ? e.message : "Could not save. Set DATABASE_URL and run npm run db:push if using a database.",
          variant: "destructive",
        });
      });
    } else {
      setDomainIndex((i) => i + 1);
    }
  };

  const handleRunAIAnalysis = () => {
    runAnalyze({ scaleAnswers: answers, freeResponses })
      .then((res) => {
        setAiAnalysisResult({
          summary: res.summary,
          suggestedDomainScores: res.suggestedDomainScores,
          suggestedSupportLevel: res.suggestedSupportLevel,
        });
        toast({ title: "Analysis complete", description: "AI summary is shown below." });
      })
      .catch((e) => {
        toast({
          title: "Analysis failed",
          description: e instanceof Error ? e.message : "Set OPENAI_API_KEY for AI analysis.",
          variant: "destructive",
        });
      });
  };

  const handleApplyToProfile = () => {
    if (!lastResult) return;
    const { recommendedComplexity } = lastResult;
    updateProfile(
      { complexityLevel: recommendedComplexity },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast({ title: "Profile updated", description: "Tablet complexity set from assessment." });
        },
        onError: (e) => {
          toast({ title: "Error", description: e.message, variant: "destructive" });
        },
      },
    );
  };

  const canAdvance = domain?.questions.every((_, i) => answers[`${domain.key}-${i}`] != null);

  return (
    <div className="min-h-screen bg-[#eff6ff] flex flex-col">
      <header className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-foreground font-display font-bold">
            <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm">
              A
            </span>
            AuXel
          </Link>
          <span className="text-sm text-muted-foreground font-medium">
            Skill Assessment
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                  <ClipboardList className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-display font-bold text-foreground mb-3">
                  ABA Skill Assessment
                </h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Autism is on a spectrum. This in-depth assessment is aligned with applied behavior
                  analysis (ABA) and tools like ABLLS-R and VB-MAPP. It covers six domains:{" "}
                  <strong>communication</strong>, <strong>social</strong>, <strong>adaptive</strong>,{" "}
                  <strong>play</strong>, <strong>physical &amp; sensory-motor</strong>, and{" "}
                  <strong>advanced</strong> (executive function). Results inform support tier and tablet complexity in AuXel.
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h2 className="font-display font-semibold text-lg mb-2">What to expect</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• 6 domains with multiple in-depth questions each</li>
                  <li>• Rate each item: Limited / rarely → Sometimes / emerging → Often / consistently</li>
                  <li>• Optional free-response per domain: describe performance, examples, strengths, or challenges (an LLM can use this later for deeper analysis)</li>
                  <li>• Results show support tier and recommended tablet complexity; you can apply to profile</li>
                </ul>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => { setStep("domain"); setDomainIndex(0); setAnswers({}); setFreeResponses({}); }}
                  className="px-8 py-4 rounded-2xl font-semibold bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  Start assessment <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "domain" && domain && (
            <motion.div
              key={`domain-${domain.key}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <button
                  onClick={() => setDomainIndex((i) => (i > 0 ? i - 1 : i))}
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <span className="flex-1 text-center">
                  Domain {domainIndex + 1} of {DOMAINS.length}
                </span>
              </div>
              <div className="rounded-2xl border bg-card p-6 shadow-sm max-h-[60vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-4 sticky top-0 bg-card/95 backdrop-blur py-2 -mt-2 z-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    {domain.icon}
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl">{domain.title}</h2>
                    <p className="text-sm text-muted-foreground">{domain.description}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-6">
                  {domain.questions.map((q, i) => (
                    <div key={i}>
                      <p className="font-medium text-foreground mb-3">{q}</p>
                      <div className="flex flex-wrap gap-3">
                        {[1, 2, 3].map((value) => (
                          <label
                            key={value}
                            className={`flex-1 min-w-[120px] rounded-xl border-2 px-4 py-3 text-center text-sm font-medium cursor-pointer transition-all ${
                              answers[`${domain.key}-${i}`] === value
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`${domain.key}-${i}`}
                              value={value}
                              checked={answers[`${domain.key}-${i}`] === value}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [`${domain.key}-${i}`]: value }))
                              }
                              className="sr-only"
                            />
                            {SCALE_LABELS[value - 1]}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <label className="block font-medium text-foreground mb-2">
                      Optional: Free response about performance
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Describe how your child typically performs in this area—examples, strengths, or challenges. An LLM can use this later for deeper analysis.
                    </p>
                    <textarea
                      placeholder="e.g. strengths in X, struggles with Y, recent progress…"
                      value={freeResponses[`${domain.key}-performance`] ?? ""}
                      onChange={(e) =>
                        setFreeResponses((prev) => ({
                          ...prev,
                          [`${domain.key}-performance`]: e.target.value,
                        }))
                      }
                      className="w-full min-h-[100px] rounded-xl border-2 border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-y"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNextDomain}
                  disabled={!canAdvance || isSubmitting}
                  className="px-8 py-4 rounded-2xl font-semibold bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving…" : isLastDomain ? "See results" : "Next domain"}{" "}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-6">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                  Assessment complete
                </h1>
                <p className="text-muted-foreground">
                  Here are the results and recommended settings.
                </p>
              </div>

              {lastResult && (() => {
                const { domainScores: scores, supportLevel, recommendedComplexity } = lastResult;
                const levelInfo = SUPPORT_TIERS[supportLevel];
                return (
                  <div className="space-y-6">
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                      <h2 className="font-display font-semibold text-lg mb-4">Domain scores</h2>
                      <div className="grid grid-cols-2 gap-4">
                        {DOMAINS.map((d) => (
                          <div
                            key={d.key}
                            className="rounded-xl bg-muted/50 px-4 py-3 flex justify-between items-center"
                          >
                            <span className="font-medium capitalize">{d.key}</span>
                            <span className="text-lg font-bold text-primary">
                              {(scores as Record<string, number>)[d.key] ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border bg-card p-6 shadow-sm">
                      <h2 className="font-display font-semibold text-lg mb-2">
                        {levelInfo?.title}
                      </h2>
                      <p className="text-muted-foreground mb-4">{levelInfo?.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Recommended tablet complexity: <strong className="text-foreground">Level {recommendedComplexity}</strong>
                      </p>
                    </div>
                    {!aiAnalysisResult ? (
                      <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6">
                        <p className="text-sm text-muted-foreground mb-3">
                          Optional: Run an LLM over your scale answers and free-response text for a deeper needs summary.
                        </p>
                        <button
                          onClick={handleRunAIAnalysis}
                          disabled={isAnalyzing}
                          className="px-6 py-3 rounded-xl font-medium border-2 border-primary text-primary hover:bg-primary/10 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                          {isAnalyzing ? "Analyzing…" : "Run AI analysis (free-response + scale)"}
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-2xl border bg-card p-6 shadow-sm">
                        <h2 className="font-display font-semibold text-lg mb-2">AI analysis summary</h2>
                        <p className="text-muted-foreground whitespace-pre-wrap">{aiAnalysisResult.summary}</p>
                        {aiAnalysisResult.suggestedSupportLevel != null && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Suggested support tier: {SUPPORT_TIERS[aiAnalysisResult.suggestedSupportLevel]?.title ?? aiAnalysisResult.suggestedSupportLevel}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleApplyToProfile}
                        disabled={submitted}
                        className="px-8 py-4 rounded-2xl font-semibold bg-accent text-accent-foreground shadow-md hover:bg-accent/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {submitted ? "Applied to profile" : "Apply to profile"}
                      </button>
                      <Link href="/dashboard/config">
                        <button className="px-8 py-4 rounded-2xl font-semibold border-2 border-primary text-primary hover:bg-primary/5 transition-all">
                          Open configuration
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-center pt-4">
                <Link href="/">
                  <button className="text-muted-foreground hover:text-foreground font-medium">
                    ← Back to home
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
