
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onSave: (signatureData: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export const SignaturePad: React.FC<Props> = ({ onSave, disabled, initialValue }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(!!initialValue);

  useEffect(() => {
    if (initialValue && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = initialValue;
      }
    }
  }, [initialValue]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    if (disabled) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      const data = canvasRef.current.toDataURL('image/png');
      onSave(data);
      setHasContent(true);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#064e3b'; // Majestic Emerald Deep

    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clear = () => {
    if (disabled || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      onSave('');
      setHasContent(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className={`relative border border-emerald-900/10 rounded-[2rem] overflow-hidden bg-white shadow-inner transition-all ${disabled ? 'opacity-70 grayscale' : 'cursor-crosshair active:ring-2 active:ring-emerald-800/20'}`}>
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseOut={stopDrawing}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="w-full h-36 block"
        />
        {!hasContent && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] text-slate-300 font-black uppercase tracking-[0.4em] opacity-40">Corporate Signature</span>
          </div>
        )}
      </div>
      {!disabled && (
        <button 
          type="button" 
          onClick={clear} 
          className="text-[10px] text-slate-400 font-black uppercase tracking-widest hover:text-emerald-900 transition-colors px-4 py-2 border border-slate-100 rounded-xl hover:bg-slate-50"
        >
          Reset Signature
        </button>
      )}
    </div>
  );
};
