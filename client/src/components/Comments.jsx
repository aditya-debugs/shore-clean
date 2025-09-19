// components/Comments.jsx
import { useEffect, useState } from "react";

const Comments = ({ eventId, userId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8000/api/comments/${eventId}`)
      .then((res) => res.json())
      .then(setComments);
  }, [eventId]);

  const addComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(`http://localhost:8000/api/comments/${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment, userId }),
    });
    const data = await res.json();
    setComments((prev) => [...prev, data]);
    setNewComment("");
  };

  const deleteComment = async (id) => {
    await fetch(`http://localhost:8000/api/comments/${id}`, {
      method: "DELETE",
    });
    setComments((prev) => prev.filter((c) => c._id !== id));
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-bold mb-2">Comments</h3>
      
      {comments.map((c) => (
        <div key={c._id} className="flex justify-between items-center mb-2">
          <p className="text-sm">{c.userId?.name || "Anonymous"}: {c.text}</p>
          {c.userId?._id === userId && (
            <button
              onClick={() => deleteComment(c._id)}
              className="text-red-500 text-xs"
            >
              Delete
            </button>
          )}
        </div>
      ))}

      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 border px-2 py-1 rounded"
        />
        <button
          onClick={addComment}
          className="bg-blue-500 text-white px-3 py-1 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Comments;
