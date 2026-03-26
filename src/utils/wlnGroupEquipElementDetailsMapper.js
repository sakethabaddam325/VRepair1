/**
 * Maps `/vRepairOne/controller/wlnGroupEquipElementDetails` response payload
 * (UPPER_SNAKE_CASE fields + parallel arrays) into the row/patch shapes
 * consumed by `EquipmentCircuitDetails.jsx` in WLN inventory mode.
 *
 * Output shape:
 * - statusOk: boolean
 * - detailsPatch: partial details object to merge into component `details`
 * - additionalDetailsRows: [{ NAME, VALUE }, ...]
 * - provisionedCountsRows: [{ PRODUCT, COUNT }, ...]
 * - circuitInfoRows: [{ circuitId, ticketClass, serviceType, circuitStatus, customerName, trNo }, ...]
 */

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (val && typeof val === 'object') {
    const len = Number(val.length);
    if (Number.isFinite(len)) {
      return Array.from({ length: len }, (_, i) => val[i]);
    }

    // Last resort: numeric-keyed object (e.g. {0: 'a', 1: 'b', ...})
    const keys = Object.keys(val)
      .filter((k) => /^\d+$/.test(k))
      .sort((a, b) => Number(a) - Number(b));
    if (keys.length > 0) return keys.map((k) => val[k]);
  }
  return [];
};

const s = (v) => (v == null ? '' : String(v));

export function mapWlnGroupEquipElementDetailsResponse(raw) {
  if (!raw || typeof raw !== 'object') {
    return {
      statusOk: false,
      detailsPatch: {},
      additionalDetailsRows: [],
      provisionedCountsRows: [],
      circuitInfoRows: [],
    };
  }

  // Some controllers may wrap the actual payload in `resultData`.
  const payload = raw.resultData ?? raw;

  const statusOk =
    s(payload.StatusDesc ?? payload.StatusCode ?? '').trim().toUpperCase() === 'SUCCESS';

  const additionalDetailsRows = [];
  const locaIps = payload?.LOCA_IP_ADDR_JSON_DATA?.LOCA_IP_ADDR_DATA ?? [];
  toArray(locaIps).forEach((ip) => {
    additionalDetailsRows.push({
      NAME: `LOCA IP (${s(ip?.LOCA_IP_ADDR_TYPE)})`.trim(),
      VALUE: s(ip?.LOCA_IP_ADDR_VALUE),
    });
  });

  const loczIps = payload?.LOCZ_IP_ADDR_JSON_DATA?.LOCZ_IP_ADDR_DATA ?? [];
  toArray(loczIps).forEach((ip) => {
    additionalDetailsRows.push({
      NAME: `LOCZ IP (${s(ip?.LOCZ_IP_ADDR_TYPE)})`.trim(),
      VALUE: s(ip?.LOCZ_IP_ADDR_VALUE),
    });
  });

  const provData = payload?.ELEMENT_DETAIL_PROV_DATA?.PROV_DATA ?? [];
  const provisionedCountsRows = toArray(provData).map((p) => ({
    PRODUCT: s(p?.PROD_CODE),
    COUNT: s(p?.CUST_PROV_NUM),
  }));

  const detailsPatch = {
    groupName: s(payload.LINE_ID),
    tidClli: s(payload.NODE),
    equipName: s(payload.LOCA_EQPNAME) || s(payload.LOCZ_EQPNAME) || s(payload.EQUIPMENTNAME),
    equipType: s(payload.EQUIPMENTTYPE),
    system: s(payload.SYSTEM),
    source: s(payload.SOURCE),
    relayRack: s(payload.LOCA_RELAYRACK),
    rate: s(payload.BAND_WIDTH),
    status: s(payload.STATUS) || s(payload.IPCIRCUITSTATUSCODE),
    vzvzb: s(payload.VZB_VZT),
    vendor: s(payload.VENDOR),
    model: s(payload.MODEL),
    spec: s(payload.EQUIPMENTSPEC),
    nextGenAssetOwner: s(payload.NEXTGENASSETOWNER),
    owner: s(payload.OWNER),
    supervisor: s(payload.SUPERVISOR),
    serialNumber: s(payload.EQUIPMENTSERIALNUM),
    nextGenDomain: s(payload.DOMAIN_FLAG),
    wireCenterSiteId: s(payload.WIRECENTER),
    locationCode: s(payload.LOCATION_CODE),
    locationClli: s(payload.LOCATION_CLLI),
    region: s(payload.REGION),
    mgmtRegion: s(payload.MGMTREGION),
    country: s(payload.COUNTRY),
    address: s(payload.LOCA_ADDRESS) || s(payload.LOCZ_ADDRESS),
    city:
      s(payload.PRIMARYLOCATIONCITY) ||
      s(payload.SECONDARYLOCATIONCITY) ||
      s(payload.CONTACTCITY),
    state: s(payload.STATECD) || s(payload.CONTACTSTATE),
    zipCode:
      s(payload.PRIMARYLOCATIONZIPCODE) ||
      s(payload.SECONDARYLOCATIONZIPCODE) ||
      s(payload.CONTACTZIPCODE),
  };

  // Circuit/service grid mapping (prefer parallel arrays; fallback to TPV block).
  const circuitIds = toArray(payload.CIRCUIT_ID_ARRAY);
  const ticketClasses = toArray(payload.TICKET_CLASS_ARRAY);
  const circuitStatuses = toArray(payload.CIRCUIT_STATUS_ARRAY);
  const serviceTypes = toArray(payload.SERVICE_TYPE_ARRAY);
  const customerNames = toArray(payload.CUSTOMER_NAME_ARRAY);
  const troubleReportNums = toArray(payload.TROUBLEREPORTNUM_ARRAY);

  let circuitInfoRows = [];
  if (circuitIds.length > 0) {
    circuitInfoRows = circuitIds.map((circuitId, i) => ({
      circuitId: s(circuitId),
      ticketClass: s(ticketClasses[i]),
      serviceType: s(serviceTypes[i]),
      circuitStatus: s(circuitStatuses[i]),
      customerName: s(customerNames[i]),
      trNo: s(troubleReportNums[i]),
    }));
  } else {
    const tpvRows =
      payload?.ELEMENT_DETAIL_TPV_DATA?.TTPV_DETAILS_INFO_DATA ?? [];
    circuitInfoRows = toArray(tpvRows).map((r) => ({
      circuitId: s(r.CIRCUITNAME),
      ticketClass: s(r.CATEGORY),
      serviceType: s(r.SERVICETYPE),
      circuitStatus: s(r.CIRCUITSTATUS),
      customerName: s(r.ASITENAME),
      trNo: '',
    }));
  }

  return {
    statusOk,
    detailsPatch,
    additionalDetailsRows,
    provisionedCountsRows,
    circuitInfoRows,
  };
}

