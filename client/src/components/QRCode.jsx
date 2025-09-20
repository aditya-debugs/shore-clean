import React, { useEffect, useRef } from 'react';
import QRCodeLib from 'qrcode';

const QRCode = ({ value, size = 200, level = 'M', includeMargin = true }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCodeLib.toCanvas(canvasRef.current, value, {
        width: size,
        margin: includeMargin ? 2 : 0,
        errorCorrectionLevel: level
      }, (error) => {
        if (error) {
          console.error('QR Code generation failed:', error);
        }
      });
    }
  }, [value, size, level, includeMargin]);

  return <canvas ref={canvasRef} />;
};

export default QRCode;