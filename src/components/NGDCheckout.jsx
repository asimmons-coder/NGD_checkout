import React, { useState, useMemo } from 'react';

const INSURANCE_CODES = {
  'AETNA': 'AETNA', 'AH&L': 'AH&L', 'BCBS': 'BC', 'BCN': 'BCN',
  'CIGNA': 'CIGNA', 'HAP': 'HAP', 'MR': 'MR', 'PRIORITY': 'PRIOR',
  'UHC': 'UHC', 'PATIENT PAY': 'PTPAY', 'OTHER': 'OTHER'
};

const COSMETIC_ITEMS = [
  { id: 'botox', name: 'Botox', hasUnits: true, unitPrice: 15 },
  { id: 'dysport', name: 'Dysport', hasUnits: true, unitPrice: 5 },
  { id: 'daxxify', name: 'Daxxify', hasUnits: true, unitPrice: 12 },
  { id: 'contour', name: 'Contour', hasQty: true, basePrice: 850 },
  { id: 'voluma', name: 'Voluma', hasQty: true, basePrice: 950 },
  { id: 'skinvyve', name: 'Skinvive', hasQty: true, basePrice: 650 },
  { id: 'sclero', name: 'Sclerotherapy', hasQty: false, basePrice: 350 },
  { id: 'kybella', name: 'Kybella', hasQty: true, basePrice: 750 },
];

// Sequential/Add-On Codes (NOT subject to multiple procedure reduction)
const SEQUENTIAL_CODES = ['17003', '11103', '11105', '11107', '11201'];

const PROCEDURE_CODES = {
  // Office Calls
  '99202': { desc: 'New patient - minor', prices: { AETNA: 76.77, BC: 82.88, BCN: 82.88, CIGNA: 76.02, HAP: 76.02, UHC: 76.87, PTPAY: 119, OTHER: 82.88 }, isOfficeCall: true },
  '99203': { desc: 'New patient - moderate', prices: { AETNA: 119.71, BC: 117.35, BCN: 117.35, CIGNA: 111.32, HAP: 111.32, UHC: 111.78, PTPAY: 140, OTHER: 117.35 }, isOfficeCall: true },
  '99204': { desc: 'New patient - complex', prices: { AETNA: 178.19, BC: 179.33, BCN: 179.33, CIGNA: 170.46, HAP: 170.46, UHC: 169.62, PTPAY: 200, OTHER: 179.33 }, isOfficeCall: true },
  '99212': { desc: 'Established - brief', prices: { AETNA: 59.88, BC: 54.61, BCN: 54.61, CIGNA: 44.59, HAP: 44.59, UHC: 44.67, PTPAY: 75, OTHER: 54.61 }, isOfficeCall: true },
  '99213': { desc: 'Established - standard', prices: { AETNA: 96.16, BC: 85.82, BCN: 85.82, CIGNA: 73.93, HAP: 73.93, UHC: 74.92, PTPAY: 95, OTHER: 85.82 }, isOfficeCall: true },
  '99214': { desc: 'Established - complex', prices: { AETNA: 136.24, BC: 124.45, BCN: 124.45, CIGNA: 109.19, HAP: 109.19, UHC: 110.16, PTPAY: 150, OTHER: 124.45 }, isOfficeCall: true },

  // Biopsies
  '11102': { desc: 'Tangential biopsy (single)', prices: { AETNA: 121.64, BC: 126.84, BCN: 126.84, CIGNA: 98.25, HAP: 98.25, UHC: 112.72, PTPAY: 150, OTHER: 126.84 }},
  '11103': { desc: 'Tangential biopsy (each add\'l)', prices: { AETNA: 60.46, BC: 63.42, BCN: 63.42, CIGNA: 53.03, HAP: 53.03, UHC: 60.83, PTPAY: 75, OTHER: 63.42 }, isSequential: true },
  '11104': { desc: 'Punch biopsy (single)', prices: { AETNA: 150.90, BC: 157.92, BCN: 157.92, CIGNA: 123.43, HAP: 123.43, UHC: 141.64, PTPAY: 175, OTHER: 157.92 }},
  '11105': { desc: 'Punch biopsy (each add\'l)', prices: { AETNA: 71.37, BC: 75.18, BCN: 75.18, CIGNA: 60.83, HAP: 60.83, UHC: 69.75, PTPAY: 85, OTHER: 75.18 }, isSequential: true },
  '11106': { desc: 'Incisional biopsy (single)', prices: { AETNA: 186.72, BC: 196.14, BCN: 196.14, CIGNA: 149.55, HAP: 149.55, UHC: 171.56, PTPAY: 210, OTHER: 196.14 }},
  '11107': { desc: 'Incisional biopsy (each add\'l)', prices: { AETNA: 86.17, BC: 89.88, BCN: 89.88, CIGNA: 71.71, HAP: 71.71, UHC: 82.23, PTPAY: 95, OTHER: 89.88 }, isSequential: true },

  // Skin Tags
  '11200': { desc: 'Skin tags 1-15', prices: { AETNA: 110.40, BC: 117.18, BCN: 117.18, CIGNA: 85.57, HAP: 85.57, UHC: 101.72, PTPAY: 105, OTHER: 117.18 }},
  '11201': { desc: 'Skin tags 16+', prices: { AETNA: 22.77, BC: 23.10, BCN: 23.10, CIGNA: 19.01, HAP: 19.01, UHC: 22.26, PTPAY: 79, OTHER: 23.10 }, isSequential: true },

  // Benign Shave
  '11300': { desc: 'Benign shave trunk/arms/legs ≤.5cm', prices: { AETNA: 121.41, BC: 126.84, BCN: 126.84, CIGNA: 68.86, HAP: 68.86, UHC: 111.70, PTPAY: 115, OTHER: 126.84 }},
  '11301': { desc: 'Benign shave trunk/arms/legs .6-1cm', prices: { AETNA: 146.88, BC: 153.30, BCN: 153.30, CIGNA: 92.44, HAP: 92.44, UHC: 137.92, PTPAY: 158, OTHER: 153.30 }},
  '11302': { desc: 'Benign shave trunk/arms/legs 1.1-2cm', prices: { AETNA: 165.42, BC: 173.04, BCN: 173.04, CIGNA: 110.54, HAP: 110.54, UHC: 162.68, PTPAY: 168, OTHER: 173.04 }},
  '11310': { desc: 'Benign shave face/ears/nose ≤.5cm', prices: { AETNA: 140.28, BC: 146.16, BCN: 146.16, CIGNA: 84.67, HAP: 84.67, UHC: 130.56, PTPAY: 155, OTHER: 146.16 }},
  '11311': { desc: 'Benign shave face/ears/nose .6-1cm', prices: { AETNA: 165.28, BC: 172.62, BCN: 172.62, CIGNA: 106.29, HAP: 106.29, UHC: 127.93, PTPAY: 140, OTHER: 172.62 }},

  // Benign Excision
  '11400': { desc: 'Benign exc trunk/arms/legs ≤.5cm', prices: { AETNA: 154.02, BC: 162.54, BCN: 162.54, CIGNA: 119.86, HAP: 119.86, UHC: 142.07, PTPAY: 165, OTHER: 162.54 }},
  '11401': { desc: 'Benign exc trunk/arms/legs .6-1cm', prices: { AETNA: 188.95, BC: 197.82, BCN: 197.82, CIGNA: 146.74, HAP: 146.74, UHC: 171.48, PTPAY: 195, OTHER: 197.82 }},
  '11402': { desc: 'Benign exc trunk/arms/legs 1.1-2cm', prices: { AETNA: 207.56, BC: 217.98, BCN: 217.98, CIGNA: 163.80, HAP: 163.80, UHC: 191.34, PTPAY: 195, OTHER: 217.98 }},
  '11440': { desc: 'Benign exc face/ears/nose ≤.5cm', prices: { AETNA: 172.41, BC: 181.86, BCN: 181.86, CIGNA: 131.99, HAP: 131.99, UHC: 153.58, PTPAY: 157, OTHER: 181.86 }},
  '11441': { desc: 'Benign exc face/ears/nose .6-1cm', prices: { AETNA: 210.59, BC: 220.92, BCN: 220.92, CIGNA: 166.41, HAP: 166.41, UHC: 193.13, PTPAY: 198, OTHER: 220.92 }},

  // Malignant Excision
  '11600': { desc: 'Malig exc trunk/arms/legs ≤.5cm', prices: { AETNA: 238.80, BC: 316.90, BCN: 316.90, CIGNA: 188.19, HAP: 188.19, UHC: 221.03, PTPAY: 298, OTHER: 316.90 }},
  '11601': { desc: 'Malig exc trunk/arms/legs .6-1cm', prices: { AETNA: 276.46, BC: 289.38, BCN: 289.38, CIGNA: 226.10, HAP: 226.10, UHC: 263.92, PTPAY: 268, OTHER: 289.38 }},
  '11602': { desc: 'Malig exc trunk/arms/legs 1.1-2cm', prices: { AETNA: 295.90, BC: 309.54, BCN: 309.54, CIGNA: 246.49, HAP: 246.49, UHC: 286.34, PTPAY: 293, OTHER: 309.54 }},
  '11640': { desc: 'Malig exc face/ears/nose ≤.5cm', prices: { AETNA: 245.03, BC: 257.46, BCN: 257.46, CIGNA: 197.67, HAP: 197.67, UHC: 230.55, PTPAY: 236, OTHER: 257.46 }},
  '11641': { desc: 'Malig exc face/ears/nose .6-1cm', prices: { AETNA: 287.10, BC: 299.88, BCN: 299.88, CIGNA: 237.08, HAP: 237.08, UHC: 274.64, PTPAY: 282, OTHER: 299.88 }},

  // Destruction/LN2
  '17000': { desc: 'LN2/AK first lesion', prices: { AETNA: 80.92, BC: 85.68, BCN: 85.68, CIGNA: 79.90, HAP: 79.90, UHC: 76.53, PTPAY: 98, OTHER: 85.68 }},
  '17003': { desc: 'LN2/AK 2-14 (per lesion)', prices: { AETNA: 7.93, BC: 8.40, BCN: 8.40, CIGNA: 7.13, HAP: 7.13, UHC: 6.54, PTPAY: 22, OTHER: 8.40 }, isSequential: true },
  '17004': { desc: 'LN2/AK 15+ lesions', prices: { AETNA: 203.62, BC: 211.68, BCN: 211.68, CIGNA: 172.07, HAP: 172.07, UHC: 172.70, PTPAY: 288, OTHER: 211.68 }},
  '17110': { desc: 'MC/SK/Milia 1-14', prices: { AETNA: 135.80, BC: 144.06, BCN: 144.06, CIGNA: 108.70, HAP: 108.70, UHC: 126.16, PTPAY: 134, OTHER: 144.06 }},
  '17111': { desc: 'MC/SK/Milia 15+', prices: { AETNA: 159.20, BC: 168.42, BCN: 168.42, CIGNA: 129.34, HAP: 129.34, UHC: 150.39, PTPAY: 156, OTHER: 168.42 }},
  '17260': { desc: 'Malig ED&C trunk/arms/legs ≤.5cm', prices: { AETNA: 121.04, BC: 126.42, BCN: 126.42, CIGNA: 94.00, HAP: 94.00, UHC: 109.50, PTPAY: 137, OTHER: 126.42 }},
  '17261': { desc: 'Malig ED&C trunk/arms/legs .6-1cm', prices: { AETNA: 178.19, BC: 188.16, BCN: 188.16, CIGNA: 143.29, HAP: 143.29, UHC: 164.34, PTPAY: 200, OTHER: 188.16 }},

  // Pathology
  '88304': { desc: 'Path - cyst/lipoma/tags', prices: { AETNA: 50.78, BC: 68.71, BCN: 68.71, CIGNA: 60.07, HAP: 60.07, UHC: 41.73, PTPAY: 110, OTHER: 68.71 }, isPath: true },
  '88305': { desc: 'Path - specimen exam', prices: { AETNA: 86.13, BC: 105.03, BCN: 105.03, CIGNA: 102.27, HAP: 102.27, UHC: 69.84, PTPAY: 110, OTHER: 105.03 }, isPath: true },
  '88312': { desc: 'Path - special stain microorg', prices: { AETNA: 133.55, BC: 180.02, BCN: 180.02, CIGNA: 90.50, HAP: 90.50, UHC: 99.50, PTPAY: 150, OTHER: 180.02 }, isPath: true },
  '88342': { desc: 'Path - immunohistochemistry', prices: { AETNA: 119.66, BC: 169.37, BCN: 169.37, CIGNA: 102.45, HAP: 102.45, UHC: 108.28, PTPAY: 150, OTHER: 169.37 }, isPath: true },

  // Unit-Based
  'J0585': { desc: 'Botox - per unit (medical)', prices: { AETNA: 6.60, BC: 6.35, BCN: 6.35, CIGNA: 6.32, HAP: 6.32, UHC: 6.23, PTPAY: 7, OTHER: 6.35 }, isUnitBased: true },
};

const formatCurrency = (amount) => {
  if (amount === 0 || amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatCurrencyAlways = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

export default function NGDCheckout() {
  const [step, setStep] = useState(1);
  const [showCalculations, setShowCalculations] = useState(true);

  const [patientInfo, setPatientInfo] = useState({
    accountNumber: '',
    doctor: 'FN',
    recallsAddressed: false,
    knFnCosmeticChecked: false,
    knFnMedicalChecked: false,
    hsaBillFirst: false,
    mipsChecked: false,
    emailUpdated: false,
  });

  const [insurance, setInsurance] = useState({
    insurer: '',
    deductible: '',
    officeCallCopay: '',
    pvSurgCopay: '',
    coinsurance: '',
    pathCoinsurance: '',
    pathCopay: '',
  });

  const [cosmetics, setCosmetics] = useState({});
  const [products, setProducts] = useState([{ name: '', price: '' }]);
  const [procedures, setProcedures] = useState([]);
  const [adjustments, setAdjustments] = useState({
    balance: '',
    credit: '',
    aspireToday: '',
    aspireToCB: '',
    bdToday: '',
    bdToCB: '',
    coupon: '',
    oldCosmeticBalance: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [checkout, setCheckout] = useState({ completed: false, amountPaid: '' });

  const insurerKey = useMemo(() => {
    const entry = Object.entries(INSURANCE_CODES).find(([k]) => k === insurance.insurer);
    return entry ? entry[1] : 'PTPAY';
  }, [insurance.insurer]);

  const calculations = useMemo(() => {
    // HSA / BILL FIRST - GLOBAL STOP
    if (patientInfo.hsaBillFirst) {
      return {
        cosmeticTotal: 0, productTotal: 0, medicalDue: 0, totalDue: 0,
        hsaStopped: true,
        pvSurgChargesRaw: [], pvSurgTotal: 0, pathTotal: 0, ocTotal: 0,
        sequentialTotal: 0, unitBasedTotal: 0,
        deductibleApplied: 0, remainingDeductible: parseFloat(insurance.deductible) || 0,
        pvSurgTowardsDed: 0, pathTowardsDed: 0, ocTowardsDed: 0,
        pvSurgCoinsurance: 0, pathCoinsurance: 0, ocCoinsurance: 0,
        totalCoinsurance: 0, copayCollected: 0, copayType: null,
        deductibleCollected: 0, coinsuranceCollected: 0, pathCollected: 0,
        totalAdjustments: 0, balance: 0, credit: 0,
      };
    }

    // COSMETIC TOTAL
    let cosmeticTotal = 0;
    Object.entries(cosmetics).forEach(([id, data]) => {
      const item = COSMETIC_ITEMS.find(i => i.id === id);
      if (item && data.checked) {
        if (data.customPrice) {
          cosmeticTotal += data.customPrice;
        } else if (item.hasUnits) {
          cosmeticTotal += (data.units || 0) * item.unitPrice;
        } else if (item.hasQty) {
          cosmeticTotal += (data.qty || 1) * item.basePrice;
        } else {
          cosmeticTotal += item.basePrice || 0;
        }
      }
    });

    // PRODUCT TOTAL
    const productTotal = products.reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0);

    // Unit-based codes
    let unitBasedTotal = 0;
    let unitBasedDetails = [];

    // Categorize procedures
    let ocCharge = 0;
    let ocCode = '';
    let pvSurgChargesRaw = [];
    let sequentialCharges = [];
    let pathCharges = [];

    procedures.forEach(proc => {
      const codeData = PROCEDURE_CODES[proc.code];
      if (!codeData) return;
      const price = codeData.prices[insurerKey] || codeData.prices['OTHER'] || codeData.prices['PTPAY'] || 0;
      const qty = proc.qty || 1;

      if (codeData.isUnitBased) {
        const total = price * qty;
        unitBasedTotal += total;
        unitBasedDetails.push({ code: proc.code, price, qty, total });
      } else if (codeData.isOfficeCall) {
        ocCharge = price;
        ocCode = proc.code;
      } else if (codeData.isPath) {
        pathCharges.push({ code: proc.code, price, qty, total: price * qty });
      } else if (codeData.isSequential || SEQUENTIAL_CODES.includes(proc.code)) {
        sequentialCharges.push({ code: proc.code, price, qty, total: price * qty });
      } else {
        pvSurgChargesRaw.push({ code: proc.code, price, qty, total: price * qty });
      }
    });

    // Multiple procedure reduction
    let pvSurgReduced = 0;
    let maxPvSurgCode = '';
    let maxPvSurgAmount = 0;
    let reductionDetails = [];

    if (pvSurgChargesRaw.length > 0) {
      pvSurgChargesRaw.sort((a, b) => b.total - a.total);
      maxPvSurgCode = pvSurgChargesRaw[0].code;
      maxPvSurgAmount = pvSurgChargesRaw[0].total;

      reductionDetails.push({
        code: pvSurgChargesRaw[0].code,
        original: pvSurgChargesRaw[0].total,
        reduced: pvSurgChargesRaw[0].total,
        pct: 100
      });
      pvSurgReduced = maxPvSurgAmount;

      pvSurgChargesRaw.slice(1).forEach(c => {
        const reducedAmt = c.total * 0.5;
        reductionDetails.push({ code: c.code, original: c.total, reduced: reducedAmt, pct: 50 });
        pvSurgReduced += reducedAmt;
      });
    }

    const sequentialTotal = sequentialCharges.reduce((sum, c) => sum + c.total, 0);
    const pvSurgTotal = pvSurgReduced + sequentialTotal + unitBasedTotal;
    const pathTotal = pathCharges.reduce((sum, c) => sum + c.total, 0);
    const ocTotal = ocCharge;

    // Insurance parameters
    const deductible = parseFloat(insurance.deductible) || 0;
    const coinsurancePct = parseFloat(insurance.coinsurance) || 0;
    const pathCoinsurancePct = parseFloat(insurance.pathCoinsurance) || coinsurancePct;
    const ocCopay = parseFloat(insurance.officeCallCopay) || 0;
    const pvSurgCopay = parseFloat(insurance.pvSurgCopay) || 0;
    const pathCopay = parseFloat(insurance.pathCopay) || 0;

    // Deductible waterfall
    let remainingDed = deductible;
    let pvSurgTowardsDed = 0;
    let pathTowardsDed = 0;
    let ocTowardsDed = 0;
    let pvSurgAfterDed = pvSurgTotal;
    let pathAfterDed = pathTotal;
    let ocAfterDed = ocTotal;

    if (remainingDed > 0 && pvSurgTotal > 0) {
      if (pvSurgTotal >= remainingDed) {
        pvSurgTowardsDed = remainingDed;
        pvSurgAfterDed = pvSurgTotal - remainingDed;
        remainingDed = 0;
      } else {
        pvSurgTowardsDed = pvSurgTotal;
        pvSurgAfterDed = 0;
        remainingDed -= pvSurgTotal;
      }
    }

    if (remainingDed > 0 && pathTotal > 0) {
      if (pathTotal >= remainingDed) {
        pathTowardsDed = remainingDed;
        pathAfterDed = pathTotal - remainingDed;
        remainingDed = 0;
      } else {
        pathTowardsDed = pathTotal;
        pathAfterDed = 0;
        remainingDed -= pathTotal;
      }
    }

    if (remainingDed > 0 && ocTotal > 0) {
      if (ocTotal >= remainingDed) {
        ocTowardsDed = remainingDed;
        ocAfterDed = ocTotal - remainingDed;
        remainingDed = 0;
      } else {
        ocTowardsDed = ocTotal;
        ocAfterDed = 0;
        remainingDed -= ocTotal;
      }
    }

    const deductibleApplied = pvSurgTowardsDed + pathTowardsDed + ocTowardsDed;
    const remainingDeductible = remainingDed;

    // Coinsurance
    let pvSurgCoinsurance = 0;
    let pathCoinsurance = 0;
    let ocCoinsurance = 0;

    if (coinsurancePct > 0) {
      pvSurgCoinsurance = pvSurgAfterDed * (coinsurancePct / 100);
      ocCoinsurance = ocAfterDed * (coinsurancePct / 100);
    }
    if (pathCoinsurancePct > 0) {
      pathCoinsurance = pathAfterDed * (pathCoinsurancePct / 100);
    }

    const totalCoinsurance = pvSurgCoinsurance + pathCoinsurance + ocCoinsurance;

    // Copay logic
    let copayCollected = 0;
    let copayType = null;
    let pathCopayCollected = 0;

    const hasDeductible = deductible > 0;
    const hasCoinsurance = coinsurancePct > 0 || pathCoinsurancePct > 0;
    const copaysBlocked = hasDeductible || hasCoinsurance;

    if (!copaysBlocked) {
      if (pvSurgTotal > 0 && ocTotal > 0) {
        if (pvSurgCopay >= ocCopay) {
          copayCollected = pvSurgCopay;
          copayType = 'PV/Surg Copay';
        } else {
          copayCollected = ocCopay;
          copayType = 'Office Call Copay';
        }
      } else if (pvSurgTotal > 0 && pvSurgCopay > 0) {
        copayCollected = pvSurgCopay;
        copayType = 'PV/Surg Copay';
      } else if (ocTotal > 0 && ocCopay > 0) {
        copayCollected = ocCopay;
        copayType = 'Office Call Copay';
      }

      if (pathTotal > 0 && pathCopay > 0) {
        pathCopayCollected = pathCopay;
      }
    }

    if (pathTowardsDed > 0) {
      pathCopayCollected = 0;
    }
    if (ocTowardsDed > 0 && copayType === 'Office Call Copay') {
      copayCollected = 0;
      copayType = null;
    }

    const deductibleCollected = deductibleApplied;
    const coinsuranceCollected = totalCoinsurance;
    const medicalDue = deductibleCollected + coinsuranceCollected + copayCollected + pathCopayCollected;

    // Adjustments
    const balance = parseFloat(adjustments.balance) || 0;
    const credit = parseFloat(adjustments.credit) || 0;
    const aspireToday = parseFloat(adjustments.aspireToday) || 0;
    const bdToday = parseFloat(adjustments.bdToday) || 0;
    const coupon = parseFloat(adjustments.coupon) || 0;
    const totalAdjustments = aspireToday + bdToday + coupon;

    const subtotal = cosmeticTotal + productTotal + medicalDue;
    const totalDue = subtotal + balance - credit - totalAdjustments;

    return {
      cosmeticTotal,
      productTotal,
      pvSurgChargesRaw,
      reductionDetails,
      sequentialCharges,
      sequentialTotal,
      unitBasedDetails,
      unitBasedTotal,
      pathCharges,
      maxPvSurgCode,
      maxPvSurgAmount,
      pvSurgTotal,
      pathTotal,
      ocTotal,
      ocCode,
      deductible,
      deductibleApplied,
      remainingDeductible,
      pvSurgTowardsDed,
      pathTowardsDed,
      ocTowardsDed,
      pvSurgAfterDed,
      pathAfterDed,
      ocAfterDed,
      coinsurancePct,
      pathCoinsurancePct,
      pvSurgCoinsurance,
      pathCoinsurance,
      ocCoinsurance,
      totalCoinsurance,
      copaysBlocked,
      copayCollected,
      copayType,
      pathCopayCollected,
      deductibleCollected,
      coinsuranceCollected,
      medicalDue,
      totalAdjustments,
      balance,
      credit,
      subtotal,
      totalDue: Math.max(0, totalDue),
      hsaStopped: false,
    };
  }, [cosmetics, products, procedures, insurance, adjustments, patientInfo, insurerKey]);

  const Section = ({ title, children, icon }) => (
    <div className="bg-white rounded-xl shadow-sm border border-ngd-taupe/30 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-ngd-light to-white border-b border-ngd-taupe/20">
        <h3 className="text-sm font-semibold text-ngd-dark uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">{icon}</span> {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  const Checkbox = ({ label, checked, onChange, required }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
        ${checked ? 'bg-ngd-brown border-ngd-brown' : 'border-ngd-taupe group-hover:border-ngd-gray'}
        ${required && !checked ? 'border-amber-400 bg-amber-50' : ''}`}>
        {checked && <span className="text-white text-xs">✓</span>}
      </div>
      <span className={`text-sm ${required && !checked ? 'text-amber-700 font-medium' : 'text-ngd-gray'}`}>
        {label} {required && !checked && <span className="text-amber-500">*</span>}
      </span>
    </label>
  );

  const Input = ({ label, value, onChange, type = 'text', prefix, placeholder, small }) => (
    <div className={small ? 'flex-1' : ''}>
      {label && <label className="block text-xs font-medium text-ngd-gray mb-1">{label}</label>}
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ngd-taupe text-sm">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-ngd-taupe/50 py-2 text-sm focus:border-ngd-brown focus:ring-2 focus:ring-ngd-taupe/20 outline-none transition-all
            ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
    </div>
  );

  const CalcRow = ({ label, value, indent, bold, highlight, sub, dimmed }) => (
    <div className={`flex justify-between py-1 ${indent ? 'pl-4' : ''} ${highlight ? 'bg-amber-50 -mx-2 px-2 rounded' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold text-ngd-dark' : sub ? 'text-ngd-taupe text-xs' : dimmed ? 'text-ngd-taupe' : 'text-ngd-gray'}`}>{label}</span>
      <span className={`text-sm font-mono ${bold ? 'font-bold text-ngd-dark' : dimmed ? 'text-ngd-taupe' : 'font-medium text-ngd-gray'}`}>
        {typeof value === 'number' ? formatCurrency(value) : value}
      </span>
    </div>
  );

  const CalculationBreakdown = () => {
    if (calculations.hsaStopped) {
      return (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mt-4">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold">HSA / Bill First</div>
              <div className="text-sm">Do not collect any money up front. Total due today = $0</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-ngd-light rounded-xl p-4 mt-4 border border-ngd-taupe/30">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-ngd-dark text-sm uppercase tracking-wide">📊 Calculation Breakdown</h4>
          <button
            onClick={() => setShowCalculations(!showCalculations)}
            className="text-xs text-ngd-brown hover:text-ngd-dark font-medium"
          >
            {showCalculations ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {showCalculations && (
          <div className="space-y-4 text-xs">
            {/* Charges Section */}
            <div className="bg-white rounded-lg p-3 border border-ngd-taupe/30">
              <h5 className="font-semibold text-ngd-gray mb-2 uppercase tracking-wider text-xs">Step 1-2: Charges & Multiple Procedure Reduction</h5>

              {calculations.reductionDetails.length > 0 && (
                <>
                  <div className="text-xs text-ngd-taupe mb-1">PV/Surg (with reduction):</div>
                  {calculations.reductionDetails.map((d, i) => (
                    <CalcRow
                      key={d.code}
                      label={`${d.code} @ ${d.pct}%${i === 0 ? ' (max)' : ''}`}
                      value={d.reduced}
                      indent
                    />
                  ))}
                </>
              )}

              {calculations.sequentialCharges.length > 0 && (
                <>
                  <div className="text-xs text-ngd-taupe mt-2 mb-1">Sequential/Add-on (no reduction):</div>
                  {calculations.sequentialCharges.map(c => (
                    <CalcRow key={c.code} label={`${c.code} × ${c.qty}`} value={c.total} indent />
                  ))}
                </>
              )}

              {calculations.unitBasedDetails.length > 0 && (
                <>
                  <div className="text-xs text-ngd-taupe mt-2 mb-1">Unit-Based:</div>
                  {calculations.unitBasedDetails.map(c => (
                    <CalcRow key={c.code} label={`${c.code} × ${c.qty} units`} value={c.total} indent />
                  ))}
                </>
              )}

              <div className="border-t border-ngd-taupe/30 mt-2 pt-2">
                <CalcRow label="Total PV/Surg" value={calculations.pvSurgTotal} bold />
              </div>

              {calculations.pathCharges.length > 0 && (
                <>
                  <div className="text-xs text-ngd-taupe mt-2 mb-1">Pathology (no reduction):</div>
                  {calculations.pathCharges.map(c => (
                    <CalcRow key={c.code} label={c.code} value={c.total} indent />
                  ))}
                  <CalcRow label="Total Path" value={calculations.pathTotal} bold />
                </>
              )}

              {calculations.ocTotal > 0 && (
                <CalcRow label={`Office Call (${calculations.ocCode})`} value={calculations.ocTotal} />
              )}
            </div>

            {/* Deductible Waterfall */}
            <div className="bg-white rounded-lg p-3 border border-ngd-taupe/30">
              <h5 className="font-semibold text-ngd-gray mb-2 uppercase tracking-wider text-xs">Step 3: Deductible Waterfall</h5>
              <CalcRow label="Starting Deductible" value={calculations.deductible} />

              <div className="text-xs text-ngd-taupe mt-2 mb-1">Applied in order:</div>
              <CalcRow
                label="1. PV/Surg → Deductible"
                value={calculations.pvSurgTowardsDed}
                indent
                dimmed={calculations.pvSurgTowardsDed === 0}
              />
              <CalcRow
                label="2. Path → Deductible"
                value={calculations.pathTowardsDed}
                indent
                dimmed={calculations.pathTowardsDed === 0}
              />
              <CalcRow
                label="3. OC → Deductible"
                value={calculations.ocTowardsDed}
                indent
                dimmed={calculations.ocTowardsDed === 0}
              />

              <div className="border-t border-ngd-taupe/30 mt-2 pt-2">
                <CalcRow label="Deductible Collected Today" value={calculations.deductibleApplied} bold />
                <CalcRow
                  label="Remaining Deductible"
                  value={calculations.remainingDeductible}
                  bold
                  highlight={calculations.remainingDeductible > 0}
                />
              </div>
            </div>

            {/* Coinsurance */}
            <div className="bg-white rounded-lg p-3 border border-ngd-taupe/30">
              <h5 className="font-semibold text-ngd-gray mb-2 uppercase tracking-wider text-xs">Step 4: Coinsurance</h5>
              <CalcRow label="Coinsurance %" value={`${calculations.coinsurancePct}%`} />

              <div className="text-xs text-ngd-taupe mt-2 mb-1">Applied to amounts after deductible:</div>
              <CalcRow
                label={`PV/Surg: ${formatCurrency(calculations.pvSurgAfterDed)} × ${calculations.coinsurancePct}%`}
                value={calculations.pvSurgCoinsurance}
                indent
                dimmed={calculations.pvSurgCoinsurance === 0}
              />
              <CalcRow
                label={`Path: ${formatCurrency(calculations.pathAfterDed)} × ${calculations.pathCoinsurancePct}%`}
                value={calculations.pathCoinsurance}
                indent
                dimmed={calculations.pathCoinsurance === 0}
              />
              <CalcRow
                label={`OC: ${formatCurrency(calculations.ocAfterDed)} × ${calculations.coinsurancePct}%`}
                value={calculations.ocCoinsurance}
                indent
                dimmed={calculations.ocCoinsurance === 0}
              />

              <div className="border-t border-ngd-taupe/30 mt-2 pt-2">
                <CalcRow label="Total Coinsurance" value={calculations.totalCoinsurance} bold />
              </div>
            </div>

            {/* Copay Gate */}
            <div className="bg-white rounded-lg p-3 border border-ngd-taupe/30">
              <h5 className="font-semibold text-ngd-gray mb-2 uppercase tracking-wider text-xs">Step 5-6: Copay Gate & Mutual Exclusion</h5>

              {calculations.copaysBlocked ? (
                <div className="bg-red-50 text-red-700 text-xs p-2 rounded mb-2">
                  ⛔ Copays BLOCKED (deductible or coinsurance exists)
                </div>
              ) : (
                <div className="bg-green-50 text-green-700 text-xs p-2 rounded mb-2">
                  ✓ Copays eligible (no deductible, no coinsurance)
                </div>
              )}

              <CalcRow
                label="OC Copay Available"
                value={formatCurrency(parseFloat(insurance.officeCallCopay) || 0)}
                dimmed={calculations.copaysBlocked}
              />
              <CalcRow
                label="PV/Surg Copay Available"
                value={formatCurrency(parseFloat(insurance.pvSurgCopay) || 0)}
                dimmed={calculations.copaysBlocked}
              />

              {!calculations.copaysBlocked && calculations.copayType && (
                <div className="text-xs text-ngd-taupe mt-2">
                  Mutual exclusion: Collecting higher of the two
                </div>
              )}

              <div className="border-t border-ngd-taupe/30 mt-2 pt-2">
                <CalcRow
                  label={calculations.copayType ? `Copay Collected (${calculations.copayType})` : 'Copay Collected'}
                  value={calculations.copayCollected}
                  bold
                />
                {calculations.pathCopayCollected > 0 && (
                  <CalcRow label="Path Copay Collected" value={calculations.pathCopayCollected} bold />
                )}
              </div>
            </div>

            {/* Final Total */}
            <div className="bg-ngd-brown/10 rounded-lg p-3 border border-ngd-brown/30">
              <h5 className="font-semibold text-ngd-brown mb-2 uppercase tracking-wider text-xs">Step 8: Total Due Today (Medical)</h5>
              <CalcRow label="Deductible Collected" value={calculations.deductibleCollected} />
              <CalcRow label="Coinsurance Collected" value={calculations.totalCoinsurance} />
              <CalcRow label="Copay Collected" value={calculations.copayCollected + calculations.pathCopayCollected} />
              <div className="border-t border-ngd-brown/30 mt-2 pt-2">
                <CalcRow label="MEDICAL DUE TODAY" value={calculations.medicalDue} bold highlight />
              </div>
            </div>
          </div>
        )}

        {!showCalculations && (
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white rounded-lg p-2 border border-ngd-taupe/30">
              <div className="text-xs text-ngd-taupe">Deductible</div>
              <div className="font-semibold text-ngd-dark">{formatCurrencyAlways(calculations.deductibleCollected)}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-ngd-taupe/30">
              <div className="text-xs text-ngd-taupe">Coinsurance</div>
              <div className="font-semibold text-ngd-dark">{formatCurrencyAlways(calculations.totalCoinsurance)}</div>
            </div>
            <div className="bg-white rounded-lg p-2 border border-ngd-taupe/30">
              <div className="text-xs text-ngd-taupe">Copay</div>
              <div className="font-semibold text-ngd-dark">{formatCurrencyAlways(calculations.copayCollected + calculations.pathCopayCollected)}</div>
            </div>
            <div className="bg-ngd-brown/10 rounded-lg p-2 border border-ngd-brown/30">
              <div className="text-xs text-ngd-brown">Medical Due</div>
              <div className="font-bold text-ngd-brown">{formatCurrencyAlways(calculations.medicalDue)}</div>
            </div>
          </div>
        )}

        {calculations.deductible > 0 && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-amber-800">⚠️ Remaining Deductible (update in system)</span>
            <span className="text-lg font-bold text-amber-700">{formatCurrencyAlways(calculations.remainingDeductible)}</span>
          </div>
        )}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-5">
      <Section title="Patient Information" icon="👤">
        <div className="grid grid-cols-2 gap-4 mb-5">
          <Input
            label="Account Number"
            value={patientInfo.accountNumber}
            onChange={(v) => setPatientInfo(p => ({ ...p, accountNumber: v }))}
            placeholder="Enter account #"
          />
          <div>
            <label className="block text-xs font-medium text-ngd-gray mb-1">Provider</label>
            <div className="flex gap-2">
              {['FN', 'KN'].map(doc => (
                <button
                  key={doc}
                  onClick={() => setPatientInfo(p => ({ ...p, doctor: doc }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                    ${patientInfo.doctor === doc
                      ? 'bg-ngd-brown text-white shadow-sm'
                      : 'bg-ngd-light text-ngd-gray hover:bg-ngd-taupe/30'}`}
                >
                  Dr. {doc === 'FN' ? 'Novice' : 'Karlee'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-ngd-light rounded-lg">
          <p className="text-xs font-medium text-ngd-gray uppercase tracking-wide mb-2">Pre-Checkout Verification</p>
          <Checkbox
            label="Nurse verbally signed off recalls"
            checked={patientInfo.recallsAddressed}
            onChange={(e) => setPatientInfo(p => ({ ...p, recallsAddressed: !p.recallsAddressed }))}
            required
          />
          <Checkbox
            label="KN/FN Cosmetic box checked"
            checked={patientInfo.knFnCosmeticChecked}
            onChange={() => setPatientInfo(p => ({ ...p, knFnCosmeticChecked: !p.knFnCosmeticChecked }))}
            required
          />
          <Checkbox
            label="KN/FN Medical box checked"
            checked={patientInfo.knFnMedicalChecked}
            onChange={() => setPatientInfo(p => ({ ...p, knFnMedicalChecked: !p.knFnMedicalChecked }))}
            required
          />
          <Checkbox
            label="MIPS (65+) form verified"
            checked={patientInfo.mipsChecked}
            onChange={() => setPatientInfo(p => ({ ...p, mipsChecked: !p.mipsChecked }))}
          />
          <Checkbox
            label="Email confirmed/updated"
            checked={patientInfo.emailUpdated}
            onChange={() => setPatientInfo(p => ({ ...p, emailUpdated: !p.emailUpdated }))}
          />
        </div>
      </Section>

      <Section title="Insurance" icon="🏥">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium text-ngd-gray mb-1">Insurance</label>
            <select
              value={insurance.insurer}
              onChange={(e) => setInsurance(i => ({ ...i, insurer: e.target.value }))}
              className="w-full rounded-lg border border-ngd-taupe/50 py-2 px-3 text-sm focus:border-ngd-brown focus:ring-2 focus:ring-ngd-taupe/20 outline-none"
            >
              <option value="">Select insurer...</option>
              {Object.keys(INSURANCE_CODES).map(ins => (
                <option key={ins} value={ins}>{ins}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end pb-1">
            <Checkbox
              label="HSA / Bill First (NO COLLECTION)"
              checked={patientInfo.hsaBillFirst}
              onChange={() => setPatientInfo(p => ({ ...p, hsaBillFirst: !p.hsaBillFirst }))}
            />
          </div>
        </div>

        {patientInfo.hsaBillFirst && (
          <div className="mb-4 p-3 bg-amber-100 border-2 border-amber-400 rounded-lg">
            <p className="text-sm text-amber-800 font-semibold">
              ⚠️ HSA/Bill First: Do NOT collect any medical charges up front.
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <Input
            label="Deductible"
            value={insurance.deductible}
            onChange={(v) => setInsurance(i => ({ ...i, deductible: v }))}
            prefix="$"
            placeholder="0"
          />
          <Input
            label="Coinsurance %"
            value={insurance.coinsurance}
            onChange={(v) => setInsurance(i => ({ ...i, coinsurance: v }))}
            placeholder="0"
          />
          <Input
            label="Office Call Copay"
            value={insurance.officeCallCopay}
            onChange={(v) => setInsurance(i => ({ ...i, officeCallCopay: v }))}
            prefix="$"
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="PV/Surg Copay"
            value={insurance.pvSurgCopay}
            onChange={(v) => setInsurance(i => ({ ...i, pvSurgCopay: v }))}
            prefix="$"
            placeholder="0"
          />
          <Input
            label="Path Coinsurance %"
            value={insurance.pathCoinsurance}
            onChange={(v) => setInsurance(i => ({ ...i, pathCoinsurance: v }))}
            placeholder="Same as coins"
          />
          <Input
            label="Path Copay"
            value={insurance.pathCopay}
            onChange={(v) => setInsurance(i => ({ ...i, pathCopay: v }))}
            prefix="$"
            placeholder="0"
          />
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
          <strong>Copay Gate Rule:</strong> If patient has deductible OR coinsurance, copays are NOT collected.
          Only collect copays when both deductible = $0 AND coinsurance = 0%.
        </div>
      </Section>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <Section title="Cosmetics" icon="✨">
        <div className="grid grid-cols-2 gap-3">
          {COSMETIC_ITEMS.map(item => {
            const data = cosmetics[item.id] || {};
            return (
              <div
                key={item.id}
                className={`p-3 rounded-lg border-2 transition-all cursor-pointer
                  ${data.checked
                    ? 'border-ngd-brown bg-ngd-brown/5'
                    : 'border-ngd-taupe/30 hover:border-ngd-taupe'}`}
                onClick={() => setCosmetics(c => ({
                  ...c,
                  [item.id]: { ...data, checked: !data.checked }
                }))}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium text-sm ${data.checked ? 'text-ngd-brown' : 'text-ngd-gray'}`}>
                    {item.name}
                  </span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${data.checked ? 'bg-ngd-brown border-ngd-brown' : 'border-ngd-taupe'}`}>
                    {data.checked && <span className="text-white text-xs">✓</span>}
                  </div>
                </div>

                {data.checked && (
                  <div className="flex gap-2 mt-2" onClick={e => e.stopPropagation()}>
                    {item.hasUnits && (
                      <input
                        type="number"
                        placeholder="Units"
                        value={data.units || ''}
                        onChange={(e) => setCosmetics(c => ({
                          ...c,
                          [item.id]: { ...data, units: parseInt(e.target.value) || 0 }
                        }))}
                        className="flex-1 text-sm px-2 py-1 border border-ngd-taupe/50 rounded bg-white"
                      />
                    )}
                    {item.hasQty && (
                      <input
                        type="number"
                        placeholder="Qty"
                        value={data.qty || 1}
                        onChange={(e) => setCosmetics(c => ({
                          ...c,
                          [item.id]: { ...data, qty: parseInt(e.target.value) || 1 }
                        }))}
                        className="w-16 text-sm px-2 py-1 border border-ngd-taupe/50 rounded bg-white"
                      />
                    )}
                    <input
                      type="number"
                      placeholder="$"
                      value={data.customPrice || ''}
                      onChange={(e) => setCosmetics(c => ({
                        ...c,
                        [item.id]: { ...data, customPrice: parseFloat(e.target.value) || 0 }
                      }))}
                      className="w-20 text-sm px-2 py-1 border border-ngd-taupe/50 rounded bg-white"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {calculations.cosmeticTotal > 0 && (
          <div className="mt-4 p-3 bg-ngd-brown/10 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-ngd-brown">Cosmetic Total</span>
            <span className="text-lg font-bold text-ngd-brown">{formatCurrencyAlways(calculations.cosmeticTotal)}</span>
          </div>
        )}
      </Section>

      <Section title="Products" icon="🛍️">
        <div className="space-y-2">
          {products.map((product, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Product name"
                value={product.name}
                onChange={(e) => {
                  const newProducts = [...products];
                  newProducts[idx].name = e.target.value;
                  setProducts(newProducts);
                }}
                className="flex-1 px-3 py-2 text-sm border border-ngd-taupe/50 rounded-lg"
              />
              <input
                type="number"
                placeholder="$0"
                value={product.price}
                onChange={(e) => {
                  const newProducts = [...products];
                  newProducts[idx].price = e.target.value;
                  setProducts(newProducts);
                }}
                className="w-24 px-3 py-2 text-sm border border-ngd-taupe/50 rounded-lg"
              />
              {idx === products.length - 1 ? (
                <button
                  onClick={() => setProducts([...products, { name: '', price: '' }])}
                  className="p-2 text-ngd-brown hover:bg-ngd-brown/10 rounded-lg"
                >
                  +
                </button>
              ) : (
                <button
                  onClick={() => setProducts(products.filter((_, i) => i !== idx))}
                  className="p-2 text-ngd-taupe hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        {calculations.productTotal > 0 && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">Product Total</span>
            <span className="text-lg font-bold text-purple-700">{formatCurrencyAlways(calculations.productTotal)}</span>
          </div>
        )}
      </Section>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <Section title="Medical Procedures" icon="🩺">
        <div className="mb-4">
          <select
            onChange={(e) => {
              if (e.target.value && !procedures.find(p => p.code === e.target.value)) {
                setProcedures([...procedures, { code: e.target.value, qty: 1 }]);
              }
              e.target.value = '';
            }}
            className="w-full px-3 py-2 border border-ngd-taupe/50 rounded-lg text-sm"
          >
            <option value="">+ Add procedure code...</option>
            <optgroup label="Office Calls">
              {Object.entries(PROCEDURE_CODES).filter(([_, v]) => v.isOfficeCall).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Biopsies">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('111')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Benign Shave/Excision">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('113') || c.startsWith('114')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Malignant Excision">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('116')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Destruction/LN2">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('17')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Skin Tags">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c === '11200' || c === '11201').map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Pathology">
              {Object.entries(PROCEDURE_CODES).filter(([_, v]) => v.isPath).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Unit-Based (Medical)">
              {Object.entries(PROCEDURE_CODES).filter(([_, v]) => v.isUnitBased).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {procedures.length === 0 ? (
          <p className="text-sm text-ngd-taupe text-center py-4">No procedures added yet</p>
        ) : (
          <div className="space-y-2">
            {procedures.map((proc, idx) => {
              const codeData = PROCEDURE_CODES[proc.code];
              const price = codeData?.prices[insurerKey] || codeData?.prices['OTHER'] || codeData?.prices['PTPAY'] || 0;
              const isMax = proc.code === calculations.maxPvSurgCode;
              const isSequential = codeData?.isSequential || SEQUENTIAL_CODES.includes(proc.code);
              const isUnitBased = codeData?.isUnitBased;

              return (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${isMax ? 'bg-blue-50 border border-blue-200' : 'bg-ngd-light'}`}>
                  <div className="flex-1">
                    <span className="font-mono text-sm font-medium text-ngd-dark">{proc.code}</span>
                    <span className="text-sm text-ngd-gray ml-2">{codeData?.desc}</span>
                    {isSequential && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded">Add-on</span>
                    )}
                    {codeData?.isPath && (
                      <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">Path</span>
                    )}
                    {codeData?.isOfficeCall && (
                      <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">OC</span>
                    )}
                    {isUnitBased && (
                      <span className="ml-2 text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded">Per Unit</span>
                    )}
                    {isMax && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">Max (100%)</span>
                    )}
                  </div>
                  {(isSequential || isUnitBased) && (
                    <input
                      type="number"
                      min="1"
                      placeholder={isUnitBased ? "Units" : "Qty"}
                      value={proc.qty}
                      onChange={(e) => {
                        const newProcs = [...procedures];
                        newProcs[idx].qty = parseInt(e.target.value) || 1;
                        setProcedures(newProcs);
                      }}
                      className="w-20 px-2 py-1 text-sm border border-ngd-taupe/50 rounded"
                    />
                  )}
                  <span className="text-sm font-medium text-ngd-gray w-20 text-right">
                    {formatCurrencyAlways(price * (proc.qty || 1))}
                  </span>
                  <button
                    onClick={() => setProcedures(procedures.filter((_, i) => i !== idx))}
                    className="p-1 text-ngd-taupe hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <CalculationBreakdown />
      </Section>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <Section title="Adjustments & Credits" icon="💳">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Balance Owed"
            value={adjustments.balance}
            onChange={(v) => setAdjustments(a => ({ ...a, balance: v }))}
            prefix="$"
          />
          <Input
            label="Credit"
            value={adjustments.credit}
            onChange={(v) => setAdjustments(a => ({ ...a, credit: v }))}
            prefix="$"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Aspire (AS) - Today"
            value={adjustments.aspireToday}
            onChange={(v) => setAdjustments(a => ({ ...a, aspireToday: v }))}
            prefix="$"
          />
          <Input
            label="Aspire (AS) - to CB"
            value={adjustments.aspireToCB}
            onChange={(v) => setAdjustments(a => ({ ...a, aspireToCB: v }))}
            prefix="$"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Brilliant Distinctions (BD) - Today"
            value={adjustments.bdToday}
            onChange={(v) => setAdjustments(a => ({ ...a, bdToday: v }))}
            prefix="$"
          />
          <Input
            label="BD - to CB"
            value={adjustments.bdToCB}
            onChange={(v) => setAdjustments(a => ({ ...a, bdToCB: v }))}
            prefix="$"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Coupon/Rebate"
            value={adjustments.coupon}
            onChange={(v) => setAdjustments(a => ({ ...a, coupon: v }))}
            prefix="$"
          />
          <Input
            label="Old Cosmetic Balance"
            value={adjustments.oldCosmeticBalance}
            onChange={(v) => setAdjustments(a => ({ ...a, oldCosmeticBalance: v }))}
            prefix="$"
          />
        </div>
      </Section>

      <Section title="Payment Summary" icon="📋">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between py-2 border-b border-ngd-taupe/20">
            <span className="text-ngd-gray">Cosmetics</span>
            <span className="font-medium">{formatCurrencyAlways(calculations.cosmeticTotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-ngd-taupe/20">
            <span className="text-ngd-gray">Products</span>
            <span className="font-medium">{formatCurrencyAlways(calculations.productTotal)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-ngd-taupe/20">
            <span className="text-ngd-gray">Medical</span>
            <span className="font-medium">{formatCurrencyAlways(calculations.medicalDue)}</span>
          </div>
          {calculations.balance > 0 && (
            <div className="flex justify-between py-2 border-b border-ngd-taupe/20">
              <span className="text-ngd-gray">Balance</span>
              <span className="font-medium text-red-600">+{formatCurrencyAlways(calculations.balance)}</span>
            </div>
          )}
          {calculations.credit > 0 && (
            <div className="flex justify-between py-2 border-b border-ngd-taupe/20">
              <span className="text-ngd-gray">Credit</span>
              <span className="font-medium text-green-600">−{formatCurrencyAlways(calculations.credit)}</span>
            </div>
          )}
          {calculations.totalAdjustments > 0 && (
            <div className="flex justify-between py-2 border-b border-ngd-taupe/20">
              <span className="text-ngd-gray">Discounts (AS/BD/Coupon)</span>
              <span className="font-medium text-green-600">−{formatCurrencyAlways(calculations.totalAdjustments)}</span>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-ngd-brown to-ngd-taupe text-white p-4 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-white/80 uppercase text-sm tracking-wide">Total Due Today</span>
            <span className="text-3xl font-bold">{formatCurrencyAlways(calculations.totalDue)}</span>
          </div>
        </div>

        {calculations.deductible > 0 && calculations.remainingDeductible > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-amber-800">⚠️ Update Remaining Deductible in System:</span>
              <span className="text-lg font-bold text-amber-700">{formatCurrencyAlways(calculations.remainingDeductible)}</span>
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="block text-xs font-medium text-ngd-gray mb-2">Payment Method</label>
          <div className="flex gap-2">
            {[
              { id: 'card', label: '💳 Card', color: 'blue' },
              { id: 'cash', label: '💵 Cash', color: 'green' },
              { id: 'check', label: '📝 Check', color: 'purple' },
            ].map(method => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all
                  ${paymentMethod === method.id
                    ? `text-white shadow-sm`
                    : 'bg-ngd-light text-ngd-gray hover:bg-ngd-taupe/30'}`}
                style={paymentMethod === method.id ? {
                  backgroundColor: method.id === 'card' ? '#3b82f6' : method.id === 'cash' ? '#22c55e' : '#a855f7'
                } : {}}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setCheckout({ completed: true, amountPaid: calculations.totalDue })}
          className="w-full mt-5 py-4 bg-gradient-to-r from-ngd-brown to-ngd-taupe text-white font-semibold rounded-xl
            hover:from-ngd-dark hover:to-ngd-brown transition-all shadow-lg shadow-ngd-taupe/30"
        >
          Complete Checkout →
        </button>
      </Section>
    </div>
  );

  const renderComplete = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gradient-to-br from-ngd-taupe to-ngd-brown rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
        <span className="text-4xl text-white">✓</span>
      </div>
      <h2 className="text-2xl font-bold text-ngd-dark mb-2">Checkout Complete!</h2>
      <p className="text-ngd-gray mb-6">Patient #{patientInfo.accountNumber || '—'} • {formatCurrencyAlways(checkout.amountPaid)} paid via {paymentMethod}</p>

      {calculations.deductible > 0 && calculations.remainingDeductible > 0 && (
        <div className="bg-amber-100 border-2 border-amber-400 rounded-xl p-4 max-w-md mx-auto mb-6">
          <div className="text-amber-800 font-bold">⚠️ ACTION REQUIRED</div>
          <div className="text-amber-700">Update remaining deductible in system:</div>
          <div className="text-2xl font-bold text-amber-800">{formatCurrencyAlways(calculations.remainingDeductible)}</div>
        </div>
      )}

      <div className="bg-ngd-light border border-ngd-taupe/30 rounded-xl p-5 max-w-md mx-auto mb-8">
        <h3 className="font-semibold text-ngd-dark mb-3">Post-Checkout Reminders</h3>
        <ul className="text-sm text-ngd-gray space-y-2 text-left">
          <li className="flex items-start gap-2">
            <span>📋</span>
            <span>Photocopy white router → back in chart</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🧾</span>
            <span>Staple receipt to blue photocopied router</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📧</span>
            <span>Verify email added in eThomas</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📝</span>
            <span>Post charges in Genius</span>
          </li>
        </ul>
      </div>

      <button
        onClick={() => {
          setStep(1);
          setCheckout({ completed: false, amountPaid: '' });
          setPatientInfo({
            accountNumber: '',
            doctor: 'FN',
            recallsAddressed: false,
            knFnCosmeticChecked: false,
            knFnMedicalChecked: false,
            hsaBillFirst: false,
            mipsChecked: false,
            emailUpdated: false,
          });
          setInsurance({
            insurer: '',
            deductible: '',
            officeCallCopay: '',
            pvSurgCopay: '',
            coinsurance: '',
            pathCoinsurance: '',
            pathCopay: '',
          });
          setCosmetics({});
          setProducts([{ name: '', price: '' }]);
          setProcedures([]);
          setAdjustments({
            balance: '',
            credit: '',
            aspireToday: '',
            aspireToCB: '',
            bdToday: '',
            bdToCB: '',
            coupon: '',
            oldCosmeticBalance: '',
          });
        }}
        className="px-8 py-3 bg-ngd-dark text-white rounded-xl hover:bg-ngd-brown transition-all font-medium"
      >
        Start New Checkout
      </button>
    </div>
  );

  const steps = [
    { num: 1, label: 'Patient & Insurance' },
    { num: 2, label: 'Cosmetics & Products' },
    { num: 3, label: 'Medical' },
    { num: 4, label: 'Payment' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ngd-light via-ngd-cream to-ngd-light">
      {/* Checkout Header */}
      <div className="bg-white border-b border-ngd-taupe/30 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-ngd-dark">Patient Checkout</h1>
              <p className="text-sm text-ngd-gray">Novice Group Dermatology</p>
            </div>
            {!checkout.completed && (
              <div className="text-right">
                <p className="text-xs text-ngd-taupe uppercase tracking-wide">Total Due</p>
                <p className={`text-lg font-bold ${calculations.hsaStopped ? 'text-amber-600' : 'text-ngd-brown'}`}>
                  {calculations.hsaStopped ? '$0 (HSA)' : formatCurrencyAlways(calculations.totalDue)}
                </p>
              </div>
            )}
          </div>

          {/* Step indicator */}
          {!checkout.completed && (
            <div className="flex gap-1">
              {steps.map((s) => (
                <button
                  key={s.num}
                  onClick={() => setStep(s.num)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                    ${step === s.num
                      ? 'bg-ngd-brown text-white'
                      : 'bg-ngd-light text-ngd-gray hover:bg-ngd-taupe/30'}`}
                >
                  <span className="hidden sm:inline">{s.num}. {s.label}</span>
                  <span className="sm:hidden">{s.num}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {checkout.completed ? renderComplete() : (
          <>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-3 bg-white border border-ngd-taupe/50 text-ngd-gray font-medium rounded-xl hover:bg-ngd-light transition-all"
                >
                  ← Back
                </button>
              )}
              {step < 4 && (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 py-3 bg-ngd-brown text-white font-medium rounded-xl hover:bg-ngd-dark transition-all"
                >
                  Continue →
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
