import { useEffect, useState } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

function FindPartners() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.id);
      API.get("/users")
        .then((res) => {
          const allUsers = res.data.data;
          const cUser = allUsers.find(u => u._id === decoded.id);
          setCurrentUser(cUser);
          let others = allUsers.filter(u => u._id !== decoded.id);
          if (cUser) {
            const myWanted = cUser.skillsWanted || [];
            const myOffered = cUser.skillsOffered || [];
            others = others.map(u => {
              const uOffered = u.skillsOffered || [];
              const uWanted = u.skillsWanted || [];
              let score = 0;
              const matchWanted = uOffered.filter(s => myWanted.includes(s));
              score += matchWanted.length * 4;
              const matchOffered = uWanted.filter(s => myOffered.includes(s));
              score += matchOffered.length * 2;
              return { ...u, matchScore: score, bestOffer: matchWanted[0], bestRequest: matchOffered[0] };
            }).sort((a, b) => b.matchScore - a.matchScore);
          }
          setUsers(others);
          setLoading(false);
        })
        .catch((err) => { console.error(err); setLoading(false); });
    } catch (e) { console.error("Invalid token", e); setLoading(false); }
  }, []);

  const sendRequest = async (receiver) => {
    try {
      const bestOffer = receiver.bestRequest || currentUser?.skillsOffered?.[0] || "Coding";
      const bestRequest = receiver.bestOffer || currentUser?.skillsWanted?.[0] || "Design";
      await API.post("/swaps/send", { sender: currentUserId, receiver: receiver._id, skillOffered: bestOffer, skillRequested: bestRequest });
      toast.success("Swap request sent!");
    } catch(error) { toast.error(error.response?.data?.message || "Request failed"); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-muted">Searching the network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <span className="section-label">Find Partners</span>
        <h1 className="page-title mt-2">Discover your next mentor</h1>
        <p className="page-subtitle">Connect with peers who have the skills you need, and offer your expertise in return.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((user) => (
          <div key={user._id} className="card card-hover flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold text-primary-light border border-dark-border">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              {user.matchScore >= 6 && <span className="badge badge-primary">Perfect Match</span>}
              {user.matchScore >= 4 && user.matchScore < 6 && <span className="badge badge-primary">Recommended</span>}
              {user.matchScore > 0 && user.matchScore < 4 && <span className="badge badge-secondary">Seeking You</span>}
            </div>

            <h2 className="text-lg font-bold text-charcoal mb-1.5">{user.name}</h2>
            <p className="text-sm text-muted italic mb-5 line-clamp-2 min-h-[40px] leading-relaxed">
              {user.bio || "This user hasn't written a bio yet."}
            </p>

            <div className="space-y-4 mt-auto">
              <div className="pt-4 border-t border-dark-border">
                <p className="text-xs text-muted font-medium mb-2 uppercase tracking-wider">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.skillsOffered?.length > 0 ? (
                    user.skillsOffered.map(skill => <span key={skill} className="badge badge-muted text-[11px]">{skill}</span>)
                  ) : (
                    <span className="text-xs text-muted/50 italic">None listed</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted font-medium mb-2 uppercase tracking-wider">Wants to Learn</p>
                <div className="flex flex-wrap gap-1.5">
                  {user.skillsWanted?.length > 0 ? (
                    user.skillsWanted.map(skill => <span key={skill} className="badge badge-secondary text-[11px]">{skill}</span>)
                  ) : (
                    <span className="text-xs text-muted/50 italic">None listed</span>
                  )}
                </div>
              </div>
              <button onClick={() => sendRequest(user)} className="btn btn-primary w-full py-2.5 text-sm mt-2">Request Swap →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FindPartners;