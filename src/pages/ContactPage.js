import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getTheme } from "../theme";
import API from "../api/axios";

// 1. ADDED THIS: Create a base URL for the image by removing '/api' from your environment variable
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
    const [userMessages, setUserMessages] = useState([]);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const fetchUserInbox = async () => {
    // We use the email from the form or the logged-in user
    const emailToFetch = formData.email || user?.email;

    if (emailToFetch) {
        try {
            // FIXED URL: removed "/admin"
            const res = await API.get("/messages"); 
            
            // Filter the messages so this user only sees theirs
            const filtered = res.data.filter(m => m.email === emailToFetch);
            setUserMessages(filtered);
        } catch (err) {
            console.error("Error fetching inbox:", err);
        }
    }
};

    useEffect(() => {
        fetchUserInbox();
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    // ... validation logic ...

    try {
        // FIXED URL: removed "/admin" 
        // formData contains { name, email, message } from your inputs
        await API.post("/messages", formData); 
        
        setSuccess(true);
        setFormData(prev => ({ ...prev, message: "" })); // Clear only the message box
        fetchUserInbox(); // Refresh the list below
        setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
        console.error("Submission error:", err.response?.data);
        alert("Failed to send message.");
    }
};

    // USER REPLY LOGIC: Appends text to the thread and marks as unread for admin
    const handleUserReply = async (msgId, currentMessage) => {
        const reply = window.prompt("Type your reply to the Admin:");
        if (reply && reply.trim() !== "") {
            try {
                const updatedText = `${currentMessage}\n\n(User Reply): ${reply}`;
                // This marks 'read' as false so the Admin sees the new notification
                await API.put(`/admin/messages/${msgId}`, {
                    message: updatedText,
                    read: false
                });
                fetchUserInbox();
            } catch (err) {
                alert("Failed to send reply.");
            }
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

                {/* 2. RESTORED INBOX SECTION */}
                {userMessages.length > 0 && (
                    <div style={{ ...card, textAlign: "left" }}>
                        <h2 style={{ color: t.text, marginBottom: "16px", textAlign: "center", fontSize: "18px" }}>Inbox</h2>
                        <div style={{ maxHeight: "400px", overflowY: "auto", paddingRight: "5px" }}>
                            {userMessages.map((m) => (
                                <div key={m.id} style={{
                                    marginBottom: "16px",
                                    paddingBottom: "16px",
                                    borderBottom: `1px solid ${t.border}`
                                }}>
                                    <div style={{ marginBottom: "8px" }}>
                                        <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: t.pink }}>
                                            {m.name}
                                        </p>
                                        <p style={{ margin: "4px 0", fontSize: "14px", color: t.text, whiteSpace: "pre-wrap" }}>
                                            {m.message}
                                        </p>
                                    </div>

                                    {m.reply_text && (
                                        <div style={{
                                            marginTop: "10px",
                                            padding: "10px",
                                            borderRadius: "8px",
                                            background: isDark ? "rgba(255, 255, 255, 0.05)" : "#f9f9f9",
                                            borderLeft: `4px solid ${t.pink}`
                                        }}>
                                            <p style={{ margin: 0, fontSize: "13px", color: t.text }}>
                                                <strong>Admin:</strong> {m.reply_text}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleUserReply(m.id, m.message)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            color: t.pink,
                                            fontSize: "12px",
                                            cursor: "pointer",
                                            marginTop: "10px",
                                            padding: 0,
                                            textDecoration: "underline",
                                            fontWeight: "600"
                                        }}
                                    >
                                        Reply to Admin
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. MAP SECTION */}
                <div style={card}>
                    <h2 style={{ color: t.text, marginBottom: "6px" }}>My Location</h2>
                    <p style={{ color: t.textSub, marginBottom: "12px" }}>This is a general location map for reference only.</p>
                    {/* 2. ADDED THIS: Swapped localhost for the BASE_URL variable */}
                    <img src={`${BASE_URL}/uploads/map.png`} alt="Map" style={{ width: "100%", borderRadius: "10px" }} />
                </div>
            </main>
            <footer style={{ textAlign: "center", color: t.textMuted }}><p><strong>♥ Just us ♥</strong></p></footer>
        </div>
    );
};

export default ContactPage;
