import { useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DIFFICULTY_CONFIG = {
  easy: { label: "Easy", colorClass: "badge-primary", icon: "I" },
  medium: { label: "Medium", colorClass: "bg-amber-500/10 text-amber-400 border border-amber-500/20", icon: "II" },
  hard: { label: "Hard", colorClass: "badge-secondary", icon: "III" },
};

function SkillChallenges() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [progress, setProgress] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);
  const [previousAttempt, setPreviousAttempt] = useState(null);
  const [timeUntilNext, setTimeUntilNext] = useState("");
  const [showXpAnimation, setShowXpAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState([]);
  const [outcomes, setOutcomes] = useState([]);
  const [expandedOutcome, setExpandedOutcome] = useState(null);
  const [newTask, setNewTask] = useState({ title: "", description: "", skillTag: "" });
  const [userId, setUserId] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (token) setUserId(jwtDecode(token).id);
      const [challengeRes, progressRes, leaderboardRes, tasksRes, outcomesRes] = await Promise.all([
        API.get("/challenges/daily"), API.get("/challenges/progress"), API.get("/challenges/leaderboard"),
        API.get("/tasks").catch(() => ({ data: { data: [] } })), API.get("/outcomes").catch(() => ({ data: { data: [] } }))
      ]);
      setChallenge(challengeRes.data.data.challenge); setAlreadyAttempted(challengeRes.data.data.alreadyAttempted);
      setPreviousAttempt(challengeRes.data.data.attempt); setProgress(progressRes.data.data);
      setLeaderboard(leaderboardRes.data.data); setTasks(tasksRes.data.data || []); setOutcomes(outcomesRes.data.data || []);
    } catch (error) { console.error("Failed to fetch challenge data"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date(); const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow - now;
      setTimeUntilNext(`${String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0")}:${String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0")}:${String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0")}`);
    };
    updateTimer(); const interval = setInterval(updateTimer, 1000); return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!selectedAnswer || submitting || alreadyAttempted) return;
    setSubmitting(true);
    try {
      const res = await API.post("/challenges/submit", { challengeId: challenge._id, selectedAnswer });
      setResult(res.data.data); setAlreadyAttempted(true);
      if (res.data.data.isCorrect) { setShowXpAnimation(true); setTimeout(() => setShowXpAnimation(false), 2500); }
      const progressRes = await API.get("/challenges/progress"); setProgress(progressRes.data.data);
    } catch (error) { console.error("Failed to submit answer"); }
    finally { setSubmitting(false); }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/tasks", newTask);
      setTasks([res.data.data, ...tasks]); setNewTask({ title: "", description: "", skillTag: "" });
      toast.success("Task posted to Help Hub!");
    } catch (error) { toast.error("Failed to post task."); }
  };

  const handleAcceptTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token"); const decoded = jwtDecode(token);
      await API.put(`/tasks/${taskId}/accept`, { userId: decoded.id });
      setTasks(tasks.filter((t) => t._id !== taskId));
      toast.success("Task accepted! Redirecting to schedule..."); navigate("/sessions");
    } catch (error) { toast.error(error.response?.data?.message || "Failed to accept task."); }
  };

  const getOptionStyle = (option) => {
    const base = "relative px-5 py-4 rounded-xl text-sm text-left transition-all duration-300 border ";
    if (alreadyAttempted && previousAttempt && !result) {
      if (option === previousAttempt.correctAnswer) return base + "bg-green-500/10 border-green-500/30 text-green-400";
      if (option === previousAttempt.selectedAnswer && !previousAttempt.isCorrect) return base + "bg-secondary/10 border-secondary/30 text-secondary";
      return base + "bg-surface-light/30 border-dark-border text-muted/40 cursor-not-allowed";
    }
    if (result) {
      if (option === result.correctAnswer) return base + "bg-green-500/10 border-green-500/30 text-green-400";
      if (option === selectedAnswer && !result.isCorrect) return base + "bg-secondary/10 border-secondary/30 text-secondary";
      return base + "bg-surface-light/30 border-dark-border text-muted/40";
    }
    if (option === selectedAnswer) return base + "bg-primary/10 border-primary text-charcoal shadow-glow";
    return base + "bg-surface border-dark-border text-muted hover:border-primary/30 hover:text-charcoal cursor-pointer";
  };

  const levelTitle = (level) => {
    if (level >= 20) return "Grandmaster"; if (level >= 15) return "Diamond"; if (level >= 10) return "Gold";
    if (level >= 7) return "Silver"; if (level >= 4) return "Bronze"; return "Beginner";
  };

  if (loading) {
    return (<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>);
  }

  const tabItems = [
    { key: "tasks", label: "Help Hub" }, { key: "outcomes", label: "Outcome Board" },
    { key: "challenge", label: "Daily Challenge" }, { key: "leaderboard", label: "Leaderboard" },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {showXpAnimation && result && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl font-black text-primary drop-shadow-lg" style={{ animation: "xpFloat 2s ease-out forwards" }}>+{result.xpEarned} XP</div>
        </div>
      )}

      <header className="mb-8">
        <span className="section-label">Challenges</span>
        <h1 className="page-title mt-2">Skill Arena</h1>
        <p className="page-subtitle">Sharpen your skills with daily challenges and help your peers grow.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="space-y-6">
          {progress && (
            <div className="card">
              <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-5 pb-2 border-b border-dark-border">Your Progress</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-end">
                  <div><p className="text-xs text-muted mb-1">Level</p><p className="text-3xl font-bold text-charcoal">{progress.level}</p></div>
                  <div className="text-right"><p className="text-xs text-muted mb-1">Rank</p><p className="text-sm font-bold text-primary-light">{levelTitle(progress.level)}</p></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted mb-2"><span>{progress.xpInCurrentLevel} XP</span><span>{progress.xpToNextLevel} XP to next</span></div>
                  <div className="h-2.5 bg-accent rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-1000" style={{ width: `${(progress.xpInCurrentLevel / progress.xpToNextLevel) * 100}%` }}></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-accent rounded-xl text-center"><p className="text-lg font-bold text-charcoal">{progress.streak}</p><p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Streak</p></div>
                  <div className="p-3 bg-accent rounded-xl text-center"><p className="text-lg font-bold text-charcoal">{progress.accuracy}%</p><p className="text-[10px] text-muted uppercase tracking-wider mt-0.5">Accuracy</p></div>
                </div>
                <div className="text-center pt-2"><p className="text-xs text-primary-light font-mono animate-pulse">Next in {timeUntilNext}</p></div>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-xs font-medium text-muted uppercase tracking-wider mb-4 pb-2 border-b border-dark-border">Top Contributors</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 5).map((user, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted/40 font-mono w-5">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span className="text-sm font-semibold text-charcoal">{user.name}</span>
                  </div>
                  <span className="text-xs text-primary-light font-mono">{user.xp} XP</span>
                </div>
              ))}
            </div>
            <button onClick={() => setActiveTab("leaderboard")} className="w-full mt-4 text-xs text-muted hover:text-charcoal transition-colors">View All →</button>
          </div>
        </aside>

        <main className="lg:col-span-2">
          <div className="flex gap-1 mb-6 p-1 bg-surface rounded-xl overflow-x-auto border border-dark-border">
            {tabItems.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? "bg-primary text-white shadow-glow" : "text-muted hover:text-charcoal"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "tasks" && (
            <div className="space-y-6 animate-slide-up">
              <div className="card border-primary/20 bg-primary/5">
                <h3 className="text-lg font-bold text-charcoal mb-4">Request Help</h3>
                <form onSubmit={handleCreateTask} className="space-y-3">
                  <input type="text" placeholder="e.g. Need help building responsive navbar in React" className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required/>
                  <textarea placeholder="Describe exactly what you are stuck on..." className="input-field min-h-[80px] resize-none" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} required></textarea>
                  <input type="text" placeholder="Skill Area (e.g. React.js)" className="input-field" value={newTask.skillTag} onChange={e => setNewTask({...newTask, skillTag: e.target.value})} required/>
                  <button type="submit" className="btn btn-primary w-full py-2.5 text-sm">Publish to Help Hub</button>
                </form>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-muted uppercase tracking-wider pb-2 border-b border-dark-border">Open Requests</h3>
                {tasks.map(t => (
                  <div key={t._id} className="card card-hover">
                    <div className="flex justify-between items-start mb-3">
                      <span className="badge badge-muted">{t.skillTag}</span>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="w-5 h-5 rounded-full bg-surface-light flex items-center justify-center text-[10px] font-bold text-muted border border-dark-border">{t.author?.name?.charAt(0) || "U"}</span>
                        {t.author?.name}
                      </div>
                    </div>
                    <h4 className="text-lg font-bold text-charcoal mb-1.5">{t.title}</h4>
                    <p className="text-sm text-muted mb-5">{t.description}</p>
                    {userId !== t.author?._id ? (
                      <button onClick={() => handleAcceptTask(t._id)} className="btn btn-primary w-full py-2.5 text-sm">Accept & Help →</button>
                    ) : (
                      t.status === "accepted" ? (
                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                          <p className="text-xs text-green-400 font-medium mb-0.5">Accepted!</p>
                          <p className="text-sm text-charcoal">by {t.acceptedBy?.name}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-primary-light text-center p-3 bg-primary/5 border border-primary/20 rounded-xl">Your request is live</p>
                      )
                    )}
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="card flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-surface-light/50 flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" /></svg>
                    </div>
                    <p className="text-sm text-muted">No open tasks right now. Be the first to ask for help!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "outcomes" && (
            <div className="space-y-4 animate-slide-up">
              {outcomes.map(o => (
                <div key={o._id} className={`card cursor-pointer transition-all ${expandedOutcome === o._id ? "border-primary/30 shadow-md" : "hover:border-dark-border/80"}`} onClick={() => setExpandedOutcome(expandedOutcome === o._id ? null : o._id)}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center text-sm font-bold text-primary border border-primary/10">
                        {o.user?.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-charcoal">{o.user?.name}</p>
                        <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="badge badge-primary hidden sm:inline-flex">Verified</span>
                      <svg className={`w-5 h-5 text-muted transition-transform duration-200 ${expandedOutcome === o._id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </div>
                  </div>
                  
                  {expandedOutcome === o._id && (
                    <div className="mt-5 pt-5 border-t border-dark-border animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-surface-light/50 p-4 rounded-xl">
                          <p className="text-[10px] text-primary font-medium uppercase tracking-wider mb-1">Taught</p>
                          <p className="text-sm text-charcoal">{o.taught}</p>
                        </div>
                        <div className="bg-surface-light/50 p-4 rounded-xl">
                          <p className="text-[10px] text-secondary font-medium uppercase tracking-wider mb-1">Learned</p>
                          <p className="text-sm text-charcoal">{o.learned}</p>
                        </div>
                      </div>
                      {o.review && (<div className="p-4 rounded-xl italic text-muted text-sm mb-4 bg-accent border border-dark-border">"{o.review}"</div>)}
                      <div className="flex justify-between items-center text-xs text-muted pt-2">
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" /></svg> Confidence: {o.confidence}/5</span>
                        <span title={o.nextTopic}>Next goal: <span className="text-charcoal font-medium">{o.nextTopic}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {outcomes.length === 0 && (
                <div className="card flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-surface-light/50 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
                  </div>
                  <p className="text-sm text-muted">No outcomes yet. Complete a session to log your progress!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "challenge" && challenge && (
            <div className="space-y-6 animate-slide-up">
              <div className="card min-h-[400px] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <span className={`badge ${DIFFICULTY_CONFIG[challenge.difficulty]?.colorClass}`}>{DIFFICULTY_CONFIG[challenge.difficulty]?.icon} {DIFFICULTY_CONFIG[challenge.difficulty]?.label}</span>
                    <span className="badge badge-muted">{challenge.skillTag}</span>
                  </div>
                  <span className="text-xs font-mono text-primary-light font-semibold">+{challenge.xpReward} XP</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-charcoal mb-3">{challenge.title}</h2>
                  <p className="text-base text-muted mb-8 leading-relaxed">{challenge.description}</p>
                  {alreadyAttempted && !result && previousAttempt && (
                    <div className={`p-4 rounded-xl mb-6 text-sm text-center font-medium ${previousAttempt.isCorrect ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-secondary/10 text-secondary border border-secondary/20"}`}>
                      {previousAttempt.isCorrect ? "Correct! Well done." : "Incorrect. Try again tomorrow."}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {challenge.options.map((option, idx) => (
                      <button key={idx} onClick={() => !alreadyAttempted && !result && setSelectedAnswer(option)} disabled={alreadyAttempted || result} className={getOptionStyle(option)}>
                        <span className="text-xs opacity-30 mr-2 font-mono">{String.fromCharCode(65 + idx)}</span>{option}
                      </button>
                    ))}
                  </div>
                </div>
                {result && (
                  <div className={`mt-8 p-6 rounded-xl ${result.isCorrect ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/10 border border-secondary/20"}`}>
                    <h3 className={`text-xl font-bold mb-2 ${result.isCorrect ? "text-green-400" : "text-secondary"}`}>{result.isCorrect ? "Correct!" : "Not Quite"}</h3>
                    <p className="text-sm text-muted">{result.isCorrect ? `+${result.xpEarned} XP earned. Streak: ${result.newStreak} days.` : `The answer was: ${result.correctAnswer}`}</p>
                  </div>
                )}
                {!alreadyAttempted && !result && (
                  <button onClick={handleSubmit} disabled={!selectedAnswer || submitting} className="btn btn-primary w-full py-3.5 text-sm font-semibold mt-8">{submitting ? "Verifying..." : "Submit Answer"}</button>
                )}
              </div>
            </div>
          )}



          {activeTab === "leaderboard" && (
            <div className="space-y-3 animate-slide-up">
              {leaderboard.map((user, idx) => (
                <div key={idx} className={`card flex items-center justify-between py-4 px-5 ${idx === 0 ? "border-primary/30 bg-primary/5" : ""}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-muted/30 font-mono w-8">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <p className="font-semibold text-charcoal">{user.name}</p>
                      <p className="text-xs text-primary-light">{levelTitle(Math.floor(user.xp / 500) + 1)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold font-mono text-charcoal">{user.xp}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider">XP</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <style>{`@keyframes xpFloat { 0% { opacity: 0; transform: translateY(20px); } 20% { opacity: 1; transform: translateY(0); } 80% { opacity: 1; transform: translateY(-40px); } 100% { opacity: 0; transform: translateY(-80px); } }`}</style>
    </div>
  );
}

export default SkillChallenges;
