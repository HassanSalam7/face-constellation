import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, FlipHorizontal, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [error, setError] = useState(null);

  const checkCameraSupport = async () => {
    // Check if we're in a secure context (HTTPS or localhost)
    if (window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      setError('Camera access requires a secure connection (HTTPS)');
      return false;
    }

    // Check if the browser supports getUserMedia
    if (!navigator?.mediaDevices?.getUserMedia) {
      setError('Your browser does not support camera access');
      return false;
    }

    try {
      // Check if we can get camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      return true;
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera access and reload the page.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on your device.');
      } else {
        setError(`Camera error: ${err.message}`);
      }
      return false;
    }
  };

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return;

    const initCamera = async () => {
      const isSupported = await checkCameraSupport();
      if (!isSupported) return;

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(cameras.length > 1);
      } catch (err) {
        console.error('Error checking cameras:', err);
      }
    };

    initCamera();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isCameraReady) return;

    const startCamera = async () => {
      try {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
            setError('Error starting video stream');
          });
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError(err.message);
        setIsCameraReady(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode, isCameraReady]);

  const toggleCamera = () => {
    setFacingMode((current) => (current === 'user' ? 'environment' : 'user'));
  };

  const captureImage = () => {
    if (!videoRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Error capturing image');
      return;
    }

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    
    try {
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      onCapture(imageData);
    } catch (err) {
      console.error('Error capturing image:', err);
      setError('Failed to capture image');
    }
  };

  return (
    <Card className="relative bg-black/20 backdrop-blur-lg border-white/20 max-w-md mx-auto">
      <CardContent className="p-4">
        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="relative rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full rounded-lg ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
              style={{ maxHeight: '80vh' }}
            />

            {/* Close button */}
            <div className="absolute top-4 right-4">
              <Button
                variant="outline"
                size="icon"
                className="bg-black/50 hover:bg-black/70 border-white/20"
                onClick={onClose}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-4 px-4">
              <Button
                size="lg"
                className="flex-1 bg-white text-black hover:bg-white/90 md:flex-none"
                onClick={captureImage}
                disabled={!isCameraReady}
              >
                <Camera className="mr-2 h-5 w-5" />
                Capture
              </Button>

              {hasMultipleCameras && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white md:flex-none"
                  onClick={toggleCamera}
                >
                  <FlipHorizontal className="mr-2 h-5 w-5" />
                  Flip
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CameraCapture;