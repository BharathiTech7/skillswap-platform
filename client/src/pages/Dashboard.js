import { useEffect, useState } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const icons = {
  inbox: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  bolt: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  ),
};

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ incoming: 0, accepted: 0, sessions: 0 });
  const [challengeProgress, setChallengeProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    API.get("/users/me")
      .then((res) => {
        setUserName(res.data.data.name);
        if (!res.data.data.isProfileComplete) {
          navigate("/profile/edit", { state: { fromOnboarding: true } });
        }
        setLoading(false);
      })
      .catch((err) => { console.log(err); setLoading(false); });

    const decoded = jwtDecode(token);
    const userId = decoded.id;

    API.get(`/swaps/user/${userId}`)
      .then((res) => {
        const swaps = res.data.data;
        setStats((prev) => ({
          ...prev,
          incoming: swaps.filter((s) => s.status === "pending").length,
          accepted: swaps.filter((s) => s.status === "accepted").length,
        }));
      })
      .catch(console.log);

    API.get(`/sessions/user/${userId}`)
      .then((res) => {
        const now = new Date();
        const upcoming = res.data.data.filter((s) => {
          const sessionEnd = new Date(`${s.date}T${s.time}`);
          sessionEnd.setHours(sessionEnd.getHours() + 1); // session is 1hr
          return sessionEnd > now;
        });
        setStats((prev) => ({ ...prev, sessions: upcoming.length }));
      })
      .catch(console.log);

    API.get("/challenges/progress")
      .then((res) => setChallengeProgress(res.data.data))
      .catch(console.log);
  }, [navigate]);

  const levelTitle = (level) => {
    if (level >= 20) return "Grandmaster";
    if (level >= 15) return "Diamond";
    if (level >= 10) return "Gold";
    if (level >= 7) return "Silver";
    if (level >= 4) return "Bronze";
    return "Beginner";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <span className="section-label">Dashboard</span>
        <h1 className="page-title mt-2">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
            {userName.split(' ')[0]}
          </span>
        </h1>
        <p className="page-subtitle">Here's a quick overview of your activity and progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Pending Requests", value: stats.incoming, icon: icons.inbox, color: "bg-violet-50 text-violet-600 border border-violet-100", link: "/requests" },
          { label: "Active Swaps", value: stats.accepted, icon: icons.users, color: "bg-blue-50 text-blue-600 border border-blue-100", link: "/partners" },
          { label: "Upcoming Sessions", value: stats.sessions, icon: icons.calendar, color: "bg-amber-50 text-amber-600 border border-amber-100", link: "/sessions" },
        ].map((stat, i) => (
          <div key={i} onClick={() => navigate(stat.link)} className="card card-hover cursor-pointer group">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <span className="text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">View →</span>
            </div>
            <p className="text-3xl font-bold text-charcoal mb-1">{stat.value}</p>
            <p className="text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {challengeProgress && (
        <section>
          <div className="mb-4 flex justify-between items-end">
            <div>
              <h2 className="text-xl font-bold text-charcoal">Challenge Progress</h2>
              <p className="text-sm text-muted mt-1">Level {challengeProgress.level} · {levelTitle(challengeProgress.level)}</p>
            </div>
          </div>

          <div className="card group cursor-pointer hover:border-primary/30 transition-all relative overflow-hidden" onClick={() => navigate("/challenges")}>
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-24 h-24 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-center">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted mb-2">
                  <span>Current Mastery</span>
                  <span>{challengeProgress.xpInCurrentLevel} / {challengeProgress.xpToNextLevel} XP</span>
                </div>
                <div className="w-full h-2.5 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-1000" style={{ width: `${(challengeProgress.xpInCurrentLevel / challengeProgress.xpToNextLevel) * 100}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:w-1/3">
                {[
                  { label: "Streak", val: challengeProgress.streak, sub: "days" },
                  { label: "Accuracy", val: `${challengeProgress.accuracy}%`, sub: "" },
                  { label: "Total", val: challengeProgress.totalAttempts, sub: "" },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 bg-accent rounded-xl">
                    <p className="text-lg font-bold text-charcoal">{s.val}</p>
                    <p className="text-[10px] text-muted uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-dark-border flex justify-between items-center">
              <p className="text-sm text-muted italic">Ready for your daily challenge?</p>
              <span className="btn btn-primary text-sm py-2 px-4">Enter Arena →</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Dashboard;