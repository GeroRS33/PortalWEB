import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';
import api from '../services/api';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [toasts, setToasts] = useState([]);

  // Function to trigger a local visual toast alert
  const showToast = (titulo, mensaje) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, titulo, mensaje }]);
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Poll backend for unread notifications if logged-in user is a client
  useEffect(() => {
    if (!user || user.role !== 'cliente') return;

    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notificaciones');
        const notifications = res.data;

        // Display toast for each unread notification
        for (const notif of notifications) {
          showToast(notif.titulo, notif.mensaje);
          // Immediately mark as read so it isn't polled again
          await api.put(`/notificaciones/${notif._id}/leer`);
        }
      } catch (err) {
        console.error('Error polling notifications:', err);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <NotificationContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}

      {/* Floating Notifications UI Container */}
      <div className="notification-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            <div className="toast-content">
              <strong className="toast-title">{toast.titulo}</strong>
              <p className="toast-message">{toast.mensaje}</p>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
