'use client';

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, toast.duration || 4000);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onHide }: { toasts: Toast[]; onHide: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onHide={onHide} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onHide }: { toast: Toast; onHide: (id: string) => void }) {
  const bgColors = {
    success: 'var(--color-black)',
    error: '#DC2626',
    warning: '#F59E0B',
    info: '#3B82F6',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className="toast"
      style={{
        background: bgColors[toast.type],
        color: 'var(--color-white)',
        padding: '16px 24px',
        borderRadius: '0',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        minWidth: '300px',
        maxWidth: '400px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        animation: 'slideIn 0.3s ease',
      }}
    >
      <span style={{ fontSize: '18px', fontWeight: 'bold', flexShrink: 0 }}>{icons[toast.type]}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>{toast.title}</div>
        {toast.message && <div style={{ fontSize: '14px', opacity: 0.9 }}>{toast.message}</div>}
      </div>
      <button
        onClick={() => onHide(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-white)',
          fontSize: '18px',
          cursor: 'pointer',
          opacity: 0.7,
          padding: '0',
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}