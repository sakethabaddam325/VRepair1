import React, { createContext, useContext, useState, useCallback } from 'react';

const TabsContext = createContext(null);

/**
 * TabsProvider — manages browser-style tabs for open tickets.
 *
 * Starts empty. Tabs are created when the user opens a ticket or worklist.
 */
export function TabsProvider({ children }) {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  /**
   * Opens a tab. If a tab with the given id already exists, it is simply activated.
   * Otherwise a new tab is appended and activated.
   */
  const openTab = useCallback((id, label, path) => {
    setTabs((prev) => {
      const exists = prev.some((t) => t.id === id);
      if (exists) return prev;
      return [...prev, { id, label, path, closable: true }];
    });
    setActiveTabId(id);
  }, []);

  /**
   * Closes a tab by id (only if it is closable).
   * After removal the previously-adjacent tab becomes active.
   */
  const closeTab = useCallback(
    (id) => {
      setTabs((prev) => {
        const tab = prev.find((t) => t.id === id);
        if (!tab || !tab.closable) return prev;

        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);

        // If the closed tab was active, activate the nearest remaining tab
        if (activeTabId === id) {
          const newActive = next[Math.min(idx, next.length - 1)] || next[0];
          setActiveTabId(newActive ? newActive.id : null);
        }

        return next;
      });
    },
    [activeTabId],
  );

  /**
   * Sets the active tab by id.
   */
  const setActiveTab = useCallback((id) => {
    setActiveTabId(id);
  }, []);

  const value = {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    setActiveTab,
  };

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

/**
 * Hook to consume the TabsContext. Throws if used outside a TabsProvider.
 */
export function useTabsContext() {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error('useTabsContext must be used within a <TabsProvider>');
  }
  return ctx;
}
