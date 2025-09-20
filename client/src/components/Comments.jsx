import React, { useEffect, useState } from "react";
import { User, Trash2, Send, MessageCircle, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Comments = ({ eventId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [eventId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/comments/${eventId}`);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    try {
      setSubmitting(true);
      const response = await api.post(`/comments/${eventId}`, {
        text: newComment.trim(),
        userId: currentUser.id || currentUser._id,
      });

      // Add the new comment to the list with user info
      const commentWithUser = {
        ...response.data,
        userId: {
          _id: currentUser.id || currentUser._id,
          name: currentUser.name,
        },
      };

      setComments((prev) => [...prev, commentWithUser]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addComment();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-cyan-600" />
          <h3 className="text-xl font-bold text-gray-800">
            Comments ({comments.length})
          </h3>
        </div>
      </div>

      {/* Comments List */}
      <div className="max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-12 px-6">
            <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No comments yet</p>
            <p className="text-gray-400 text-sm">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {comment.userId?.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {comment.userId?.name || "Anonymous"}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Button */}
                  {currentUser &&
                    (comment.userId?._id === currentUser.id ||
                      comment.userId?._id === currentUser._id) && (
                      <button
                        onClick={() => deleteComment(comment._id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                        title="Delete comment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                </div>

                {/* Comment Text */}
                <p className="text-gray-700 leading-relaxed pl-13">
                  {comment.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      {currentUser ? (
        <div className="border-t border-gray-100 p-6 bg-gray-50">
          <div className="flex space-x-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {currentUser.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts about this event..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none"
                rows="3"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-gray-500">
                  Press Enter to post, Shift+Enter for new line
                </span>
                <button
                  onClick={addComment}
                  disabled={!newComment.trim() || submitting}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {submitting ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {submitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 p-6 bg-gray-50 text-center">
          <p className="text-gray-500">
            Please{" "}
            <a
              href="/login"
              className="text-cyan-600 hover:text-cyan-800 font-semibold"
            >
              sign in
            </a>{" "}
            to leave a comment
          </p>
        </div>
      )}
    </div>
  );
};

export default Comments;
