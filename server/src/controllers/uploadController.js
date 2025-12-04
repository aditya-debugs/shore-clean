const fs = require("fs").promises;
const path = require("path");
const crypto = require("crypto");
const {
  uploadMiddleware,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
} = require("../middlewares/chatUploadMiddleware");

// Use crypto.randomUUID instead of uuid package
const uuidv4 = () => crypto.randomUUID();

// @desc    Generate presigned URL for file upload
// @route   POST /api/upload/presigned-url
// @access  Private
const generatePresignedUrl = async (req, res) => {
  try {
    const { fileName, fileSize, messageType, communityId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!fileName || !fileSize || !messageType || !communityId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: fileName, fileSize, messageType, communityId",
      });
    }

    // Validate message type
    if (!ALLOWED_FILE_TYPES[messageType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid message type",
      });
    }

    // Validate file extension
    const fileExtension = path.extname(fileName).toLowerCase();
    const allowedExtensions = ALLOWED_FILE_TYPES[messageType];
    if (!allowedExtensions.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type for ${messageType}. Allowed: ${allowedExtensions.join(
          ", "
        )}`,
      });
    }

    // Validate file size
    const maxSize = MAX_FILE_SIZES[messageType];
    if (fileSize > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size for ${messageType}: ${
          maxSize / (1024 * 1024)
        }MB`,
      });
    }

    // Generate unique filename
    const uniqueFileName = uploadMiddleware.generateFileName(
      fileName,
      messageType
    );
    const uploadPath = path.join(process.cwd(), "uploads", "chat", communityId);
    const fullPath = path.join(uploadPath, uniqueFileName);

    // Create directory if it doesn't exist
    await fs.mkdir(uploadPath, { recursive: true });

    // Generate upload token (expires in 10 minutes)
    const uploadToken = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // In a production environment, you would store this in Redis or database
    // For simplicity, we'll use in-memory storage with cleanup
    if (!global.uploadTokens) {
      global.uploadTokens = new Map();
    }

    global.uploadTokens.set(uploadToken, {
      userId,
      fileName: uniqueFileName,
      originalName: fileName,
      filePath: fullPath,
      messageType,
      communityId,
      expiresAt,
    });

    // Clean up expired tokens (basic cleanup)
    setTimeout(() => {
      if (global.uploadTokens && global.uploadTokens.has(uploadToken)) {
        global.uploadTokens.delete(uploadToken);
      }
    }, 10 * 60 * 1000);

    res.json({
      success: true,
      data: {
        uploadToken,
        fileName: uniqueFileName,
        uploadUrl: `/api/upload/file/${uploadToken}`,
        expiresAt,
      },
    });
  } catch (error) {
    console.error("Generate presigned URL error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Upload file using presigned URL
// @route   POST /api/upload/file/:uploadToken
// @access  Public (with valid token)
const uploadFile = async (req, res) => {
  try {
    const { uploadToken } = req.params;

    // Validate upload token
    if (!global.uploadTokens || !global.uploadTokens.has(uploadToken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired upload token",
      });
    }

    const tokenData = global.uploadTokens.get(uploadToken);

    // Check if token has expired
    if (new Date() > tokenData.expiresAt) {
      global.uploadTokens.delete(uploadToken);
      return res.status(400).json({
        success: false,
        message: "Upload token has expired",
      });
    }

    // Use multer middleware for file upload
    const uploadSingle = uploadMiddleware.single("file");

    uploadSingle(req, res, async (error) => {
      try {
        if (error) {
          return res.status(400).json({
            success: false,
            message: error.message || "File upload error",
          });
        }

        if (!req.file) {
          return res.status(400).json({
            success: false,
            message: "No file provided",
          });
        }

        // Validate file matches token data
        const fileInfo = uploadMiddleware.getFileInfo(req.file);
        uploadMiddleware.validateFileType(req.file, tokenData.messageType);

        // Save file to disk
        await fs.writeFile(tokenData.filePath, req.file.buffer);

        // Generate file URL (relative to server)
        const fileUrl = `/uploads/chat/${tokenData.communityId}/${tokenData.fileName}`;

        // Clean up token
        global.uploadTokens.delete(uploadToken);

        res.json({
          success: true,
          data: {
            fileUrl,
            fileName: fileInfo.originalName,
            fileSize: fileInfo.size,
            mimeType: fileInfo.mimeType,
            uploadedAt: new Date(),
          },
        });
      } catch (uploadError) {
        console.error("File upload processing error:", uploadError);

        // Clean up token on error
        if (global.uploadTokens && global.uploadTokens.has(uploadToken)) {
          global.uploadTokens.delete(uploadToken);
        }

        res.status(500).json({
          success: false,
          message: "File upload processing failed",
        });
      }
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete uploaded file
// @route   DELETE /api/upload/file
// @access  Private
const deleteFile = async (req, res) => {
  try {
    const { fileUrl } = req.body;
    const userId = req.user.id;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: "File URL is required",
      });
    }

    // Extract file path from URL
    const urlPath = fileUrl.replace("/uploads/", "");
    const fullPath = path.join(process.cwd(), "uploads", urlPath);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Delete file
    await fs.unlink(fullPath);

    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get file info
// @route   GET /api/upload/file-info
// @access  Private
const getFileInfo = async (req, res) => {
  try {
    const { fileUrl } = req.query;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        message: "File URL is required",
      });
    }

    // Extract file path from URL
    const urlPath = fileUrl.replace("/uploads/", "");
    const fullPath = path.join(process.cwd(), "uploads", urlPath);

    // Get file stats
    const stats = await fs.stat(fullPath);
    const fileName = path.basename(fullPath);
    const extension = path.extname(fileName);

    res.json({
      success: true,
      data: {
        fileName,
        fileSize: stats.size,
        extension,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      },
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    console.error("Get file info error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  generatePresignedUrl,
  uploadFile,
  deleteFile,
  getFileInfo,
};
