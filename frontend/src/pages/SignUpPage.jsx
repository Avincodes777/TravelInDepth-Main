import React, { useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../features/auth/useAuth";
import { getMediaUrl } from "../utils/media";
import { Helmet } from "react-helmet-async";


const INTERESTS = [
  { id: "himalayan", label: "Himalayan Treks", icon: "🏔️" },
  { id: "heritage", label: "Heritage Sites", icon: "🕌" },
  { id: "coastal", label: "Coastal Escapes", icon: "🌊" },
  { id: "cultural", label: "Cultural Tours", icon: "🎨" },
  { id: "wildlife", label: "Wildlife Safari", icon: "🐅" },
  { id: "food", label: "Food Trails", icon: "🍛" },
  { id: "wellness", label: "Wellness & Yoga", icon: "🧘" },
  { id: "photography", label: "Photography", icon: "📷" },
  { id: "backpacking", label: "Backpacking", icon: "🎒" },
  { id: "spiritual", label: "Spiritual Journeys", icon: "🛕" },
];

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Security" },
  { id: 3, label: "Profile" },
];

const AVATAR_LETTERS = ["A", "R", "P", "S"];
const AVATAR_COLORS = ["#C0392B", "#8B1A1A", "#138808", "#F5A623"];

export default function TravelSignup() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState([]);
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const strength = useMemo(() => {
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };
    const score = Object.values(checks).filter(Boolean).length;
    let label = "Enter a password";
    let color = "var(--border)";
    if (password.length > 0) {
      if (score <= 1) {
        label = "Weak";
        color = "var(--red)";
      } else if (score === 2) {
        label = "Fair";
        color = "var(--gold)";
      } else if (score === 3) {
        label = "Good";
        color = "var(--saffron)";
      } else {
        label = "Strong";
        color = "var(--green-india)";
      }
    }
    return { checks, score, label, color };
  }, [password]);

  const toggleInterest = (id) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const locationHook = useLocation();
  const redirectTarget = locationHook.state?.from || "/dashboard";

  const [signupError, setSignupError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setSignupError("");
    setSubmitting(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }
      await loginWithGoogle(credentialResponse.credential);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setSignupError(err.message || "Google sign in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleError = () => {
    setSignupError("Google sign in failed. Please try again.");
  };

  const handleFinalSubmit = async () => {
    setSignupError("");
    setSubmitting(true);
    try {
      await signup({
        name: fullName,
        email,
        password,
        phone,
        location,
        interests,
      });
      setSubmitted(true);
      navigate(redirectTarget, { replace: true });
    } catch (err) {
      setSignupError(err.message || "Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  const goNext = (e) => {
    e.preventDefault();
    setSignupError("");
    if (step === 1) {
      if (!fullName.trim() || !email.trim()) {
        setSignupError("Please enter your full name and email.");
        return;
      }
    }
   
    if (step === 2) {
      if (!password || password.length < 6) {
        setSignupError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirm) {
        setSignupError("Passwords do not match.");
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      if (!agreed) return;
      handleFinalSubmit();
    }
  };

  const goBack = () => {
    setSignupError("");
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="page">
      <Helmet>
        <title>Create an Account | Travel In Depth</title>
        <meta
          name="description"
          content="Join Travel In Depth to unlock personalized travel recommendations, custom AI itineraries, and exclusive travel guides across India."
        />
      </Helmet>
      <style>{`
        
        .page {
          --saffron:#FF6B1A; --saffron-dark:#C94F00; --gold:#F5A623; --gold-light:#FFD580;
          --maroon:#8B1A1A; --maroon-light:#C0392B; --cream:#FDF6EC; --ivory:#FFF8F0;
          --green-india:#138808; --navy:#1A1F3A; --red:#E0483E; --text-dark:#2D1B00; --text-mid:#6B4226;
          --text-light:#A07850; --border:rgba(245,166,35,0.30); --border-hover:rgba(255,107,26,0.55);
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh; display:grid; grid-template-columns:1fr 1fr;
          background: var(--cream); color: var(--text-dark);
        }
        .page h1, .page h2 { font-family: 'Playfair Display', Georgia, serif; }

        /* LEFT PANEL */
        .left-panel{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;padding:3rem;min-height:100vh}
        .left-bg{position:absolute;inset:0;
          background:
            linear-gradient(160deg, rgba(139,26,26,0.82) 0%, rgba(26,31,58,0.92) 60%, rgba(19,136,8,0.30) 100%),
            url('https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat;
          z-index:0;
        }
        .mandala{position:absolute;top:-100px;right:-100px;width:520px;height:520px;border-radius:50%;border:1.5px solid rgba(245,166,35,0.18);z-index:1}
        .mandala::before{content:'';position:absolute;inset:40px;border-radius:50%;border:1px solid rgba(245,166,35,0.14)}
        .mandala::after{content:'';position:absolute;inset:80px;border-radius:50%;border:1px solid rgba(245,166,35,0.10)}
        .lotus-overlay{position:absolute;bottom:0;left:0;right:0;height:220px;background:linear-gradient(to top,rgba(139,26,26,0.55),transparent);z-index:1}
        .geo-border{position:absolute;top:0;left:0;width:6px;height:100%;background:linear-gradient(to bottom,var(--saffron),var(--gold),var(--green-india));z-index:2}
        .left-content{position:relative;z-index:2}
        .brand{display:flex;align-items:center;gap:12px;margin-bottom:2.5rem}
        .brand-logo{width:52px;height:52px;border-radius:14px;flex-shrink:0;background:var(--saffron);
          box-shadow:0 4px 18px rgba(255,107,26,0.5),0 0 0 2px rgba(255,213,128,0.35);
          display:flex;align-items:center;justify-content:center;font-size:1.5rem}
        .brand-name{font-size:1.35rem;font-weight:700;color:#fff;letter-spacing:0.02em;line-height:1.15}
        .brand-name span{display:block;font-size:0.75rem;font-weight:400;font-family:'DM Sans',sans-serif;color:var(--gold-light);letter-spacing:0.14em;text-transform:uppercase}
        .left-headline{font-size:3.2rem;font-weight:700;color:#fff;line-height:1.15;margin-bottom:1.1rem}
        .left-headline em{font-style:italic;color:var(--gold-light)}
        .left-sub{font-size:1rem;color:rgba(255,255,255,0.72);line-height:1.7;max-width:360px;margin-bottom:2rem}
        .badges{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:1.6rem}
        .badge{background:rgba(255,255,255,0.10);border:1px solid rgba(245,166,35,0.35);border-radius:100px;padding:6px 14px;font-size:0.78rem;color:var(--gold-light);letter-spacing:0.04em;backdrop-filter:blur(6px)}
        .dots-row{position:absolute;top:2.5rem;left:3.5rem;display:grid;grid-template-columns:repeat(6,1fr);gap:8px;opacity:0.22;z-index:2}
        .dot{width:4px;height:4px;border-radius:50%;background:var(--gold)}
        .stats-row{display:flex;align-items:center;gap:14px}
        .avatars{display:flex}
        .avatar{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          font-size:0.75rem;font-weight:700;color:#fff;border:2px solid rgba(255,248,240,0.85);margin-left:-10px}
        .avatars .avatar:first-child{margin-left:0}
        .stats-text{font-size:0.8rem;color:rgba(255,255,255,0.75);line-height:1.5}
        .stats-text b{color:var(--gold-light);font-weight:600}

        /* RIGHT PANEL */
        .right-panel{background:var(--ivory);display:flex;align-items:center;justify-content:center;padding:2.5rem 3rem;position:relative;overflow:hidden}
        .right-panel::before{content:'';position:absolute;top:-60px;right:-60px;width:320px;height:320px;border-radius:50% 10% 50% 10%;border:1.5px solid rgba(255,107,26,0.08);transform:rotate(25deg)}
        .right-panel::after{content:'';position:absolute;bottom:-40px;left:-40px;width:200px;height:200px;border-radius:50% 10% 50% 10%;border:1.5px solid rgba(245,166,35,0.10);transform:rotate(-15deg)}
        .form-card{width:100%;max-width:480px;position:relative;z-index:1}

        /* STEP INDICATOR */
        .stepper{display:flex;align-items:center;justify-content:flex-end;gap:0;margin-bottom:0.6rem}
        .step-item{display:flex;flex-direction:column;align-items:center;gap:6px}
        .step-circle{width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          font-size:0.85rem;font-weight:700;border:2px solid var(--border);color:var(--text-light);background:#fff;transition:all 0.25s}
        .step-circle.done{background:var(--green-india);border-color:var(--green-india);color:#fff}
        .step-circle.active{background:var(--saffron);border-color:var(--saffron);color:#fff;
          box-shadow:0 0 0 4px rgba(255,107,26,0.18)}
        .step-label{font-size:0.7rem;letter-spacing:0.12em;font-weight:600;color:var(--text-light);text-transform:uppercase}
        .step-label.done{color:var(--green-india)}
        .step-label.active{color:var(--saffron)}
        .step-connector{flex:1;height:2px;background:var(--border);margin:0 10px 22px;border-radius:2px;overflow:hidden}
        .step-connector .fill{height:100%;background:var(--green-india);transition:width 0.3s}
        .progress-track{height:4px;width:100%;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:1.8rem}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--saffron),var(--maroon-light));border-radius:4px;transition:width 0.35s}

        /* HEADINGS */
        .form-title{font-size:2rem;font-weight:700;color:var(--text-dark);line-height:1.2;margin-bottom:0.4rem}
        .form-title span{color:var(--saffron)}
        .form-subtitle{font-size:0.9rem;color:var(--text-light);line-height:1.6;margin-bottom:1.6rem}

        /* SOCIAL BUTTONS */
        .social-row{ display:flex;justify-content:center;margin-bottom:1.4rem;}
        .social-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;border-radius:10px;
          border:1.5px solid var(--border);background:#fff;font-size:0.88rem;font-weight:500;color:var(--text-dark);
          cursor:pointer;transition:border-color 0.2s,box-shadow 0.2s,width: 280px;}
        .social-btn:hover{border-color:var(--border-hover);box-shadow:0 2px 10px rgba(255,107,26,0.10)}
        .divider-line{display:flex;align-items:center;gap:10px;margin:0 0 1.6rem;font-size:0.72rem;letter-spacing:0.12em;
          color:var(--text-light);font-weight:600;text-transform:uppercase}
        .divider-line::before,.divider-line::after{content:'';flex:1;height:1px;background:var(--border)}

        /* FIELDS */
        .fields-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
        .field-full{grid-column:1/-1}
        .field{display:flex;flex-direction:column;gap:5px;margin-bottom:1rem}
        .field label{font-size:0.78rem;font-weight:500;color:var(--text-mid);letter-spacing:0.06em;text-transform:uppercase}
        .input-wrap{position:relative;display:flex;align-items:center}
        .input-icon{position:absolute;left:12px;font-size:0.95rem;color:var(--text-light);flex-shrink:0;pointer-events:none}
        .input-wrap input{width:100%;padding:11px 12px 11px 38px;font-size:0.88rem;font-family:'DM Sans',sans-serif;
          color:var(--text-dark);background:#fff;border:1.5px solid var(--border);border-radius:10px;outline:none;
          transition:border-color 0.2s,box-shadow 0.2s}
        .input-wrap input::placeholder{color:var(--text-light);opacity:0.6}
        .input-wrap input:focus{border-color:var(--saffron);box-shadow:0 0 0 3px rgba(255,107,26,0.12)}
        .input-wrap input:hover{border-color:var(--border-hover)}
        .input-wrap.valid input{border-color:var(--green-india)}
        .input-wrap.valid input:focus{box-shadow:0 0 0 3px rgba(19,136,8,0.12)}
        .eye-btn{position:absolute;right:12px;background:none;border:none;cursor:pointer;color:var(--text-light);
          display:flex;align-items:center;padding:0;font-size:1rem}
        .eye-btn:hover{color:var(--saffron)}
        .phone-prefix{position:absolute;left:38px;font-size:0.88rem;color:var(--text-mid);pointer-events:none;font-weight:500}
        .phone-input{padding-left:68px!important}

        /* PASSWORD STRENGTH */
        .strength-track{display:flex;gap:6px;margin-top:8px;margin-bottom:8px}
        .strength-bar{flex:1;height:4px;border-radius:4px;background:var(--border);transition:background 0.25s}
        .strength-label{font-size:0.78rem;font-weight:600;margin-bottom:8px}
        .req-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px 1.2rem;margin-bottom:0.4rem}
        .req-item{font-size:0.78rem;color:var(--text-light);display:flex;align-items:center;gap:6px}
        .req-item::before{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--border)}
        .req-item.met{color:var(--green-india)}
        .req-item.met::before{background:var(--green-india)}

        /* INTERESTS */
        .interests-label{font-size:0.78rem;font-weight:500;color:var(--text-mid);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:0.7rem}
        .interests-label .hint{font-weight:400;text-transform:none;letter-spacing:normal;color:var(--text-light)}
        .interests-grid{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:0.5rem}
        .interest-pill{display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:100px;
          border:1.5px solid var(--border);background:#fff;font-size:0.85rem;color:var(--text-dark);cursor:pointer;
          transition:all 0.18s;font-family:'DM Sans',sans-serif}
        .interest-pill:hover{border-color:var(--border-hover)}
        .interest-pill.selected{background:linear-gradient(135deg,var(--saffron),var(--maroon-light));border-color:transparent;color:#fff;
          box-shadow:0 3px 10px rgba(255,107,26,0.30)}
        .interests-help{font-size:0.78rem;color:var(--text-light);margin-bottom:1.4rem}

        /* TERMS */
        .terms-row{display:flex;align-items:flex-start;gap:10px;margin:0.4rem 0 1.4rem}
        .terms-row input[type="checkbox"]{width:17px;height:17px;accent-color:var(--saffron);flex-shrink:0;margin-top:2px;cursor:pointer}
        .terms-row label{font-size:0.8rem;color:var(--text-light);line-height:1.5;cursor:pointer}
        .terms-row label a{color:var(--saffron);text-decoration:none;font-weight:500}
        .terms-row label a:hover{text-decoration:underline}

        /* BUTTONS */
        .btn-row{display:flex;gap:1rem}
        .btn-back{flex:0 0 auto;padding:14px 20px;font-size:0.95rem;font-weight:500;font-family:'DM Sans',sans-serif;
          color:var(--text-mid);background:#fff;border:1.5px solid var(--border);border-radius:12px;cursor:pointer;
          display:flex;align-items:center;gap:8px;transition:border-color 0.2s}
        .btn-back:hover{border-color:var(--border-hover)}
        .btn-primary{flex:1;padding:14px;font-size:0.95rem;font-weight:500;font-family:'DM Sans',sans-serif;letter-spacing:0.04em;
          color:#fff;background:linear-gradient(135deg,var(--saffron) 0%,var(--maroon-light) 100%);border:none;border-radius:12px;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.15s,box-shadow 0.2s;
          box-shadow:0 6px 24px rgba(255,107,26,0.30)}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(255,107,26,0.38)}
        .btn-primary:active{transform:scale(0.98)}
        .btn-primary:disabled{opacity:0.55;cursor:not-allowed;transform:none;box-shadow:none}
        .btn-primary.success{background:linear-gradient(135deg,var(--green-india),#0d6306)}

        .signin-link{text-align:center;margin-top:1.3rem;font-size:0.83rem;color:var(--text-light)}
        .signin-link a{color:var(--saffron);font-weight:500;text-decoration:none}
        .signin-link a:hover{text-decoration:underline}

        @media(max-width:860px){
          .page{grid-template-columns:1fr}
          .left-panel{min-height:300px;padding:2rem}
          .left-headline{font-size:2.2rem}
          .right-panel{padding:2rem 1.5rem}
          .fields-grid{grid-template-columns:1fr}
          .field-full{grid-column:1}
          .dots-row{display:none}
          .social-row{grid-template-columns:1fr}
          .stepper{justify-content:space-between}
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

        .dark .input-wrap input,
        .dark .interest-pill,
        .dark .btn-back {
          background: #0d1527 !important;
          color: #f8fafc !important;
          border-color: #2a3b5c !important;
        }

        .dark .interest-pill:hover,
        .dark .btn-back:hover {
          border-color: #fb923c !important;
        }

        .dark .step-circle {
          background: #121a2d !important;
          border-color: #23324d !important;
          color: #94a3b8 !important;
        }

        .dark .step-circle.active,
        .dark .step-circle.done {
          background: #FF6B1A !important;
          color: #ffffff !important;
        }
      `}</style>

      {/* LEFT PANEL */}
      <div className="left-panel">
        <div className="left-bg" />
        <div className="lotus-overlay" />
        <div className="geo-border" />
        <div className="mandala" />
        <div className="dots-row">
          {Array.from({ length: 18 }).map((_, i) => (
            <span className="dot" key={i} />
          ))}
        </div>
        <div className="left-content">
          <div className="brand">
           
           <div className="brand-logo">
  <img src={getMediaUrl("logo.jpg")} alt="Travel in Depth logo" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "14px" }} />
</div>
            <div className="brand-name">
              Travel in Depth
              <span>Discover Incredible India</span>
            </div>
          </div>

          <h1 className="left-headline">
            Every journey
            <br />
            begins with
            <br />
            <em>one step.</em>
          </h1>
          <p className="left-sub">
            From the snow-capped Himalayas to the sun-kissed shores of Kerala
            — your next unforgettable adventure awaits.
          </p>

          <div className="badges">
            <span className="badge">🏔️ Himalayan Treks</span>
            <span className="badge">🕌 Heritage Sites</span>
            <span className="badge">🌊 Coastal Escapes</span>
            <span className="badge">🎨 Cultural Tours</span>
          </div>

          <div className="stats-row">
            <div className="avatars">
              {AVATAR_LETTERS.map((l, i) => (
                <div
                  className="avatar"
                  style={{ background: AVATAR_COLORS[i] }}
                  key={l}
                >
                  {l}
                </div>
              ))}
            </div>
            <p className="stats-text">
              <b>12,400+ explorers</b> have already joined.
              <br />
              New destinations added every week.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <div className="form-card">
          {/* Stepper */}
          <div className="stepper">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="step-item">
                  <div
                    className={
                      "step-circle " +
                      (step > s.id ? "done" : step === s.id ? "active" : "")
                    }
                  >
                    {step > s.id ? "✓" : s.id}
                  </div>
                  <span
                    className={
                      "step-label " +
                      (step > s.id ? "done" : step === s.id ? "active" : "")
                    }
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="step-connector">
                    <div
                      className="fill"
                      style={{ width: step > s.id ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          {signupError && (
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
              <span>⚠️</span> {signupError}
            </div>
          )}

          <form onSubmit={goNext}>
            {/* STEP 1: ACCOUNT */}
            {step === 1 && (
              <>
                <h2 className="form-title">
                  Create your <span>account</span>
                </h2>
                <p className="form-subtitle">
                  Quick sign up via social or fill in your details below.
                </p>

                <div className="social-row">
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


                <div className="divider-line">Or continue with email</div>

                <div className="field field-full">
                  <label htmlFor="fullname">Full name</label>
                  <div className="input-wrap">
                    <span className="input-icon">👤</span>
                    <input
                      id="fullname"
                      type="text"
                      placeholder="Arjun Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="field field-full">
                  <label htmlFor="email">Email address</label>
                  <div className="input-wrap">
                    <span className="input-icon">✉️</span>
                    <input
                      id="email"
                      type="email"
                      placeholder="arjun@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="btn-row">
                  <button type="submit" className="btn-primary">
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* STEP 2: SECURITY */}
            {step === 2 && (
              <>
                <h2 className="form-title">
                  Set your <span>password</span>
                </h2>
                <p className="form-subtitle">
                  Make it strong — your adventures deserve protection.
                </p>

                <div className="field field-full">
                  <label htmlFor="password">Password</label>
                  <div className="input-wrap">
                    <span className="input-icon">🔒</span>
                    <input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowPwd((s) => !s)}
                      aria-label="Toggle password visibility"
                    >
                      {showPwd ? "🙈" : "👁️"}
                    </button>
                  </div>

                  <div className="strength-track">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          background:
                            i < strength.score ? strength.color : "var(--border)",
                        }}
                      />
                    ))}
                  </div>
                  <p
                    className="strength-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </p>

                  <div className="req-grid">
                    <span
                      className={"req-item " + (strength.checks.length ? "met" : "")}
                    >
                      8+ characters
                    </span>
                    <span
                      className={"req-item " + (strength.checks.upper ? "met" : "")}
                    >
                      Uppercase letter
                    </span>
                    <span
                      className={"req-item " + (strength.checks.number ? "met" : "")}
                    >
                      Number
                    </span>
                    <span
                      className={"req-item " + (strength.checks.special ? "met" : "")}
                    >
                      Special character
                    </span>
                  </div>
                </div>

                <div className="field field-full">
                  <label htmlFor="confirm">Confirm password</label>
                  <div
                    className={
                      "input-wrap " +
                      (confirm && confirm === password ? "valid" : "")
                    }
                  >
                    <span className="input-icon">🔒</span>
                    <input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="eye-btn"
                      onClick={() => setShowConfirm((s) => !s)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div className="btn-row">
                  <button type="button" className="btn-back" onClick={goBack}>
                    ← Back
                  </button>
                  <button type="submit" className="btn-primary">
                    Continue →
                  </button>
                </div>
              </>
            )}

            {/* STEP 3: PROFILE */}
            {step === 3 && (
              <>
                <h2 className="form-title">
                  Your <span>travel profile</span>
                </h2>
                <p className="form-subtitle">
                  Help us personalise your experience from day one.
                </p>

                <div className="fields-grid">
                  <div className="field">
                    <label htmlFor="phone">Phone number</label>
                    <div className="input-wrap">
                      <span className="input-icon">📞</span>
                      <span className="phone-prefix">+91</span>
                      <input
                        id="phone"
                        type="tel"
                        className="phone-input"
                        placeholder="98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="location">Location</label>
                    <div className="input-wrap">
                      <span className="input-icon">📍</span>
                      <input
                        id="location"
                        type="text"
                        placeholder="Search city..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--saffron)" }}
                      >
                        ⌖ GPS
                      </button>
                    </div>
                  </div>
                </div>

                <p className="interests-label">
                  What excites you most? <span className="hint">(Pick any)</span>
                </p>
                <div className="interests-grid">
                  {INTERESTS.map((interest) => (
                    <button
                      type="button"
                      key={interest.id}
                      className={
                        "interest-pill " +
                        (interests.includes(interest.id) ? "selected" : "")
                      }
                      onClick={() => toggleInterest(interest.id)}
                    >
                      <span>{interest.icon}</span>
                      {interest.label}
                    </button>
                  ))}
                </div>
                <p className="interests-help">
                  Select at least 1 interest to personalise your dashboard
                </p>

                <div className="terms-row">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    I agree to the <a href="#">Terms of Service</a> and{" "}
                    <a href="#">Privacy Policy</a>. I consent to receiving
                    travel updates and destination guides from Travel in
                    Depth.
                  </label>
                </div>

                <div className="btn-row">
                  <button type="button" className="btn-back" onClick={goBack} disabled={submitting}>
                    ← Back
                  </button>
                  <button
                    type="submit"
                    className={"btn-primary " + (submitted ? "success" : "")}
                    disabled={!agreed || interests.length === 0 || submitting}
                  >
                    {submitting ? "Creating Account..." : submitted ? "✓ Account Created!" : "📍 Begin Your Journey"}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="signin-link">
            Already have an account? <Link to="/login" state={{ from: redirectTarget }}>Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}