import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";

const VerifyPage = () => {
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email passed from RegisterPage, or default to empty
    const email = location.state?.email || "";
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            // Requirement 2: Submit OTP for verification
            await API.post("/auth/verify-otp", { email, otp });
            alert("Account verified successfully! 🌸");
            navigate("/login");
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center",
            background: t.bg, padding: "20px"
        }}>
            <div style={{
                background: t.card, padding: "40px", borderRadius: "20px",
                border: `1px solid ${t.border}`, width: "100%", maxWidth: "400px",
                textAlign: "center", boxShadow: t.shadow
            }}>
                <h2 style={{ fontFamily: t.fontSerif, fontStyle: "italic", color: t.text, marginBottom: "10px" }}>
                    Verify Your Account
                </h2>
                <p style={{ color: t.textSub, fontSize: "14px", marginBottom: "25px" }}>
                    We sent a code to <br /><strong>{email}</strong>
                </p>

                <form onSubmit={handleVerify}>
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        style={{
                            width: "100%", padding: "12px", borderRadius: "10px",
                            border: `1px solid ${t.border}`, background: t.bg,
                            color: t.text, textAlign: "center", fontSize: "18px",
                            letterSpacing: "4px", marginBottom: "20px"
                        }}
                    />

                    {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "15px" }}>{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%", padding: "12px", borderRadius: "10px",
                            background: t.pinkGrad, color: "white", fontWeight: "600",
                            border: "none", cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <p
                    onClick={() => navigate("/register")}
                    style={{ marginTop: "20px", fontSize: "12px", color: t.pink, cursor: "pointer" }}
                >
                    Didn't get a code? Try registering again.
                </p>
            </div>
        </div>
    );
};

export default VerifyPage;