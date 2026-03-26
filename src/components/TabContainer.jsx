import React, { useMemo } from 'react';
import { Box, Stack, Tabs, Tab } from '@mui/material';

/**
 * TabContainer - adapter using MUI Tabs / Tab.
 *
 * Accepts the legacy tab config format { id, label, isVisible, closeable, style, onClose }
 * and delegates tab-bar rendering to MUI components.
 *
 * External API (unchanged):
 *   tabs, activeTab, onTabSelect, children, className
 */
const TabContainer = ({
  tabs,
  activeTab,
  onTabSelect,
  children,
  className, // eslint-disable-line no-unused-vars
  sx,
  tabType = 'secondary',  // eslint-disable-line no-unused-vars
  extraActions = null,
}) => {
  const visibleTabs = useMemo(
    () => tabs.filter((t) => t.isVisible !== false),
    [tabs],
  );

  const activeIndex = useMemo(() => {
    const idx = visibleTabs.findIndex((t) => t.id === activeTab);
    return idx >= 0 ? idx : 0;
  }, [visibleTabs, activeTab]);

  const handleTabChange = (_event, newIndex) => {
    const tab = visibleTabs[newIndex];
    if (tab) onTabSelect(tab.id);
  };

  const hasCloseableTabs = visibleTabs.some((t) => t.closeable);

  return (
    <Box sx={{ width: '100%', ...(sx || {}) }}>
      <Stack direction="row" alignItems="flex-end" sx={{ gap: 1 }}>
        <Tabs
          value={activeIndex}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{ flex: 1, minWidth: 0, bgcolor: 'background.paper' }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {visibleTabs.map((tab, index) => (
            <Tab
              key={tab.id}
              label={
                hasCloseableTabs && tab.closeable ? (
                  <Box
                    component="span"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {tab.label}
                    <Box
                      component="span"
                      role="button"
                      aria-label={`Close ${tab.label}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (tab.onClose) tab.onClose(tab.id);
                      }}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        lineHeight: 1,
                        color: 'grey.500',
                        ml: 0.25,
                        width: 16,
                        height: 16,
                        borderRadius: 0.375,
                        cursor: 'pointer',
                        '&:hover': {
                          color: 'text.primary',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      &times;
                    </Box>
                  </Box>
                ) : (
                  tab.label
                )
              }
              value={index}
            />
          ))}
        </Tabs>

        {extraActions && (
          <Stack
            direction="row"
            alignItems="center"
            sx={{ gap: 1, pb: 0.75, flexShrink: 0 }}
          >
            {extraActions}
          </Stack>
        )}
      </Stack>

      <Box sx={{ bgcolor: 'background.default' }}>{children}</Box>
    </Box>
  );
};

export default TabContainer;
