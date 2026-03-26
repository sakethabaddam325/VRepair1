import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [sessionUniqueKey, setSessionUniqueKey] = useState(
    () => sessionStorage.getItem('sessionUniqueKey') || ''
  );
  const [loginId, setLoginId] = useState('');
  const [permGroup, setPermGroup] = useState('');
  const [defaultUserDateFormat, setDefaultUserDateFormat] = useState('MM/DD/YYYY');
  const [userCenterType, setUserCenterType] = useState('');
  const [userID, setUserID] = useState('');
  const [userPermGroup, setUserPermGroup] = useState('');
  const [appContext, setAppContext] = useState('');

  /* ─── Toast Notification System (replaces showAlert/VRModalAlert) ─── */
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message, variant = 'info') => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    return id;
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** @deprecated Use addToast(message, 'info') instead */
  const showAlert = useCallback((message) => {
    addToast(message, 'info');
  }, [addToast]);

  /** @deprecated No longer needed — toasts auto-dismiss */
  const closeAlert = useCallback(() => {}, []);

  /** Legacy alertModal kept for backward compatibility during migration */
  const alertModal = { isOpen: false, message: '' };

  const updateSession = useCallback((key) => {
    setSessionUniqueKey(key);
    sessionStorage.setItem('sessionUniqueKey', key);
  }, []);

  return (
    <AppContext.Provider
      value={{
        sessionUniqueKey,
        loginId,
        setLoginId,
        permGroup,
        setPermGroup,
        defaultUserDateFormat,
        setDefaultUserDateFormat,
        userCenterType,
        setUserCenterType,
        userID,
        setUserID,
        userPermGroup,
        setUserPermGroup,
        appContext,
        setAppContext,
        alertModal,
        showAlert,
        closeAlert,
        updateSession,
        toasts,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

export default AppContext;
