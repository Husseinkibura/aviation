// contexts/ToastContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';
import Toast from '@/components/Toast';

type ToastType = 'success' | 'error';

interface ToastContextProps {
  showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps>({
  showToast: () => {},
});

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');

  const showToast = (msg: string, toastType: ToastType) => {
    setMessage(msg);
    setType(toastType);
    setVisible(true);
  };

  const hideToast = () => setVisible(false);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast visible={visible} message={message} type={type} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
