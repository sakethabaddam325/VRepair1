import React, { useState, useEffect, useCallback, useContext } from 'react';
import DateTimeInput from '../components/DateTimeInput.jsx';
import Modal from '../components/Modal.jsx';
import DataGrid from '../components/DataGrid.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { useAppContext } from '../contexts/AppContext.jsx';
import { getEquipmentCircuitDetails, updateProduct, addProduct, deleteProduct, changePrimaryNE, getWlnGroupEquipElementDetails } from '../api/inventoryApi.js';
import { mapWlnGroupEquipElementDetailsResponse } from '../utils/wlnGroupEquipElementDetailsMapper.js';
import mockWlnGroupEquipElementDetails from '../../mock-server/data/wlnGroupEquipElementDetails.json';
import { Box, Stack, Typography, Button, Chip, Divider } from '@mui/material';

/**
 * Toggle: set to true  → use local mock data (no network call)
 *         set to false → call real API POST /wlnGroupEquipElementDetails
 */
const USE_MOCK_WLN_INVENTORY = false;

function buildWlnInventoryMockPayload(groupTroubleNum) {
  return {
    ...mockWlnGroupEquipElementDetails,
    GROUP_TROUBLE_NUM: groupTroubleNum,
  };
}

const PRODUCT_ROW_TYPES = [
  'EQUIPMENT', 'CIRCUIT', 'AUTH. CODES', 'DIAL TOLLFREE', 'DIAL ANI',
  'DIAL CLI', 'GENERAL', 'E911 SERVICES', 'HOSTING', 'AUDIO/NET',
  'CPE', 'MANAGED SERVICES', 'INTELLIGENT SERVICES', 'IPS CUSTOMER',
  'SECURITY SERVICES', 'VOIP', 'VICIRCUIT',
];

const INITIAL_EQUIP_DETAILS = { groupType: 'IPR', groupTypeDesc: 'MEDIA GATEWAY 9000', hierarchyLevel: 'PORT', groupName: 'ACTNMAMA0AW/3/4/1',
  tidClli: 'ACTNMAMA0AW', equipName: '', equipType: 'MDG', equipSubType: '',
  lata: '', relayRack: '', rate: '', status: '', vzvzb: '',
  system: 'VI', source: 'NM', nextGenNetworkType: '',
  vendor: '', model: '', spec: '', nextGenAssetOwner: '',
  owner: '', supervisor: '', serialNumber: '', nextGenDomain: '',
  wireCenterSiteId: '', locationCode: '', locationClli: '', priorityBand: '3/CO',
  region: '', mgmtRegion: '', country: '', address: '', city: '', state: '', zipCode: '',
  primaryNEID: '', primaryGrpName: '', primaryGrpType: '', primarySS: '',
  productId: '', productCount: '1', primaryInd: '',
};

const INITIAL_ETMS_EQUIP = { primaryNEId: '', customerName: '', mfgPartNum: '', alternateNEId: '',
  customerID: '', model: '', vendor: '', sourceSystem: '', assetTag: '',
  equipType: '', siteId: '', serialNumber: '', region: '', hub: '',
  interfaceName: '', card: '', port: '', speed: '', channel: '', description: '',
};

const INITIAL_ETMS_CIRCUIT = { primaryNEId: '', customerName: '', masters: '', alternateNEId: '', chronic: '',
  equipType: '', customerID: '', migration: '', serviceInsTid: '', sourceSystem: '',
  speed: '', solutionInsTid: '', productName: '', temporaryPath: '',
  locA: '', productSvcType: '', netIndA: '', category: '',
  locZ: '', service: '', netIndZ: '', multiPoint: '',
};

const fieldLblSx = { fontSize: 11,
  fontWeight: 700,
  color: 'grey.500',
  whiteSpace: 'nowrap',
  userSelect: 'none',
};

const fieldValSx = { fontSize: 12,
  color: 'text.primary',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const selectSx = { fontSize: 12,
  lineHeight: '14px',
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
  '&:focus': { borderColor: 'grey.900' },
};

const detectionLblSx = { fontSize: 11,
  fontWeight: 700,
  whiteSpace: 'nowrap',
  color: 'text.primary',
};

const tableWrapperSx = { border: '1px solid',
  borderColor: 'divider',
  borderRadius: '3px',
  overflow: 'auto',
  minHeight: '160px',
  maxHeight: '240px',
};

const dataTableThSx = { bgcolor: 'grey.100',
  fontWeight: 700,
  fontSize: 11,
  color: 'text.primary',
  textAlign: 'left',
  p: '4px 8px',
  borderBottom: '1px solid',
  borderColor: 'divider',
  position: 'sticky',
  top: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.03em',
};

const dataTableTdSx = { p: '4px 8px',
  color: 'text.primary',
  borderBottom: '1px solid',
  borderColor: 'grey.100',
};

const modalCellLblSx = { p: '2px 8px',
  fontSize: 12,
  color: 'text.primary',
  fontWeight: 700,
  whiteSpace: 'nowrap',
};

const modalCellValSx = { p: '2px 8px',
  fontSize: 12,
  color: 'text.primary',
};

const modalCellRightLblSx = { ...modalCellLblSx, borderLeft: '1px solid', borderColor: 'divider' };
const modalCellRightValSx = { ...modalCellValSx, borderLeft: '1px solid', borderColor: 'divider' };

const ReadOnlyField = ({ label, value }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
    <Box component="span" sx={fieldLblSx}>{label}</Box>
    <Box component="span" sx={fieldValSx}>{value || '\u00A0'}</Box>
  </Box>
);

const EquipmentCircuitDetails = ({
  trNum,
  sessionUniqueKey,
  sourceLink = 'GTRM',
  groupType: initGroupType = 'IPR',
  isAddProd = false,
  isNoMatch = false,
  equipSearchType = '',
  groupName: initGroupName = '',
  useWlnInventory = false,
}) => {
  const { showAlert, loginId, defaultUserDateFormat } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [wlnInventoryMode, setWlnInventoryMode] = useState(false);

  const hourFormat = defaultUserDateFormat === '24' ? '24' : '12';
  const dateMask = hourFormat === '24' ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy hh:mm a';

  const [products, setProducts] = useState([{ id: 'PROD001', name: 'ACTNMAMA0AW/3/4/1 - EQUIPMENT (VI)' }]);
  const [selectedProductId, setSelectedProductId] = useState('PROD001');
  const [productCount, setProductCount] = useState(1);
  const [primaryInd, setPrimaryInd] = useState('Y');
  const [activeTemplate, setActiveTemplate] = useState('EQUIPMENT');

  const [detectionDate, setDetectionDate] = useState('01/12/2022 01:38 AM');
  const [relToTestInd, setRelToTestInd] = useState('Y');
  const [relToTestOptions, setRelToTestOptions] = useState([
    { id: 'DNT', name: 'DO NOT TEST' }, { id: 'TST', name: 'TEST' }, { id: 'RDY', name: 'READY' },
  ]);
  const [relToTestValue, setRelToTestValue] = useState('DNT');
  const [relToTestDate, setRelToTestDate] = useState('');
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);

  const [details, setDetails] = useState(INITIAL_EQUIP_DETAILS);
  const [etmsEquip, setEtmsEquip] = useState(INITIAL_ETMS_EQUIP);
  const [etmsCircuit, setEtmsCircuit] = useState(INITIAL_ETMS_CIRCUIT);

  const [showEtmsEquipRow, setShowEtmsEquipRow] = useState(false);
  const [showEtmsCircuitRow, setShowEtmsCircuitRow] = useState(false);
  const [showViCircuitRow, setShowViCircuitRow] = useState(false);
  const [showEquipDiversity, setShowEquipDiversity] = useState(false);
  const [showCircuitInfo, setShowCircuitInfo] = useState(false);
  const [circuitInfoData, setCircuitInfoData] = useState([]);
  const [equipDiversityData, setEquipDiversityData] = useState([]);
  const [additionalDetails, setAdditionalDetails] = useState([]);
  const [provisionedCounts, setProvisionedCounts] = useState([]);

  const [canAddProduct, setCanAddProduct] = useState(true);
  const [canDeleteProduct, setCanDeleteProduct] = useState(true);
  const [canChangePrimary, setCanChangePrimary] = useState(true);

  const [showChangePrimaryModal, setShowChangePrimaryModal] = useState(false);
  const [primaryChangeData, setPrimaryChangeData] = useState({
    fromNEID: '', fromGrpName: '', fromGrpType: '', fromSS: '',
    toNEID: '', toGrpName: '', toGrpType: '', toSS: '',
  });

  const checkSubmitEnabled = useCallback(() => {
    if (useWlnInventory || wlnInventoryMode) {
      setIsSubmitEnabled(false);
      return;
    }
    const relToTestRequired = relToTestInd === 'Y';
    const relToTestDateRequired = relToTestValue !== '';
    const enabled =
      sourceLink !== 'ETMS' &&
      detectionDate !== '' &&
      (!relToTestRequired || relToTestValue !== '') &&
      (!relToTestDateRequired || relToTestDate !== '');
    setIsSubmitEnabled(enabled);
  }, [sourceLink, detectionDate, relToTestInd, relToTestValue, relToTestDate, useWlnInventory, wlnInventoryMode]);

  useEffect(() => { checkSubmitEnabled(); }, [checkSubmitEnabled]);

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      // WLN inventory element details flow (used by the Inventory/Add flow).
      // When `isAddProd` is true, we should load WLN element details instead of ETMS product operations.
      if (useWlnInventory || isAddProd) {
        const groupTroubleNum = trNum || initGroupName || '';
        let payload;

        if (USE_MOCK_WLN_INVENTORY) {
          await Promise.resolve();
          payload = buildWlnInventoryMockPayload(groupTroubleNum);
        } else {
          try {
            const response = await getWlnGroupEquipElementDetails({
              userId: loginId || 'GONDCH7',
              searchType: 'T',
              groupTroubleNum,
            });
            payload = response?.data ?? response;
          } catch (apiErr) {
            console.error('[WlnInventory] Real API failed, falling back to mock:', apiErr);
            payload = buildWlnInventoryMockPayload(groupTroubleNum);
          }
        }

        if (!payload) {
          showAlert('Error loading inventory details.');
          return;
        }

        const mapped = mapWlnGroupEquipElementDetailsResponse(payload);
        if (!mapped.statusOk) {
          showAlert('Error loading inventory details.');
          return;
        }

        setWlnInventoryMode(true);
        setCanAddProduct(false);
        setCanDeleteProduct(false);
        setCanChangePrimary(false);
        setIsSubmitEnabled(false);

        setAdditionalDetails(mapped.additionalDetailsRows);
        setProvisionedCounts(mapped.provisionedCountsRows);

        // Merge detailsPatch so we keep any existing defaults.
        setDetails((prev) => ({ ...prev, ...mapped.detailsPatch }));
        setCircuitInfoData(mapped.circuitInfoRows);
        return;
      }

      const response = await getEquipmentCircuitDetails({ action: 'GET_INITIAL_ETMS', sourceLink, groupType: initGroupType, sessionUniqueKey, isAddProd, equipSearchType, isNoMatch });
      if (response?.data?.resultData) {
        const rsp = response.data.resultData;
        if (rsp.status === 'SUCCESS') {
          if (rsp.prodArr) { setProducts(rsp.prodArr); if (rsp.prodArr.length > 0) setSelectedProductId(rsp.prodArr[0].id); }
          if (rsp.relToTestDDMList) setRelToTestOptions(rsp.relToTestDDMList);
          if (rsp.productsNumberFromEqtCkt !== undefined) setProductCount(rsp.productsNumberFromEqtCkt);
          if (rsp.primaryInd) setPrimaryInd(rsp.primaryInd);
          if (rsp.relToTestInd) setRelToTestInd(rsp.relToTestInd);
          const showActionBtns = !(['TRK', 'TLS'].includes(rsp.groupType)) && sourceLink !== 'GTRE' && sourceLink !== 'ETMS';
          setCanAddProduct(showActionBtns);
          setCanDeleteProduct(showActionBtns);
          setCanChangePrimary(showActionBtns);
          populateTemplateData(rsp);
        } else if (rsp.status === 'ERROR') {
          showAlert(rsp.msg || 'Error loading equipment/circuit details.');
        }
      }
    } catch {
      showAlert('Error loading inventory details.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, sourceLink, initGroupType, isAddProd, equipSearchType, isNoMatch, showAlert, trNum, initGroupName, loginId, useWlnInventory]);

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const populateTemplateData = (rsp) => {
    if (!rsp?.prodType) return;
    if (rsp.equipmentDiversityCountJson) { setShowEquipDiversity(true); setEquipDiversityData(rsp.equipmentDiversityCountJson); }
    const prodType = rsp.prodType;
    setShowEtmsEquipRow(false); setShowEtmsCircuitRow(false); setShowViCircuitRow(false);
    if (prodType === 'viEQUIPMENT') {
      setActiveTemplate('EQUIPMENT');
      if (rsp.dataObj) { if (rsp.dataObj.ipAddJson) setAdditionalDetails(rsp.dataObj.ipAddJson); if (rsp.dataObj.provCountJson) setProvisionedCounts(rsp.dataObj.provCountJson); }
      setDetails((prev) => ({ ...prev, hierarchyLevel: rsp.hierarchyLevel || prev.hierarchyLevel, groupName: rsp.elementDetailsLine_ID || rsp.groupName || prev.groupName, groupTypeDesc: rsp.groupTypeDesc || prev.groupTypeDesc, priorityBand: rsp.priorityBandValue || prev.priorityBand }));
    } else if (prodType === 'viCIRCUIT') { setActiveTemplate('VICIRCUIT'); setShowViCircuitRow(true); }
    else if (prodType === 'etmsEQUIPMENT') {
      setShowEtmsEquipRow(true);
      if (rsp.dataObj) setEtmsEquip({ primaryNEId: rsp.dataObj.primaryNEId || '', customerName: rsp.dataObj.customerName || '', mfgPartNum: rsp.dataObj.mfgPartNum || '', alternateNEId: rsp.dataObj.alternateNEId || '', customerID: rsp.dataObj.customerID || '', model: rsp.dataObj.model || '', vendor: rsp.dataObj.vendor || '', sourceSystem: rsp.dataObj.sourceSystem || '', assetTag: rsp.dataObj.assetTag || '', equipType: rsp.dataObj.equipType || '', siteId: rsp.dataObj.siteId || '', serialNumber: rsp.dataObj.serialNumber || '', region: rsp.dataObj.region || '', hub: rsp.dataObj.hub || '', interfaceName: rsp.dataObj.interfaceName || '', card: rsp.dataObj.card || '', port: rsp.dataObj.port || '', speed: rsp.dataObj.speed || '', channel: rsp.dataObj.channel || '', description: rsp.dataObj.description || '' });
    } else if (prodType === 'etmsCIRCUIT') {
      setShowEtmsCircuitRow(true);
      if (rsp.dataObj) setEtmsCircuit({ primaryNEId: rsp.dataObj.primaryNEId || '', customerName: rsp.dataObj.customerName || '', masters: rsp.dataObj.masters || '', alternateNEId: rsp.dataObj.alternateNEId || '', chronic: rsp.dataObj.chronic || '', equipType: rsp.dataObj.equipType || '', customerID: rsp.dataObj.customerID || '', migration: rsp.dataObj.migration || '', serviceInsTid: rsp.dataObj.serviceInsTid || '', sourceSystem: rsp.dataObj.sourceSystem || '', speed: rsp.dataObj.speed || '', solutionInsTid: rsp.dataObj.solutionInsTid || '', productName: rsp.dataObj.productName || '', temporaryPath: rsp.dataObj.temporaryPath || '', locA: rsp.dataObj.locA || '', productSvcType: rsp.dataObj.productSvcType || '', netIndA: rsp.dataObj.netIndA || '', category: rsp.dataObj.category || '', locZ: rsp.dataObj.locZ || '', service: rsp.dataObj.service || '', netIndZ: rsp.dataObj.netIndZ || '', multiPoint: rsp.dataObj.multiPoint || '' });
    } else { setActiveTemplate(prodType?.toUpperCase?.() || ''); }
    if (rsp.detectionDate) setDetectionDate(rsp.detectionDate);
    if (rsp.relToTestDate) setRelToTestDate(rsp.relToTestDate);
    if (rsp.relToTestValue) setRelToTestValue(rsp.relToTestValue);
    if (rsp.dataObj) setDetails((prev) => ({ ...prev, tidClli: rsp.dataObj.tidClli || prev.tidClli, equipName: rsp.dataObj.equipName || prev.equipName, equipType: rsp.dataObj.equipType || prev.equipType, equipSubType: rsp.dataObj.equipSubType || prev.equipSubType, lata: rsp.dataObj.lata || prev.lata, relayRack: rsp.dataObj.relayRack || prev.relayRack, rate: rsp.dataObj.rate || prev.rate, status: rsp.dataObj.status || prev.status, vzvzb: rsp.dataObj.vzvzb || prev.vzvzb, system: rsp.dataObj.system || prev.system, source: rsp.dataObj.source || prev.source, nextGenNetworkType: rsp.dataObj.nextGenNetworkType || prev.nextGenNetworkType, vendor: rsp.dataObj.vendor || prev.vendor, model: rsp.dataObj.model || prev.model, spec: rsp.dataObj.spec || prev.spec, nextGenAssetOwner: rsp.dataObj.nextGenAssetOwner || prev.nextGenAssetOwner, owner: rsp.dataObj.owner || prev.owner, supervisor: rsp.dataObj.supervisor || prev.supervisor, serialNumber: rsp.dataObj.serialNumber || prev.serialNumber, nextGenDomain: rsp.dataObj.nextGenDomain || prev.nextGenDomain, wireCenterSiteId: rsp.dataObj.wireCenterSiteId || prev.wireCenterSiteId, locationCode: rsp.dataObj.locationCode || prev.locationCode, locationClli: rsp.dataObj.locationClli || prev.locationClli, priorityBand: rsp.dataObj.priorityBand || prev.priorityBand, region: rsp.dataObj.region || prev.region, mgmtRegion: rsp.dataObj.mgmtRegion || prev.mgmtRegion, country: rsp.dataObj.country || prev.country, address: rsp.dataObj.address || prev.address, city: rsp.dataObj.city || prev.city, state: rsp.dataObj.state || prev.state, zipCode: rsp.dataObj.zipCode || prev.zipCode, groupType: rsp.groupType || prev.groupType, groupTypeDesc: rsp.groupTypeDesc || prev.groupTypeDesc, hierarchyLevel: rsp.hierarchyLevel || prev.hierarchyLevel, groupName: rsp.groupName || prev.groupName }));
  };

  const handleProductChange = useCallback(async (e) => {
    const productId = e.target.value;
    setSelectedProductId(productId);
    setIsLoading(true);
    try {
      const response = await getEquipmentCircuitDetails({ action: 'GET_PRODUCT_DETAILS', productId, sessionUniqueKey, sourceLink });
      if (response?.data?.resultData) populateTemplateData(response.data.resultData);
    } catch {
      showAlert('Error loading product details.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, sourceLink, showAlert]);

  const handleGetCircuits = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getEquipmentCircuitDetails({ action: 'GET_IP_SERVICES', productId: selectedProductId, sessionUniqueKey });
      if (response?.data?.resultData?.circuitData) { setCircuitInfoData(response.data.resultData.circuitData); setShowCircuitInfo(true); }
    } catch {
      showAlert('Error loading circuits.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedProductId, sessionUniqueKey, showAlert]);

  const handleSubmit = useCallback(async () => {
    if (!isSubmitEnabled) return;
    if (wlnInventoryMode) {
      showAlert('Submit is not applicable in WLN inventory view.');
      return;
    }
    setIsLoading(true);
    try {
      const fn = isAddProd ? addProduct : updateProduct;
      const response = await fn({ sessionUniqueKey, productId: selectedProductId, detectionDate, relToTestValue, relToTestDate, sourceLink });
      if (response?.data?.resultData?.status === 'SUCCESS') { showAlert('Product updated successfully.'); }
      else { showAlert(response?.data?.resultData?.msg || 'Error submitting product.'); }
    } catch {
      showAlert('Error submitting product update.');
    } finally {
      setIsLoading(false);
    }
  }, [isSubmitEnabled, isAddProd, sessionUniqueKey, selectedProductId, detectionDate, relToTestValue, relToTestDate, sourceLink, showAlert, wlnInventoryMode]);

  const handleDeleteProduct = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await deleteProduct({ sessionUniqueKey, productId: selectedProductId });
      if (response?.data?.resultData?.status === 'SUCCESS') { showAlert('Product deleted successfully.'); fetchInitialData(); }
      else { showAlert(response?.data?.resultData?.msg || 'Error deleting product.'); }
    } catch {
      showAlert('Error deleting product.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, selectedProductId, showAlert, fetchInitialData]);

  const handleChangePrimaryNE = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await changePrimaryNE({ sessionUniqueKey, fromNEID: primaryChangeData.fromNEID, toNEID: primaryChangeData.toNEID });
      if (response?.data?.resultData?.status === 'SUCCESS') { showAlert('Primary NE ID changed successfully.'); setShowChangePrimaryModal(false); fetchInitialData(); }
      else { showAlert(response?.data?.resultData?.msg || 'Error changing Primary NE ID.'); }
    } catch {
      showAlert('Error changing Primary NE ID.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionUniqueKey, primaryChangeData, showAlert, fetchInitialData]);

  const circuitInfoColumns = [
    { field: 'circuitId', label: 'CIRCUIT ID', width: 160 },
    { field: 'ticketClass', label: 'TICKET CLASS', width: 120 },
    { field: 'serviceType', label: 'SERVICE TYPE', width: 120 },
    { field: 'circuitStatus', label: 'CIRCUIT STATUS', width: 130 },
    { field: 'customerName', label: 'CUSTOMER NAME', width: 160 },
    { field: 'trNo', label: 'TRNO', width: 100 },
  ];

  const relToTestRequired = relToTestInd === 'Y';

  const fieldGrid3Sx = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 12px', p: '8px 10px' };
  const fieldGrid4Sx = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 12px', p: '8px 10px' };

  return (
    <Box
      id="equipmentCircuitDetailsDiv"
      sx={{ fontSize: 12, lineHeight: '14px', color: 'text.primary', p: '5px' }}
    >
      {isLoading && <LoadingSpinner />}

      {/* Change Primary NE ID Modal */}
      {showChangePrimaryModal && (
        <Modal
          title="Change Primary NE ID"
          isOpen={showChangePrimaryModal}
          onClose={() => setShowChangePrimaryModal(false)}
          width={680}
          footer={
            <Stack direction="row" justifyContent="flex-end" sx={{ gap: '8px' }}>
              <Button size="small" variant="contained" onClick={handleChangePrimaryNE}>Submit</Button>
              <Button size="small" variant="outlined" onClick={() => setShowChangePrimaryModal(false)}>Cancel</Button>
            </Stack>
          }
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', width: '100%' }}>
            {[
              { label: 'Primary', isRight: false },
              { label: 'Change To', isRight: true },
            ].map(({ label, isRight }) => (
              <Box key={label} component="span" sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', p: '4px 8px', borderBottom: '1px solid', borderColor: 'divider', ...(isRight ? { borderLeft: '1px solid', borderLeftColor: 'divider' } : {}) }}>
                {label}
              </Box>
            ))}
            {[
              { lbl: 'NEID:', fromVal: primaryChangeData.fromNEID, toVal: primaryChangeData.toNEID, fromId: 'primaryNEID', toId: 'primaryNEID_To' },
              { lbl: 'Group Name:', fromVal: primaryChangeData.fromGrpName, toVal: primaryChangeData.toGrpName, fromId: 'primaryGrpName', toId: 'primaryGrpName_To' },
              { lbl: 'Type:', fromVal: primaryChangeData.fromGrpType, toVal: primaryChangeData.toGrpType, fromId: 'primaryGrpType', toId: 'primaryGrpType_To' },
              { lbl: 'Source System:', fromVal: primaryChangeData.fromSS, toVal: primaryChangeData.toSS, fromId: 'primarySS', toId: 'primarySS_To' },
            ].map(({ lbl, fromVal, toVal, fromId, toId }) => (
              <React.Fragment key={fromId}>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
                  <Box component="span" sx={modalCellLblSx}>{lbl}</Box>
                  <Box component="span" id={fromId} sx={modalCellValSx}>{fromVal}</Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', borderLeft: '1px solid', borderColor: 'divider' }}>
                  <Box component="span" sx={modalCellRightLblSx}>{lbl}</Box>
                  <Box component="span" id={toId} sx={modalCellRightValSx}>{toVal}</Box>
                </Box>
              </React.Fragment>
            ))}
          </Box>
        </Modal>
      )}

      {/* Product Bar */}
      <Stack
        id="trt0"
        direction="row"
        alignItems="center"
        sx={{ gap: '8px', p: '8px 10px', bgcolor: 'grey.100', borderRadius: '3px', mb: '4px' }}
      >
        <Box component="span" sx={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, color: 'text.primary' }}>
          Product(<Box component="span" id="productNumber">{productCount}</Box>):
        </Box>
        <Box
          component="select"
          id="productEquipDropdown"
          value={selectedProductId}
          onChange={handleProductChange}
          sx={{ ...selectSx, width: '400px' }}
        >
          {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </Box>
        {primaryInd === 'Y' && (
          <Box component="span" sx={{ ml: '4px' }}>
            <Chip label="Primary" color="info" size="small" sx={{ fontSize: 11, height: 20 }} />
          </Box>
        )}
        <Stack direction="row" sx={{ gap: '4px', ml: 'auto' }}>
          {canAddProduct && <Button size="small" variant="contained" onClick={() => showAlert('Add Product functionality — redirects to Add Inventory tab')}>Add</Button>}
          {canChangePrimary && <Button size="small" variant="outlined" onClick={() => setShowChangePrimaryModal(true)}>Change Primary NE ID</Button>}
          {canDeleteProduct && <Button size="small" variant="outlined" onClick={handleDeleteProduct}>Delete</Button>}
        </Stack>
      </Stack>

      {/* Detection / Rel to Test Row */}
      <Box
        id="trt1"
        sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto 1fr auto 1fr auto', alignItems: 'center', gap: '4px 8px', p: '8px 10px', mb: '4px' }}
      >
        <Box component="span" id="DetectionLabel" sx={detectionLblSx}>Detection D/T:</Box>
        <Box id="DetectionValue">
          <DateTimeInput id="detectionDate" value={detectionDate} onChange={(val) => { setDetectionDate(val); checkSubmitEnabled(); }} mask={dateMask} hourFormat={hourFormat} tabIndex={118} />
        </Box>
        <Box component="span" id="RelToTestLabel" sx={{ ...detectionLblSx, color: relToTestRequired ? 'error.main' : 'text.primary' }}>Rel to Test:</Box>
        <Box id="RelToTestValue">
          <Box component="select" id="relTestDDM" name="relTestDDM" value={relToTestValue} onChange={(e) => { setRelToTestValue(e.target.value); setRelToTestDate(''); checkSubmitEnabled(); }} sx={{ ...selectSx, width: '100%', minWidth: '120px' }}>
            <option value=""></option>
            {relToTestOptions.map((opt) => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </Box>
        </Box>
        <Box component="span" id="RelToTestDateLabel" sx={detectionLblSx}>Rel to Test D/T:</Box>
        <Box id="RelToTestDateValue">
          <DateTimeInput id="RelToTestDate" value={relToTestDate} onChange={(val) => { setRelToTestDate(val); checkSubmitEnabled(); }} mask={dateMask} hourFormat={hourFormat} tabIndex={118} />
        </Box>
        <Button size="small" variant="contained" disabled={!isSubmitEnabled} onClick={handleSubmit}>Submit</Button>
      </Box>

      {/* Group Details */}
      <SectionHeader title="Group Details" defaultExpanded>
        <Box id="tbl2" sx={fieldGrid3Sx}>
          <ReadOnlyField label="Group Type" value={details.groupTypeDesc} />
          <ReadOnlyField label="Hierarchy" value={details.hierarchyLevel} />
          <ReadOnlyField label="Group Name" value={details.groupName} />
        </Box>
      </SectionHeader>

      {/* Equipment Details */}
      <SectionHeader title="Equipment Details" defaultExpanded>
        <Box id="tbl3" sx={fieldGrid4Sx}>
          <ReadOnlyField label="TID/CLLI" value={details.tidClli} />
          <ReadOnlyField label="Name" value={details.equipName} />
          <ReadOnlyField label="Type" value={details.equipType} />
          <ReadOnlyField label="Sub Type" value={details.equipSubType} />
          <ReadOnlyField label="LATA" value={details.lata} />
          <ReadOnlyField label="Relay Rack" value={details.relayRack} />
          <ReadOnlyField label="Rate" value={details.rate} />
          <ReadOnlyField label="Status" value={details.status} />
          <ReadOnlyField label="VZT\VZB" value={details.vzvzb} />
          <ReadOnlyField label="System" value={details.system} />
          <ReadOnlyField label="Source" value={details.source} />
          <ReadOnlyField label="Next Gen Network Type" value={details.nextGenNetworkType} />
          <ReadOnlyField label="Vendor" value={details.vendor} />
          <ReadOnlyField label="Model" value={details.model} />
          <ReadOnlyField label="Spec" value={details.spec} />
          <ReadOnlyField label="Next Gen Asset Owner" value={details.nextGenAssetOwner} />
          <ReadOnlyField label="Owner" value={details.owner} />
          <ReadOnlyField label="Supervisor" value={details.supervisor} />
          <ReadOnlyField label="Serial #" value={details.serialNumber} />
          <ReadOnlyField label="Next Gen Domain" value={details.nextGenDomain} />
        </Box>
      </SectionHeader>

      {/* Location Details */}
      <SectionHeader title="Location Details" defaultExpanded>
        <Box id="tbl4" sx={fieldGrid4Sx}>
          <ReadOnlyField label="WireCenter/Site ID" value={details.wireCenterSiteId} />
          <ReadOnlyField label="Location Code" value={details.locationCode} />
          <ReadOnlyField label="Location CLLI" value={details.locationClli} />
          <ReadOnlyField label="Priority Band/Use" value={details.priorityBand} />
          <ReadOnlyField label="Region" value={details.region} />
          <ReadOnlyField label="MGMT Region" value={details.mgmtRegion} />
          <ReadOnlyField label="Country" value={details.country} />
          <Box />
          <ReadOnlyField label="Address" value={details.address} />
          <ReadOnlyField label="City" value={details.city} />
          <ReadOnlyField label="State" value={details.state} />
          <ReadOnlyField label="Zip Code" value={details.zipCode} />
        </Box>
      </SectionHeader>

      {/* Equipment Diversity */}
      {showEquipDiversity && (
        <SectionHeader title="Equipment Diversity" defaultExpanded>
          <Box sx={{ p: '8px 10px' }}>
            <Box component="table" id="EquipmentDiversityDetails" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <Box component="tbody">
                {Array.isArray(equipDiversityData) && equipDiversityData.map((row, idx) => (
                  <Box component="tr" key={idx}>
                    {Object.entries(row).map(([k, v]) => (
                      <Box component="td" key={k} sx={{ p: '2px 4px', color: 'text.primary' }}>{v}</Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </SectionHeader>
      )}

      {/* Additional Details + Provisioned Counts */}
      <Box id="trt5" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', p: '10px' }}>
        {[
          { title: 'Additional Details', id: 'additionalDetails', data: additionalDetails, headers: ['NAME', 'VALUE'] },
          { title: 'Provisioned Counts', id: 'provisionedCounts', data: provisionedCounts, headers: ['PRODUCT', 'COUNT'] },
        ].map(({ title, id, data, headers }) => (
          <Box key={title} sx={{ minWidth: 0 }}>
            <Typography component="div" sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', mb: '4px' }}>{title}</Typography>
            <Box sx={tableWrapperSx}>
              <Box component="table" id={id} sx={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <Box component="thead">
                  <Box component="tr">
                    {headers.map((h) => (<Box component="th" key={h} sx={dataTableThSx}>{h}</Box>))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {Array.isArray(data) && data.length > 0
                    ? data.map((row, idx) => (
                        <Box component="tr" key={idx} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          {Object.entries(row).map(([k, v]) => (<Box component="td" key={k} sx={dataTableTdSx}>{v}</Box>))}
                        </Box>
                      ))
                    : (
                      <Box component="tr">
                        <Box component="td" colSpan={2} sx={{ textAlign: 'center', color: 'text.disabled', fontStyle: 'italic', height: '120px', verticalAlign: 'middle' }}>&nbsp;</Box>
                      </Box>
                    )}
                </Box>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Circuits/Services Information */}
      <Box sx={{ p: '10px' }}>
        <Typography component="div" sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary', mb: '4px' }}>Circuits/Services Information</Typography>
        <Box sx={tableWrapperSx}>
          <DataGrid id="circuitInfo" columns={circuitInfoColumns} data={circuitInfoData} height={120} alternateRows showToolbar showFooter />
        </Box>
      </Box>

      {/* Get Circuits */}
      <Box id="trt7" sx={{ p: '8px 10px' }}>
        <Button size="small" variant="contained" onClick={handleGetCircuits}>Get Circuits</Button>
      </Box>

      <Divider />

      {/* ETMS Equipment */}
      {showEtmsEquipRow && (
        <SectionHeader title="ETMS Equipment" defaultExpanded>
          <Box id="etmsEquipmentRow" sx={fieldGrid3Sx}>
            <ReadOnlyField label="NEID" value={etmsEquip.primaryNEId} />
            <ReadOnlyField label="Cust Name" value={etmsEquip.customerName} />
            <ReadOnlyField label="Mfg Part Number" value={etmsEquip.mfgPartNum} />
            <ReadOnlyField label="Alt NEID" value={etmsEquip.alternateNEId} />
            <ReadOnlyField label="Cust ID" value={etmsEquip.customerID} />
            <ReadOnlyField label="Model" value={etmsEquip.model} />
            <ReadOnlyField label="Vendor" value={etmsEquip.vendor} />
            <ReadOnlyField label="Source System" value={etmsEquip.sourceSystem} />
            <ReadOnlyField label="Asset Tag" value={etmsEquip.assetTag} />
            <ReadOnlyField label="Equipment Type" value={etmsEquip.equipType} />
            <ReadOnlyField label="Site ID" value={etmsEquip.siteId} />
            <ReadOnlyField label="Serial #" value={etmsEquip.serialNumber} />
            <Box /><ReadOnlyField label="Region" value={etmsEquip.region} /><ReadOnlyField label="Hub" value={etmsEquip.hub} />
            <Box /><ReadOnlyField label="Interface" value={etmsEquip.interfaceName} /><ReadOnlyField label="Card" value={etmsEquip.card} />
            <Box /><Box /><ReadOnlyField label="Port" value={etmsEquip.port} />
            <Box /><Box /><ReadOnlyField label="Speed" value={etmsEquip.speed} />
            <Box /><Box /><ReadOnlyField label="Channel" value={etmsEquip.channel} />
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 8px', p: '4px 10px' }}>
            <Box component="span" sx={fieldLblSx}>Description</Box>
            <Box component="span" id="ETMSdescription" sx={fieldValSx}>{etmsEquip.description || '\u00A0'}</Box>
          </Box>
        </SectionHeader>
      )}

      {/* ETMS Circuit */}
      {showEtmsCircuitRow && (
        <SectionHeader title="ETMS Circuit" defaultExpanded>
          <Box id="etmsCircuitRow" sx={fieldGrid3Sx}>
            <ReadOnlyField label="NEID" value={etmsCircuit.primaryNEId} />
            <ReadOnlyField label="Cust Name" value={etmsCircuit.customerName} />
            <ReadOnlyField label="MASTARS" value={etmsCircuit.masters} />
            <ReadOnlyField label="Alt NEID" value={etmsCircuit.alternateNEId} />
            <Box /><ReadOnlyField label="Chronic" value={etmsCircuit.chronic} />
            <ReadOnlyField label="Type" value={etmsCircuit.equipType} />
            <ReadOnlyField label="Cust ID" value={etmsCircuit.customerID} />
            <ReadOnlyField label="Migration" value={etmsCircuit.migration} />
            <ReadOnlyField label="Service Inst ID" value={etmsCircuit.serviceInsTid} />
            <ReadOnlyField label="Source System" value={etmsCircuit.sourceSystem} />
            <ReadOnlyField label="Speed" value={etmsCircuit.speed} />
            <ReadOnlyField label="Solution Inst ID" value={etmsCircuit.solutionInsTid} />
            <ReadOnlyField label="Product Name" value={etmsCircuit.productName} />
            <ReadOnlyField label="Temporary Path" value={etmsCircuit.temporaryPath} />
            <ReadOnlyField label="Location A" value={etmsCircuit.locA} />
            <ReadOnlyField label="Product Svc Type" value={etmsCircuit.productSvcType} />
            <Box />
            <ReadOnlyField label="Net Ind (A)" value={etmsCircuit.netIndA} />
            <ReadOnlyField label="Category" value={etmsCircuit.category} />
            <Box />
            <ReadOnlyField label="Location Z" value={etmsCircuit.locZ} />
            <ReadOnlyField label="Service" value={etmsCircuit.service} />
            <Box />
            <ReadOnlyField label="Net Ind (Z)" value={etmsCircuit.netIndZ} />
            <ReadOnlyField label="Multi Point" value={etmsCircuit.multiPoint} />
            <Box />
          </Box>
        </SectionHeader>
      )}
    </Box>
  );
};

export default EquipmentCircuitDetails;
