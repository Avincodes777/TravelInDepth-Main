import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../features/auth/useAuth";

function AdminLoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      if (user.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }
      const user = await loginWithGoogle(credentialResponse.credential);
      if (user.role !== "admin") {
        setError("This account does not have admin access.");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(err.message || "Google sign in failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    setError("Google sign in failed. Please try again.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDF6EC" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 12, width: 320, display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#8B1A1A" }}>Admin Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E8DCC4" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #E8DCC4" }}
        />
        {error && <p style={{ color: "red", fontSize: 13 }}>{error}</p>}
        <button
          type="submit"
          style={{ padding: "10px 20px", borderRadius: 8, background: "#8B1A1A", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}
        >
          Log In
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0", color: "#A07850", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(245,166,35,0.3)" }} />
          <span>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(245,166,35,0.3)" }} />
        </div>

        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
      </form>
    </div>
  );
}

export default AdminLoginPage;