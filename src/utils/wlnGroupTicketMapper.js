/**
 * Maps WLN `wlnGroupTicketRetrieve` API payload (UPPER_SNAKE_CASE) into
 * `groupRetrieveRspVO`-shaped camelCase used by GroupTrouble + CustomerInfoHeader.
 */

const s = (v) => (v == null ? '' : String(v));

const joinArr = (arr, sep = ', ') =>
  Array.isArray(arr) ? arr.filter((x) => x != null && s(x) !== '').map(s).join(sep) : '';

/**
 * Build status timeline rows from activity / report arrays when present.
 */
function buildStatusData(d) {
  const codes = d.ACTIVITY_STATUS_GROUP || d.REPORT_STATUSCODE;
  const dates = d.ACTIVITY_STATUS_DATE_GROUP;
  if (!Array.isArray(codes) || codes.length === 0) return null;

  return codes.map((stat, i) => ({
    x: i === 0 ? '●' : '',
    stat: s(stat),
    dateTime: Array.isArray(dates) && dates[i] ? s(dates[i]) : '',
    id: i === 0 ? s(d.TROUBLE_REPORT_OWNER || d.CREATED_BY || '') : '',
  }));
}

/**
 * @param {Record<string, unknown>} raw - API body (may be nested under data/resultData)
 * @returns {Record<string, unknown>} camelCase merge for GroupSearchContext.groupRetrieveRspVO
 */
export function mapWlnGroupTicketToRetrieveVo(raw) {
  if (!raw || typeof raw !== 'object') return {};

  const d = raw;

  const retrieve = {
    _source: 'wlnGroupTicketRetrieve',
    troubleReportNum: s(d.GROUP_TROUBLE_NUM),
    groupType: s(d.GROUP_TYPE),
    eventId: s(d.EVENTID),
    etmsTktNum: s(d.ETMS_TICKET_NUM),
    rootCause: s(d.EVENT_ROOTCAUSE_STATE),
    customerAffected: s(d.CUSTOMERAFFECTEDIND),
    numberCustAftd: s(d.NUMAFFECTEDCUSTOMERS),
    trAttachedNumber: s(d.TR_ATTACHED_NUM),
    trRestored: s(d.TR_RESTORED_NUM),
    wsc: s(d.WSC),
    oasisFlashId: s(d.OASISFLASHID),
    mastarsId: s(d.MASTARSEVENTID),
    assignedUser: s(d.ASSIGNED_USER),
    reassignAllowed: s(d.REASSIGNED_ALLOW_FLAG),
    morningCall: s(d.MORNING_CALL_NUM),
    gpAttached: s(d.GPATTACHED),
    reportedByName: s(d.REPORTED_BY_NAME),
    reportedByPhone: '',
    reportedByExt: '',
    reportedByOther: '',
    contactName: s(d.CONTACT_BY_NAME),
    contactPhone: '',
    contactExt: '',
    contactOther: '',
    whiteboard: s(d.WHITE_BOARD_NUM),
    troubleNarrative: s(d.GROUP_TROUBLE_NARR),
    reasonForGroup: s(d.REASON_FOR_GROUP),
    oos: s(d.OUTOFSERVICEIND),
    estRestoralDate: s(d.EST_RESTORAL),
    exceptionCode: s(d.EXCEPTIONCODE),
    severity: s(d.SEVERITYCODE),
    priority: s(d.PRIORITY || d.SES_PRIORITY),
    sla: s(d.SLA),
    component: s(d.GROUPCOMPONENTCODE),
    symptomType: s(d.GROUPSYMPTOMTYPECODE),
    serviceType: s(d.GROUPSERVICETYPECODE),
    outageCat: s(d.GROUP_OUTAGE_CATEGORY_CODE),
    lod: s(d.LOSSOFDIVERSITYIND),
    lov: s(d.LOSSOFVISIBILITYIND),
    oasisExclude: s(d.OASIS_EXCLUDE),
    subComponent: s(d.GROUP_SUB_COMPONENT),
    vendor: s(d.VENDOR_NAME),
    summaryStatus: s(d.STATUS_COMMENT),
    keywords: s(d.KEYWORDS),
    ss1: s(d.SPECIALSTUDYCODE1),
    ss2: s(d.SPECIALSTUDYCODE2),
    ss3: s(d.SPECIALSTUDYCODE3),
    activeReferralCenters: joinArr(d.ETMSSHADOW_WORKGROUP_ID),
    referredTRCount: s(d.CORRELATION_TR_NUM),
    parentGroupTr: s(d.PARENTGROUPTR),

    // CustomerInfoHeader GROUP layout
    trNum: s(d.GROUP_TROUBLE_NUM),
    groupId: s(d.GROUP_ID),
    lata: s(d.NPANXX),
    hierarchy: s(d.HIERARCHY_LEVEL),
    applId: s(d.APPL_ID),
    groupName: s(d.GROUP_NAME),
    regionId:  s(d.REGION_ID),
    elementName: s(d.NODE),
    modelSpec: s(d.EQUIPMENT_CLASS),
    maintCtr: s(d.MAINTENANCE_CENTER),
    wireCenter: s(d.WIRECENTERNAME || d.WIRE_CENTER),
    status: s(d.GROUP_STATE),
    createdBy: s(d.CREATED_BY),
    createdByName: s(d.CREATED_BY_NAME),
    assigned: s(d.ASSIGNED_USER),
    assignedToName: s(d.TROUBLE_REPORT_OWNER_NAME || d.ASSIGNED_USER_NAME),
    serviceInfo: s(d.AFFECTED_VOICE_SERVICE),
    priorityBand: s(d.SEVERITYCODE),
    cac: s(d.SCID),
    rate: s(d.PRE_BAND_USE),
    reportedDate: s(d.REPORTED_DATE_GROUP),
    refreshDT: s(d.REPORTED_DATE_GROUP),
    troubleNotes: s(d.STICKYNOTES),

    statusData: buildStatusData(d),

    attachedTrs: buildAttachedTrs(d),
    attachedGroups: buildAttachedGroups(d),

    activityDetails: mapActivityDetails(d),
  };

  const regional = joinArr(d.REGIONAL_TROUBLEREPORTNUM);
  if (regional) retrieve.regionalTrList = regional;

  return retrieve;
}

/**
 * Builds attachedTrs from native parallel arrays already present in the
 * wlnGroupTicketRetrieve payload:
 *   REGIONAL_TROUBLEREPORTNUM  — TR numbers
 *   REPORT_STATUSCODE          — status per TR (parallel)
 *   CHILDGROUP_REGIONID        — region ID per TR (parallel)
 *   GROUP_TYPE                 — type (common)
 *   REPORTED_DATE_GROUP        — reported date (common)
 */
function buildAttachedTrs(d) {
  const trNums = Array.isArray(d.REGIONAL_TROUBLEREPORTNUM) ? d.REGIONAL_TROUBLEREPORTNUM : [];
  if (trNums.length === 0) return [];
  const statuses  = Array.isArray(d.REPORT_STATUSCODE)   ? d.REPORT_STATUSCODE   : [];
  const regions   = Array.isArray(d.CHILDGROUP_REGIONID) ? d.CHILDGROUP_REGIONID : [];
  return trNums
    .filter((n) => s(n) !== '')
    .map((trNum, i) => ({
      trNum:        s(trNum),
      trType:       s(d.GROUP_TYPE),
      status:       s(statuses[i]),
      reportedDate: s(d.REPORTED_DATE_GROUP),
      region:       s(regions[i]),
      customerId:   '',
      circuitId:    '',
      notes:        '',
    }));
}

/**
 * Builds attachedGroups from native parallel arrays:
 *   MERGED_GROUP_ID    — group TR numbers
 *   MERGED_GROUP_NAME  — group names (parallel)
 *   GROUP_STATE        — status (common)
 *   GROUP_TYPE         — type (common)
 *   REGION_ID          — region (common)
 *   REPORTED_DATE_GROUP — reported date (common)
 */
function buildAttachedGroups(d) {
  const groupIds   = Array.isArray(d.MERGED_GROUP_ID)   ? d.MERGED_GROUP_ID   : [];
  const groupNames = Array.isArray(d.MERGED_GROUP_NAME) ? d.MERGED_GROUP_NAME : [];
  return groupIds
    .filter((id) => s(id) !== '')
    .map((id, i) => ({
      trNum:        s(id),
      groupName:    s(groupNames[i]),
      trType:       s(d.GROUP_TYPE),
      status:       s(d.GROUP_STATE),
      reportedDate: s(d.REPORTED_DATE_GROUP),
      region:       s(d.REGION_ID),
    }));
}

/**
 * Maps ACTIVITY_DETAILS block (and top-level ticket fields) into the flat shape
 * expected by GroupActivityDetails.jsx — eliminating the ActivityDetailsController call.
 *
 * @param {Record<string, unknown>} d - raw wlnGroupTicketRetrieve payload
 */
function mapActivityDetails(d) {
  const ad = (d.ACTIVITY_DETAILS && typeof d.ACTIVITY_DETAILS === 'object') ? d.ACTIVITY_DETAILS : {};

  const activityRows = Array.isArray(ad.ACTIVITY_DETAILS_LIST)
    ? ad.ACTIVITY_DETAILS_LIST.map((item) => ({
        rowId:        s(item.ACTIVITYDETAILSSEQNUM) || String(Math.random()),
        seqNum:       s(item.ACTIVITYDETAILSSEQNUM),
        function:     s(item.ACTIVITYFUNCTIONDESC),
        location:     s(item.DISPATCHLOCATIONROUTINGADDRESS),
        jobId:        s(item.DISPATCHTROUBLEREPORTNUM),
        center:       s(item.DISPATCHCENTERNAME),
        ctrType:      s(item.CENTERTYPECODE),
        workType:     s(item.WORKTYPE),
        cktEnd:       s(item.ENDOFCIRCUIT),
        startDt:      s(item.STARTDATE),
        dspEndDt:     s(item.DISPATCHENDDATE),
        endDt:        s(item.ENDDATE),
        duration:     s(item.ACTIVITYDURATIONNUM),
        deleteFlag:   false,
        isEdited:     false,
      }))
    : [];

  return {
    // top-level ticket fields
    reportedDt: s(d.REPORTED_DATE_GROUP),
    trStatus:   s(d.GROUP_STATE),

    // ACTIVITY_DETAILS duration/timing fields
    restoredDt:               s(ad.RESTOREDDATE),
    noaccess:                 s(ad.CUSTOMERNOACCESSTIME),
    noaccessother:            s(ad.COMPANYNOACCESSTIME),
    actual:                   s(ad.ACTUALDURATIONTIME),
    center:                   s(ad.CENTERDURATIONTIME),
    referral:                 s(ad.REFERRALDURATIONTIME),
    handoff:                  s(ad.HANDOFFTIME),
    outofservice:             s(ad.OUTSERVICETIME),
    elecbonding:              s(ad.EBVERIFICATIONTIME),
    rebate:                   s(ad.REBATEMINUTES),
    total:                    s(ad.TOTAL_DURATION),
    suspDur:                  s(ad.SUSPEND_DURATION),
    handoffDur:               s(ad.HANDOFF_DSL_DURATION),
    monitorDuration:          s(ad.MONITOR_DURATION),
    maintenanceDuration:      s(ad.MAINT_DURATION),
    hanoffetmsDuration:       s(ad.HANOFFETMS_DURATION),
    numhandsoff:              s(ad.NUMOFHANDOFFS),

    // dispatch fields
    dispatchCenterName:               s(ad.DISPATCHCENTER_TEXT),
    dispatchLocationRoutingAddress:   s(ad.DISPATCHLOCATION_TEXT),

    // fields not present in the retrieve payload — default empty
    rri:             '',
    rebateQualified: '',
    sentToBilling:   '',

    activityRows,
  };
}

export default mapWlnGroupTicketToRetrieveVo;
