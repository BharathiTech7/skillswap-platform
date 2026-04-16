import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      API.get(`/users/${decoded.id}`)
        .then((res) => { setUser(res.data.data); setLoading(false); })
        .catch((err) => { console.error(err); setLoading(false); });
    } catch (e) { console.error(e); setLoading(false); }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="card relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-t-2xl"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div>
                <span className="section-label">Profile</span>
                <h1 className="text-2xl font-bold text-charcoal mt-1">{user.name}</h1>
                <p className="text-sm text-muted mt-0.5">{user.email}</p>
              </div>
            </div>
            <button onClick={() => navigate("/profile/edit")} className="btn btn-primary text-sm">Edit Profile →</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-6">
              <div>
                <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-2">Biography</label>
                <p className="text-charcoal/90 leading-relaxed">{user.bio || "No bio written yet."}</p>
              </div>
              <div className="p-4 bg-accent rounded-xl border border-dark-border">
                <p className="text-sm text-muted text-center">
                  Member since {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div>
                <label className="text-xs font-medium text-primary-light uppercase tracking-wider block mb-3">Skills Offered</label>
                <div className="flex flex-wrap gap-2">
                  {user.skillsOffered?.length > 0 ? (
                    user.skillsOffered.map(skill => <span key={skill} className="badge badge-primary text-sm px-3 py-1.5">{skill}</span>)
                  ) : (
                    <span className="text-sm text-muted/50 italic">No skills shared yet</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-secondary-light uppercase tracking-wider block mb-3">Skills Wanted</label>
                <div className="flex flex-wrap gap-2">
                  {user.skillsWanted?.length > 0 ? (
                    user.skillsWanted.map(skill => <span key={skill} className="badge badge-secondary text-sm px-3 py-1.5">{skill}</span>)
                  ) : (
                    <span className="text-sm text-muted/50 italic">No interests listed yet</span>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;