import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../features/auth/useAuth";
import { getMediaUrl } from "../utils/media";
import { Helmet } from "react-helmet-async";


const HERO_BG_SRC = getMediaUrl("assets/hawamahal.jpg");
const LOGO_SRC = getMediaUrl("logo.jpg");

const styles = `
  :root {
    --saffron:     #FF6B1A;
    --saffron-dark:#C94F00;
    --gold:        #F5A623;
    --gold-light:  #FFD580;
    --maroon:      #8B1A1A;
    --maroon-light:#C0392B;
    --cream:       #FDF6EC;
    --ivory:       #FFF8F0;
    --green-india: #138808;
    --navy:        #1A1F3A;
    --text-dark:   #2D1B00;
    --text-mid:    #6B4226;
    --text-light:  #A07850;
    --border:      rgba(245,166,35,0.30);
    --border-hover:rgba(255,107,26,0.55);
  }

 

  .tid-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--text-dark);
    min-height: 100vh;
  }

  .page {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* LEFT PANEL */
  .left-panel {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 3rem;
    min-height: 100vh;
  }

  .left-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background:
      radial-gradient(circle at center, rgba(0,0,0,0) 20%, rgba(26,31,58,0.6) 100%),
      linear-gradient(160deg, rgba(139,26,26,0.3) 0%, rgba(245,166,35,0.1) 100%),
      url('${HERO_BG_SRC}') center/cover no-repeat;
    background-position: 50% 30%;
  }

  .mandala {
    position: absolute;
    top: -100px; left: -100px;
    width: 520px; height: 520px;
    border-radius: 50%;
    border: 1.5px solid rgba(245,166,35,0.18);
    z-index: 1;
  }

  .geo-border {
    position: absolute;
    top: 0; left: 0;
    width: 6px; height: 100%;
    background: linear-gradient(to bottom, var(--saffron), var(--gold), var(--green-india));
    z-index: 2;
  }

  .left-content { position: relative; z-index: 2; }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 2.5rem;
  }

  .brand-logo-img {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    object-fit: cover;
    box-shadow: 0 4px 18px rgba(255,107,26,0.45), 0 0 0 2px rgba(255,213,128,0.3);
    flex-shrink: 0;
  }

  .brand-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.35rem;
    font-weight: 700;
    color: #fff;
  }

  .brand-name span {
    display: block;
    font-size: 0.75rem;
    font-weight: 400;
    font-family: 'DM Sans', sans-serif;
    color: var(--gold-light);
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .left-headline {
    font-family: 'Playfair Display', serif;
    font-size: 3.2rem;
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 1.1rem;
  }

  .left-headline em { font-style: italic; color: var(--gold-light); }

  /* RIGHT PANEL */
  .right-panel {
    background: var(--ivory);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 3rem;
    position: relative;
    overflow: hidden;
  }

  .form-card {
    width: 100%;
    max-width: 400px;
    position: relative;
    z-index: 1;
  }

  .form-logo-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 1.8rem;
  }

  .form-logo-img {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    object-fit: cover;
    box-shadow: 0 2px 10px rgba(255,107,26,0.3);
  }

  .form-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 600;
    color: var(--maroon);
  }

  .form-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 0.4rem;
  }

  .form-title span { color: var(--saffron); }

  .form-subtitle {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: 2rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 1.2rem;
  }

  .field label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-mid);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 12px;
    width: 18px; height: 18px;
    color: var(--text-light);
    z-index: 2;
  }

  .input-wrap input {
    width: 100%;
    padding: 12px 12px 12px 40px;
    font-size: 0.95rem;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    outline: none;
    background: #fff;
    transition: 0.2s;
    font-family: 'DM Sans', sans-serif;
    color: var(--text-dark);
  }

  .input-wrap input:focus {
    border-color: var(--saffron);
    box-shadow: 0 0 0 3px rgba(255,107,26,0.1);
  }

  .eye-btn {
    position: absolute;
    right: 12px;
    background: none; border: none;
    cursor: pointer; color: var(--text-light);
    display: flex; align-items: center;
    z-index: 2;
  }

  .forgot-link {
    text-align: right;
    margin-top: -0.5rem;
    margin-bottom: 1.5rem;
  }

  .forgot-link a {
    font-size: 0.85rem;
    color: var(--text-light);
    text-decoration: none;
    transition: 0.2s;
  }

  .forgot-link a:hover { color: var(--maroon-light); }

  .btn-login {
    width: 100%;
    padding: 14px;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, var(--saffron) 0%, var(--maroon-light) 100%);
    border: none;
    border-radius: 12px;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(255,107,26,0.25);
    transition: 0.2s;
    margin-bottom: 1.5rem;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .btn-login:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,107,26,0.35); }

  .social-divider {
    display: flex;
    align-items: center;
    gap: 15px;
    margin: 1.5rem 0;
    color: var(--text-light);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .social-divider::before, .social-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  .social-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 10px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--text-dark);
    transition: 0.2s;
    font-family: 'DM Sans', sans-serif;
  }

  .social-btn:hover { background: var(--cream); border-color: var(--gold); }
  .social-btn svg { width: 18px; height: 18px; }

  .signup-link {
    text-align: center;
    margin-top: 2rem;
    font-size: 0.9rem;
    color: var(--text-light);
  }

  .signup-link a {
    color: var(--saffron);
    font-weight: 600;
    text-decoration: none;
  }

 .flag-strip {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 4px; display: flex;
  }
  .flag-strip .f1 { background: var(--saffron); flex: 1; }
  .flag-strip .f2 { background: #fff; flex: 1; }
  .flag-strip .f3 { background: var(--green-india); flex: 1; }

  @media (max-width: 860px) {
    .page { grid-template-columns: 1fr; }
    .left-panel { min-height: 280px; padding: 2rem; }
    .left-headline { font-size: 2.2rem; }
    .right-panel { padding: 2rem 1.5rem; }
  }

  /* Dark Theme Parity */
  .dark, .dark .tid-root, :root.dark {
    --cream:       #0a0f1d;
    --ivory:       #0a0f1d;
    --text-dark:   #ffffff;
    --text-mid:    #cbd5e1;
    --text-light:  #94a3b8;
    --border:      #23324d;
    --border-hover:#fb923c;
  }

  .dark .right-panel {
    background: #0a0f1d !important;
  }

  .dark .input-wrap input {
    background: #0d1527 !important;
    color: #f8fafc !important;
    border-color: #2a3b5c !important;
  }
`;

function EyeIcon({ open }) {
  return (
    <svg
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      style={{ color: open ? "var(--saffron)" : "var(--text-light)" }}
    >
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
export default function TravelLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine return target: from location.state or fallback
  const redirectTarget = location.state?.from || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }
      await loginWithGoogle(credentialResponse.credential);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setError(err.message || "Google sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign in failed. Please try again.");
  };

  return (
    <div className="tid-root">
      <Helmet>
        <title>Account Login | Travel In Depth</title>
        <meta name="description" content="Sign in to your Travel In Depth account to view your saved itineraries and personalized trip recommendations." />
      </Helmet>
      <style>{styles}</style>

      <div className="page">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="left-bg"></div>
          <div className="mandala"></div>
          <div className="geo-border"></div>
          <div className="left-content">
            <div className="brand">
              <img className="brand-logo-img" src={LOGO_SRC} alt="Travel in Depth Logo" loading="lazy" />
              <div className="brand-name">
                Travel in Depth
                <span>Discover Incredible India</span>
              </div>
            </div>
            <h1 className="left-headline">
              Welcome<br />back, <em>explorer.</em>
            </h1>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="form-card">
            <div className="form-logo-row">
              <img className="form-logo-img" src={LOGO_SRC} alt="Travel in Depth" loading="lazy" />
              <span className="form-logo-text">Travel in Depth</span>
            </div>

            <h2 className="form-title">
              Account <span>Login</span>
            </h2>
            <p className="form-subtitle">Pick up right where you left your journey.</p>

            {error && (
              <div style={{
                background: "rgba(224, 72, 62, 0.1)",
                border: "1px solid rgba(224, 72, 62, 0.4)",
                borderRadius: "10px",
                padding: "10px 14px",
                color: "#E0483E",
                fontSize: "0.85rem",
                marginBottom: "1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Email Address</label>
                <div className="input-wrap">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                  </svg>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="input-wrap">
                  <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <EyeIcon open={showPassword} />
                  </button>
                </div>
              </div>

              <div className="forgot-link">
                <a href="/forgot-password">Forgot Password?</a>
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? "Logging in..." : (
                  <>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98z" />
                    </svg>
                    Login to Dashboard
                  </>
                )}
              </button>
            </form>

            <div className="social-divider">or continue with</div>

            <div style={{ display: "flex", justifyContent: "center", width: "100%", marginBottom: "0.5rem" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                shape="rectangular"
                theme="outline"
                size="large"
                text="continue_with"
                width="100%"
              />
            </div>

            <p className="signup-link">
              Don't have an account? <Link to="/signup" state={{ from: redirectTarget }}>Sign up</Link>
            </p>
          </div>

         
        </div>
      </div>
    </div>
  );
}