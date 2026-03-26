import React, { useState, useCallback } from 'react';
import DataGrid from '../components/DataGrid.jsx';
import { replaceAll } from '../utils/stringUtils.js';
import { Box, Typography, Button } from '@mui/material';

const RelatedCircuitsTable = ({
  gridData = [],
  onViewDetails,
  sessionUniqueKey,
}) => {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowSelect = useCallback((row) => {
    setSelectedRow(row);
  }, []);

  const handleViewDetails = useCallback(() => {
    if (!selectedRow) return;
    const circuitName = replaceAll(selectedRow.circuitName, '\u00A0', ' ');
    if (onViewDetails) onViewDetails(circuitName, selectedRow.circuitType);
  }, [selectedRow, onViewDetails]);

  const handleRowDoubleClick = useCallback((row) => {
    const circuitName = replaceAll(row.circuitName, '\u00A0', ' ');
    if (onViewDetails) onViewDetails(circuitName, row.circuitType);
  }, [onViewDetails]);

  const columns = [
    { field: 'circuitName', label: 'CIRCUIT NAME', width: 200 },
    { field: 'circuitStatus', label: 'CIRCUIT STATUS', width: 130 },
    { field: 'circuitType', label: 'CIRCUIT TYPE', width: 130 },
    { field: 'endpointA', label: 'ENDPOINT A', width: 200 },
    { field: 'endpointZ', label: 'ENDPOINT Z', width: 200 },
  ];

  return (
    <Box component="fieldset" sx={{ border: '1px solid', borderColor: 'divider', p: '8px' }}>
      <Box component="legend" sx={{ color: 'primary.main', fontWeight: 700, fontSize: 12 }}>
        Related Circuits
      </Box>
      <DataGrid
        columns={columns}
        data={gridData}
        height={300}
        onRowSelect={handleRowSelect}
        onRowDoubleClick={handleRowDoubleClick}
        alternateRows
        showToolbar
        showFooter
      />
      <Box id="recordDetails" sx={{ mt: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Typography component="span" sx={{ fontSize: 12 }}>
          Related Circuit Count: <Box component="span" sx={{ fontWeight: 'bold' }}>{gridData.length}</Box>
        </Typography>
        <Button
          id="viewDetailsButton"
          onClick={handleViewDetails}
          disabled={!selectedRow}
          size="small"
          variant="contained"
          sx={{ fontSize: 11 }}
        >
          🔍 View Details
        </Button>
      </Box>
    </Box>
  );
};

export default RelatedCircuitsTable;
