import { useEffect, useState } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [selectedSwap, setSelectedSwap] = useState(null);
  const [date, setDate] = useState("");
  const [timeHour, setTimeHour] = useState("12");
  const [timeMinute, setTimeMinute] = useState("00");
  const [timeAmPm, setTimeAmPm] = useState("AM");
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      Promise.all([API.get(`/sessions/user/${decoded.id}`), API.get(`/swaps/user/${decoded.id}`)])
        .then(([sessionsRes, swapsRes]) => {
          setSessions(sessionsRes.data.data);
          setSwaps(swapsRes.data.data.filter(s => s.status === "accepted"));
          setLoading(false);
        }).catch(err => { console.error(err); setLoading(false); });
    } catch (e) { console.error(e); setLoading(false); }
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const dateObj = new Date();
    dateObj.setHours(parseInt(h, 10), parseInt(m, 10), 0);
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const createSession = async (e) => {
    e.preventDefault();
    if (!selectedSwap) { toast.error("Choose a partner first."); return; }
    let hour24 = parseInt(timeHour, 10);
    if (timeAmPm === "PM" && hour24 !== 12) hour24 += 12;
    if (timeAmPm === "AM" && hour24 === 12) hour24 = 0;
    const time = `${hour24.toString().padStart(2, '0')}:${timeMinute}`;
    const selectedDate = new Date(`${date}T${time}`);
    if (selectedDate < new Date()) { toast.error("Can't schedule in the past."); return; }
    try {
      const teacher = selectedSwap.sender._id;
      const learner = selectedSwap.receiver._id;
      const isSender = selectedSwap.sender._id === userId;
      const topic = isSender ? selectedSwap.skillRequested : selectedSwap.skillOffered;
      await API.post("/sessions/create", { swapId: selectedSwap._id, teacher, learner, topic, date, time, duration: 60 });
      toast.success("Session scheduled!");
      API.get(`/sessions/user/${userId}`).then((res) => setSessions(res.data.data));
      setSelectedSwap(null); setDate("");
    } catch (error) { toast.error(error.response?.data?.message || "Scheduling failed."); }
  };

  const executeDelete = async () => {
    if (!sessionToDelete) return;
    try {
      await API.delete(`/sessions/${sessionToDelete}`);
      toast.success("Session cancelled.");
      setSessions(sessions.filter(s => s._id !== sessionToDelete));
      setSessionToDelete(null);
    } catch (error) { toast.error("Failed to cancel."); setSessionToDelete(null); }
  };

  if (loading) {
    return (<div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>);
  }

  const upcomingSessions = sessions.filter(session => {
    const sessionDateTime = new Date(`${session.date}T${session.time}`);
    return new Date() <= new Date(sessionDateTime.getTime() + 60 * 60 * 1000);
  });

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <span className="section-label">Sessions</span>
        <h1 className="page-title mt-2">Schedule your learning</h1>
        <p className="page-subtitle">Book time with your partners to exchange knowledge.</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <section className="lg:w-96 shrink-0">
          <div className="card">
            <h2 className="text-sm font-semibold text-charcoal mb-5 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Schedule New Session
            </h2>
            <form onSubmit={createSession} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Partner</label>
                <select className="input-field text-sm" onChange={(e) => setSelectedSwap(swaps.find(s => s._id === e.target.value))} value={selectedSwap?._id || ""}>
                  <option value="">Choose partner...</option>
                  {swaps.map((s) => (<option key={s._id} value={s._id}>{s.sender._id === userId ? `${s.receiver.name}: ${s.skillRequested}` : `${s.sender.name}: ${s.skillOffered}`}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Date</label>
                <input type="date" min={new Date().toISOString().split("T")[0]} className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Time</label>
                <div className="flex gap-2">
                  <select className="input-field text-center" value={timeHour} onChange={(e) => setTimeHour(e.target.value)}>
                    {[...Array(12).keys()].map(i => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}
                  </select>
                  <select className="input-field text-center" value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)}>
                    {['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select className="input-field text-center" value={timeAmPm} onChange={(e) => setTimeAmPm(e.target.value)}>
                    <option value="AM">AM</option><option value="PM">PM</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary w-full py-3 text-sm font-semibold mt-2">Confirm Session →</button>
            </form>
          </div>
        </section>

        <section className="flex-1">
          <h2 className="text-sm font-semibold text-charcoal mb-5 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            Upcoming Sessions
          </h2>
          {upcomingSessions.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-light/50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-muted/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>
              </div>
              <p className="text-muted">No upcoming sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingSessions.map((session) => {
                const isTeacher = session.teacher._id === userId;
                const partnerName = isTeacher ? session.learner.name : session.teacher.name;
                const sessionDateTime = new Date(`${session.date}T${session.time}`);
                const canJoin = (sessionDateTime - new Date()) / (1000 * 60) <= 20;
                const roomName = session.meetingLink.split("meet.jit.si/")[1] || session._id;
                return (
                  <div key={session._id} className="card card-hover flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`badge ${isTeacher ? 'badge-primary' : 'badge-secondary'}`}>{isTeacher ? "Teaching" : "Learning"}</span>
                      <svg className="w-5 h-5 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-charcoal mb-1">{session.topic}</h3>
                    <p className="text-sm text-muted mb-4">with {partnerName}</p>
                    <div className="space-y-1.5 mb-6 text-sm text-muted">
                      <div className="flex items-center gap-2"><span className="w-1 h-1 bg-muted/40 rounded-full"></span>{new Date(session.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div className="flex items-center gap-2"><span className="w-1 h-1 bg-muted/40 rounded-full"></span>{formatTime(session.time)}</div>
                    </div>
                    <div className="mt-auto space-y-2">
                      {canJoin ? (
                        <Link to={`/meeting/${roomName}`} className="btn btn-primary w-full py-2.5 text-sm">Join Meeting →</Link>
                      ) : (
                        <div className="py-2.5 text-center text-xs text-muted bg-accent rounded-xl border border-dark-border">Opens at {formatTime(session.time)}</div>
                      )}
                      {session.createdBy === userId && (
                        <button onClick={() => setSessionToDelete(session._id)} className="w-full text-xs text-secondary/70 hover:text-secondary transition-colors pt-1">Cancel Session</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {sessionToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card bg-surface w-full max-w-sm">
            <header className="mb-5">
              <span className="section-label text-secondary">Warning</span>
              <h2 className="text-xl font-bold text-charcoal mt-1">Cancel Session?</h2>
            </header>
            <p className="text-sm text-muted mb-6 leading-relaxed">This will permanently cancel the scheduled session.</p>
            <div className="flex gap-3">
              <button onClick={() => setSessionToDelete(null)} className="btn btn-ghost flex-1 py-2.5 text-sm">Keep It</button>
              <button onClick={executeDelete} className="btn btn-danger flex-1 py-2.5 text-sm">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sessions;