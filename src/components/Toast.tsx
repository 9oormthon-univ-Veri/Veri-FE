import React, { useEffect, useState } from 'react';
import './Toast.css';

export interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
    onClose?: () => void;
    isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({ 
    message, 
    type = 'info', 
    duration = 3000, 
    onClose, 
    isVisible 
}) => {
    const [isShowing, setIsShowing] = useState(isVisible);

    useEffect(() => {
        setIsShowing(isVisible);
        
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                setIsShowing(false);
                onClose?.();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isShowing) return null;

    return (
        <div className={`toast toast-${type} ${isShowing ? 'toast-show' : ''}`}>
            <div className="toast-content">
                <span className="toast-message">{message}</span>
                <button 
                    className="toast-close" 
                    onClick={() => {
                        setIsShowing(false);
                        onClose?.();
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast; 