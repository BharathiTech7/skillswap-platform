import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import API from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      API.get(`/users/${decoded.id}`)
        .then((res) => setUser(res.data.data))
        .catch((err) => console.log(err));
    } catch (e) {
      console.error("Invalid token", e);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Partners", path: "/partners" },
    { name: "Requests", path: "/requests" },
    { name: "Sessions", path: "/sessions" },
    { name: "Chat", path: "/chat" },
    { name: "Challenges", path: "/challenges" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/dashboard"
            className="text-xl font-bold bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            SkillSwap
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-primary/10 text-primary-light"
                      : "text-muted hover:text-charcoal hover:bg-surface-light/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg text-muted hover:text-charcoal hover:bg-surface-light transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-sm font-semibold cursor-pointer hover:shadow-glow transition-all duration-200"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 card rounded-xl shadow-card-hover overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-dark-border">
                    <p className="text-sm font-semibold text-charcoal truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => { setOpen(false); navigate("/profile"); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-charcoal hover:bg-surface-light/50 transition-colors"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => { setOpen(false); navigate("/profile/edit"); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-muted hover:text-charcoal hover:bg-surface-light/50 transition-colors"
                    >
                      Settings
                    </button>
                    <div className="border-t border-dark-border my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-secondary hover:bg-secondary/5 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-dark-border bg-surface/95 backdrop-blur-xl animate-fade-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary-light"
                      : "text-muted hover:text-charcoal hover:bg-surface-light/50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;