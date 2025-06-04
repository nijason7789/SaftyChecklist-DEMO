import React, { useRef, useEffect } from 'react';
import { Button } from '../../../common';

interface SignaturePadProps {
  isVisible: boolean;
  onConfirm: (signatureDataURL: string) => void;
  onCancel: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  isVisible,
  onConfirm,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);

  // Initialize and resize canvas
  const resizeCanvas = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Adjust for device pixel ratio for sharper drawing
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      // Set canvas attributes based on its display size
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      if (context) {
        context.scale(dpr, dpr); // Scale context to match DPR
        context.lineWidth = 2;
        context.lineCap = 'round';
        context.strokeStyle = '#000';
        contextRef.current = context;
        // Redraw existing signature if any (optional, depends on requirements)
        // If you need to preserve signature across resizes, you'd store points and redraw
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      resizeCanvas(); // Initial resize
      window.addEventListener('resize', resizeCanvas);
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [isVisible]);

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!contextRef.current) return;
    
    isDrawingRef.current = true;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    const dpr = window.devicePixelRatio || 1;
    let eventX, eventY;

    if ('touches' in e) {
      eventX = e.touches[0].clientX;
      eventY = e.touches[0].clientY;
    } else {
      eventX = e.clientX;
      eventY = e.clientY;
    }

    // Calculate position relative to canvas, accounting for display scaling and DPR
    x = (eventX - rect.left) * (canvas.width / dpr / canvas.offsetWidth);
    y = (eventY - rect.top) * (canvas.height / dpr / canvas.offsetHeight);
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !contextRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    const dpr = window.devicePixelRatio || 1;
    let eventX, eventY;

    if ('touches' in e) {
      eventX = e.touches[0].clientX;
      eventY = e.touches[0].clientY;
    } else {
      eventX = e.clientX;
      eventY = e.clientY;
    }

    // Calculate position relative to canvas, accounting for display scaling and DPR
    x = (eventX - rect.left) * (canvas.width / dpr / canvas.offsetWidth);
    y = (eventY - rect.top) * (canvas.height / dpr / canvas.offsetHeight);
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!contextRef.current) return;
    
    if (isDrawingRef.current) {
      contextRef.current.closePath();
      isDrawingRef.current = false;
    }
  };

  const clearSignature = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(
        0, 
        0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
    }
  };

  const confirmSignature = () => {
    if (canvasRef.current) {
      // Check if signature is empty
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const imageData = context.getImageData(
          0, 
          0, 
          canvasRef.current.width, 
          canvasRef.current.height
        );
        const hasSignature = imageData.data.some(channel => channel !== 0);
        
        if (!hasSignature) {
          alert('請先簽名');
          return;
        }
        
        // Save signature as data URL and call the onConfirm callback
        onConfirm(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="signature-modal">
      <div className="signature-modal-content">
        <h3>請在此處簽名</h3>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="signature-canvas"
        />
        <div className="signature-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={clearSignature}
          >
            清除簽名
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={confirmSignature}
          >
            簽名完成
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            取消
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;
