import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, FlipHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CameraCapture = ({ onCapture, onClose }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  useEffect(() => {
    // Check if device has multiple cameras
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(cameras.length > 1);
      } catch (err) {
        console.error('Error checking cameras:', err);
      }
    };

    checkCameras();
  }, []);

  useEffect(() => {
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
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setIsCameraReady(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode((current) => (current === 'user' ? 'environment' : 'user'));
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');

    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(imageData);
  };

  return (
    <Card className="relative bg-black/20 backdrop-blur-lg border-white/20 max-w-md mx-auto">
      <CardContent className="p-4">
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
      </CardContent>
    </Card>
  );
};

export default CameraCapture;