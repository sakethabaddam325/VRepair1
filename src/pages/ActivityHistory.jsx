import React, { useState } from 'react';
import GroupActivityLog from './GroupActivityLog.jsx';
import GroupTroubleHistory from './GroupTroubleHistory.jsx';
import { Box, Stack, Tabs, Tab } from '@mui/material';

const VIEWS = { ACTIVITY_LOG: 'activityLog',
  HISTORY: 'history',
};

const viewList = [VIEWS.ACTIVITY_LOG, VIEWS.HISTORY];

const ActivityHistory = ({ trNum, sessionUniqueKey }) => {
  const [activeView, setActiveView] = useState(VIEWS.ACTIVITY_LOG);

  return (
    <Stack
      direction="column"
      sx={{ p: '8px' }}
    >
      <Tabs
        value={viewList.indexOf(activeView)}
        onChange={(_e, idx) => setActiveView(viewList[idx])}
        aria-label="Activity view"
        sx={{ minHeight: 28, mb: '8px' }}
      >
        <Tab label="Activity Log" />
        <Tab label="History" />
      </Tabs>
      <Box sx={{ flex: 1 }}>
        {activeView === VIEWS.ACTIVITY_LOG ? (
          <GroupActivityLog trNum={trNum} sessionUniqueKey={sessionUniqueKey} />
        ) : (
          <GroupTroubleHistory trNum={trNum} sessionUniqueKey={sessionUniqueKey} />
        )}
      </Box>
    </Stack>
  );
};

export default ActivityHistory;
