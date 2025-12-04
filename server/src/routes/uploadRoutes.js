const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  generatePresignedUrl,
  uploadFile,
  deleteFile,
  getFileInfo,
} = require("../controllers/uploadController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rate limiting for file operations
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 uploads per windowMs
  message: {
    success: false,
    message: "Too many upload attempts, try again later",
  },
});

// @route   POST /api/upload/presigned-url
// @desc    Generate presigned URL for file upload
// @access  Private
router.post("/presigned-url", protect, uploadLimiter, generatePresignedUrl);

// @route   POST /api/upload/file/:uploadToken
// @desc    Upload file using presigned URL
// @access  Public (with valid token)
router.post("/file/:uploadToken", uploadLimiter, uploadFile);

// @route   DELETE /api/upload/file
// @desc    Delete uploaded file
// @access  Private
router.delete("/file", protect, deleteFile);

// @route   GET /api/upload/file-info
// @desc    Get file info
// @access  Private
router.get("/file-info", protect, getFileInfo);

module.exports = router;
