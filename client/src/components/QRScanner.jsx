import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, CheckCircle, AlertCircle, QrCode, Upload, Image } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/library';
import { checkInVolunteer, checkOutVolunteer } from '../utils/api';

const QRScanner = ({ eventId, isOpen, onClose, onSuccess, mode = 'checkin' }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stream, setStream] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(0);
  const [lastRejectedScan, setLastRejectedScan] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const scanIntervalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startScanning();
    } else {
      stopScanning();
    }

    // Cleanup when component unmounts or modal closes
    return () => {
      stopScanning();
    };
  }, [isOpen]);

  // Handle page visibility change to pause/resume camera
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && scanning) {
        console.log('🔄 Page hidden, pausing camera...');
        stopScanning();
      } else if (!document.hidden && isOpen && !scanning) {
        console.log('🔄 Page visible, resuming camera...');
        startScanning();
      }
    };

    const handleBeforeUnload = () => {
      stopScanning();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [scanning, isOpen]);

  const startScanning = async () => {
    // Don't start if already scanning or processing
    if (scanning || processing || stream) {
      console.log('⚠️ Camera already running, skipping start');
      return;
    }

    try {
      setError('');
      setScanning(true);
      
      // Request camera access with optimized settings for QR scanning
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
          frameRate: { ideal: 30, min: 15 } // Higher frame rate for faster scanning
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Start scanning as soon as the video can play
        videoRef.current.onloadedmetadata = () => {
          // Check if video is not already playing before calling play()
          if (videoRef.current && videoRef.current.paused) {
            videoRef.current.play().then(() => {
              // Start scanning immediately when video starts playing
              setTimeout(initializeScanner, 100);
            }).catch((error) => {
              console.error('Error playing video:', error);
              setError('Failed to start video playback');
            });
          } else {
            // Video is already playing, just initialize scanner
            setTimeout(initializeScanner, 100);
          }
        };
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      let errorMessage = 'Failed to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else {
        errorMessage += 'Please check camera permissions and try again.';
      }
      
      setError(errorMessage);
      setScanning(false);
    }
  };

  const initializeScanner = () => {
    try {
      // Don't initialize if already scanning or if we already have a code reader
      if (scanIntervalRef.current || processing) {
        console.log('⚠️ Scanner already running, skipping initialization');
        return;
      }

      const codeReader = new BrowserMultiFormatReader();
      
      // Store the reader immediately to prevent multiple initializations
      scanIntervalRef.current = codeReader;
      
      // Start continuous scanning using the ZXing library's native method
      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
        if (result && !processing && scanIntervalRef.current) {
          const now = Date.now();
          // Fast scanning - reduce throttle time to 1000ms for more controlled response
          if (now - lastScanTime > 1000) {
            setLastScanTime(now);
            const scannedText = result.getText();
            console.log('📱 Raw scan detected:', scannedText.substring(0, 50) + '...');
            handleQRCodeScan(scannedText);
          }
        }
        // Silently ignore NotFoundException - these are expected when no QR code is visible
        if (err && 
            !err.name?.includes('NotFoundException') && 
            !err.message?.includes('No MultiFormat Readers were able to detect the code')) {
          console.error('QR scan error:', err);
        }
      });
      
    } catch (error) {
      console.error('Failed to initialize scanner:', error);
      setError('QR Scanner initialization failed. Try manual entry instead.');
      scanIntervalRef.current = null;
    }
  };

  const stopScanning = () => {
    console.log('🛑 Stopping camera and scanner...');
    
    // Stop the code reader if it exists
    if (scanIntervalRef.current) {
      try {
        if (scanIntervalRef.current.reset) {
          scanIntervalRef.current.reset();
        }
        // Also try to stop any ongoing decode operations
        if (scanIntervalRef.current.stopContinuousDecode) {
          scanIntervalRef.current.stopContinuousDecode();
        }
      } catch (e) {
        console.log('Error stopping code reader:', e);
      }
      scanIntervalRef.current = null;
    }
    
    // Stop all media stream tracks
    if (stream) {
      stream.getTracks().forEach(track => {
        if (track.readyState !== 'ended') {
          track.stop();
          console.log('🔴 Camera track stopped:', track.label);
        }
      });
      setStream(null);
    }
    
    // Clear video element completely
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force reload to clear any cached state
    }
    
    // Clear any rejection messages and reset state
    setLastRejectedScan('');
    setProcessing(false);
    setScanning(false);
  };

  const handleQRCodeScan = async (qrCode) => {
    if (processing) return; // Prevent multiple scans
    
    // Validate QR code format BEFORE processing
    if (!isValidRegistrationQR(qrCode)) {
      console.log('❌ Invalid QR code format detected, ignoring:', qrCode.substring(0, 100));
      setLastRejectedScan(`Invalid QR format: ${qrCode.substring(0, 50)}...`);
      // Clear rejection message after 2 seconds
      setTimeout(() => setLastRejectedScan(''), 2000);
      return; // Continue scanning without stopping
    }
    
    setProcessing(true);
    setError(''); // Clear any previous errors
    
    // Stop scanning while processing
    stopScanning();
    
    try {
      console.log(`🔍 Valid QR Code detected: ${qrCode}`);
      
      let result;
      if (mode === 'checkin') {
        result = await checkInVolunteer(qrCode);
      } else {
        result = await checkOutVolunteer(qrCode);
      }
      
      console.log(`✅ ${mode} successful:`, result);
      
      // Ensure camera stops immediately on success
      stopScanning();
      
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('QR processing error:', error);
      const message = error.response?.data?.message || `Failed to ${mode} volunteer. Please try again.`;
      setError(message);
      
      // Restart scanning on error after a short delay
      setTimeout(() => {
        if (!processing) {
          startScanning();
        }
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  // Validate that the scanned data is a proper registration QR code
  const isValidRegistrationQR = (qrCode) => {
    try {
      // Must be valid JSON
      const qrData = JSON.parse(qrCode);
      
      // Must have required fields
      if (!qrData.eventId || !qrData.userId) {
        return false;
      }
      
      // EventId should be a valid MongoDB ObjectId format (24 hex characters)
      const eventIdPattern = /^[0-9a-fA-F]{24}$/;
      if (!eventIdPattern.test(qrData.eventId)) {
        return false;
      }
      
      // UserId should be a valid MongoDB ObjectId format (24 hex characters)
      if (!eventIdPattern.test(qrData.userId)) {
        return false;
      }
      
      // Should have timestamp (optional but good validation)
      if (qrData.timestamp && (typeof qrData.timestamp !== 'number' || qrData.timestamp <= 0)) {
        return false;
      }
      
      console.log('✅ Valid registration QR code format detected');
      return true;
    } catch (e) {
      // Not valid JSON or missing required fields
      return false;
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      // Create image element from file
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      
      img.onload = async () => {
        try {
          // Create canvas to decode the image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          // Use ZXing to decode QR from canvas
          const codeReader = new BrowserMultiFormatReader();
          const result = await codeReader.decodeFromImageElement(img);
          
          if (result) {
            console.log('📷 QR decoded from image:', result.getText());
            await handleQRCodeScan(result.getText());
          }
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
          
        } catch (decodeError) {
          console.error('QR decode error:', decodeError);
          setError('No valid QR code found in image. Please try another image.');
          URL.revokeObjectURL(imageUrl);
        } finally {
          setUploadingImage(false);
        }
      };

      img.onerror = () => {
        setError('Failed to load image. Please try another file.');
        URL.revokeObjectURL(imageUrl);
        setUploadingImage(false);
      };

      img.src = imageUrl;

    } catch (error) {
      console.error('Image upload error:', error);
      setError('Failed to process image. Please try again.');
      setUploadingImage(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleTestScan = async () => {
    // Generate a test QR code for debugging
    const testQrCode = JSON.stringify({
      eventId: eventId,
      userId: "test-user-id",
      timestamp: Date.now()
    });
    await handleQRCodeScan(testQrCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-cyan-600" />
            {mode === 'checkin' ? 'Check In Volunteer' : 'Check Out Volunteer'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
              {scanning ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  {/* QR Code targeting overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 border-2 border-white rounded-lg opacity-75">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Camera not active</p>
                  </div>
                </div>
              )}
              
              {processing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600"></div>
                    <span className="text-gray-900">Processing...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Position the volunteer's QR code within the camera view or upload QR image
              </p>
              {processing && (
                <p className="text-xs text-blue-600 mb-4 font-medium">
                  🎯 Valid QR Code detected! Processing...
                </p>
              )}
              {uploadingImage && (
                <p className="text-xs text-blue-600 mb-4 font-medium">
                  📷 Processing uploaded image...
                </p>
              )}
              {lastRejectedScan && !processing && !uploadingImage && (
                <p className="text-xs text-red-600 mb-4 font-medium">
                  ❌ Rejected: {lastRejectedScan}
                </p>
              )}
              {scanning && !processing && !lastRejectedScan && !uploadingImage && (
                <p className="text-xs text-green-600 mb-4">
                  📹 Camera active - Scan registration QR code only
                </p>
              )}
              {!scanning && !error && !processing && !uploadingImage && (
                <p className="text-xs text-yellow-600 mb-4">
                  📷 Camera starting up...
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleUploadClick}
                className="px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm flex items-center gap-2 justify-center"
                disabled={processing || uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload QR
                  </>
                )}
              </button>
              <button
                onClick={handleTestScan}
                className="px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-sm"
                disabled={processing || uploadingImage}
              >
                Test Scan
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  stopScanning();
                  setTimeout(startScanning, 100);
                }}
                className="flex-1 px-4 py-2 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors font-medium"
                disabled={processing || uploadingImage}
              >
                Restart Camera
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
