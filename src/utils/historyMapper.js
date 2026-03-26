/**
 * Maps the GroupHistoryController API response (parallel/column-oriented arrays)
 * to the row-array shapes consumed by GroupTroubleHistory.jsx and AssociatedHistoryGrid.jsx.
 *
 * API response shape:
 *   {
 *     GRID_DATA:      { TROUBLE_REPORT_NUM: [...], STATUS: [...], ... },
 *     ASSC_GRID_DATA: { TROUBLE_REPORT_NUM: [...], STATUS: [...], ... }
 *   }
 *
 * Output:
 *   { historyRows: [...], assoHistoryRows: [...] }
 */

const s = (v) => (v == null ? '' : String(v));

function mapGridRows(grid) {
  if (!grid || typeof grid !== 'object') return [];
  const len = (grid.TROUBLE_REPORT_NUM || []).length;
  const rows = [];
  for (let i = 0; i < len; i++) {
    rows.push({
      trNum:            s(grid.TROUBLE_REPORT_NUM?.[i]),
      grpName:          s(grid.GROUPNAME?.[i]),
      repDate:          s(grid.REPORTED_DATE?.[i]),
      resDate:          s(grid.RESTORED_DATE?.[i]),
      closedDate:       s(grid.CLD_CAN_DATE?.[i]),
      stat:             s(grid.STATUS?.[i]),
      trType:           s(grid.TROUBLE_TYPE?.[i]),
      priority:         s(grid.PRIORITY?.[i]),
      dispCode:         s(grid.DISPOSITION_CODE?.[i]),
      causeAnalysis:    s(grid.ANALYSIS_CODE?.[i] || grid.CAUSE_CODE?.[i]),
      outOfSvc:         s(grid.OUT_OF_SERVICE_FLAG?.[i]),
      exclReason:       s(grid.EXCLUDE_REASON_CODE?.[i]),
      dspClosedID:      s(grid.CLOSED_USER_ID?.[i] || grid.RESTORED_CLOSED_BY_ID?.[i]),
      dspTech:          s(grid.RESTORED_CLOSED_BY_DISP_EMP?.[i]),
      l1Disp:           s(grid.L1_DISP?.[i]),
      l1Cause:          s(grid.L1_CAUSE?.[i]),
      summary:          s(grid.SUMMARY?.[i]),
      troubleNarrative: s(grid.NARRATIVE?.[i]),
      closedByCenter:   s(grid.CLOSED_BY_CENTER?.[i]),
      historyOption:    s(grid.HISTORYOPTION?.[i]),
    });
  }
  return rows;
}

function mapAsscGridRows(grid) {
  if (!grid || typeof grid !== 'object') return [];
  const len = (grid.TROUBLE_REPORT_NUM || []).length;
  const rows = [];
  for (let i = 0; i < len; i++) {
    rows.push({
      AsscTrNum:             s(grid.TROUBLE_REPORT_NUM?.[i]),
      AsscGrpName:           s(grid.GROUPNAME?.[i]),
      AsscRepDate:           s(grid.REPORTED_DATE?.[i]),
      AsscResDate:           s(grid.RESTORED_DATE?.[i]),
      AsscClosedDate:        s(grid.CLD_CAN_DATE?.[i]),
      AsscStat:              s(grid.STATUS?.[i]),
      AsscTrType:            s(grid.TROUBLE_TYPE?.[i]),
      AsscPriority:          s(grid.PRIORITY?.[i]),
      AsscDispCode:          s(grid.DISPOSITION_CODE?.[i]),
      AsscCauseAnalysis:     s(grid.CAUSE_CODE?.[i]),
      AsscSummary:           s(grid.SUMMARY?.[i]),
      AsscTroubleNarrative:  s(grid.NARRATIVE?.[i]),
      asscClosedByCenter:    s(grid.CLOSED_BY_CENTER?.[i]),
    });
  }
  return rows;
}

export function mapHistoryResponse(data) {
  if (!data || data.StatusCode !== 'SUCCESS') {
    return { historyRows: [], assoHistoryRows: [], filterOptions: [] };
  }

  // Derive unique group name options from GRID_DATA for the filter dropdown
  const nameSet = new Set(
    (data.GRID_DATA?.GROUPNAME || []).filter(Boolean)
  );
  const filterOptions = Array.from(nameSet).map((n) => ({ value: n, label: n }));

  return {
    historyRows:     mapGridRows(data.GRID_DATA),
    assoHistoryRows: mapAsscGridRows(data.ASSC_GRID_DATA),
    filterOptions,
  };
}
