import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

function OutcomeForm() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    taught: "",
    learned: "",
    confidence: 3,
    review: "",
    nextTopic: "",
    rating: 5
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");
      const decoded = jwtDecode(token);

      await API.post("/outcomes", {
        sessionId: roomId,
        user: decoded.id,
        ...formData
      });

      toast.success("Learning outcome recorded!");
      navigate("/challenges");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save outcome");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      <header className="mb-8 text-center">
        <span className="section-label">Session Complete</span>
        <h1 className="page-title mt-2">
          Record your learning outcome
        </h1>
        <p className="page-subtitle mx-auto text-center">
          Reflect on what happened to build your public accountability board.
        </p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">What did you teach?</label>
              <input
                type="text"
                placeholder="e.g. React Router basics"
                className="input-field"
                value={formData.taught}
                onChange={(e) => setFormData({...formData, taught: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">What did you learn?</label>
              <input
                type="text"
                placeholder="e.g. Setting up Context API"
                className="input-field"
                value={formData.learned}
                onChange={(e) => setFormData({...formData, learned: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Confidence Level: <span className="text-primary-light font-semibold">{formData.confidence}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              className="w-full accent-primary h-2 bg-surface-light rounded-full appearance-none cursor-pointer"
              value={formData.confidence}
              onChange={(e) => setFormData({...formData, confidence: Number(e.target.value)})}
            />
            <div className="flex justify-between text-xs text-muted/50 mt-1.5">
              <span>Unsure</span>
              <span>Very Confident</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Session Review</label>
              <textarea
                placeholder="How did the session go?"
                className="input-field min-h-[80px] resize-none"
                value={formData.review}
                onChange={(e) => setFormData({...formData, review: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Next Session Topic</label>
              <input
                type="text"
                placeholder="e.g. Advanced useEffect"
                className="input-field"
                value={formData.nextTopic}
                onChange={(e) => setFormData({...formData, nextTopic: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted mb-2">
              Session Rating: <span className="text-secondary-light font-semibold">{formData.rating}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              className="w-full accent-secondary h-2 bg-surface-light rounded-full appearance-none cursor-pointer"
              value={formData.rating}
              onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
            />
            <div className="flex justify-between text-xs text-muted/50 mt-1.5">
              <span>Poor</span>
              <span>Excellent</span>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-3.5 text-sm font-semibold mt-4"
          >
            {submitting ? "Saving..." : "Submit Outcome →"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OutcomeForm;
