import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      const { token, user } = res.data.data;
      localStorage.setItem("token", token);
      toast.success("Welcome back!");

      if (user.isProfileComplete) {
        navigate("/dashboard");
      } else {
        toast("Let's complete your profile first.");
        navigate("/profile/edit", { state: { fromOnboarding: true } });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
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
        <Link to="/register" className="btn btn-secondary text-sm">
          Sign Up
        </Link>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Gradient Panel */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary/20 via-accent to-surface items-center justify-center p-12">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-dark/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 max-w-lg text-center">
            <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-glow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-charcoal mb-4 leading-tight">
              Learn Together,<br />
              <span className="bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">Grow Together.</span>
            </h2>
            <p className="text-muted text-lg leading-relaxed">
              A peer-to-peer platform where you teach what you know and learn what you need — without barriers.
            </p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <span className="section-label">Welcome back</span>
              <h1 className="text-3xl md:text-4xl font-bold text-charcoal mt-2">
                Sign in to your account
              </h1>
              <p className="text-muted mt-3">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary-light hover:text-primary transition-colors font-medium">
                  Create one free
                </Link>
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                  placeholder="••••••••"
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
                    Signing in...
                  </span>
                ) : "Sign In →"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-14 flex items-center justify-center border-t border-dark-border">
        <p className="text-xs text-muted/50">
          © 2026 SkillSwap Platform • Peer-to-Peer Learning
        </p>
      </footer>
    </div>
  );
}

export default Login;
