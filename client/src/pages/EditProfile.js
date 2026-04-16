import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnboarding = location.state?.fromOnboarding;
  const [userId, setUserId] = useState("");
  const [bio, setBio] = useState("");
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded = jwtDecode(token);
      setUserId(decoded.id);
      API.get(`/users/${decoded.id}`)
        .then((res) => {
          const user = res.data.data;
          setBio(user.bio || "");
          setSkillsOffered(user.skillsOffered?.join(", ") || "");
          setSkillsWanted(user.skillsWanted?.join(", ") || "");
        })
        .catch((err) => console.log(err));
    } catch (e) { console.error(e); }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.put(`/users/${userId}`, {
        bio,
        skillsOffered: skillsOffered.split(",").map(s => s.trim().toLowerCase()).filter(s => s !== ""),
        skillsWanted: skillsWanted.split(",").map(s => s.trim().toLowerCase()).filter(s => s !== ""),
        isProfileComplete: true
      });
      toast.success("Profile updated successfully.");
      navigate("/profile");
    } catch (error) { toast.error("Update failed. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 animate-fade-in">
      {isOnboarding && (
        <div className="mb-8 p-6 bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20 rounded-2xl relative overflow-hidden">
          <div className="absolute top-3 right-4 opacity-10">
            <svg className="w-16 h-16 text-charcoal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Welcome to SkillSwap!</h2>
          <p className="text-muted leading-relaxed">Let's set up your profile so we can match you with the right peers.</p>
        </div>
      )}

      <div className="card">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <span className="section-label">{isOnboarding ? "Getting Started" : "Settings"}</span>
            <h1 className="text-2xl font-bold text-charcoal mt-1">{isOnboarding ? "Set Up Your Profile" : "Edit Profile"}</h1>
          </div>
          <svg className="w-6 h-6 text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Your Bio</label>
            <textarea placeholder="Tell us a bit about your journey..." className="input-field min-h-[120px] resize-none" value={bio} onChange={(e) => setBio(e.target.value)} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-primary-light mb-2">Skills I Can Teach</label>
              <input type="text" placeholder="React, UI Design, Python..." className="input-field" value={skillsOffered} onChange={(e) => setSkillsOffered(e.target.value)} required />
              <p className="text-xs text-muted/50 mt-1.5">Comma-separated values</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-light mb-2">Skills I Want to Learn</label>
              <input type="text" placeholder="Docker, Public Speaking..." className="input-field" value={skillsWanted} onChange={(e) => setSkillsWanted(e.target.value)} required />
              <p className="text-xs text-muted/50 mt-1.5">Comma-separated values</p>
            </div>
          </div>
          <div className="pt-6 border-t border-dark-border flex items-center justify-between gap-4">
            {!isOnboarding && (<button type="button" onClick={() => navigate("/profile")} className="btn btn-ghost text-sm">← Back to Profile</button>)}
            <button disabled={loading} className="btn btn-primary flex-1 py-3 text-sm font-semibold">{loading ? "Saving..." : isOnboarding ? "Continue →" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;