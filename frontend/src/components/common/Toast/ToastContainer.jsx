import React from 'react';
import { createPortal } from 'react-dom';
import Toast from './Toast';

const positions = {
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
  'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export default function ToastContainer({ toasts, removeToast }) {
  const groupedToasts = toasts.reduce((acc, toast) => {
    if (!acc[toast.position]) {
      acc[toast.position] = [];
    }
    acc[toast.position].push(toast);
    return acc;
  }, {});

  return createPortal(
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`
            fixed
            z-50
            flex
            flex-col
            gap-2
            ${positions[position]}
          `}
        >
          {positionToasts.map((toast) => (
            <Toast
              key={toast.id}
              {...toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      ))}
    </>,
    document.body
  );
}
