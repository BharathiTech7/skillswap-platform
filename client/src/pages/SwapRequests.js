import { useEffect, useState } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function SwapRequests() {
  const [tab, setTab] = useState("incoming");
  const [incoming, setIncoming] = useState([]);
  const [sent, setSent] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSwaps = () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      const uid = decoded.id;
      setUserId(uid);
      API.get(`/swaps/user/${uid}`)
        .then((res) => {
          const swaps = res.data.data;
          setIncoming(swaps.filter((s) => s.receiver._id === uid && s.status === "pending"));
          setSent(swaps.filter((s) => s.sender._id === uid && (s.status === "pending" || s.status === "rejected")));
          setAccepted(swaps.filter((s) => s.status === "accepted"));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } catch (e) { console.error(e); setLoading(false); }
  };

  useEffect(() => { fetchSwaps(); }, []);

  const updateRequest = async (id, status) => {
    try {
      await API.put(`/swaps/${id}`, { status });
      toast.success(`Request ${status}.`);
      fetchSwaps();
    } catch { toast.error("Processing error."); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { key: "incoming", label: "Incoming", count: incoming.length },
    { key: "sent", label: "Sent", count: sent.length },
    { key: "accepted", label: "Accepted", count: accepted.length },
  ];

  const EmptyState = ({ icon, text }) => (
    <div className="col-span-full card flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-light/50 flex items-center justify-center mb-4">{icon}</div>
      <p className="text-muted">{text}</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <span className="section-label">Swap Requests</span>
        <h1 className="page-title mt-2">Manage your connections</h1>
      </header>

      <div className="flex gap-1 mb-8 p-1 bg-surface rounded-xl w-fit border border-dark-border">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-primary text-white shadow-glow" : "text-muted hover:text-charcoal"}`}>
            {t.label}
            <span className={`ml-1.5 text-xs ${tab === t.key ? "text-white/70" : "text-muted/50"}`}>{t.count}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {tab === "incoming" && incoming.length === 0 && (
          <EmptyState icon={<svg className="w-6 h-6 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" /></svg>} text="No incoming requests to review." />
        )}
        {tab === "incoming" && incoming.map((req) => (
          <div key={req._id} className="card flex flex-col">
            <div className="flex justify-between items-start mb-5">
              <span className="badge badge-secondary">New Request</span>
              <svg className="w-5 h-5 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
            </div>
            <h2 className="text-lg font-bold text-charcoal mb-4">{req.sender.name}</h2>
            <div className="space-y-3 flex-1">
              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">They Offer</label>
                <p className="text-sm text-primary-light font-medium">{req.skillOffered}</p>
              </div>
              <div>
                <label className="text-xs text-muted font-medium uppercase tracking-wider block mb-1">They Want</label>
                <p className="text-sm text-secondary-light font-medium">{req.skillRequested}</p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-dark-border flex gap-3">
              <button onClick={() => updateRequest(req._id, "accepted")} className="btn btn-primary flex-1 py-2.5 text-sm">Accept</button>
              <button onClick={() => updateRequest(req._id, "rejected")} className="btn btn-danger flex-1 py-2.5 text-sm">Decline</button>
            </div>
          </div>
        ))}

        {tab === "sent" && sent.length === 0 && (
          <EmptyState icon={<svg className="w-6 h-6 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>} text="No sent requests yet." />
        )}
        {tab === "sent" && sent.map((req) => (
          <div key={req._id} className={`card ${req.status === "rejected" ? "opacity-60" : ""}`}>
            <div className="flex justify-between items-start mb-5">
              {req.status === "pending" ? (
                <><span className="badge badge-muted">Awaiting</span><svg className="w-5 h-5 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg></>
              ) : (
                <><span className="badge badge-secondary">Declined</span><svg className="w-5 h-5 text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg></>
              )}
            </div>
            <h2 className="text-lg font-bold text-charcoal mb-2">{req.receiver.name}</h2>
            <p className="text-sm text-muted italic">{req.status === "pending" ? "Waiting for response..." : "Request was declined."}</p>
            <div className="mt-6 pt-5 border-t border-dark-border">
              <p className="text-xs text-muted">Skill: {req.skillRequested}</p>
            </div>
          </div>
        ))}

        {tab === "accepted" && accepted.length === 0 && (
          <EmptyState icon={<svg className="w-6 h-6 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>} text="No active connections yet." />
        )}
        {tab === "accepted" && accepted.map((req) => {
          const partner = req.sender._id === userId ? req.receiver : req.sender;
          return (
            <div key={req._id} className="card">
              <div className="flex justify-between items-start mb-5">
                <span className="badge badge-primary">Active</span>
                <svg className="w-5 h-5 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
              </div>
              <h2 className="text-lg font-bold text-charcoal mb-4">{partner.name}</h2>
              <p className="text-sm text-muted mb-6">Skills: {req.skillOffered} & {req.skillRequested}</p>
              <div className="space-y-2">
                <button onClick={() => navigate("/chat")} className="btn btn-secondary w-full py-2.5 text-sm">Message →</button>
                <button onClick={() => navigate("/sessions")} className="btn btn-primary w-full py-2.5 text-sm">Schedule Session</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SwapRequests;