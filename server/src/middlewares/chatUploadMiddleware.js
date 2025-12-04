const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// Use crypto.randomUUID instead of uuid package
const uuidv4 = () => crypto.randomUUID();

// Define allowed file types for different message types
const ALLOWED_FILE_TYPES = {
  image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
  video: [".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm"],
  audio: [".mp3", ".wav", ".aac", ".ogg", ".m4a"],
  file: [".pdf", ".doc", ".docx", ".txt", ".zip", ".rar"],
};

// Maximum file sizes (in bytes)
const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 50 * 1024 * 1024, // 50MB
  file: 50 * 1024 * 1024, // 50MB
};

// Configure multer for memory storage (for file validation before saving)
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const messageType = req.body.messageType || "file";

    // Check if file type is allowed
    const allowedExtensions = ALLOWED_FILE_TYPES[messageType];
    if (!allowedExtensions || !allowedExtensions.includes(fileExtension)) {
      return cb(
        new Error(
          `Invalid file type for ${messageType}. Allowed: ${allowedExtensions?.join(
            ", "
          )}`
        ),
        false
      );
    }

    // Check file size
    const maxSize = MAX_FILE_SIZES[messageType];
    if (file.size > maxSize) {
      return cb(
        new Error(
          `File too large. Maximum size for ${messageType}: ${
            maxSize / (1024 * 1024)
          }MB`
        ),
        false
      );
    }

    cb(null, true);
  } catch (error) {
    cb(error, false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Math.max(...Object.values(MAX_FILE_SIZES)), // Use the largest max size
    files: 1, // Only one file per upload
  },
});

// Middleware for handling file uploads
const uploadMiddleware = {
  // Single file upload for chat messages
  single: (fieldName) => {
    return (req, res, next) => {
      const uploadSingle = upload.single(fieldName);

      uploadSingle(req, res, (error) => {
        if (error) {
          if (error instanceof multer.MulterError) {
            if (error.code === "LIMIT_FILE_SIZE") {
              return res.status(400).json({
                success: false,
                message: "File too large",
              });
            }
            if (error.code === "LIMIT_FILE_COUNT") {
              return res.status(400).json({
                success: false,
                message: "Too many files",
              });
            }
            if (error.code === "LIMIT_UNEXPECTED_FILE") {
              return res.status(400).json({
                success: false,
                message: "Unexpected file field",
              });
            }
          }

          return res.status(400).json({
            success: false,
            message: error.message || "File upload error",
          });
        }

        next();
      });
    };
  },

  // Generate unique filename
  generateFileName: (originalName, messageType) => {
    const timestamp = Date.now();
    const uuid = uuidv4();
    const extension = path.extname(originalName);
    return `${messageType}_${timestamp}_${uuid}${extension}`;
  },

  // Validate file type based on message type
  validateFileType: (file, messageType) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ALLOWED_FILE_TYPES[messageType];

    if (!allowedExtensions || !allowedExtensions.includes(fileExtension)) {
      throw new Error(
        `Invalid file type for ${messageType}. Allowed: ${allowedExtensions?.join(
          ", "
        )}`
      );
    }

    return true;
  },

  // Get file info
  getFileInfo: (file) => {
    return {
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      extension: path.extname(file.originalname).toLowerCase(),
    };
  },
};

module.exports = {
  uploadMiddleware,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
};
