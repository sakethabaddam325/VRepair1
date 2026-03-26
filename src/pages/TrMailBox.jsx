import React, { useState, useEffect, useCallback, useRef } from 'react';
import DataGrid from '../components/DataGrid.jsx';
import Modal from '../components/Modal.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import UploadDownload from '../components/UploadDownload.jsx';
import { Button } from '@mui/material';
import { useAppContext } from '../contexts/AppContext.jsx';
import { sendEmailOperation, lookupEmailId, downloadAttachment } from '../api/emailApi.js';
import { EMAIL_OPERATIONS, EMAIL_TYPES } from '../constants/appConstants.js';
import { normalizeEmailSeparators } from '../utils/stringUtils.js';
import { Box, Stack, Typography } from '@mui/material';

const fieldLabelSx = {
  fontSize: 11,
  fontWeight: 400,
  whiteSpace: 'nowrap',
  color: 'text.primary',
  userSelect: 'none',
};

const readOnlyLabelSx = {
  ...fieldLabelSx,
  color: '#9E9E9E',
};

const fieldLabelTopSx = { ...fieldLabelSx, alignSelf: 'start', pt: '4px' };

const textInputSx = {
  fontSize: 12,
  lineHeight: '14px',
  py: '4px',
  px: '5px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  color: 'text.primary',
  bgcolor: 'background.paper',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  minWidth: 0,
  '&:focus': { borderColor: 'grey.900' },
  '&:disabled': { bgcolor: 'grey.100', color: 'text.disabled', cursor: 'default' },
  '&[readOnly]': { bgcolor: 'grey.100', color: 'text.disabled', cursor: 'default' },
};

const selectSx = {
  fontSize: 11,
  lineHeight: '13.2px',
  py: '4px',
  px: '5px',
  pr: '24px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  color: 'text.primary',
  bgcolor: 'background.paper',
  appearance: 'none',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  minWidth: 0,
  '&:focus': { borderColor: 'grey.900' },
};

const textareaSx = {
  fontSize: 12,
  lineHeight: '14px',
  width: '730px',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  p: '5px',
  color: 'text.primary',
  bgcolor: 'background.paper',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  resize: 'vertical',
  '&:focus': { borderColor: 'grey.900' },
  '&[readOnly]': { bgcolor: 'grey.100', color: 'text.disabled', cursor: 'default' },
};

const checkboxSx = {
  accentColor: 'primary.main',
  cursor: 'pointer',
  width: '16px',
  height: '16px',
  '&:disabled': { cursor: 'default' },
};

const composeGridSx = {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gap: '4px 8px',
  alignItems: 'center',
  width: '100%',
  fontSize: 12,
};

const TrMailBox = ({ trNum, sessionUniqueKey, sourceLink = 'TRM', fromFunctionPanel = false }) => {
  const { showAlert } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);

  const [emailRows, setEmailRows] = useState([]);
  const [emailCount, setEmailCount] = useState(0);
  const [selectedEmailId, setSelectedEmailId] = useState(null);

  const [composeOpen, setComposeOpen] = useState(false);
  const [mailType, setMailType] = useState(EMAIL_TYPES.NEW);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [lookupTargetField, setLookupTargetField] = useState('to');

  const [fromAddr, setFromAddr] = useState('');
  const [toAddr, setToAddr] = useState('');
  const [ccAddr, setCcAddr] = useState('');
  const [bccAddr, setBccAddr] = useState('');
  const [subject, setSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgBodyHtml, setMsgBodyHtml] = useState('');
  const [isHtmlBody, setIsHtmlBody] = useState(false);
  const [emailDate, setEmailDate] = useState('');
  const [emailTemplateId, setEmailTemplateId] = useState('');
  const [templateOptions, setTemplateOptions] = useState([]);
  const [useTemplate, setUseTemplate] = useState(false);
  const [useAttachment, setUseAttachment] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const [useToMailGrp, setUseToMailGrp] = useState(false);
  const [useCCMailGrp, setUseCCMailGrp] = useState(false);
  const [useBCCMailGrp, setUseBCCMailGrp] = useState(false);
  const [toMailGrpOptions, setToMailGrpOptions] = useState([]);
  const [ccMailGrpOptions, setCCMailGrpOptions] = useState([]);
  const [bccMailGrpOptions, setBCCMailGrpOptions] = useState([]);

  const [lookupName, setLookupName] = useState('');
  const [escalationOptions, setEscalationOptions] = useState([]);
  const [selectedEscalation, setSelectedEscalation] = useState('');
  const [escalationEmailText, setEscalationEmailText] = useState('');
  const [isLookupResultLoaded, setIsLookupResultLoaded] = useState(false);

  useEffect(() => {
    refreshEmailGrid();
  }, []);

  const refreshEmailGrid = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await sendEmailOperation({ operation: EMAIL_OPERATIONS.REFRESH, sessionUniqueKey, troubleReportNum: trNum, srcLink: sourceLink });
      if (response.data) {
        const rows = Array.isArray(response.data.emailrows) ? response.data.emailrows : [];
        setEmailRows(rows);
        setEmailCount(response.data.sCount || rows.length);
      }
    } catch {
      showAlert('Error loading email data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, trNum, sourceLink, showAlert]);

  const spawnComposeDialog = useCallback(async (type) => {
    if (type !== EMAIL_TYPES.NEW && !selectedEmailId) { showAlert('Please select an email first.'); return; }
    setMailType(type);
    resetComposeForm();
    if (type !== EMAIL_TYPES.NEW && selectedEmailId) {
      setIsLoading(true);
      try {
        const response = await sendEmailOperation({ operation: EMAIL_OPERATIONS.EMAIL_INFO, sessionUniqueKey, emailID: selectedEmailId, troubleReportNum: trNum });
        if (response.data) populateComposeFromResponse(response.data, type);
      } catch {
        showAlert('Error loading email details.');
      } finally {
        setIsLoading(false);
      }
    }
    setComposeOpen(true);
  }, [selectedEmailId, sessionUniqueKey, trNum, showAlert]);

  const resetComposeForm = useCallback(() => {
    setToAddr(''); setCcAddr(''); setBccAddr(''); setSubject(''); setMsgBody('');
    setMsgBodyHtml(''); setIsHtmlBody(false); setUseTemplate(false); setEmailTemplateId('');
    setUseAttachment(false); setAttachedFile(null); setUseToMailGrp(false); setUseCCMailGrp(false); setUseBCCMailGrp(false);
  }, []);

  const populateComposeFromResponse = useCallback((data, type) => {
    if (data.contentType === 'HTML') { setIsHtmlBody(true); setMsgBodyHtml(data.body || ''); }
    else { setMsgBody(data.body || ''); }
    if (type === EMAIL_TYPES.REPLY || type === EMAIL_TYPES.REPLY_ALL) { setSubject(`Re: ${data.subject || ''}`); setToAddr(data.fromAddr || ''); }
    else if (type === EMAIL_TYPES.FORWARD) { setSubject(`Fwd: ${data.subject || ''}`); }
    else if (type === EMAIL_TYPES.VIEW) { setSubject(data.subject || ''); setToAddr(data.toAddr || ''); setCcAddr(data.ccAddr || ''); setBccAddr(data.bccAddr || ''); }
  }, [trNum]);

  const isMandatoryField = useCallback(() => {
    if (mailType === EMAIL_TYPES.NEW) {
      if (!toAddr.trim()) { showAlert('To field is required.'); return true; }
      if (!subject.trim()) { showAlert('Subject is required.'); return true; }
    }
    if (useAttachment && !attachedFile) { showAlert('Please select a file to attach.'); return true; }
    return false;
  }, [mailType, toAddr, subject, useAttachment, attachedFile, showAlert]);

  const handleSendMail = useCallback(async () => {
    if (isMandatoryField()) return;
    setIsLoading(true);
    try {
      const params = {
        operation: EMAIL_OPERATIONS.SEND, sessionUniqueKey, troubleReportNum: trNum, sMailType: mailType,
        emailFromAddr: fromAddr, emailToAddr: useToMailGrp ? '' : toAddr, emailCCAddr: useCCMailGrp ? '' : ccAddr,
        emailBCCAddr: useBCCMailGrp ? '' : bccAddr, emailSubject: subject, emailBody: msgBody,
        emailDate: new Date().toISOString(), emailType: mailType, emailTemplateId: useTemplate ? emailTemplateId : '', srcLink: sourceLink,
      };
      const response = await sendEmailOperation(params);
      if (response.data?.status === 'SUCCESS') {
        showAlert(useAttachment && attachedFile ? 'Email sent with attachment.' : 'Email sent successfully.');
        setComposeOpen(false);
        refreshEmailGrid();
      } else {
        showAlert(response.data?.message || 'Error sending email.');
      }
    } catch {
      showAlert('Error sending email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isMandatoryField, sessionUniqueKey, trNum, mailType, fromAddr, toAddr, ccAddr, bccAddr,
      subject, msgBody, useToMailGrp, useCCMailGrp, useBCCMailGrp, emailTemplateId, useTemplate,
      useAttachment, attachedFile, sourceLink, showAlert, refreshEmailGrid]);

  const handleTemplateToggle = useCallback(async (checked) => {
    setUseTemplate(checked);
    if (checked) {
      try {
        const response = await sendEmailOperation({ operation: EMAIL_OPERATIONS.TEMPLATE_ID, sessionUniqueKey, srcLink: sourceLink });
        if (response.data?.emailtemplates) {
          setTemplateOptions(response.data.emailtemplates.map((t) => ({ value: t.TEMP_ID, label: t.TEMP_NAME, subject: t.TEMP_SUBJECT, body: t.TEMP_BODY })));
        }
      } catch { showAlert('Error loading email templates.'); }
    }
  }, [sessionUniqueKey, sourceLink, showAlert]);

  const handleInsertTemplate = useCallback(() => {
    const tmpl = templateOptions.find((t) => t.value === emailTemplateId);
    if (tmpl) { setSubject(tmpl.subject || ''); setMsgBody(tmpl.body || ''); }
  }, [templateOptions, emailTemplateId]);

  const handleMailGroupToggle = useCallback(async (field, checked) => {
    const setters = { to: setUseToMailGrp, cc: setUseCCMailGrp, bcc: setUseBCCMailGrp };
    setters[field](checked);
    if (checked) {
      try {
        const response = await sendEmailOperation({ operation: EMAIL_OPERATIONS.MAIL_GRP, sessionUniqueKey });
        if (response.data) { setToMailGrpOptions(response.data.toGroups || []); setCCMailGrpOptions(response.data.ccGroups || []); setBCCMailGrpOptions(response.data.bccGroups || []); }
      } catch {}
    }
  }, [sessionUniqueKey]);

  const handleEmailLookup = useCallback(async () => {
    if (!lookupName.trim()) { showAlert('Please enter a name to search.'); return; }
    setIsLoading(true);
    try {
      const response = await lookupEmailId({ nameTxt: lookupName, sessionUniqueKey });
      if (response.data?.users?.length > 0) {
        setEscalationOptions(response.data.users.map((u) => ({ value: u.emailId, label: `${u.lastName}, ${u.firstName}`, email: u.emailId })));
        setIsLookupResultLoaded(true);
      } else {
        showAlert('No users found for the provided name.');
      }
    } catch {
      showAlert('Error performing email ID lookup.');
    } finally {
      setIsLoading(false);
    }
  }, [lookupName, sessionUniqueKey, showAlert]);

  const handleSetMailId = useCallback(() => {
    if (!selectedEscalation) return;
    const emailAddr = selectedEscalation + '; ';
    if (lookupTargetField === 'to') setToAddr((prev) => normalizeEmailSeparators(prev + emailAddr));
    else if (lookupTargetField === 'cc') setCcAddr((prev) => normalizeEmailSeparators(prev + emailAddr));
    else if (lookupTargetField === 'bcc') setBccAddr((prev) => normalizeEmailSeparators(prev + emailAddr));
    setLookupOpen(false);
  }, [selectedEscalation, lookupTargetField]);

  const emailColumns = [
    { field: 'date', label: 'DATE', width: 130 },
    { field: 'emailId', label: 'EMAILID', width: 50, hidden: true },
    { field: 'hasAttachment', label: 'ATTACHMENT', width: 80 },
    { field: 'status', label: 'TYPE', width: 60 },
    { field: 'from', label: 'FROM', width: 200 },
    { field: 'to', label: 'TO', width: 200 },
    { field: 'subject', label: 'SUBJECT', width: 280 },
    { field: 'template', label: 'TEMPLATE', width: 100 },
    { field: 'cc', label: 'CC', width: 150 },
  ];

  const isViewMode = mailType === EMAIL_TYPES.VIEW;

  const getModalTitle = () => {
    const titles = {
      [EMAIL_TYPES.NEW]: 'SEND - NEW EMAIL',
      [EMAIL_TYPES.FORWARD]: 'FORWARD EMAIL',
      [EMAIL_TYPES.REPLY]: 'REPLY EMAIL',
      [EMAIL_TYPES.REPLY_ALL]: 'REPLY ALL EMAIL',
      [EMAIL_TYPES.VIEW]: 'VIEW EMAIL',
    };
    return titles[mailType] || 'New eMail';
  };

  const renderAddrField = (label, value, onChange, useGrp, setUseGrp, grpOptions, setGrpVal, lookupField, id) => (
    <>
      <Box component="span" sx={isViewMode ? readOnlyLabelSx : fieldLabelSx}>{label}</Box>
      <Stack direction="row" alignItems="center" sx={{ gap: '4px' }}>
        <Box component="input" type="checkbox" id={`chk${label}MailGrp`} checked={useGrp} onChange={(e) => handleMailGroupToggle(lookupField, e.target.checked)} sx={checkboxSx} disabled={isViewMode} />
        {useGrp ? (
          <Box component="select" id={`ddm${label}MailGrp`} sx={{ ...selectSx, width: '600px' }}>
            {grpOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Box>
        ) : (
          <Box component="input" type="text" id={id} value={value} onChange={(e) => onChange(normalizeEmailSeparators(e.target.value))} readOnly={isViewMode} sx={{ ...textInputSx, width: '560px' }} />
        )}
        {!isViewMode && (
          <Button id={`lookupButton_${lookupField}`} variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => { setLookupTargetField(lookupField); setLookupOpen(true); }}>Lookup</Button>
        )}
      </Stack>
    </>
  );

  return (
    <Box
      id="eMailBoxForm"
      sx={{
 fontSize: 12, lineHeight: '14px', p: '5px', color: 'text.primary' }}
    >
      {isLoading && <LoadingSpinner />}

      <Box id="divMailBox">
        <Stack direction="row" alignItems="center" sx={{ gap: '4px', mb: '5px', flexWrap: 'wrap' }}>
          <Button variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => spawnComposeDialog(EMAIL_TYPES.NEW)}>New</Button>
          <Button variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => spawnComposeDialog(EMAIL_TYPES.REPLY)}>Reply</Button>
          <Button variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => spawnComposeDialog(EMAIL_TYPES.REPLY_ALL)}>Reply to All</Button>
          <Button variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => spawnComposeDialog(EMAIL_TYPES.FORWARD)}>Forward</Button>
          <Button variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => spawnComposeDialog(EMAIL_TYPES.VIEW)}>View</Button>
          <Button variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={refreshEmailGrid}>↻ Refresh</Button>
          <Box component="span" sx={{ ml: 'auto', fontSize: 11, alignSelf: 'center', color: 'text.primary' }}>
            Total: <Box component="span" id="spnCount">{emailCount}</Box>
          </Box>
        </Stack>

        <DataGrid
          columns={emailColumns}
          data={emailRows}
          height={400}
          onRowSelect={(row) => setSelectedEmailId(row.emailId || row.emailID || row.EMAILID)}
          onRowDoubleClick={(row) => {
            setSelectedEmailId(row.emailId || row.emailID || row.EMAILID);
            spawnComposeDialog(EMAIL_TYPES.VIEW);
          }}
          alternateRows
          showToolbar
          showFooter
        />
      </Box>

      <Modal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        title={getModalTitle()}
        width={800}
        footer={
          !isViewMode ? (
            <Stack direction="row" justifyContent="flex-end" sx={{ gap: '4px' }}>
              <Button id="sendButton" variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleSendMail}>Send</Button>
              <Button id="cancelButton" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => setComposeOpen(false)}>Cancel</Button>
            </Stack>
          ) : (
            <Stack direction="row" justifyContent="flex-end" sx={{ gap: '4px' }}>
              <Button id="closeButton" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => setComposeOpen(false)}>Close</Button>
            </Stack>
          )
        }
      >
        <Box sx={composeGridSx}>
          {/* From */}
          <Box component="span" sx={readOnlyLabelSx}>From</Box>
          <Box component="input" type="text" id="txtFrom" value={fromAddr} readOnly sx={{ ...textInputSx, width: '600px' }} />

          {/* To */}
          {renderAddrField('To', toAddr, setToAddr, useToMailGrp, setUseToMailGrp, toMailGrpOptions, () => {}, 'to', 'txtTo')}
          {/* CC */}
          {renderAddrField('CC', ccAddr, setCcAddr, useCCMailGrp, setUseCCMailGrp, ccMailGrpOptions, () => {}, 'cc', 'txtCC')}
          {/* BCC */}
          {renderAddrField('BCC', bccAddr, setBccAddr, useBCCMailGrp, setUseBCCMailGrp, bccMailGrpOptions, () => {}, 'bcc', 'txtBCC')}

          {/* Template */}
          {!isViewMode && (
            <>
              <Box component="span" sx={fieldLabelSx}>Template</Box>
              <Stack direction="row" alignItems="center" sx={{ gap: '4px' }}>
                <Box component="input" type="checkbox" id="chkTemplate" checked={useTemplate} onChange={(e) => handleTemplateToggle(e.target.checked)} sx={checkboxSx} />
                <Box component="select" id="ddmTemplate" value={emailTemplateId} onChange={(e) => setEmailTemplateId(e.target.value)} disabled={!useTemplate} sx={{ ...selectSx, width: '350px' }}>
                  <option value=""></option>
                  {templateOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Box>
                <Button id="insertButton" variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleInsertTemplate} disabled={!useTemplate}>Insert</Button>
              </Stack>
            </>
          )}

          {/* TR# / Subject */}
          <Box component="span" sx={readOnlyLabelSx}>TR#</Box>
          <Stack direction="row" alignItems="center" sx={{ gap: '4px' }}>
            <Box component="input" type="text" id="txtTrNo" value={`[TR#${trNum}] `} readOnly sx={{ ...textInputSx, width: '100px' }} />
            <Box component="input" type="text" id="txtSubject" value={subject} onChange={(e) => setSubject(e.target.value.slice(0, 60))} readOnly={isViewMode} sx={{ ...textInputSx, width: '565px' }} maxLength={60} />
          </Stack>

          {/* Attach (compose mode) */}
          {!isViewMode && (
            <>
              <Box component="span" sx={fieldLabelSx}>Attach</Box>
              <Stack direction="row" alignItems="center" sx={{ gap: '4px' }}>
                <Box component="input" type="checkbox" id="chkAttach" checked={useAttachment} onChange={(e) => setUseAttachment(e.target.checked)} sx={checkboxSx} />
                <UploadDownload sessionKey={sessionUniqueKey} troubleReportNum={trNum} srcLink={sourceLink} isEnabled={useAttachment} onFileSelected={setAttachedFile} />
              </Stack>
            </>
          )}

          {/* Attachments (view mode) */}
          {isViewMode && (
            <>
              <Box component="span" sx={fieldLabelSx}>Attachments</Box>
              <Box id="divattachments" sx={{ fontSize: 11, color: 'text.primary' }}>None</Box>
            </>
          )}

          {/* Message */}
          <Box component="span" sx={isViewMode ? { ...readOnlyLabelSx, alignSelf: 'start', pt: '4px' } : fieldLabelTopSx}>Message</Box>
          <Box>
            {isHtmlBody ? (
              <Box
                id="msgBodyDiv"
                dangerouslySetInnerHTML={{ __html: msgBodyHtml }}
                sx={{ width: '730px', minHeight: '200px', border: '1px solid', borderColor: 'divider', borderRadius: '3px', p: '5px',
 fontSize: 12, color: 'text.primary', bgcolor: 'background.paper' }}
              />
            ) : (
              <Box
                component="textarea"
                id="msgBody"
                value={msgBody}
                onChange={(e) => { if (e.target.value.length <= 64000) setMsgBody(e.target.value); }}
                readOnly={isViewMode}
                rows={18}
                sx={textareaSx}
                maxLength={64000}
              />
            )}
          </Box>
        </Box>
      </Modal>

      <Modal
        isOpen={lookupOpen}
        onClose={() => { setLookupOpen(false); setLookupName(''); setEscalationOptions([]); setIsLookupResultLoaded(false); }}
        title="E-Mail Id Look Up"
        width={700}
        height={150}
        footer={
          <Stack direction="row" justifyContent="flex-end" sx={{ gap: '4px' }}>
            <Button id="btnSetMailId" variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleSetMailId} disabled={!isLookupResultLoaded}>Set Mail ID</Button>
            <Button id="btnReset" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => { setLookupName(''); setEscalationOptions([]); setIsLookupResultLoaded(false); }}>Reset</Button>
            <Button id="btnCancelDiv" variant="outlined" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={() => setLookupOpen(false)}>Cancel</Button>
          </Stack>
        }
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '4px 8px', alignItems: 'center', fontSize: 12 }}>
          <Box component="span" sx={fieldLabelSx}>Name</Box>
          <Box
            component="input"
            type="text"
            id="nameTxt"
            value={lookupName}
            onChange={(e) => setLookupName(e.target.value.slice(0, 50))}
            sx={{ ...textInputSx, width: '350px' }}
            maxLength={50}
          />
          <Button id="btnLookUp" variant="contained" size="small" sx={{ fontSize: 11, py: '2px', px: '8px', minWidth: 0 }} onClick={handleEmailLookup}>Look Up</Button>

          {escalationOptions.length > 0 && (
            <>
              <Box component="span" sx={fieldLabelSx}>Select User</Box>
              <Stack direction="row" alignItems="center" sx={{ gridColumn: '2 / -1', gap: '8px' }}>
                <Box
                  component="select"
                  id="escalationDDM"
                  value={selectedEscalation}
                  onChange={(e) => {
                    setSelectedEscalation(e.target.value);
                    const opt = escalationOptions.find((o) => o.value === e.target.value);
                    setEscalationEmailText(opt?.email || '');
                  }}
                  sx={{ ...selectSx, width: '350px' }}
                >
                  <option value=""></option>
                  {escalationOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </Box>
                <Box component="span" id="escalationEmailTxt" sx={{ fontSize: 11, color: 'text.primary' }}>{escalationEmailText}</Box>
              </Stack>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default TrMailBox;
