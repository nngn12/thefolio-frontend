import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { getTheme } from "../theme";
import API from "../api/axios";

const PostPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = getTheme(isDark);
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentBody, setCommentBody] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const BACKEND_URL = "https://thefolio-backend.onrender.com";

    useEffect(() => {
        Promise.all([
            API.get(`/posts/${id}`), 
            API.get(`/comments/${id}`)
        ])
        .then(([p, c]) => { 
            setPost(p.data); 
            setComments(c.data); 
        })
        .catch(() => navigate("/home"))
        .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await API.delete(`/posts/${id}`);
            navigate("/home");
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!commentBody.trim()) return;
        setSubmitting(true);
        try {
            const res = await API.post(`/comments/${id}`, { body: commentBody });
            setComments(prev => [...prev, res.data]);
            setCommentBody("");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    const delComment = async (cid) => {
        try {
            await API.delete(`/comments/${cid}`);
            setComments(prev => prev.filter(c => c.id !== cid));
        } catch (err) {
            alert("Delete comment failed");
        }
    };

    if (loading) return (
        <div style={{ background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${t.border}`, borderTop: `1px solid ${t.pink}`, animation: "spin 1.2s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (!post) return null;

    const isAdmin = user?.role === "admin";
    const isOwner = user && (user.id === post.author_id || user._id === post.author_id);

    const miniAvatar = (name, pic) => {
        const avatarSrc = pic?.startsWith('http') ? pic : `${BACKEND_URL}/uploads/${pic}`;
        return (
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: t.pinkGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "11px", fontWeight: "700", overflow: "hidden", flexShrink: 0 }}>
                {pic ? <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name?.[0]?.toUpperCase()}
            </div>
        );
    };

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 24px 0" }}>
                
                <button 
                    onClick={() => isAdmin ? navigate("/admin") : navigate("/home")} 
                    style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "13px", marginBottom: "36px", padding: "0", display: "flex", alignItems: "center", gap: "6px" }}
                >
                    ← {isAdmin ? "Back to Dashboard" : "Back to memories"}
                </button>

                <article>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                        {miniAvatar(post.author_name, post.author_pic)}
                        <div>
                            <span style={{ fontSize: "13px", color: t.textSub, fontWeight: "500" }}>{post.author_name}</span>
                            <span style={{ fontSize: "12px", color: t.textMuted, marginLeft: "10px" }}>
                                {new Date(post.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "clamp(30px, 5vw, 46px)", color: t.text, marginBottom: "28px" }}>
                        {post.title}
                    </h1>

                    <div style={{ display: "grid", gap: "12px", marginBottom: "36px" }}>
                        {post.image && post.image.split(',').map((img, idx) => (
                            <img key={idx} src={img} alt="" style={{ width: "100%", borderRadius: "12px" }} />
                        ))}
                    </div>

                    <div style={{ fontSize: "17px", color: t.textSub, lineHeight: "1.85", whiteSpace: "pre-wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: "40px", marginBottom: "40px" }}>
                        {post.body}
                    </div>

                    {(isOwner || isAdmin) && (
                        <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
                            <button onClick={() => navigate(`/edit/${id}`)} style={{ padding: "9px 22px", borderRadius: "8px", border: `1px solid ${t.border}`, color: t.textSub, cursor: "pointer" }}>Edit</button>
                            <button onClick={handleDelete} style={{ padding: "9px 22px", borderRadius: "8px", border: "1px solid #ff4d4f", color: "#ff4d4f", cursor: "pointer" }}>Delete</button>
                        </div>
                    )}
                </article>

                <section>
                    <h3 style={{ fontFamily: t.fontSerif, fontSize: "24px", color: t.text, marginBottom: "24px" }}>
                        {comments.length} Comments
                    </h3>

                    {comments.map(c => (
                        <div key={c.id} style={{ display: "flex", gap: "12px", padding: "18px 0", borderBottom: `1px solid ${t.border}` }}>
                            {miniAvatar(c.author_name, c.author_pic)}
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ fontSize: "13px", fontWeight: "600", color: t.pink }}>
                                        {c.author_name}
                                        {c.author_role === "admin" && (
                                            <span style={{ marginLeft: '6px', fontSize: '9px', background: t.pink, color: 'white', padding: '2px 4px', borderRadius: '4px' }}>ADMIN</span>
                                        )}
                                    </span>
                                    {(user?.id === c.author_id || user?._id === c.author_id || isAdmin) && (
                                        <button onClick={() => delComment(c.id)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer" }}>×</button>
                                    )}
                                </div>
                                <p style={{ fontSize: "14px", color: t.textSub, marginTop: "4px" }}>{c.body}</p>
                            </div>
                        </div>
                    ))}

                    {user && (
                        <form onSubmit={handleComment} style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                            <input type="text" placeholder="Comment..." value={commentBody} onChange={e => setCommentBody(e.target.value)} style={{ flex: 1, padding: "12px", borderRadius: "8px", border: `1px solid ${t.border}` }} />
                            <button type="submit" disabled={submitting} style={{ padding: "12px 24px", borderRadius: "8px", background: t.pinkGrad, color: "white" }}>
                                {submitting ? "..." : "Post"}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </div>
    );
};

export default PostPage;
