import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableSortLabel,
  Checkbox,
  InputBase,
  InputAdornment,
  Select,
  MenuItem,
  IconButton,
  Button,
  Stack,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import DownloadIcon from '@mui/icons-material/Download';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * DataGrid — MUI-based table styled to match the Canvas Design System table.
 *
 * Existing prop API is fully preserved — no breaking changes.
 *
 * New optional props:
 *   showToolbar             → renders search + filter icons above the table (default: false)
 *   showFooter              → renders Export + rows-per-page + pagination below (default: false)
 *   rowsPerPageOptions      → array of page-size choices (default: [5, 10, 25, 50])
 *   defaultRowsPerPage      → initial page size (default: 25)
 *   onExport(rows)          → custom export handler; omit to use built-in TSV download
 */

const DataGrid = ({
  columns,
  data,
  height = 250,
  onRowDoubleClick,
  onRowSelect,
  onRightClickMenuItems,
  showCheckboxColumn = false,
  alternateRows = true,
  sortable = true,
  defaultSortField = null,
  defaultSortDir = 'asc',
  emptyMessage = 'No data available.',
  className, // eslint-disable-line no-unused-vars
  sx,
  // ── New props ──
  showToolbar = false,
  showFooter = false,
  rowsPerPageOptions = [5, 10, 25, 50],
  defaultRowsPerPage = 25,
  onExport,
}) => {
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortDir, setSortDir] = useState(defaultSortDir);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [page, setPage] = useState(0);
  const tableWrapperRef = useRef(null);

  /* ── Visible columns ── */
  const visibleColumns = useMemo(
    () => columns.filter((c) => !c.hidden),
    [columns],
  );

  /* ── Sorting ── */
  const sortedData = useMemo(() => {
    if (!sortField) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortField] ?? '';
      const bVal = b[sortField] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortField, sortDir]);

  /* ── Search filtering (only active when toolbar is shown) ── */
  const searchFilteredData = useMemo(() => {
    if (!searchText.trim()) return sortedData;
    const lower = searchText.toLowerCase();
    return sortedData.filter((row) =>
      Object.values(row).some((v) => String(v ?? '').toLowerCase().includes(lower))
    );
  }, [sortedData, searchText]);

  /* ── Pagination (only slices when footer is shown) ── */
  const displayData = useMemo(() => {
    if (!showFooter) return searchFilteredData;
    return searchFilteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  }, [searchFilteredData, page, rowsPerPage, showFooter]);

  const totalRows = searchFilteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
  const startRow = totalRows === 0 ? 0 : page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, totalRows);

  /* ── Reset page when search or page-size changes ── */
  useEffect(() => { setPage(0); }, [searchText]);
  useEffect(() => { setSelectedRowIndex(null); }, [page, searchText]);

  /* ── Sort handler ── */
  const handleSort = useCallback((columnKey) => {
    if (!sortable) return;
    if (sortField === columnKey) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(columnKey);
      setSortDir('asc');
    }
  }, [sortable, sortField]);

  /* ── Row interaction handlers ── */
  const handleRowClick = useCallback((rowIndex) => {
    setSelectedRowIndex(rowIndex);
    if (onRowSelect && displayData[rowIndex]) {
      onRowSelect(displayData[rowIndex], rowIndex);
    }
  }, [onRowSelect, displayData]);

  const handleDoubleClick = useCallback((rowIndex) => {
    if (!onRowDoubleClick) return;
    if (displayData[rowIndex]) onRowDoubleClick(displayData[rowIndex], rowIndex);
  }, [onRowDoubleClick, displayData]);

  const handleContextMenu = useCallback((e, rowIndex) => {
    if (!onRightClickMenuItems) return;
    e.preventDefault();
    const row = displayData[rowIndex];
    if (!row) return;
    const items = onRightClickMenuItems(row);
    if (!items || !Array.isArray(items) || items.length === 0) return;
    setSelectedRowIndex(rowIndex);
    if (onRowSelect) onRowSelect(row, rowIndex);
  }, [onRightClickMenuItems, displayData, onRowSelect]);

  const getCellValue = (col, row, rowIndex) => {
    const raw = row[col.field];
    if (col.formatter) return col.formatter(raw, row, rowIndex);
    if (raw === null || raw === undefined || raw === '') return '\u00A0';
    return raw;
  };

  /* ── Export ── */
  const handleExportClick = useCallback(() => {
    if (onExport) { onExport(searchFilteredData); return; }
    const headers = visibleColumns.map((c) => c.label).join('\t');
    const rows = searchFilteredData
      .map((row) => visibleColumns.map((c) => String(row[c.field] ?? '')).join('\t'))
      .join('\n');
    const blob = new Blob([headers + '\n' + rows], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [onExport, searchFilteredData, visibleColumns]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', ...(sx || {}) }}>

      {/* ── Toolbar ── */}
      {showToolbar && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '4px',
          px: '12px',
          py: '6px',
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
          <InputBase
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
              </InputAdornment>
            }
            sx={{
              fontSize: 12,
              px: '8px',
              py: '3px',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '4px',
              bgcolor: 'background.paper',
              width: '200px',
              '& input': { fontSize: 12, p: 0 },
            }}
          />
          <IconButton size="small" sx={{ p: '3px', color: 'text.secondary' }} title="Filter">
            <FilterListIcon sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            size="small"
            sx={{ p: '3px', color: searchText ? 'text.secondary' : 'text.disabled' }}
            title="Clear search"
            onClick={() => setSearchText('')}
            disabled={!searchText}
          >
            <FilterListOffIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      )}

      {/* ── Table ── */}
      <Box
        ref={tableWrapperRef}
        sx={{
          maxHeight: typeof height === 'number' ? `${height}px` : height,
          overflow: 'auto',
          width: '100%',
        }}
      >
        <Table size="small" stickyHeader sx={{ fontSize: 12 }}>
          <TableHead>
            <TableRow>
              {showCheckboxColumn && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    fontSize: 12,
                    bgcolor: 'background.paper',
                    borderBottom: '2px solid #000',
                    borderRight: 'none',
                    borderLeft: 'none',
                    borderTop: 'none',
                  }}
                />
              )}
              {visibleColumns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    width: col.width ? `${col.width}px` : undefined,
                    py: '6px',
                    px: '8px',
                    bgcolor: 'background.paper',
                    borderBottom: '2px solid #000',
                    borderRight: 'none',
                    borderLeft: 'none',
                    borderTop: 'none',
                  }}
                  sortDirection={sortField === col.field ? sortDir : false}
                >
                  {sortable && col.sortable !== false ? (
                    <TableSortLabel
                      active={sortField === col.field}
                      direction={sortField === col.field ? sortDir : 'asc'}
                      onClick={() => handleSort(col.field)}
                      sx={{ fontSize: 12, fontWeight: 700 }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                selected={selectedRowIndex === rowIndex}
                hover
                onClick={() => handleRowClick(rowIndex)}
                onDoubleClick={() => handleDoubleClick(rowIndex)}
                onContextMenu={(e) => handleContextMenu(e, rowIndex)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: alternateRows && rowIndex % 2 === 1
                    ? 'grey.50'
                    : 'background.default',
                }}
              >
                {showCheckboxColumn && (
                  <TableCell
                    padding="checkbox"
                    sx={{ borderBottom: '1px solid', borderColor: 'divider', borderRight: 'none', borderLeft: 'none' }}
                  >
                    <Checkbox
                      size="small"
                      checked={selectedRowIndex === rowIndex}
                      onChange={() => handleRowClick(rowIndex)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                )}
                {visibleColumns.map((col) => (
                  <TableCell
                    key={col.field}
                    sx={{
                      fontSize: 12,
                      py: '4px',
                      px: '8px',
                      whiteSpace: col.wrap ? 'normal' : 'nowrap',
                      maxWidth: col.width ? `${col.width}px` : undefined,
                      overflow: col.wrap ? 'visible' : 'hidden',
                      textOverflow: col.wrap ? 'unset' : 'ellipsis',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      borderRight: 'none',
                      borderLeft: 'none',
                    }}
                  >
                    {getCellValue(col, row, rowIndex)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {displayData.length === 0 && (
          <Typography sx={{ textAlign: 'center', p: '32px', color: 'grey.500', fontSize: 14, lineHeight: '16.8px' }}>
            {searchText && data.length > 0 ? 'No results match your search.' : emptyMessage}
          </Typography>
        )}
      </Box>

      {/* ── Footer ── */}
      {showFooter && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          px: '12px',
          py: '5px',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
            onClick={handleExportClick}
            sx={{
              fontSize: 11,
              py: '3px',
              px: '12px',
              bgcolor: 'grey.900',
              color: '#fff',
              borderRadius: '20px',
              textTransform: 'none',
              minWidth: 0,
              '&:hover': { bgcolor: 'grey.700' },
            }}
          >
            Export
          </Button>
          <Stack direction="row" alignItems="center" sx={{ gap: '4px' }}>
            <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
              size="small"
              sx={{
                fontSize: 11,
                '& .MuiSelect-select': { py: '2px', px: '6px', fontSize: 11 },
                minWidth: '52px',
              }}
            >
              {rowsPerPageOptions.map((opt) => (
                <MenuItem key={opt} value={opt} sx={{ fontSize: 11 }}>{opt}</MenuItem>
              ))}
            </Select>
          </Stack>
          <Typography sx={{ fontSize: 11, color: 'text.secondary', whiteSpace: 'nowrap' }}>
            {startRow}–{endRow} of {totalRows}
          </Typography>
          <Stack direction="row" sx={{ gap: '0px' }}>
            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              sx={{ p: '2px' }}
            >
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
              disabled={page >= totalPages - 1}
              sx={{ p: '2px' }}
            >
              <ChevronRightIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Box>
      )}

    </Box>
  );
};

export default DataGrid;
