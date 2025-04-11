import React, { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from './ToastContainer';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({
    title,
    message,
    type = 'info',
    duration = 5000,
    position = 'bottom-right',
    action,
  }) => {
    const id = `toast-${toastId++}`;
    const toast = {
      id,
      title,
      message,
      type,
      duration,
      position,
      action,
    };

    setToasts((prevToasts) => [...prevToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
