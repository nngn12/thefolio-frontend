import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return setError("Please fill in all fields");
        if (password.length < 6) return setError("Password must be at least 6 characters");
        setLoading(true); setError("");
        const result = await register({ name, email, password });
        setLoading(false);
        result.success ? navigate("/home") : setError(result.message);
    };

    const inputStyle = {
        width: "100%", padding: "13px 16px", borderRadius: "10px",
        border: `1px solid ${t.border}`, fontSize: "14px", fontFamily: t.fontSans,
        background: t.input, color: t.text, outline: "none",
        transition: "border-color 0.2s", boxSizing: "border-box",
    };
    const labelStyle = { display: "block", fontSize: "12px", fontWeight: "500", letterSpacing: "0.06em", textTransform: "uppercase", color: t.textMuted, marginBottom: "6px" };

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
            <div style={{ position: "fixed", top: "15%", left: "12%", width: "300px", height: "300px", borderRadius: "50%", background: isDark ? "rgba(190,24,93,0.04)" : "rgba(190,24,93,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

            <div style={{ width: "100%", maxWidth: "400px", background: t.card, border: `1px solid ${t.border}`, padding: "48px 40px", borderRadius: "16px", boxShadow: t.shadow, animation: "fadeUp 0.5s ease both" }}>
                <div style={{ textAlign: "center", marginBottom: "36px" }}>
                    <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "32px", fontWeight: "400", color: t.text, marginBottom: "8px" }}>Create account</h1>
                    <p style={{ fontSize: "13px", color: t.textMuted }}>Join Captured Memories today</p>
                </div>

                {error && <div style={{ padding: "11px 14px", borderRadius: "8px", marginBottom: "20px", background: isDark ? "rgba(190,24,93,0.1)" : "#fef2f2", border: `1px solid rgba(190,24,93,0.2)`, fontSize: "13px", color: t.danger }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[{ label: "Name", type: "text", val: name, set: setName, ph: "Your full name" },
                      { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com" },
                      { label: "Password", type: "password", val: password, set: setPassword, ph: "Min. 6 characters" }].map(f => (
                        <div key={f.label}>
                            <label style={labelStyle}>{f.label}</label>
                            <input type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} style={inputStyle} />
                        </div>
                    ))}
                    <button type="submit" disabled={loading} style={{
                        width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                        background: loading ? t.border : t.pinkGrad,
                        color: "white", fontFamily: t.fontSans, fontWeight: "600", fontSize: "14px",
                        letterSpacing: "0.04em", cursor: loading ? "not-allowed" : "pointer",
                        boxShadow: loading ? "none" : "0 4px 16px rgba(190,24,93,0.3)", marginTop: "4px",
                    }}>{loading ? "Creating account…" : "Create Account"}</button>
                </form>

                <p style={{ textAlign: "center", marginTop: "28px", fontSize: "13px", color: t.textMuted }}>
                    Already have an account?{" "}
                    <Link to="/login" style={{ color: t.pink, fontWeight: "500", textDecoration: "none" }}>Sign in</Link>
                </p>
            </div>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};
export default RegisterPage;
