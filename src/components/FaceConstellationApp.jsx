import React, { useState } from "react";
import { Camera, Upload, Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CameraCapture from "./CameraCapture";
import ConstellationProcessor from "./ConstellationProcessor";

const FaceConstellationApp = () => {
  const [step, setStep] = useState("initial");
  const [imageSource, setImageSource] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [error, setError] = useState(null);

  const handleCameraClick = () => {
    setShowCamera(true);
    setStep("capture");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSource(e.target.result);
        setStep("processing");
        setError(null);
      };
      reader.onerror = () => {
        setError("Error reading file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageCapture = (capturedImage) => {
    setImageSource(capturedImage);
    setShowCamera(false);
    setStep("processing");
  };

  const handleProcessingComplete = (processedImage) => {
    setResultImage(processedImage);
    setStep("result");
  };

  const handleReset = () => {
    setStep("initial");
    setImageSource(null);
    setResultImage(null);
    setShowCamera(false);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto pt-4 md:pt-8">
        {/* Responsive Header */}
        <div className="relative flex flex-col items-center mb-8 md:mb-12">
          {step !== "initial" && (
            <Button
              variant="ghost"
              className="absolute left-0 top-1/2 -translate-y-1/2 text-white hover:text-white/80 p-2 md:p-4"
              onClick={handleReset}
            >
              <div className="flex items-center">
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
                <span className="ml-1 text-sm md:text-base">Back</span>
              </div>
            </Button>
          )}
          <h1 className="text-2xl md:text-4xl font-bold text-white text-center flex items-center justify-center gap-2 px-12">
            Face Constellation Creator
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-yellow-400" />
          </h1>
        </div>
  
        {/* Main Content */}
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
  
          {step === "initial" && (
            <div className="space-y-4 md:space-y-6">
              <Button
                variant="outline"
                size="lg"
                className="w-full bg-white/10 backdrop-blur-lg hover:bg-white/20 border-white/20 text-white h-14 md:h-16 text-base md:text-lg"
                onClick={handleCameraClick}
              >
                <Camera className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Use Camera
              </Button>
  
              <div className="relative">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-white/10 backdrop-blur-lg hover:bg-white/20 border-white/20 text-white h-14 md:h-16 text-base md:text-lg"
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  <Upload className="mr-2 h-5 w-5 md:h-6 md:w-6" /> Upload Image
                </Button>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}
  
          {step === "capture" && showCamera && (
            <CameraCapture
              onCapture={handleImageCapture}
              onClose={() => {
                setShowCamera(false);
                setStep("initial");
              }}
            />
          )}
  
          {step === "processing" && imageSource && (
            <Card className="bg-black/20 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <ConstellationProcessor
                  imageSrc={imageSource}
                  onComplete={handleProcessingComplete}
                />
              </CardContent>
            </Card>
          )}
  
          {step === "result" && resultImage && (
            <Card className="bg-black/20 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <img
                  src={resultImage}
                  alt="Constellation Portrait"
                  className="rounded-lg mb-4 mx-auto"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
                <Button
                  className="bg-white text-black hover:bg-white/90 mt-4 mx-auto block w-full md:w-auto"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = resultImage;
                    link.download = "constellation-portrait.jpg";
                    link.click();
                  }}
                >
                  <span className="flex items-center justify-center">
                    Download Image
                  </span>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
  
        {/* Footer */}
        <footer className="fixed bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm text-white text-center py-2 text-xs md:text-sm">
          © {new Date().getFullYear()} Face Constellation Creator
          <span className="hidden md:inline"> | 📸 Instagram: wildroboot</span>
        </footer>
      </div>
    </div>
  );
};

export default FaceConstellationApp;
