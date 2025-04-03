import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result, BarcodeFormat } from '@zxing/library';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Camera, Loader2, SwitchCamera } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Initialize the barcode reader with EAN formats
    const hints = new Map();
    hints.set(2, [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]);
    
    readerRef.current = new BrowserMultiFormatReader(hints);

    // Get available cameras when component mounts
    if (isOpen) {
      initializeScanner();
    }

    return () => {
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, [isOpen]);

  const initializeScanner = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        throw new Error("Camera access is not supported in this browser. Please try using a modern browser like Chrome, Firefox, or Edge.");
      }

      // Request camera permission explicitly with better error handling
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Immediately stop the stream as we'll restart it with the barcode reader
        stream.getTracks().forEach(track => track.stop());
      } catch (permissionErr: any) {
        if (permissionErr.name === 'NotAllowedError') {
          throw new Error(
            "Camera access was denied. To enable camera access:\n" +
            "1. Click the camera icon in your browser's address bar\n" +
            "2. Select 'Allow' to enable camera access\n" +
            "3. Refresh the page and try again"
          );
        } else if (permissionErr.name === 'NotFoundError') {
          throw new Error("No camera was found on your device. Please ensure you have a working camera connected.");
        } else {
          throw new Error(`Camera error: ${permissionErr.message}`);
        }
      }

      // Get list of video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices.length);
      videoDevices.forEach(device => {
        console.log('Device:', device.label || 'unnamed device');
      });
      
      setAvailableDevices(videoDevices);

      if (videoDevices.length === 0) {
        throw new Error("No camera devices found. Please ensure you have a working camera connected.");
      }

      // Select the first device by default or the environment-facing camera on mobile
      const defaultDevice = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[0];
      if (defaultDevice) {
        setSelectedDeviceId(defaultDevice.deviceId);
        await startScanning(defaultDevice.deviceId);
      } else {
        throw new Error("Failed to select a camera device. Please refresh and try again.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
      setError(errorMessage);
      console.error('Camera initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = async (deviceId: string) => {
    if (!readerRef.current || !videoRef.current) return;

    try {
      setIsLoading(true);
      setError("");

      // Reset previous scanning session
      readerRef.current.reset();

      // Start continuous scanning
      await readerRef.current.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result: Result | null, error?: Error) => {
          if (result) {
            const barcode = result.getText();
            if (barcode) {
              onScan(barcode);
              onClose();
            }
          }
          if (error && !(error instanceof TypeError)) {
            // Ignore TypeError as it's commonly thrown when scanning is stopped
            console.error('Scanning error:', error);
          }
        }
      );
    } catch (err) {
      setError("Failed to start scanning. Please try again.");
      console.error('Scanning error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeviceChange = async (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    await startScanning(deviceId);
  };

  const handleClose = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Barcode
          </DialogTitle>
          <DialogDescription>
            Position the barcode within the camera view to scan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera Device Selector */}
          {availableDevices.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => {
                  const currentIndex = availableDevices.findIndex(d => d.deviceId === selectedDeviceId);
                  const nextIndex = (currentIndex + 1) % availableDevices.length;
                  handleDeviceChange(availableDevices[nextIndex].deviceId);
                }}
              >
                <SwitchCamera className="h-4 w-4" />
                Switch Camera
              </Button>
            </div>
          )}

          {/* Video Preview */}
          <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
            />
            {/* Scanning overlay */}
            <div className="absolute inset-0 border-2 border-white/20">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/3 border-2 border-blue-500/50">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-500"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-500"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-500"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-500"></div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg space-y-2">
              <p className="font-medium">Error:</p>
              <p className="whitespace-pre-line">{error}</p>
              {error.includes('Camera access was denied') && (
                <div className="mt-2 flex justify-end">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setError("");
                      initializeScanner();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-500 space-y-2">
            <p>Tips:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Ensure good lighting conditions</li>
              <li>Hold the barcode steady</li>
              <li>Position the barcode within the blue frame</li>
              <li>Keep the camera focused on the barcode</li>
              <li>Make sure camera permissions are enabled in your browser</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BarcodeScanner; 