import React, { useState } from "react";
import API from "../api/axios";

const AdminInbox = ({ messages, refreshMessages, theme }) => {
    const [replyData, setReplyData] = useState({ id: null, text: "" });

    const handleSendReply = async (id) => {
        try {
            await API.put(`/messages/${id}/reply`, { reply_text: replyData.text });
            alert("Reply sent! 🚀");
            setReplyData({ id: null, text: "" }); 
            refreshMessages(); 
        } catch (err) {
            alert("Failed to send reply.");
        }
    };

    const cardStyle = {
        background: theme?.card || "#fff",
        padding: "20px",
        borderRadius: "15px",
        marginBottom: "15px",
        boxShadow: theme?.shadow,
        border: `1px solid ${theme?.border}`,
        color: theme?.text,
        textAlign: "left"
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{ color: theme?.text }}>Messages</h2>
            {messages.map((m) => (
                <div key={m.id} style={cardStyle}>
                    <p><strong>From:</strong> {m.name} ({m.email})</p>
                    <p><strong>Message:</strong> {m.message}</p>
                    
                    {m.reply_text && (
                        <div style={{ background: "rgba(16,185,129,0.1)", padding: "10px", borderRadius: "8px", marginTop: "10px", borderLeft: "4px solid #10b981" }}>
                            <p style={{ margin: 0, color: "#10b981" }}><strong>Your Reply:</strong> {m.reply_text}</p>
                        </div>
                    )}

                    {replyData.id === m.id ? (
                        <div style={{ marginTop: "15px" }}>
                            <textarea
                                value={replyData.text}
                                onChange={(e) => setReplyData({ ...replyData, text: e.target.value })}
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                                placeholder="Type your reply..."
                            />
                            <button onClick={() => handleSendReply(m.id)} style={{ background: "#ec4899", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", marginTop: "10px" }}>Send</button>
                            <button onClick={() => setReplyData({ id: null, text: "" })} style={{ marginLeft: "10px", background: "none", border: "none", color: theme?.textSub, cursor: "pointer" }}>Cancel</button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => setReplyData({ id: m.id, text: m.reply_text || "" })}
                            style={{ marginTop: "10px", background: "#f3f4f6", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}
                        >
                            {m.reply_text ? "Edit Reply" : "Reply"}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminInbox;
