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

    useEffect(() => {
        Promise.all([API.get(`/posts/${id}`), API.get(`/comments/${id}`)])
            .then(([p, c]) => { setPost(p.data); setComments(c.data); })
            .catch(() => navigate("/home"))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm("Delete this post?")) return;
        await API.delete(`/posts/${id}`);
        navigate("/home");
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
            alert(err.response?.data?.message || "Failed");
        } finally {
            setSubmitting(false);
        }
    };

    const delComment = async (cid) => {
        await API.delete(`/comments/${cid}`);
        setComments(prev => prev.filter(c => c.id !== cid));
    };

    if (loading) return (
        <div style={{ background: t.bg, minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: `1px solid ${t.border}`, borderTop: `1px solid ${t.pink}`, animation: "spin 1.2s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
    if (!post) return null;

    const isOwner = user && (user.id === post.author_id);
    const isAdmin = user?.role === "admin";

    const miniAvatar = (name, pic) => (
        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: t.pinkGrad, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "11px", fontWeight: "700", overflow: "hidden", flexShrink: 0 }}>
            {pic ? <img src={`http://localhost:5000/uploads/${pic}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : name?.[0]?.toUpperCase()}
        </div>
    );

    return (
        <div style={{ fontFamily: t.fontSans, background: t.bg, minHeight: "100vh", paddingBottom: "80px" }}>
            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "48px 24px 0" }}>
                <button onClick={() => navigate("/home")} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: "13px", fontFamily: t.fontSans, marginBottom: "36px", padding: "0", display: "flex", alignItems: "center", gap: "6px" }}>
                    ← Back to memories
                </button>

                <article style={{ animation: "fadeUp 0.5s ease both" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}>
                        {miniAvatar(post.author_name, post.author_pic)}
                        <div>
                            <span style={{ fontSize: "13px", color: t.textSub, fontWeight: "500" }}>{post.author_name}</span>
                            <span style={{ fontSize: "12px", color: t.textMuted, marginLeft: "10px" }}>
                                {new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </span>
                        </div>
                    </div>

                    <h1 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "clamp(30px, 5vw, 46px)", fontWeight: "400", color: t.text, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "28px" }}>
                        {post.title}
                    </h1>

                    {(() => {
                        const images = post.image ? [post.image] : [];
                        if (images.length === 0) return null;
                        return (
                            <div style={{ display: "grid", gap: "10px", marginBottom: "36px" }}>
                                {images.map((img, idx) => (
                                    <img key={`${img}-${idx}`} src={`http://localhost:5000/uploads/${img}`} alt={`${post.title} ${idx + 1}`}
                                        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "10px", display: "block" }} />
                                ))}
                            </div>
                        );
                    })()}

                    <div style={{ fontSize: "17px", color: t.textSub, lineHeight: "1.85", whiteSpace: "pre-wrap", borderBottom: `1px solid ${t.border}`, paddingBottom: "40px", marginBottom: "40px" }}>
                        {post.body}
                    </div>

                    {(isOwner || isAdmin) && (
                        <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
                            <button onClick={() => navigate(`/edit/${id}`)} style={{ padding: "9px 22px", borderRadius: "8px", border: `1px solid ${t.border}`, background: "transparent", color: t.textSub, fontFamily: t.fontSans, fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                                Edit post
                            </button>
                            <button onClick={handleDelete} style={{ padding: "9px 22px", borderRadius: "8px", border: "1px solid rgba(190,24,93,0.2)", background: isDark ? "rgba(190,24,93,0.06)" : "#fff0f3", color: t.pink, fontFamily: t.fontSans, fontSize: "13px", fontWeight: "500", cursor: "pointer" }}>
                                Delete
                            </button>
                        </div>
                    )}
                </article>

                <section>
                    <h3 style={{ fontFamily: t.fontSerif, fontStyle: "italic", fontSize: "24px", fontWeight: "400", color: t.text, marginBottom: "24px" }}>
                        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
                    </h3>

                    {comments.length === 0 && <p style={{ fontSize: "14px", color: t.textMuted, marginBottom: "32px", fontStyle: "italic" }}>No comments yet — be the first.</p>}

                    <div style={{ marginBottom: "32px" }}>
                        {comments.map(c => (
                            <div key={c.id} style={{ display: "flex", gap: "12px", padding: "18px 0", borderBottom: `1px solid ${t.border}` }}>
                                {miniAvatar(c.author_name, c.author_pic)}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <span style={{ fontSize: "13px", fontWeight: "600", color: t.pink }}>{c.author_name}</span>
                                            <span style={{ fontSize: "12px", color: t.textMuted, marginLeft: "10px" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {(user?.id === c.author_id || isAdmin) && (
                                            <button onClick={() => delComment(c.id)} style={{ background: "none", border: "none", color: t.textMuted, cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0 4px" }}>×</button>
                                        )}
                                    </div>
                                    <p style={{ fontSize: "14px", color: t.textSub, lineHeight: "1.65", marginTop: "4px" }}>{c.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {user ? (
                        <form onSubmit={handleComment} style={{ display: "flex", gap: "10px" }}>
                            <input type="text" placeholder="Leave a comment…" value={commentBody}
                                onChange={e => setCommentBody(e.target.value)}
                                style={{ flex: 1, padding: "12px 16px", borderRadius: "8px", border: `1px solid ${t.border}`, background: t.input, color: t.text, fontFamily: t.fontSans, fontSize: "14px", outline: "none" }} />
                            <button type="submit" disabled={submitting} style={{ padding: "12px 24px", borderRadius: "8px", border: "none", background: t.pinkGrad, color: "white", fontFamily: t.fontSans, fontWeight: "600", fontSize: "13px", cursor: submitting ? "wait" : "pointer", boxShadow: "0 3px 12px rgba(190,24,93,0.25)", whiteSpace: "nowrap" }}>
                                {submitting ? "…" : "Post"}
                            </button>
                        </form>
                    ) : (
                        <p style={{ fontSize: "14px", color: t.textMuted, fontStyle: "italic" }}>
                            <span style={{ color: t.pink, cursor: "pointer" }} onClick={() => navigate("/login")}>Sign in</span> to leave a comment.
                        </p>
                    )}
                </section>
            </div>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>
        </div>
    );
};

export default PostPage;