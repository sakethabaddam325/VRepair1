const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// ─── Data helpers ───
const dataDir = path.join(__dirname, 'data');
function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(path.join(dataDir, file), JSON.stringify(data, null, 2));
}

// Simulated current user
const CURRENT_USER = 'GONDCH7';

// ─── Middleware ───
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  const action = req.body?.actionCode || req.body?.action || req.body?.operation || req.body?.func || '';
  console.log(`[MOCK] ${req.method} ${req.path} action=${action}`);
  next();
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/GroupSearchController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/GroupSearchController', (req, res) => {
  const trNum = req.body.trNum || 'GTR0001234';

  if (req.body.actionCode === 'LOAD_GROUP_RESULTS') {
    return res.json({
      resultData: {
        groupSearchResultsVO: {
          trNum,
          groupName: 'Fiber Cut Main St NYC',
          status: 'OPN',
          groupType: 'FP',
          createdDate: '03/19/2026 08:15',
          region: 'NE',
        },
        groupRetrieveRspVO: {
          trNum,
          troubleReportNum: trNum,
          groupType: 'FP',
          srcType: 'GTRM',
          troubleRptStatus: 'OPN',
          reportedDate: '03/19/2026 08:15',
          refreshDT: '03/19/2026 08:15',
          eventId: 'EVT-2026-001',
          etmsTktNum: 'ETMS-5678',
          rootCause: 'Cable Cut',
          custAffected: '150',
          trAttachedNumber: '3',
          trRestored: '1',
          wsc: 'NYCMNY01',
          oasisFlashId: '',
          mastarsId: '',
          assignedUser: 'JSMITH',
          reassignAllowed: 'Y',
          morningCall: '',
          gpAttached: '0',
          reportedByName: 'John Smith',
          reportedByPhone: '2125551234',
          reportedByExt: '4567',
          reportedByOther: '',
          contactName: 'Jane Doe',
          contactPhone: '2125555678',
          contactExt: '8901',
          contactOther: '',
          whiteboard: '',
          troubleNarrative: 'Fiber cut on Main Street affecting 150 customers',
          reasonForGroup: 'Multiple tickets reported for same outage',
          oos: 'Y',
          customerAffected: 'Y',
          estRestoralDate: '03/20/2026 18:00',
          exceptionCode: 'NONE',
          severity: '2',
          priority: '1',
          sla: 'P1',
          component: 'FIBER',
          symptomType: 'NO_SERVICE',
          serviceType: 'FIOS',
          codingElement: 'OUTSIDE_PLANT',
          outageCat: '',
          lod: 'N',
          lov: 'N',
          oasisExclude: 'N',
          subComponent: '',
          vendor: '',
          summaryStatus: 'Crew dispatched to Main St between 3rd and 4th Ave',
          keywords: 'fiber, outage, main street',
          ss1: '',
          ss2: '',
          ss3: '',
          activeReferralCenters: '',
          referredTRCount: '0',
          parentGroupTr: '',

          // Dropdown option arrays
          wscOptions: [
            { value: '', label: '-- Select --' },
            { value: 'NYCMNY01', label: 'NYCMNY01 - New York City' },
            { value: 'BSTNMA01', label: 'BSTNMA01 - Boston' },
            { value: 'WASHDC01', label: 'WASHDC01 - Washington DC' },
            { value: 'CLEVOH01', label: 'CLEVOH01 - Cleveland' },
            { value: 'DLLSTX01', label: 'DLLSTX01 - Dallas' },
          ],
          assignedUserOptions: [
            { value: '', label: '-- Select --' },
            { value: 'JSMITH', label: 'JSMITH - John Smith' },
            { value: 'ADOE', label: 'ADOE - Alice Doe' },
            { value: 'BCHEN', label: 'BCHEN - Bob Chen' },
            { value: 'CWILSON', label: 'CWILSON - Carol Wilson' },
            { value: 'DKIM', label: 'DKIM - David Kim' },
          ],
          exceptionCodeOptions: [
            { value: '', label: '-- Select --' },
            { value: 'NONE', label: 'NONE' },
            { value: 'WEATHER', label: 'WEATHER - Severe Weather' },
            { value: 'VEHICLE', label: 'VEHICLE - Vehicle Hit' },
            { value: 'POWER', label: 'POWER - Commercial Power' },
            { value: 'CONSTR', label: 'CONSTR - Construction' },
            { value: 'VANDAL', label: 'VANDAL - Vandalism' },
            { value: 'EQUIP', label: 'EQUIP - Equipment Failure' },
            { value: 'OTHER', label: 'OTHER' },
          ],
          severityOptions: [
            { value: '', label: '-- Select --' },
            { value: '1', label: '1 - Critical' },
            { value: '2', label: '2 - Major' },
            { value: '3', label: '3 - Minor' },
            { value: '4', label: '4 - Warning' },
            { value: '5', label: '5 - Info' },
          ],
          priorityOptions: [
            { value: '', label: '-- Select --' },
            { value: 'P1', label: 'P1 - Immediate' },
            { value: 'P2', label: 'P2 - High' },
            { value: 'P3', label: 'P3 - Medium' },
            { value: 'P4', label: 'P4 - Low' },
          ],
          oosOptions: [
            { value: 'Y', label: 'Yes' },
            { value: 'N', label: 'No' },
          ],
          custAffectedOptions: [
            { value: 'Y', label: 'Yes' },
            { value: 'N', label: 'No' },
          ],
          reassignOptions: [
            { value: 'Y', label: 'Yes' },
            { value: 'N', label: 'No' },
          ],
          ss1Options: [
            { value: '', label: '-- Select --' },
            { value: 'WRK', label: 'Working' },
            { value: 'CLR', label: 'Cleared' },
            { value: 'RST', label: 'Restored' },
          ],
          ss2Options: [
            { value: '', label: '-- Select --' },
            { value: 'DISP', label: 'Dispatched' },
            { value: 'PEND', label: 'Pending' },
            { value: 'COMP', label: 'Complete' },
          ],
          ss3Options: [
            { value: '', label: '-- Select --' },
            { value: 'ACT', label: 'Active' },
            { value: 'SUSP', label: 'Suspended' },
            { value: 'CLS', label: 'Closed' },
          ],
          componentOptions: [
            { value: '', label: '-- Select --' },
            { value: 'FIBER', label: 'Fiber' },
            { value: 'COPPER', label: 'Copper' },
            { value: 'COAX', label: 'Coax' },
            { value: 'EQUIP', label: 'Equipment' },
            { value: 'POWER', label: 'Power' },
          ],
          subComponentOptions: [
            { value: '', label: '-- Select --' },
            { value: 'AERIAL', label: 'Aerial' },
            { value: 'BURIED', label: 'Buried' },
            { value: 'UNDERGROUND', label: 'Underground' },
          ],
          vendorOptions: [
            { value: '', label: '-- Select --' },
            { value: 'VND001', label: 'ABC Telecom' },
            { value: 'VND002', label: 'XYZ Cable Co' },
            { value: 'VND003', label: 'Metro Fiber Inc' },
          ],
          symptomTypeOptions: [
            { value: '', label: '-- Select --' },
            { value: 'NO_SERVICE', label: 'No Service' },
            { value: 'INTERMITTENT', label: 'Intermittent' },
            { value: 'DEGRADED', label: 'Degraded' },
            { value: 'NOISE', label: 'Noise' },
          ],
          serviceTypeOptions: [
            { value: '', label: '-- Select --' },
            { value: 'FIOS', label: 'FiOS' },
            { value: 'DSL', label: 'DSL' },
            { value: 'POTS', label: 'POTS' },
            { value: 'ETHERNET', label: 'Ethernet' },
          ],
          outageCatOptions: [
            { value: '', label: '-- Select --' },
            { value: 'MAJOR', label: 'Major' },
            { value: 'MINOR', label: 'Minor' },
            { value: 'ISOLATED', label: 'Isolated' },
          ],
          statusEntries: [
            { x: '', stat: 'OPN', dateTime: '03/19/2026 08:15', id: 'SYSTEM' },
            { x: '', stat: 'WRK', dateTime: '03/19/2026 09:30', id: 'JSMITH' },
            { x: '', stat: 'DISP', dateTime: '03/19/2026 10:00', id: 'JSMITH' },
          ],
        },
        groupTroubleReportNum: trNum,
        srcType: 'GTRM',
        centerID: 'NYCMNY01',
        groupCloseOutInd: false,
        extNarrativeInd: true,
        isGroupClosed: false,
        groupType: 'FP',
        troubleRptStatus: 'OPN',
        tabsFlags: {},
        syncMailBox: false,
        loginId: 'JSMITH',
      },
    });
  }

  // Default: search action
  res.json({
    resultData: {
      results: [
        { trNum: 'GTR0001234', groupName: 'Fiber Cut Main St NYC', status: 'OPN', type: 'FP', reportedDate: '03/19/2026' },
        { trNum: 'GTR0001235', groupName: 'Copper Outage Brooklyn', status: 'OPN', type: 'FP', reportedDate: '03/18/2026' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/GroupTroubleEntryController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/GroupTroubleEntryController', (req, res) => {
  const action = req.body.actionCode || '';

  if (action === 'LOAD_STATES') {
    return res.json({
      resultData: {
        states: [
          { value: '', label: '-- Select --' },
          { value: 'NY', label: 'New York' },
          { value: 'NJ', label: 'New Jersey' },
          { value: 'CT', label: 'Connecticut' },
          { value: 'MA', label: 'Massachusetts' },
          { value: 'PA', label: 'Pennsylvania' },
          { value: 'VA', label: 'Virginia' },
          { value: 'MD', label: 'Maryland' },
          { value: 'DC', label: 'District of Columbia' },
          { value: 'RI', label: 'Rhode Island' },
          { value: 'TX', label: 'Texas' },
          { value: 'OH', label: 'Ohio' },
          { value: 'CA', label: 'California' },
          { value: 'FL', label: 'Florida' },
          { value: 'IL', label: 'Illinois' },
        ],
      },
    });
  }

  if (action === 'LOAD_CO_CLLI') {
    return res.json({
      resultData: {
        coCllis: [
          { value: '', label: '-- Select --' },
          { value: 'NYCMNY54', label: 'NYCMNY54 - New York 54th St' },
          { value: 'NYCMNY60', label: 'NYCMNY60 - New York 60th St' },
          { value: 'BKLNNY01', label: 'BKLNNY01 - Brooklyn' },
          { value: 'QNSNNY01', label: 'QNSNNY01 - Queens' },
          { value: 'BRNXNY01', label: 'BRNXNY01 - Bronx' },
          { value: 'STISNY01', label: 'STISNY01 - Staten Island' },
        ],
      },
    });
  }

  // Default: submit/update
  res.json({
    resultData: {
      status: 'SUCCESS',
      message: 'Trouble report updated successfully',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/GroupActivityLogController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/GroupActivityLogController', (req, res) => {
  res.json({
    rows: [
      { seq: '001', seqNum: '1', displaySeqNum: '001', dateTime: '03/19/2026 10:15', userId: 'JSMITH', center: 'NYCMNY01', function: 'CREATE', type: 'SYS', remark: 'Group TR created for fiber cut on Main Street', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '002', seqNum: '2', displaySeqNum: '002', dateTime: '03/19/2026 10:20', userId: 'JSMITH', center: 'NYCMNY01', function: 'UPDATE', type: 'USR', remark: 'Priority changed to P1 - Immediate', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '003', seqNum: '3', displaySeqNum: '003', dateTime: '03/19/2026 10:25', userId: 'SYSTEM', center: 'NYCMNY01', function: 'ATTACH', type: 'SYS', remark: 'TR001234 attached to group', logType: 'TICKET', filter: 'ALL', isUserFlow: false },
      { seq: '004', seqNum: '4', displaySeqNum: '004', dateTime: '03/19/2026 10:30', userId: 'SYSTEM', center: 'NYCMNY01', function: 'ATTACH', type: 'SYS', remark: 'TR001235 attached to group', logType: 'TICKET', filter: 'ALL', isUserFlow: false },
      { seq: '005', seqNum: '5', displaySeqNum: '005', dateTime: '03/19/2026 10:35', userId: 'SYSTEM', center: 'NYCMNY01', function: 'ATTACH', type: 'SYS', remark: 'TR001236 attached to group', logType: 'TICKET', filter: 'ALL', isUserFlow: false },
      { seq: '006', seqNum: '6', displaySeqNum: '006', dateTime: '03/19/2026 11:00', userId: 'JSMITH', center: 'NYCMNY01', function: 'DISPATCH', type: 'USR', remark: 'Dispatch crew #47 to Main St between 3rd and 4th Ave', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '007', seqNum: '7', displaySeqNum: '007', dateTime: '03/19/2026 11:30', userId: 'JSMITH', center: 'NYCMNY01', function: 'REMARK', type: 'USR', remark: 'Crew on site - assessing damage to fiber bundle', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '008', seqNum: '8', displaySeqNum: '008', dateTime: '03/19/2026 12:00', userId: 'ADOE', center: 'NYCMNY01', function: 'LEVEL_UP', type: 'USR', remark: 'Escalated to Level 2 - major fiber damage confirmed', logType: 'LEVEL_UP', filter: 'ALL', isUserFlow: true },
      { seq: '009', seqNum: '9', displaySeqNum: '009', dateTime: '03/19/2026 12:15', userId: 'JSMITH', center: 'NYCMNY01', function: 'REMARK', type: 'USR', remark: 'Customer count updated to 150 affected', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '010', seqNum: '10', displaySeqNum: '010', dateTime: '03/19/2026 13:00', userId: 'BCHEN', center: 'NYCMNY01', function: 'REMARK', type: 'USR', remark: 'Splice crew requested - ETA 14:00', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '011', seqNum: '11', displaySeqNum: '011', dateTime: '03/19/2026 14:00', userId: 'BCHEN', center: 'NYCMNY01', function: 'REMARK', type: 'USR', remark: 'Splice crew arrived on site', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '012', seqNum: '12', displaySeqNum: '012', dateTime: '03/19/2026 15:30', userId: 'BCHEN', center: 'NYCMNY01', function: 'REMARK', type: 'USR', remark: 'Splicing in progress - 48 count fiber bundle', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
    ],
    minSequenceNum: null,
    filterOptions: [
      { value: 'NYCMNY01', label: 'NYCMNY01' },
      { value: 'JSMITH', label: 'JSMITH' },
      { value: 'ADOE', label: 'ADOE' },
      { value: 'BCHEN', label: 'BCHEN' },
    ],
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/ActivityLogController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/ActivityLogController', (req, res) => {
  if (req.body.func === 'VOIDREMARKS') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Remark voided successfully' } });
  }

  res.json({
    rows: [
      { seq: '001', seqNum: '1', displaySeqNum: '001', dateTime: '03/19/2026 08:30', userId: 'JSMITH', center: 'NYCMNY01', function: 'CREATE', type: 'SYS', remark: 'Trouble report created', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '002', seqNum: '2', displaySeqNum: '002', dateTime: '03/19/2026 09:00', userId: 'JSMITH', center: 'NYCMNY01', function: 'DISPATCH', type: 'USR', remark: 'Dispatched technician to customer location', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '003', seqNum: '3', displaySeqNum: '003', dateTime: '03/19/2026 10:30', userId: 'CWILSON', center: 'NYCMNY01', function: 'REMARK', type: 'USR', remark: 'Technician on site - testing copper pairs', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
      { seq: '004', seqNum: '4', displaySeqNum: '004', dateTime: '03/19/2026 11:45', userId: 'CWILSON', center: 'NYCMNY01', function: 'REMARK', type: 'USR', remark: 'Found defective splice at terminal - repairing', logType: 'TICKET', filter: 'ALL', isUserFlow: true },
    ],
    minSequenceNum: null,
    filterOptions: [
      { value: 'NYCMNY01', label: 'NYCMNY01' },
      { value: 'JSMITH', label: 'JSMITH' },
      { value: 'CWILSON', label: 'CWILSON' },
    ],
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/ActivityDetailsController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/ActivityDetailsController', (req, res) => {
  if (req.body.actionCode === 'SUBMIT') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Activity details submitted successfully' } });
  }

  res.json({
    reportedDt: '03/19/2026 08:15',
    restoredDt: '',
    rri: '0:00',
    rebateQualified: 'N',
    sentToBilling: 'N',
    noaccess: '0:00',
    noaccessother: '0:00',
    actual: '7:15',
    center: '0:00',
    referral: '0:00',
    handoff: '0:00',
    outofservice: '7:15',
    elecbonding: '0:00',
    rebate: '0:00',
    total: '7:15',
    suspDur: '0:00',
    handoffDur: '0:00',
    monitorDuration: '0:00',
    maintenanceDuration: '0:00',
    hanoffetmsDuration: '0:00',
    numhandsoff: '0',
    trStatus: 'OPN',
    dispatchCenterName: 'NYCMNY01 - New York City',
    dispatchLocationRoutingAddress: '140 West St, New York, NY 10007',
    activityRows: [
      { function: 'OUT OF SERVICE', startDt: '03/19/2026 08:15', endDt: '', duration: '7:15', center: 'NYCMNY01', userId: 'JSMITH' },
    ],
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/GroupHistoryController
// Serves Histor-Response.json for LOAD_GRIDS; other actions unchanged
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/GroupHistoryController', (req, res) => {
  const action = req.body.actionCode || '';

  if (action === 'COPY_HISTORY') {
    return res.json({ success: true, message: 'History copied successfully' });
  }

  if (action === 'LOAD_GRID_IPMODULES') {
    return res.json({ success: true });
  }

  // LOAD_GRIDS (default) — serve real JSON file directly
  const data = readJSON('Histor-Response.json');
  console.log(`[MOCK] GroupHistoryController LOAD_GRIDS  gridRows=${(data.GRID_DATA?.TROUBLE_REPORT_NUM || []).length}  asscRows=${(data.ASSC_GRID_DATA?.TROUBLE_REPORT_NUM || []).length}`);
  res.json(data);
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/GrpMemberMgmtController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/GrpMemberMgmtController', (req, res) => {
  const action = req.body.action || '';

  // Consolidated into ATTACHED_TRS / ATTACHED_GROUPS in Ticket-Retrive-Response.json
  // if (action === 'LOAD_MEMBER_MGMT') {
  //   return res.json({
  //     resultData: {
  //       attachedTrs: [
  //         { trNum: 'TR001234', trType: 'FP', status: 'OPN', reportedDate: '03/19/2026 08:30', customerId: 'CUST001', circuitId: 'CKT-NYC-001', region: 'NE', notes: 'No FiOS service - fiber issue suspected' },
  //         { trNum: 'TR001235', trType: 'FP', status: 'OPN', reportedDate: '03/19/2026 08:45', customerId: 'CUST002', circuitId: 'CKT-NYC-002', region: 'NE', notes: 'Complete outage - same area as TR001234' },
  //         { trNum: 'TR001236', trType: 'FP', status: 'RST', reportedDate: '03/18/2026 16:00', customerId: 'CUST003', circuitId: 'CKT-NYC-003', region: 'NE', notes: 'Service restored after splice repair' },
  //       ],
  //       attachedGroups: [
  //         { trNum: 'GTR000999', trType: 'FP', status: 'OPN', reportedDate: '03/18/2026 14:00', groupName: 'Manhattan Outage - West Side', region: 'NE' },
  //       ],
  //     },
  //   });
  // }

  if (action === 'ATTACH_TR' || action === 'ATTACH_GROUP') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Record attached successfully' } });
  }

  if (action === 'DETACH_TR' || action === 'DETACH_GROUP') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Record detached successfully' } });
  }

  // Count now derived from array length in the component
  // if (action === 'GET_MEMBER_COUNT') {
  //   return res.json({ resultData: { count: 4 } });
  // }

  res.json({ resultData: { status: 'SUCCESS' } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/FunctionPanelLoadController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/FunctionPanelLoadController', (req, res) => {
  res.json({
    resultData: {
      functions: [
        { value: 'DISPATCH', label: 'Dispatch' },
        { value: 'HANDOFF', label: 'Handoff' },
        { value: 'REFERRAL', label: 'Referral' },
        { value: 'CLOSE', label: 'Close' },
        { value: 'CANCEL', label: 'Cancel' },
        { value: 'REOPEN', label: 'Reopen' },
        { value: 'LEVELUP', label: 'Level Up' },
        { value: 'TRANSFER', label: 'Transfer' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/WLMController (Tier2)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/WLMController', (req, res) => {
  const action = req.body.action || '';

  if (action === 'UPD') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Tier 2 data updated successfully' } });
  }

  if (action === 'searchClientInfo') {
    return res.json({
      recordCount: '1',
      clientName: 'Acme Corporation',
      clientPhone: '2125559876',
      clientEmail: 'support@acme.example.com',
      altPhone: '2125559877',
    });
  }

  if (action === 'SEND_VOID_ACTIONLOG') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Action log voided' } });
  }

  if (action === 'popVendor') {
    return res.json({
      vendorDDMData: [
        { value: '', label: '-- Select --' },
        { value: 'VND001', label: 'ABC Telecom Services' },
        { value: 'VND002', label: 'XYZ Cable Contractors' },
        { value: 'VND003', label: 'Metro Fiber Solutions' },
        { value: 'VND004', label: 'National Line Services' },
      ],
      wOnDDMData: [
        { value: '', label: '-- Select --' },
        { value: 'VZN', label: 'Verizon' },
        { value: 'VND', label: 'Vendor' },
        { value: 'CUST', label: 'Customer' },
        { value: 'OTHER', label: 'Other' },
      ],
      scopeDDMData: [
        { value: '', label: '-- Select --' },
        { value: 'INSTALL', label: 'Installation' },
        { value: 'REPAIR', label: 'Repair' },
        { value: 'MAINT', label: 'Maintenance' },
        { value: 'UPGRADE', label: 'Upgrade' },
      ],
    });
  }

  if (action === 'vendorAct') {
    return res.json({
      vendorId: 'VND001',
      vendorName: 'ABC Telecom Services',
      vendorContPh: '8005551234',
      vendorEmail: 'ops@abctelecom.example.com',
    });
  }

  if (action === 'LOAD_PLATFORM') {
    return res.json({
      platforms: [
        { value: '', label: '-- Select --' },
        { value: 'PLAT01', label: 'Alcatel-Lucent 7360' },
        { value: 'PLAT02', label: 'Calix E7-2' },
        { value: 'PLAT03', label: 'Cisco ASR 9000' },
        { value: 'PLAT04', label: 'Nokia 7750 SR' },
      ],
    });
  }

  if (action === 'LOAD_EQUIPMENT') {
    return res.json({
      equipment: [
        { value: '', label: '-- Select --' },
        { value: 'EQ01', label: 'OLT Shelf 1' },
        { value: 'EQ02', label: 'OLT Shelf 2' },
        { value: 'EQ03', label: 'Router Card A' },
        { value: 'EQ04', label: 'Router Card B' },
      ],
    });
  }

  if (action === 'LOAD_EQUIPMENT_ID') {
    return res.json({
      equipmentIds: [
        { value: '', label: '-- Select --' },
        { value: 'EID001', label: 'NYCMNY01-OLT-001' },
        { value: 'EID002', label: 'NYCMNY01-OLT-002' },
        { value: 'EID003', label: 'NYCMNY01-RTR-001' },
      ],
    });
  }

  if (action === 'LOAD_CAUSECODE') {
    return res.json({
      subCauseCodes: [
        { value: '', label: '-- Select --' },
        { value: 'SC01', label: 'Cable Damage - Dig Up' },
        { value: 'SC02', label: 'Cable Damage - Vehicle' },
        { value: 'SC03', label: 'Splice Failure' },
        { value: 'SC04', label: 'Connector Issue' },
        { value: 'SC05', label: 'Equipment Malfunction' },
      ],
    });
  }

  // Default: retrieve / getCacheData
  res.json({
    statusOptions: [
      { value: '', label: '-- Select --' },
      { value: 'NEW', label: 'New' },
      { value: 'INPROG', label: 'In Progress' },
      { value: 'PEND', label: 'Pending' },
      { value: 'COMP', label: 'Completed' },
      { value: 'CLOSED', label: 'Closed' },
    ],
    modeOfContactOptions: [
      { value: '', label: '-- Select --' },
      { value: 'PHONE', label: 'Phone' },
      { value: 'EMAIL', label: 'Email' },
      { value: 'CHAT', label: 'Chat' },
      { value: 'PORTAL', label: 'Portal' },
      { value: 'WALKIN', label: 'Walk-In' },
    ],
    clientOrgOptions: [
      { value: '', label: '-- Select --' },
      { value: 'ENT', label: 'Enterprise' },
      { value: 'SMB', label: 'Small/Medium Business' },
      { value: 'GOV', label: 'Government' },
      { value: 'EDU', label: 'Education' },
      { value: 'HEALTH', label: 'Healthcare' },
    ],
    wrStatusOptions: [
      { value: '', label: '-- Select --' },
      { value: 'OPEN', label: 'Open' },
      { value: 'ASSIGNED', label: 'Assigned' },
      { value: 'INPROG', label: 'In Progress' },
      { value: 'COMPLETE', label: 'Complete' },
      { value: 'CANCELLED', label: 'Cancelled' },
    ],
    requestTypeOptions: [
      { value: '', label: '-- Select --' },
      { value: 'REPAIR', label: 'Repair' },
      { value: 'INSTALL', label: 'Installation' },
      { value: 'MAINT', label: 'Maintenance' },
      { value: 'UPGRADE', label: 'Upgrade' },
      { value: 'INSPECT', label: 'Inspection' },
    ],
    regionOptions: [
      { value: '', label: '-- Select --' },
      { value: 'NE', label: 'Northeast' },
      { value: 'SE', label: 'Southeast' },
      { value: 'MW', label: 'Midwest' },
      { value: 'SW', label: 'Southwest' },
      { value: 'W', label: 'West' },
    ],
    causeCodeOptions: [
      { value: '', label: '-- Select --' },
      { value: 'CABLE', label: 'Cable/Fiber Damage' },
      { value: 'EQUIP', label: 'Equipment Failure' },
      { value: 'POWER', label: 'Power Issue' },
      { value: 'SOFTWARE', label: 'Software/Config' },
      { value: 'ENV', label: 'Environmental' },
      { value: 'CUST', label: 'Customer Premise' },
    ],
    subCauseCodeOptions: [
      { value: '', label: '-- Select --' },
      { value: 'SC01', label: 'Cable Damage - Dig Up' },
      { value: 'SC02', label: 'Cable Damage - Vehicle' },
      { value: 'SC03', label: 'Splice Failure' },
      { value: 'SC04', label: 'Connector Issue' },
    ],
    complexityOptions: [
      { value: '', label: '-- Select --' },
      { value: 'LOW', label: 'Low' },
      { value: 'MEDIUM', label: 'Medium' },
      { value: 'HIGH', label: 'High' },
      { value: 'CRITICAL', label: 'Critical' },
    ],
    tier2Template: 'RFA',
    actionLog: [
      { actionId: 'AL001', date: '03/19/2026 10:00', userId: 'JSMITH', hours: '1', minutes: '30', description: 'Initial assessment of fiber cut - coordinated with field crew' },
      { actionId: 'AL002', date: '03/19/2026 12:00', userId: 'ADOE', hours: '0', minutes: '45', description: 'Updated customer notification template - sent bulk notifications' },
      { actionId: 'AL003', date: '03/19/2026 14:00', userId: 'BCHEN', hours: '2', minutes: '00', description: 'Splice crew on site - fiber restoration in progress' },
    ],
    details: {
      status: 'INPROG',
      troubleDesc: 'Major fiber cut on Main Street affecting 150 customers - splice required',
      reportedDT: '03/19/2026 08:15',
      clientId: 'CLT001',
      clientName: 'Acme Corporation',
      clientPhone: '2125559876',
      clientEmail: 'support@acme.example.com',
      contactMethod: 'PHONE',
      clientOrg: 'ENT',
      clientTicket: 'ACME-TKT-2026-0312',
      altPhone: '2125559877',
      causeCode: 'CABLE',
      subCauseCode: 'SC01',
      rfaComplexity: 'HIGH',
      troubleResolution: '',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/EmailController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/EmailController', (req, res) => {
  const operation = req.body.operation || '';

  if (operation === 'REFRESH') {
    return res.json({
      emailrows: [
        { emailId: 'EM001', from: 'jsmith@verizon.example.com', to: 'noc@verizon.example.com', subject: 'GTR0001234 - Fiber Cut Update', date: '03/19/2026 10:30', status: 'SENT', hasAttachment: 'N' },
        { emailId: 'EM002', from: 'noc@verizon.example.com', to: 'jsmith@verizon.example.com', subject: 'RE: GTR0001234 - Crew Dispatched', date: '03/19/2026 11:00', status: 'READ', hasAttachment: 'N' },
        { emailId: 'EM003', from: 'adoe@verizon.example.com', to: 'escalation@verizon.example.com', subject: 'ESCALATION: GTR0001234 - Major Fiber Cut', date: '03/19/2026 12:00', status: 'SENT', hasAttachment: 'Y' },
        { emailId: 'EM004', from: 'bchen@verizon.example.com', to: 'jsmith@verizon.example.com', subject: 'GTR0001234 - Splice Crew ETA', date: '03/19/2026 13:00', status: 'READ', hasAttachment: 'N' },
        { emailId: 'EM005', from: 'jsmith@verizon.example.com', to: 'customers@verizon.example.com', subject: 'Service Outage Notification - Estimated Restore 18:00', date: '03/19/2026 13:30', status: 'SENT', hasAttachment: 'N' },
      ],
      sCount: 5,
    });
  }

  if (operation === 'SEND') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Email sent successfully' } });
  }

  if (operation === 'EMAILINFO') {
    return res.json({
      emailId: req.body.emailID || 'EM001',
      from: 'jsmith@verizon.example.com',
      to: 'noc@verizon.example.com',
      cc: 'adoe@verizon.example.com',
      bcc: '',
      subject: 'GTR0001234 - Fiber Cut Update',
      body: 'Update on Group TR GTR0001234:\n\nFiber cut confirmed on Main Street between 3rd and 4th Avenue.\nApprox 150 customers affected.\nSplice crew dispatched - ETA 14:00.\n\nRegards,\nJohn Smith\nNetwork Operations Center',
      bodyHtml: '',
      date: '03/19/2026 10:30',
      hasAttachment: 'N',
      attachments: [],
    });
  }

  if (operation === 'MAILGRP') {
    return res.json({
      mailGroups: [
        { value: 'NOC_TEAM', label: 'NOC Team' },
        { value: 'FIELD_OPS', label: 'Field Operations' },
        { value: 'MGMT', label: 'Management' },
        { value: 'CUST_SVC', label: 'Customer Service' },
      ],
    });
  }

  if (operation === 'TEMPLATEID') {
    return res.json({
      templates: [
        { value: '', label: '-- Select Template --' },
        { value: 'TPL_OUTAGE', label: 'Outage Notification' },
        { value: 'TPL_UPDATE', label: 'Status Update' },
        { value: 'TPL_RESTORE', label: 'Service Restored' },
        { value: 'TPL_ESCL', label: 'Escalation' },
      ],
    });
  }

  res.json({ resultData: { status: 'SUCCESS' } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/EmailAttachmentUploadController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/EmailAttachmentUploadController', (req, res) => {
  res.json({ resultData: { status: 'SUCCESS', fileName: 'upload.txt', fileId: 'FILE001' } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /controller/AttachmentDownloadController
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/controller/AttachmentDownloadController', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send('Mock attachment content - this is a placeholder file for download testing.');
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/PropertyUBICodeController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/PropertyUBICodeController', (req, res) => {
  res.json({ resultData: { status: 'SUCCESS' } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/MyFlaggedListController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/MyFlaggedListController', (req, res) => {
  res.json({ message: 'Ticket flagged successfully' });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/LineSearchController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/LineSearchController', (req, res) => {
  const target = req.body.target || '';

  if (target === 'SEARCH') {
    return res.json({
      results: [
        { trNum: 'TR001240', trType: 'FP', status: 'OPN', reportedDate: '03/19/2026 09:00', circuitId: 'CKT-NYC-010', customerId: 'CUST010', region: 'NE' },
        { trNum: 'TR001241', trType: 'FP', status: 'OPN', reportedDate: '03/19/2026 09:15', circuitId: 'CKT-NYC-011', customerId: 'CUST011', region: 'NE' },
        { trNum: 'TR001242', trType: 'FP', status: 'RST', reportedDate: '03/18/2026 14:00', circuitId: 'CKT-NYC-012', customerId: 'CUST012', region: 'NE' },
      ],
    });
  }

  if (req.body.ipServiceReq === 'IPSERVICESREQ') {
    return res.json({
      resultData: {
        ipServices: [
          { serviceId: 'IPSVC001', serviceName: 'Internet Access', speed: '100Mbps', status: 'Active' },
          { serviceId: 'IPSVC002', serviceName: 'VoIP', speed: 'N/A', status: 'Active' },
        ],
      },
    });
  }

  // REFRESH / default
  res.json({
    resultData: {
      searchResults: [
        { trNum: 'TR001234', status: 'OPN', circuitId: 'CKT-NYC-001', customerId: 'CUST001' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/ETMSInventoryController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/ETMSInventoryController', (req, res) => {
  const action = req.body.action || '';

  if (action === 'GET_INITIAL_ETMS') {
    return res.json({
      resultData: {
        products: [
          { elementID: 'PRD001', productName: 'FiOS Internet', productType: 'Data', speed: '1Gbps', status: 'Active', isPrimary: true, circuitId: 'CKT-NYC-001' },
          { elementID: 'PRD002', productName: 'FiOS TV', productType: 'Video', speed: 'N/A', status: 'Active', isPrimary: false, circuitId: 'CKT-NYC-001' },
          { elementID: 'PRD003', productName: 'FiOS Digital Voice', productType: 'Voice', speed: 'N/A', status: 'Active', isPrimary: false, circuitId: 'CKT-NYC-002' },
        ],
        networkElements: [
          { neId: 'NE001', neName: 'NYCMNY01-OLT-001', neType: 'OLT', location: 'NYCMNY01', status: 'Active' },
          { neId: 'NE002', neName: 'NYCMNY01-RTR-001', neType: 'Router', location: 'NYCMNY01', status: 'Active' },
        ],
      },
    });
  }

  if (action === 'ADD_PRODUCT' || action === 'UPDATE_PRODUCT' || action === 'DELETE_PRODUCT' || action === 'CHANGE_PRIMARY' || action === 'CHANGE_PRIMARY_NE') {
    return res.json({ resultData: { status: 'SUCCESS', message: 'Product operation completed successfully' } });
  }

  if (action === 'GET_PRODUCT_DETAILS') {
    return res.json({
      resultData: {
        productName: 'FiOS Internet',
        productType: 'Data',
        speed: '1Gbps',
        status: 'Active',
        circuitId: 'CKT-NYC-001',
        serviceAddress: '123 Main Street, New York, NY 10001',
      },
    });
  }

  if (action === 'GET_IP_SERVICES') {
    return res.json({
      resultData: {
        ipServices: [
          { serviceId: 'IPSVC001', serviceName: 'Internet', speed: '1Gbps', status: 'Active', vlan: '100' },
          { serviceId: 'IPSVC002', serviceName: 'VoIP', speed: 'N/A', status: 'Active', vlan: '200' },
        ],
      },
    });
  }

  // default for getEquipmentCircuitDetails and other actions
  res.json({
    resultData: {
      circuitId: 'CKT-NYC-001',
      circuitType: 'Fiber',
      status: 'Active',
      aLocation: 'NYCMNY01',
      zLocation: 'CUST-PREM-001',
      bandwidth: '1Gbps',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/ETMSHistorySearchController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/ETMSHistorySearchController', (req, res) => {
  const action = req.body.action || '';

  if (action === 'LOAD_ETMS_HISTORY_DETAILS') {
    return res.json({
      productDDM: [
        { value: 'PRD001', label: 'FiOS Internet - 1Gbps' },
        { value: 'PRD002', label: 'FiOS TV' },
        { value: 'PRD003', label: 'FiOS Digital Voice' },
      ],
      productCount: '3',
      primaryProduct: { elementID: 'PRD001', productName: 'FiOS Internet' },
    });
  }

  // ETMS_HISTORY_DETAILS
  res.json({
    resultData: {
      historyRows: [
        { trNum: 'ETMS001', productName: 'FiOS Internet', status: 'CLD', reportedDate: '02/01/2026', closedDate: '02/02/2026', cause: 'CABLE', resolution: 'Splice repair' },
        { trNum: 'ETMS002', productName: 'FiOS Internet', status: 'CLD', reportedDate: '01/15/2026', closedDate: '01/15/2026', cause: 'POWER', resolution: 'Commercial power restored' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/ETMSSearchController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/ETMSSearchController', (req, res) => {
  res.json({
    resultData: {
      searchResults: [
        { etmsId: 'ETMS-5678', productName: 'FiOS Internet', circuitId: 'CKT-NYC-001', status: 'Active' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/FacilitySearchController (NMA availability check)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/FacilitySearchController', (req, res) => {
  res.json({ data: { available: true } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/LineTestController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/LineTestController', (req, res) => {
  const action = req.body.action || req.body.actionCode || '';
  if (action === 'RUN_TESTS') {
    // Simulate test results with a short delay
    setTimeout(() => {
      res.json({
        resultData: {
          results: [
            { tool: 'Delphi', status: 'PASS', message: 'Line quality within acceptable parameters', details: 'SNR: 32dB, Attenuation: 18dB' },
            { tool: 'NXTT', status: 'PASS', message: 'No cross-talk detected', details: 'NEXT: -55dB, FEXT: -62dB' },
            { tool: 'Fortel', status: 'WARNING', message: 'Marginal signal strength detected', details: 'Signal: -22dBm (threshold: -20dBm)' },
            { tool: 'MLT', status: 'PASS', message: 'Metallic loop test passed', details: 'Loop resistance: 450 ohms' },
          ],
          summary: { passed: 3, warnings: 1, failed: 0, total: 4 },
          timestamp: new Date().toISOString(),
        },
      });
    }, 1500);
    return;
  }
  res.json({ resultData: { testTypes: ['Delphi', 'NXTT', 'Fortel', 'MLT'] } });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/LossOfDiversityController (email lookup)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/LossOfDiversityController', (req, res) => {
  res.json({
    resultData: {
      emailId: 'jsmith@verizon.example.com',
      displayName: 'John Smith',
      escalationList: [
        { value: 'ESC1', label: 'Level 1 - NOC Manager' },
        { value: 'ESC2', label: 'Level 2 - Regional Director' },
        { value: 'ESC3', label: 'Level 3 - VP Operations' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/TroubleNotesController (Trouble Notes tab)
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/TroubleNotesController', (req, res) => {
  res.json({
    resultData: {
      notes: [
        { noteId: 'N001', dateTime: '03/19/2026 08:30', userId: 'JSMITH', noteText: 'Initial fiber cut reported by multiple customers on Main Street.' },
        { noteId: 'N002', dateTime: '03/19/2026 10:00', userId: 'JSMITH', noteText: 'Crew dispatched - confirmed 48-count fiber bundle damaged.' },
        { noteId: 'N003', dateTime: '03/19/2026 12:30', userId: 'ADOE', noteText: 'Escalated to management per P1 protocol. Customer notifications sent.' },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/EventSummaryController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/EventSummaryController', (req, res) => {
  res.json({
    resultData: {
      eventId: 'EVT-2026-001',
      eventType: 'Fiber Cut',
      severity: '2 - Major',
      startDate: '03/19/2026 08:15',
      restoralDate: '',
      customersAffected: '150',
      summary: 'Fiber cut on Main Street between 3rd and 4th Avenue. Splice crew on site.',
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/CustomerContextController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/CustomerContextController', (req, res) => {
  res.json({
    resultData: {
      account: {
        customerName: 'Acme Industries Corp',
        accountNumber: 'ACCT-2026-78432',
        productType: 'FiOS Business',
        serviceAddress: '1400 Broadway, New York, NY 10018',
      },
      lineRecord: {
        lineStatus: 'OUT_OF_SERVICE',
        circuitId: 'CKT-NYC-BWAY-1400-F1',
        equipmentType: 'ONT-G-240G-A',
        lastTestDate: '03/18/2026 14:30',
        clli: 'NYCMNY01',
      },
      priorTickets: [
        { trNum: 'TR001230', status: 'CLD', date: '03/10/2026', description: 'Intermittent service loss - resolved' },
        { trNum: 'TR001215', status: 'CLD', date: '02/28/2026', description: 'Fiber cut on 38th St - repaired' },
        { trNum: 'TR001198', status: 'CLD', date: '02/15/2026', description: 'ONT replacement completed' },
        { trNum: 'TR001180', status: 'CLD', date: '01/30/2026', description: 'Speed test failure - config fix' },
        { trNum: 'TR001155', status: 'CLD', date: '01/15/2026', description: 'Customer premise wiring issue' },
      ],
      contact: {
        primaryName: 'Sarah Chen',
        primaryPhone: '212-555-4567',
        primaryEmail: 'schen@acmeindustries.com',
        secondaryName: 'Mike Rodriguez',
        secondaryPhone: '212-555-4568',
        secondaryEmail: 'mrodriguez@acmeindustries.com',
      },
      serviceDetails: {
        serviceType: 'FiOS Business Internet',
        classOfService: 'Business Premium',
        rate: '$299.99/mo',
        maintenanceCenter: 'NYCMNY01 - NYC Manhattan',
      },
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /controller/DispatchController
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/DispatchController', (req, res) => {
  res.json({
    resultData: {
      dispatchStatus: 'DISPATCHED',
      technician: {
        name: 'Carlos Martinez',
        phone: '917-555-8901',
        techId: 'TECH-4521',
      },
      eta: '03/19/2026 14:30',
      ctcTabletSync: {
        lastSync: new Date(Date.now() - 180000).toISOString(),
        status: 'SYNCED',
        lastUpdate: 'Technician en route to customer premise',
      },
      resolution: {
        status: 'IN_PROGRESS',
        notes: 'Technician dispatched for fiber splice repair at customer premises',
      },
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/worklists/my — Current user's worklists
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/worklists/my', (req, res) => {
  const worklists = readJSON('worklists.json').filter(w => !w.deleted && w.createdBy === CURRENT_USER);
  res.json(worklists.map(({ deleted, ...rest }) => rest));
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/worklists/all — All worklists
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/worklists/all', (req, res) => {
  const worklists = readJSON('worklists.json').filter(w => !w.deleted);
  res.json(worklists.map(({ deleted, ...rest }) => rest));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DELETE /api/worklists/:id — Soft-delete a worklist
// ═══════════════════════════════════════════════════════════════════════════════
app.delete('/api/worklists/:id', (req, res) => {
  const worklists = readJSON('worklists.json');
  const idx = worklists.findIndex(w => w.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Worklist not found' });
  worklists[idx].deleted = true;
  writeJSON('worklists.json', worklists);
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/worklists/:id/default — Set worklist as default
// ═══════════════════════════════════════════════════════════════════════════════
app.put('/api/worklists/:id/default', (req, res) => {
  const worklists = readJSON('worklists.json');
  const target = worklists.find(w => w.id === req.params.id);
  if (!target) return res.status(404).json({ success: false, message: 'Worklist not found' });
  worklists.forEach(w => { w.isDefault = w.id === req.params.id; });
  writeJSON('worklists.json', worklists);
  // Also update settings
  const settings = readJSON('settings.json');
  settings.defaultWorklistId = req.params.id;
  writeJSON('settings.json', settings);
  const { deleted, ...result } = target;
  res.json({ ...result, isDefault: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/settings/worklist — Get worklist display settings
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/settings/worklist', (req, res) => {
  res.json(readJSON('settings.json'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// PUT /api/settings/worklist — Update worklist display settings
// ═══════════════════════════════════════════════════════════════════════════════
app.put('/api/settings/worklist', (req, res) => {
  const current = readJSON('settings.json');
  const updated = { ...current, ...req.body };
  writeJSON('settings.json', updated);
  res.json({ success: true, settings: updated });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/tickets/:worklistId — Paginated tickets for a worklist
// ═══════════════════════════════════════════════════════════════════════════════
app.get('/api/tickets/:worklistId', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 25;
  const allTickets = readJSON('tickets.json').filter(t => t.worklistId === req.params.worklistId);
  const start = (page - 1) * pageSize;
  const items = allTickets.slice(start, start + pageSize);
  res.json({
    items,
    total: allTickets.length,
    page,
    pageSize,
    totalPages: Math.ceil(allTickets.length / pageSize),
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/tickets/bulk-action — Bulk ticket operations
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/api/tickets/bulk-action', (req, res) => {
  const { trNums, action, payload } = req.body;
  if (!trNums || !Array.isArray(trNums) || !action) {
    return res.status(400).json({ success: false, message: 'trNums (array) and action are required' });
  }

  const VALID_ACTIONS = [
    'pick', 'grab', 'get', 'force', 'drop', 'dropAll',
    'assignUser', 'unassignUser',
    'cancelGroup', 'closeGroup', 'groupFixed', 'groupUpdate', 'groupAttach',
    'resolveNma', 'maintenanceTime', 'monitorService',
    'remarks', 'internalRemark',
    'copy',
    'openTroubleReport', 'openMemberMgmt',
  ];

  if (!VALID_ACTIONS.includes(action)) {
    return res.status(400).json({ success: false, message: `Unknown action: ${action}` });
  }

  const tickets = readJSON('tickets.json');
  let affectedCount = 0;
  tickets.forEach(t => {
    if (trNums.includes(t.trNum)) {
      affectedCount++;
      if (action === 'pick' || action === 'grab' || action === 'get' || action === 'force') {
        t.assignedTo = CURRENT_USER;
      }
      if (action === 'assignUser' && payload?.assignTo) t.assignedTo = payload.assignTo;
      if (action === 'unassignUser' || action === 'drop' || action === 'dropAll') t.assignedTo = '';
      if (action === 'cancelGroup') t.status = 'CAN';
      if (action === 'closeGroup') t.status = 'CLD';
      if (action === 'groupFixed') t.stat = 'IP';
      if (action === 'resolveNma') t.stat = 'AP';
      // remarks, internalRemark, copy, openTroubleReport, openMemberMgmt,
      // groupUpdate, groupAttach, maintenanceTime, monitorService — no field change
      t.lastUpdated = new Date().toISOString();
    }
  });
  writeJSON('tickets.json', tickets);
  res.json({ success: true, affectedCount, action });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /vRepairOne/controller/wlnGroupActivityLog
// Query params: groupTroubleNum, type, activitySeqNum, userId, searchType
// Reads Activity-log.json and returns the raw parallel-array shape.
// Supports type=detach filtering and activitySeqNum-based pagination.
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/vRepairOne/controller/wlnGroupActivityLog', (req, res) => {
  const type           = req.query.type           || '';
  const activitySeqNum = parseInt(req.query.activitySeqNum) || 0;

  const data = readJSON('Activity-log.json');
  const len  = (data.ACTIVITY_SEQ_NUM || []).length;

  // Build index list — filter by type=detach if requested
  const DETACH_CODES = new Set(['ADD-GRP', 'ASSIGN', 'DETACH', 'REMOVE', 'ATTACH']);
  let indices = Array.from({ length: len }, (_, i) => i).filter((i) => {
    if (type === 'detach') {
      return DETACH_CODES.has(data.ACTIVITY_FUNCTION_CODE?.[i]);
    }
    return true;
  });

  // Paginate: when activitySeqNum > 0 keep only entries whose DB seq is below
  // that cursor (older entries), simulating "next page" behaviour.
  if (activitySeqNum > 0) {
    indices = indices.filter(
      (i) => Number(data.DB_ACTIVITYSEQNUM?.[i]) < activitySeqNum
    );
  }

  // Rebuild parallel arrays for the filtered/paged slice
  const pick = (arr) => indices.map((i) => (arr || [])[i] ?? '');

  const result = {
    StatusCode:              'SUCCESS',
    StatusDesc:              'SUCCESS',
    TOTAL_RECORDS:           indices.length,
    ACTIVITY_SEQ_NUM:        pick(data.ACTIVITY_SEQ_NUM),
    ACTIVITY_LOG_DATE:       pick(data.ACTIVITY_LOG_DATE),
    DB_ACTIVITYSEQNUM:       pick(data.DB_ACTIVITYSEQNUM),
    ORIGINATOR_ID:           pick(data.ORIGINATOR_ID),
    MAINTENANCE_CENTER_ID:   pick(data.MAINTENANCE_CENTER_ID),
    MAINTENANCE_CENTER_NAME: pick(data.MAINTENANCE_CENTER_NAME),
    USER_NAME:               pick(data.USER_NAME),
    APPLICATION_ID:          pick(data.APPLICATION_ID),
    APPLICATION_NAME:        pick(data.APPLICATION_NAME),
    ACTIVITY_DESCRIPTION:    pick(data.ACTIVITY_DESCRIPTION),
    ACTIVITY_STATUS_CODE:    pick(data.ACTIVITY_STATUS_CODE),
    ACTIVITY_FUNCTION_CODE:  pick(data.ACTIVITY_FUNCTION_CODE),
    MANUAL_USER_FLAG:        pick(data.MANUAL_USER_FLAG),
    LOGLEVEL:                pick(data.LOGLEVEL),
    TO_INFO:                 [],
    FROM_INFO:               [],
  };

  console.log(
    `[MOCK] wlnGroupActivityLog  tr=${req.query.groupTroubleNum}  type=${type || 'ALL'}  seqFrom=${activitySeqNum}  returned=${indices.length} rows`
  );
  res.json(result);
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /vRepairOne/controller/wlnGroupHistory
// Query params: userId, groupTroubleNum, historyOption, groupType, groupName, regionId
// Serves Histor-Response.json directly
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/vRepairOne/controller/wlnGroupHistory', (req, res) => {
  const data = readJSON('Histor-Response.json');
  console.log(
    `[MOCK] wlnGroupHistory  tr=${req.query.groupTroubleNum}  type=${req.query.groupType}  historyOption=${req.query.historyOption}  gridRows=${(data.GRID_DATA?.TROUBLE_REPORT_NUM || []).length}`
  );
  res.json(data);
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /vRepairOne/controller/wlnGroupTicketRetrieve — WLN group ticket (trouble info)
// Serves Ticket-Retrive-Response.json directly
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/vRepairOne/controller/wlnGroupTicketRetrieve', (req, res) => {
  const data = readJSON('Ticket-Retrive-Response.json');
  console.log(`[MOCK] wlnGroupTicketRetrieve  tr=${req.query.groupTroubleNum || data.GROUP_TROUBLE_NUM}`);
  res.json(data);
});

// ═══════════════════════════════════════════════════════════════════════════════
// Catch-all for any unmatched POST routes
// ═══════════════════════════════════════════════════════════════════════════════
app.post('/controller/*', (req, res) => {
  console.log(`[MOCK] Unmatched controller: ${req.path}`);
  res.json({ resultData: { status: 'SUCCESS' } });
});

// ─── Start Server ───
app.listen(PORT, () => {
  console.log(`\n  vRepair Mock Server running on http://localhost:${PORT}`);
  console.log(`  CORS enabled for http://localhost:5173`);
  console.log(`  Ready to accept requests.\n`);
});
