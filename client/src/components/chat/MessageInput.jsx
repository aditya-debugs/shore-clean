import React, { useState, useRef, useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import {
  Send,
  Paperclip,
  Image as ImageIcon,
  Video,
  Music,
  File,
  X,
  Upload,
} from "lucide-react";
import api from "../../utils/api";

const MessageInput = ({ onSendMessage, community, disabled }) => {
  const { startTyping, stopTyping } = useSocket();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileMenu, setShowFileMenu] = useState(false);

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
    }
  }, [message]);

  // Handle typing indicators
  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      startTyping(community._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping(community._id);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, community._id, isTyping, startTyping, stopTyping]);

  // Stop typing when component unmounts
  useEffect(() => {
    return () => {
      if (isTyping) {
        stopTyping(community._id);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if ((!message.trim() && !selectedFile) || disabled || uploading) return;

    try {
      let messageData;

      if (selectedFile) {
        // Handle file upload
        setUploading(true);
        const fileUrl = await uploadFile(selectedFile);

        messageData = {
          messageType: getMessageType(selectedFile.type),
          content: {
            fileUrl,
            fileName: selectedFile.name,
            fileSize: selectedFile.size,
            mimeType: selectedFile.type,
          },
        };

        setSelectedFile(null);
      } else {
        // Handle text message
        messageData = {
          messageType: "text",
          content: {
            text: message.trim(),
          },
        };
      }

      await onSendMessage(messageData);
      setMessage("");

      // Stop typing indicator
      if (isTyping) {
        setIsTyping(false);
        stopTyping(community._id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: Show error notification to user
    } finally {
      setUploading(false);
    }
  };

  const uploadFile = async (file) => {
    try {
      // Get presigned URL
      const presignedResponse = await api.post("/upload/presigned-url", {
        fileName: file.name,
        fileSize: file.size,
        messageType: getMessageType(file.type),
        communityId: community._id,
      });

      if (!presignedResponse.data.success) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadToken, uploadUrl } = presignedResponse.data.data;

      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await api.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!uploadResponse.data.success) {
        throw new Error("File upload failed");
      }

      return uploadResponse.data.data.fileUrl;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error("Failed to upload file");
    }
  };

  const getMessageType = (mimeType) => {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    if (mimeType.startsWith("audio/")) return "audio";
    return "file";
  };

  const handleFileSelect = (acceptedTypes) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = acceptedTypes;
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSelectedFile(file);
        setShowFileMenu(false);
      }
    };
    input.click();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const fileMenuItems = [
    {
      icon: ImageIcon,
      label: "Image",
      accept: "image/*",
      color: "text-green-600",
    },
    {
      icon: Video,
      label: "Video",
      accept: "video/*",
      color: "text-red-600",
    },
    {
      icon: Music,
      label: "Audio",
      accept: "audio/*",
      color: "text-purple-600",
    },
    {
      icon: File,
      label: "Document",
      accept: ".pdf,.doc,.docx,.txt,.zip,.rar",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="relative">
      {/* File preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="h-12 w-12 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center">
                  <File className="h-6 w-6 text-gray-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-800 truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* File menu */}
      {showFileMenu && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-48 z-10">
          <div className="space-y-1">
            {fileMenuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleFileSelect(item.accept)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <span className="text-sm text-gray-700">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message input form */}
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedFile ? "Add a caption (optional)" : "Type a message..."
            }
            disabled={disabled || uploading}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
            style={{ minHeight: "44px", maxHeight: "120px" }}
          />

          {/* Attachment button */}
          <button
            type="button"
            onClick={() => setShowFileMenu(!showFileMenu)}
            disabled={disabled || uploading}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Send button */}
        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || disabled || uploading}
          className="flex-shrink-0 p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-2xl hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {uploading ? (
            <Upload className="h-5 w-5 animate-pulse" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
