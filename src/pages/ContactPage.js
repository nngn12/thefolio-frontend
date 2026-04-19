import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const BASE_URL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const ContactPage = () => {
    const { isDark } = useTheme();
    const { user } = useAuth();
    const t = getTheme(isDark);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        message: ""
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        if (!formData.message.trim()) newErrors.message = "Message is required";

        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        try {
            await API.post("/messages", formData); // Corrected route
            setSuccess(true);
            setFormData(prev => ({ ...prev, message: "" }));
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            alert("Failed to send message.");
        }
    };

    const inputStyle = { width: "100%", padding: "12px", marginTop: "6px", borderRadius: "10px", border: `1px solid ${t.border}`, outline: "none", background: t.input, color: t.text, fontSize: "14px", boxSizing: "border-box" };
    const labelStyle = { fontSize: "13px", color: t.text, fontWeight: "600" };
    const card = { width: "100%", maxWidth: "500px", background: t.card, backdropFilter: "blur(10px)", padding: "30px", borderRadius: "20px", boxShadow: t.shadow, marginBottom: "20px", textAlign: "center" };

    return (
        <div style={{ fontFamily: "'Segoe UI', sans-serif", background: t.bg, minHeight: "100vh", paddingBottom: "40px" }}>
            <main style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>

                {/* 1. CONTACT FORM */}
                <div style={card}>
                    <h2 style={{ color: t.text, marginBottom: "6px" }}>Contact Us</h2>
                    <p style={{ color: t.textSub, marginBottom: "20px" }}>Feel free to send us a message anytime 💌</p>

                    {success && (
                        <div style={{ color: "#10b981", background: isDark ? "rgba(16,185,129,0.1)" : "#d1fae5", padding: "12px", borderRadius: "10px", marginBottom: "16px" }}>
                            Message sent! 🌸
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelStyle}>Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} />
                            {errors.name && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.name}</div>}
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelStyle}>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} style={inputStyle} />
                            {errors.email && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.email}</div>}
                        </div>
                        <div style={{ marginBottom: "14px" }}>
                            <label style={labelStyle}>Message</label>
                            <textarea name="message" value={formData.message} onChange={handleChange}
                                style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }} />
                            {errors.message && <div style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.message}</div>}
                        </div>
                        <button type="submit" style={{ marginTop: "6px", padding: "12px", width: "100%", borderRadius: "10px", border: "none", background: t.pinkGrad, color: "white", fontWeight: "bold", cursor: "pointer" }}>
                            Send Message
                        </button>
                    </form>
                </div>

                {/* 2. MAP SECTION */}
                <div style={card}>
                    <h2 style={{ color: t.text, marginBottom: "6px" }}>My Location</h2>
                    <p style={{ color: t.textSub, marginBottom: "12px" }}>This is a general location map for reference only.</p>
                    <img src={`${BASE_URL}/uploads/map.png`} alt="Map" style={{ width: "100%", borderRadius: "10px" }} />
                </div>
            </main>
            <footer style={{ textAlign: "center", color: t.textMuted }}><p><strong>♥ Just us ♥</strong></p></footer>
        </div>
    );
};

export default ContactPage;
