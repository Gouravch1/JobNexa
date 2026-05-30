import React, { createContext, useCallback, useContext, useState } from 'react';

const NotificationContext = createContext({
  showNotification: () => {},
});

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, options = {}) => {
    const { type = 'info', duration = 1000 } = options;

    setNotification({ message, type });

    if (duration > 0) {
      setTimeout(() => {
        setNotification(null);
      }, duration);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div
          className={`notification-toast notification-${notification.type}`}
        >
          {notification.message}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

