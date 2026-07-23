import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

const SuccessOverlay = ({
  visible = false,
  title = "Pedido enviado correctamente",
  message = "Tu pedido fue registrado correctamente. En unos segundos podrás consultar su estado.",
  orderNumber = "",
  duration = 2200,
  onComplete
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    let timerOut;
    let timerComplete;
    let animFrame;

    if (visible) {
      setShouldRender(true);
      setIsFadingOut(false);
      
      // Trigger CSS keyframe animations next frame
      animFrame = requestAnimationFrame(() => {
        setIsAnimating(true);
      });

      // Start fade out 400ms before duration finishes
      const fadeOutDelay = Math.max(800, duration - 400);

      timerOut = setTimeout(() => {
        setIsFadingOut(true);
      }, fadeOutDelay);

      timerComplete = setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
        if (onComplete) {
          onComplete();
        }
      }, duration);
    } else {
      setShouldRender(false);
      setIsAnimating(false);
      setIsFadingOut(false);
    }

    return () => {
      cancelAnimationFrame(animFrame);
      clearTimeout(timerOut);
      clearTimeout(timerComplete);
    };
  }, [visible, duration, onComplete]);

  if (!shouldRender) return null;

  return (
    <div className={`success-overlay-backdrop ${isFadingOut ? 'fade-out' : 'fade-in'}`}>
      <div className={`success-overlay-card ${isAnimating ? 'animate-in' : ''}`}>
        
        {/* Animated Green Check Circle */}
        <div className="success-icon-ring-glow">
          <div className="success-icon-circle">
            <Check className="success-check-icon" strokeWidth={3} />
          </div>
        </div>

        {/* Order Number Pill Badge */}
        {orderNumber && (
          <div className="success-order-badge">
            <span>Pedido {orderNumber}</span>
          </div>
        )}

        {/* Success Title */}
        <h2 className="success-overlay-title">{title}</h2>

        {/* Subtitle Message */}
        <p className="success-overlay-message">{message}</p>
        
        {/* Minimal Progress Line Indicator */}
        <div className="success-progress-bar-container">
          <div 
            className="success-progress-bar-fill" 
            style={{ animationDuration: `${duration}ms` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SuccessOverlay;
