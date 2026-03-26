import React, { useState, useCallback } from 'react';
import DataGrid from './DataGrid.jsx';
import { TICKET_STATUSES } from '../constants/appConstants.js';

const AssociatedHistoryGrid = ({
  rows = [],
  viewSummary = false,
  sessionUniqueKey,
  onCopyRequest,
  onNavigateToTR,
}) => {
  const getColumns = useCallback(() => {
    const base = [
      { field: 'AsscTrNum', label: 'TR#', width: 90 },
      { field: 'AsscGrpName', label: 'GROUP NAME', width: 190 },
      { field: 'AsscRepDate', label: 'RPTD DATE', width: 120 },
      { field: 'AsscResDate', label: 'RESTORED DATE', width: 120 },
      { field: 'AsscClosedDate', label: 'CL/CAN DATE', width: 120 },
      { field: 'AsscStat', label: 'STAT', width: 50 },
      { field: 'AsscTrType', label: 'TYPE', width: 40 },
      { field: 'AsscPriority', label: 'PRI', width: 40 },
    ];

    if (!viewSummary) {
      base.push(
        { field: 'AsscDispCode', label: 'DISP', width: 65 },
        { field: 'AsscCauseAnalysis', label: 'CAUSE', width: 65 }
      );
    }

    if (viewSummary) {
      base.push(
        { field: 'AsscSummary', label: 'SUMMARY/CLOSE OUT DESC', width: 250, wrap: true },
        { field: 'AsscTroubleNarrative', label: 'TROUBLE NARRATIVE', width: 250, wrap: true }
      );
    }

    base.push({ field: 'asscClosedByCenter', label: 'CLOSED BY CENTER', width: 100 });
    return base;
  }, [viewSummary]);

  const handleRowDoubleClick = useCallback((row) => {
    if (onNavigateToTR) {
      onNavigateToTR(row.AsscTrNum, 'GROUPTROUBLEREPORT', 'GTRM');
    }
  }, [onNavigateToTR]);

  const contextMenuItems = useCallback((row) => [
    {
      label: 'Copy',
      disabled: row.AsscStat === TICKET_STATUSES.OPEN || row.AsscStat === TICKET_STATUSES.CANCELLED,
      onClick: () => {
        if (row.AsscStat === TICKET_STATUSES.OPEN || row.AsscStat === TICKET_STATUSES.CANCELLED) return;
        if (onCopyRequest) onCopyRequest(row.AsscTrNum);
      },
    },
  ], [onCopyRequest]);

  return (
    <DataGrid
      columns={getColumns()}
      data={rows}
      height={250}
      defaultSortField="AsscRepDate"
      defaultSortDir="desc"
      onRowDoubleClick={handleRowDoubleClick}
      onRightClickMenuItems={contextMenuItems}
      alternateRows
      showToolbar
      showFooter
    />
  );
};

export default AssociatedHistoryGrid;
