import { useMemo, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2,
  MessageSquare,
  ArrowLeft,
  Star,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { FaHeart, FaHandPaper, FaExclamationCircle, FaHandsHelping } from "react-icons/fa";
import { useCreateSessionLog } from "@/hooks/use-session-logs";
import { useChildProfile } from "@/hooks/use-child-profile";
import { usePrompts } from "@/hooks/use-prompts";
import { useSkillAssessment } from "@/hooks/use-skill-assessment";
import { useToast } from "@/hooks/use-toast";
import type { Prompt } from "@shared/schema";

type Mode = "communicate" | "prompts" | "games";
type CommunicationIntent = "need" | "distress" | "refusal" | "help";

type PromptFeedback = {
  isCorrect: boolean;
  selectedAnswer: string;
};

type GameChallenge = {
  label: string;
  prompt: string;
  correctIntent: CommunicationIntent;
};

type GameFeedback = {
  isCorrect: boolean;
  selectedIntent: CommunicationIntent;
};

/* AAC-style symbols (symbol set, not emoji): light blue (want), red (stop), amber (distress), teal (help) */
const communicationCards: Array<{
  intent: CommunicationIntent;
  label: string;
  message: string;
  details: string;
  color: string;
  shadowColor: string;
  icon: React.ReactNode;
}> = [
  {
    intent: "need",
    label: "I WANT...",
    message: "I want that",
    details: "I want something",
    color: "bg-sky-400",
    shadowColor: "shadow-sky-500/30",
    icon: <FaHeart className="w-24 h-24 mb-4 text-white" />,
  },
  {
    intent: "refusal",
    label: "NO / STOP",
    message: "No thank you",
    details: "No or Stop",
    color: "bg-red-500",
    shadowColor: "shadow-red-500/30",
    icon: <FaHandPaper className="w-24 h-24 mb-4 text-white" />,
  },
  {
    intent: "distress",
    label: "I FEEL BAD",
    message: "I don't feel good",
    details: "Feeling bad/distress",
    color: "bg-amber-500",
    shadowColor: "shadow-amber-500/30",
    icon: <FaExclamationCircle className="w-24 h-24 mb-4 text-white" />,
  },
  {
    intent: "help",
    label: "HELP ME",
    message: "Help me please",
    details: "Need help",
    color: "bg-teal-600",
    shadowColor: "shadow-teal-600/30",
    icon: <FaHandsHelping className="w-24 h-24 mb-4 text-white" />,
  },
];

const gameChallenges: GameChallenge[] = [
  {
    label: "Need",
    prompt: "You want a snack. Which button should you use?",
    correctIntent: "need",
  },
  {
    label: "Help",
    prompt: "You cannot open a jar. Which button should you use?",
    correctIntent: "help",
  },
  {
    label: "Stop",
    prompt: "A sound is too loud and you want it to stop. Which button should you use?",
    correctIntent: "refusal",
  },
  {
    label: "Feel Bad",
    prompt: "Your tummy hurts. Which button should you use?",
    correctIntent: "distress",
  },
];

function getPromptOptions(prompt: Prompt): string[] {
  return Array.isArray(prompt.options)
    ? prompt.options.filter((option): option is string => typeof option === "string")
    : [];
}

export default function ChildTablet() {
  const [activeMode, setActiveMode] = useState<Mode>("communicate");
  const [lessonIndex, setLessonIndex] = useState(0);
  const [lessonFeedback, setLessonFeedback] = useState<PromptFeedback | null>(null);
  const [lessonStartedAt, setLessonStartedAt] = useState<number | null>(null);
  const [lessonActive, setLessonActive] = useState(false);
  const [gameIndex, setGameIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameFeedback, setGameFeedback] = useState<GameFeedback | null>(null);
  const [gameStartedAt, setGameStartedAt] = useState<number | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const { mutateAsync: logSession, isPending: isLogging } = useCreateSessionLog();
  const { data: profile } = useChildProfile();
  const { data: assessment } = useSkillAssessment();
  const { data: prompts = [] } = usePrompts();
  const { toast } = useToast();

  // Learn & Play are only usable after an assessment is done (they are driven by it)
  const hasAssessment = Boolean(assessment);
  const effectiveComplexity = assessment?.recommendedComplexity ?? profile?.complexityLevel ?? 1;
  const domainScores = assessment?.domainScores as Record<string, number> | undefined;

  const lessonPrompts = useMemo(() => {
    const filtered = prompts.filter((prompt) => {
      const isActive = prompt.isActive ?? true;
      return isActive && prompt.complexityLevel <= effectiveComplexity;
    });
    // Prioritize prompts in domains where the child needs more support (lower score)
    if (domainScores && filtered.length > 0) {
      const scoreFor = (cat: string) => domainScores[cat] ?? 2;
      return [...filtered].sort((a, b) => {
        const aScore = scoreFor(a.skillCategory);
        const bScore = scoreFor(b.skillCategory);
        return aScore - bScore;
      });
    }
    return filtered;
  }, [prompts, effectiveComplexity, domainScores]);

  const activePrompt = lessonPrompts[lessonIndex];
  const roundCount = Math.min(
    gameChallenges.length,
    Math.max(2, effectiveComplexity),
  );
  const activeGameChallenges = gameChallenges.slice(0, roundCount);
  const activeGameChallenge = activeGameChallenges[gameIndex];

  const showFeedback = profile?.sensoryPreferences?.visualFeedback !== false;

  async function createLog(
    eventType: string,
    details: string,
    options?: { isCorrect?: boolean; responseTimeMs?: number },
  ) {
    try {
      await logSession({
        childId: 1,
        eventType,
        details,
        isCorrect: options?.isCorrect,
        responseTimeMs: options?.responseTimeMs,
      });
    } catch (error) {
      toast({
        title: "Unable to save progress",
        description: "Check the server connection and try again.",
        variant: "destructive",
      });
    }
  }

  function notify(title: string, description: string) {
    if (!showFeedback) {
      return;
    }

    toast({
      title,
      description,
      duration: 2000,
    });
  }

  async function handleCommunicate(type: CommunicationIntent) {
    const card = communicationCards.find((item) => item.intent === type);
    if (!card) {
      return;
    }

    await createLog("communication", card.details);
    notify("Message Sent", card.message);
  }

  async function startLesson() {
    if (!lessonPrompts.length) {
      toast({
        title: "No prompts ready",
        description: "Add or enable prompts before starting a lesson.",
        variant: "destructive",
      });
      return;
    }

    setLessonActive(true);
    setLessonIndex(0);
    setLessonFeedback(null);
    setLessonStartedAt(Date.now());
    await createLog("prompt_started", `Lesson started: ${lessonPrompts[0].promptText}`);
  }

  async function submitPromptAnswer(selectedAnswer: string) {
    if (!activePrompt || lessonFeedback) {
      return;
    }

    const isCorrect = selectedAnswer === activePrompt.expectedResponse;
    const responseTimeMs = lessonStartedAt ? Date.now() - lessonStartedAt : undefined;

    setLessonFeedback({ isCorrect, selectedAnswer });

    await createLog(
      "prompt_response",
      `${activePrompt.promptText} -> ${selectedAnswer}`,
      { isCorrect, responseTimeMs },
    );

    notify(
      isCorrect ? "Great work" : "Try again next time",
      isCorrect
        ? `${selectedAnswer} was the right choice.`
        : `The expected response was ${activePrompt.expectedResponse}.`,
    );
  }

  async function advanceLesson() {
    if (!activePrompt) {
      return;
    }

    const nextIndex = lessonIndex + 1;
    if (nextIndex >= lessonPrompts.length) {
      setLessonActive(false);
      setLessonFeedback(null);
      setLessonStartedAt(null);
      await createLog("prompt_completed", `Completed ${lessonPrompts.length} lesson prompts`);
      notify("Lesson complete", "Nice job finishing the lesson.");
      return;
    }

    const nextPrompt = lessonPrompts[nextIndex];
    setLessonIndex(nextIndex);
    setLessonFeedback(null);
    setLessonStartedAt(Date.now());
    await createLog("prompt_started", `Next prompt: ${nextPrompt.promptText}`);
  }

  async function startGame() {
    setGameActive(true);
    setGameIndex(0);
    setGameScore(0);
    setGameFeedback(null);
    setGameStartedAt(Date.now());
    await createLog("game_started", `Started recognition game with ${roundCount} rounds`);
  }

  async function submitGameAnswer(selectedIntent: CommunicationIntent) {
    if (!activeGameChallenge || gameFeedback) {
      return;
    }

    const isCorrect = selectedIntent === activeGameChallenge.correctIntent;
    const responseTimeMs = gameStartedAt ? Date.now() - gameStartedAt : undefined;

    setGameFeedback({ isCorrect, selectedIntent });
    if (isCorrect) {
      setGameScore((current) => current + 1);
    }

    await createLog(
      "game_response",
      `${activeGameChallenge.prompt} -> ${selectedIntent}`,
      { isCorrect, responseTimeMs },
    );

    notify(
      isCorrect ? "Correct choice" : "Keep practicing",
      isCorrect
        ? "That button matches the situation."
        : `The best match was ${activeGameChallenge.label}.`,
    );
  }

  async function advanceGame() {
    const nextIndex = gameIndex + 1;
    if (nextIndex >= activeGameChallenges.length) {
      const finalScore = gameScore + (gameFeedback?.isCorrect ? 1 : 0);
      setGameActive(false);
      setGameFeedback(null);
      setGameStartedAt(null);
      await createLog(
        "game_completed",
        `Finished recognition game with score ${finalScore}/${activeGameChallenges.length}`,
      );
      notify("Game complete", `Score: ${finalScore}/${activeGameChallenges.length}`);
      return;
    }

    setGameIndex(nextIndex);
    setGameFeedback(null);
    setGameStartedAt(Date.now());
  }

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
              color={hasAssessment ? "bg-accent text-accent-foreground" : "bg-slate-400 text-white"}
            />
          )}
          <TabButton 
            active={activeMode === "games"} 
            onClick={() => setActiveMode("games")}
            icon={<Gamepad2 className="w-8 h-8" />}
            label="Play"
            color={hasAssessment ? "bg-secondary text-secondary-foreground" : "bg-slate-400 text-white"}
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
              {communicationCards.map((card) => (
                <CommunicationButton
                  key={card.intent}
                  icon={card.icon}
                  label={card.label}
                  color={card.color}
                  shadowColor={card.shadowColor}
                  disabled={isLogging}
                  onClick={() => handleCommunicate(card.intent)}
                />
              ))}
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
              {!hasAssessment ? (
                <div className="text-center glass-card p-12 rounded-3xl max-w-2xl w-full border-2 border-amber-200 bg-amber-50/50">
                  <Star className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">Learn is locked</h2>
                  <p className="text-muted-foreground mb-6">
                    Learn and Play are based on the skill assessment. Complete the assessment first so we can tailor content to your child.
                  </p>
                  <Link href="/assessment">
                    <button className="px-8 py-4 rounded-2xl font-semibold bg-sky-400 text-white shadow-md hover:bg-sky-500 transition-colors">
                      Go to Skill Assessment
                    </button>
                  </Link>
                </div>
              ) : (
              <div className="text-center glass-card p-12 rounded-3xl max-w-2xl w-full">
                <Star className="w-20 h-20 text-accent mx-auto mb-6" />
                <h2 className="text-4xl font-display font-bold text-foreground mb-4">Learning Time!</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Based on the skill assessment: complexity and domain focus from the spectrum.
                </p>

                {!lessonActive || !activePrompt ? (
                  <>
                    <p className="text-2xl text-muted-foreground mb-8">
                      {lessonPrompts.length
                        ? `There are ${lessonPrompts.length} lesson prompts ready to practice.`
                        : "Complete the Skill Assessment and apply to profile so Learn matches your child's level."}
                    </p>
                    <button
                      onClick={startLesson}
                      disabled={!lessonPrompts.length || isLogging}
                      className="px-12 py-6 text-2xl font-bold bg-accent text-white rounded-full shadow-xl shadow-accent/40 tablet-button-press hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Lesson
                    </button>
                  </>
                ) : (
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-6 text-sm font-semibold text-muted-foreground">
                      <span>Prompt {lessonIndex + 1} of {lessonPrompts.length}</span>
                      <span className="capitalize">{activePrompt.skillCategory}</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground mb-8 text-center">
                      {activePrompt.promptText}
                    </p>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      {getPromptOptions(activePrompt).map((option) => {
                        const isSelected = lessonFeedback?.selectedAnswer === option;
                        const isCorrect = option === activePrompt.expectedResponse;

                        return (
                          <button
                            key={option}
                            onClick={() => submitPromptAnswer(option)}
                            disabled={Boolean(lessonFeedback) || isLogging}
                            className={`rounded-2xl border px-6 py-5 text-left text-xl font-semibold transition-all ${
                              lessonFeedback
                                ? isCorrect
                                  ? "border-accent bg-accent/10 text-foreground"
                                  : isSelected
                                    ? "border-destructive bg-destructive/10 text-foreground"
                                    : "border-border bg-background text-muted-foreground"
                                : "border-border bg-background hover:border-accent hover:bg-accent/5"
                            } disabled:cursor-not-allowed`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>

                    {lessonFeedback && (
                      <div className="rounded-2xl bg-muted/40 px-6 py-5">
                        <div className="flex items-center gap-3 mb-3">
                          <CheckCircle2
                            className={`h-6 w-6 ${
                              lessonFeedback.isCorrect ? "text-accent" : "text-destructive"
                            }`}
                          />
                          <p className="text-xl font-display font-bold">
                            {lessonFeedback.isCorrect ? "Correct response" : "Let's review that one"}
                          </p>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Expected response: {activePrompt.expectedResponse}
                        </p>
                        <button
                          onClick={advanceLesson}
                          disabled={isLogging}
                          className="px-8 py-4 rounded-full bg-accent text-accent-foreground font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {lessonIndex + 1 < lessonPrompts.length ? "Next Prompt" : "Finish Lesson"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}
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
              {!hasAssessment ? (
                <div className="text-center glass-card p-12 rounded-3xl max-w-2xl w-full border-2 border-amber-200 bg-amber-50/50">
                  <Gamepad2 className="w-20 h-20 text-slate-400 mx-auto mb-6" />
                  <h2 className="text-2xl font-display font-bold text-foreground mb-4">Play is locked</h2>
                  <p className="text-muted-foreground mb-6">
                    Learn and Play are based on the skill assessment. Complete the assessment first so we can tailor content to your child.
                  </p>
                  <Link href="/assessment">
                    <button className="px-8 py-4 rounded-2xl font-semibold bg-sky-400 text-white shadow-md hover:bg-sky-500 transition-colors">
                      Go to Skill Assessment
                    </button>
                  </Link>
                </div>
              ) : (
              <div className="text-center glass-card p-12 rounded-3xl max-w-2xl w-full border-secondary/50 shadow-secondary/20">
                <Gamepad2 className="w-20 h-20 text-secondary mx-auto mb-6" />
                <h2 className="text-4xl font-display font-bold text-foreground mb-4">Break Time</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Difficulty and rounds are set from the skill assessment (spectrum-based).
                </p>

                {!gameActive || !activeGameChallenge ? (
                  <>
                    <p className="text-2xl text-muted-foreground mb-8">
                      Practice matching situations to the right communication button.
                    </p>
                    <button
                      onClick={startGame}
                      disabled={isLogging}
                      className="px-12 py-6 text-2xl font-bold bg-secondary text-secondary-foreground rounded-full shadow-xl shadow-secondary/40 tablet-button-press hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Play Game
                    </button>
                  </>
                ) : (
                  <div className="text-left">
                    <div className="flex items-center justify-between mb-6 text-sm font-semibold text-muted-foreground">
                      <span>Round {gameIndex + 1} of {activeGameChallenges.length}</span>
                      <span>Score {gameScore + (gameFeedback?.isCorrect ? 1 : 0)}</span>
                    </div>
                    <p className="text-3xl font-display font-bold text-foreground mb-8 text-center">
                      {activeGameChallenge.prompt}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      {communicationCards.map((card) => {
                        const isSelected = gameFeedback?.selectedIntent === card.intent;
                        const isCorrect = card.intent === activeGameChallenge.correctIntent;

                        return (
                          <button
                            key={card.intent}
                            onClick={() => submitGameAnswer(card.intent)}
                            disabled={Boolean(gameFeedback) || isLogging}
                            className={`rounded-2xl border px-5 py-5 text-left transition-all ${
                              gameFeedback
                                ? isCorrect
                                  ? "border-accent bg-accent/10"
                                  : isSelected
                                    ? "border-destructive bg-destructive/10"
                                    : "border-border bg-background"
                                : "border-border bg-background hover:border-secondary hover:bg-secondary/10"
                            } disabled:cursor-not-allowed`}
                          >
                            <div className="text-lg font-display font-bold">{card.label}</div>
                            <div className="text-sm text-muted-foreground">{card.message}</div>
                          </button>
                        );
                      })}
                    </div>

                    {gameFeedback && (
                      <div className="rounded-2xl bg-muted/40 px-6 py-5">
                        <div className="flex items-center gap-3 mb-3">
                          <Trophy
                            className={`h-6 w-6 ${
                              gameFeedback.isCorrect ? "text-secondary" : "text-destructive"
                            }`}
                          />
                          <p className="text-xl font-display font-bold">
                            {gameFeedback.isCorrect ? "You matched it" : "Not quite"}
                          </p>
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Best answer: {
                            communicationCards.find(
                              (card) => card.intent === activeGameChallenge.correctIntent,
                            )?.label
                          }
                        </p>
                        <button
                          onClick={advanceGame}
                          disabled={isLogging}
                          className="px-8 py-4 rounded-full bg-secondary text-secondary-foreground font-bold shadow-lg shadow-secondary/20 hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {gameIndex + 1 < activeGameChallenges.length ? "Next Round" : "Finish Game"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              )}
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

function CommunicationButton({
  icon,
  label,
  color,
  shadowColor,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  shadowColor: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full h-full rounded-3xl ${color} ${shadowColor}
        shadow-xl flex flex-col items-center justify-center tablet-button-press
        border-4 border-white/20 relative overflow-hidden
        disabled:cursor-not-allowed disabled:opacity-60
      `}
    >
      
      <motion.div whileTap={{ scale: 0.9 }}>
        {icon}
      </motion.div>
      <span className="text-white font-display font-bold text-4xl md:text-5xl drop-shadow-md tracking-wide">
        {label}
      </span>
    </button>
  );
}
