/**
 * Maps the wlnGroupActivityLog API response (parallel/column-oriented arrays)
 * to the row-array shape consumed by GroupActivityLog.jsx.
 *
 * API response shape:
 *   { ACTIVITY_SEQ_NUM: [...], ACTIVITY_LOG_DATE: [...], ... }
 *
 * Output shape (matches what GroupActivityLog.jsx reads from response.data):
 *   { rows: [...], filterOptions: [...], minSequenceNum: string|null }
 */
export function mapActivityLogResponse(data) {
  if (!data || data.StatusCode !== 'SUCCESS') {
    return { rows: [], filterOptions: [], minSequenceNum: null };
  }

  const len = (data.ACTIVITY_SEQ_NUM || []).length;
  const rows = [];

  for (let i = 0; i < len; i++) {
    const logLevel = data.LOGLEVEL?.[i] ?? '0';
    rows.push({
      seq:           data.ACTIVITY_SEQ_NUM?.[i]        ?? '',
      dateTime:      data.ACTIVITY_LOG_DATE?.[i]       ?? '',
      userId:        data.ORIGINATOR_ID?.[i]           ?? '',
      center:        data.MAINTENANCE_CENTER_NAME?.[i] ?? '',
      function:      data.ACTIVITY_FUNCTION_CODE?.[i]  ?? '',
      type:          data.ACTIVITY_STATUS_CODE?.[i]    ?? '',
      remark:        data.ACTIVITY_DESCRIPTION?.[i]    ?? '',
      seqNum:        data.DB_ACTIVITYSEQNUM?.[i]       ?? '',
      displaySeqNum: data.ACTIVITY_SEQ_NUM?.[i]        ?? '',
      logType:       logLevel === '0' ? 'TICKET' : 'LEVEL_UP',
      isUserFlow:    data.MANUAL_USER_FLAG?.[i] === 'Y',
      filter:        data.MAINTENANCE_CENTER_NAME?.[i] ?? '',
    });
  }

  // Derive unique filter options from MAINTENANCE_CENTER_NAME values
  const centerSet = new Set(
    (data.MAINTENANCE_CENTER_NAME || []).filter(Boolean)
  );
  const filterOptions = Array.from(centerSet).map((c) => ({ value: c, label: c }));

  // Derive unique function options from ACTIVITY_FUNCTION_CODE values
  const functionSet = new Set(
    (data.ACTIVITY_FUNCTION_CODE || []).filter(Boolean)
  );
  const functionOptions = Array.from(functionSet).map((f) => ({ value: f, label: f }));

  // Signal more pages exist when the server returned fewer rows than TOTAL_RECORDS.
  // The minimum DB sequence number becomes the cursor for the next page request.
  const totalRecords = data.TOTAL_RECORDS ?? 0;
  const dbSeqNums = (data.DB_ACTIVITYSEQNUM || []).map(Number).filter(Boolean);
  const minSequenceNum =
    rows.length > 0 && rows.length < totalRecords && dbSeqNums.length > 0
      ? String(Math.min(...dbSeqNums))
      : null;

  return { rows, filterOptions, functionOptions, minSequenceNum };
}
