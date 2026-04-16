import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await API.post("/auth/register", { name, email, password });
      toast.success("Account created! Welcome aboard.");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-accent flex flex-col">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 md:px-12 border-b border-dark-border">
        <div className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
          SkillSwap
        </div>
        <Link to="/" className="btn btn-secondary text-sm">
          Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row-reverse">
        {/* Right Side: Gradient Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-bl from-secondary/15 via-accent to-surface items-center justify-center p-12">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-secondary/15 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 max-w-lg text-center">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-charcoal mb-4 leading-tight">
              Unlock Your<br />
              <span className="bg-gradient-to-r from-secondary-light to-secondary bg-clip-text text-transparent">Full Potential.</span>
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              Join a community of learners sharing knowledge and building real connections.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: (
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                  </svg>
                ), text: "Match with skill-compatible peers" },
                { icon: (
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                ), text: "Video sessions with built-in scheduling" },
                { icon: (
                  <svg className="w-5 h-5 text-primary-light" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                ), text: "Track your learning progress" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-left bg-surface/50 rounded-xl px-4 py-3 border border-dark-border">
                  {item.icon}
                  <span className="text-sm text-muted">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Left Side: Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="section-label">Get started</span>
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal mt-2">
                Create your account
              </h1>
              <p className="text-muted mt-3">
                Already have an account?{" "}
                <Link to="/" className="text-primary-light hover:text-primary transition-colors font-medium">
                  Sign in instead
                </Link>
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="How should we call you?"
                  className="input-field"
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input-field"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  className="input-field"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                disabled={loading}
                className="btn btn-primary w-full py-3 text-sm font-semibold mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : "Create Account →"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 flex items-center justify-center border-t border-dark-border">
        <p className="text-xs text-muted/50">
          Empowering learners worldwide since 2026.
        </p>
      </footer>
    </div>
  );
}

export default Register;