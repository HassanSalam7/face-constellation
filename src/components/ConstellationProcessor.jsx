import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ConstellationProcessor = ({ imageSrc, onComplete }) => {
  const canvasRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [originalImage, setOriginalImage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const img = new Image();
    img.onload = () => {
      try {
        const maxWidth = 800;
        const maxHeight = 600;
        let newWidth = img.width;
        let newHeight = img.height;

        // Calculate dimensions while maintaining aspect ratio
        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = (img.height * maxWidth) / img.width;
        }

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = (img.width * maxHeight) / img.height;
        }

        setDimensions({ width: newWidth, height: newHeight });
        setOriginalImage(img);

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Limit canvas size to prevent payload issues
        canvas.width = Math.min(img.width * 2, 2048);
        canvas.height = Math.min(img.height * 2, 2048);

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setError(null);
      } catch (err) {
        setError("Error processing image. Please try a different image.");
        console.error('Image processing error:', err);
      }
    };
    
    img.onerror = () => {
      setError("Error loading image. Please try again.");
    };
    
    img.src = imageSrc;
  }, [imageSrc]);

  const redrawCanvas = (pointsToDraw) => {
    if (!canvasRef.current || !originalImage) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    // Clear canvas and redraw original image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    
    // Redraw all points
    pointsToDraw.forEach(point => {
      drawYellowMarker(ctx, point.x, point.y);
    });
  };

  const drawYellowMarker = (ctx, x, y) => {
    // Outer glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
    gradient.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Center point
    ctx.beginPath();
    ctx.fillStyle = '#FFD700';
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleCanvasClick = (e) => {
    if (isCompleted) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newPoints = [...points, { x, y }];
    setPoints(newPoints);
    redrawCanvas(newPoints);
  };

  const handleUndo = () => {
    const newPoints = points.slice(0, -1);
    setPoints(newPoints);
    redrawCanvas(newPoints);
  };

  const handleComplete = () => {
    setIsCompleted(true);
    drawConstellation();
  };

  const drawConstellation = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Deep space background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#000028");
    gradient.addColorStop(0.5, "#000044");
    gradient.addColorStop(1, "#000055");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Background stars
    for (let i = 0; i < canvas.width * canvas.height / 800; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 1.5 + 0.5;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`;
      ctx.fill();
    }

    // Constellation lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 255, 255, 0.5)";

    for (let i = 0; i < points.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(points[i].x, points[i].y);
      ctx.lineTo(points[i + 1].x, points[i + 1].y);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;

    // Draw stars at points
    points.forEach((point) => {
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        0,
        point.x,
        point.y,
        15
      );
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      gradient.addColorStop(0.5, "rgba(255, 240, 180, 0.6)");
      gradient.addColorStop(1, "transparent");

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = "#FFFFFF";
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    onComplete(canvas.toDataURL("image/jpeg", 1.0));
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div
        className="relative bg-black/20 backdrop-blur-lg border border-white/20 rounded-lg p-4"
        style={{ maxWidth: dimensions.width, width: "100%" }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="cursor-crosshair"
          style={{
            width: "100%",
            height: "auto",
          }}
        />
      </div>
      {!isCompleted && points.length > 0 && (
        <div className="flex gap-4">
          <Button
            onClick={handleUndo}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
          >
            Undo
          </Button>
          <Button
            onClick={handleComplete}
            className="bg-white text-black hover:bg-white/90"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConstellationProcessor;