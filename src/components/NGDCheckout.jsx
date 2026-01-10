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
const SEQUENTIAL_CODES = ['17003', '11103', '11105', '11107', '11201', '12020', '13121', '13122', '13131', '13132', '13133', '13152', '13153'];

const PROCEDURE_CODES = {
  // Office Calls - New Patient
  '99202': { desc: 'New patient - minor', prices: { AETNA: 76.77, BC: 82.88, BCN: 82.88, CIGNA: 76.02, HAP: 76.02, UHC: 76.87, PTPAY: 119, OTHER: 82.88 }, isOfficeCall: true },
  '99203': { desc: 'New patient - moderate', prices: { AETNA: 119.71, BC: 117.35, BCN: 117.35, CIGNA: 111.32, HAP: 111.32, UHC: 111.78, PTPAY: 140, OTHER: 117.35 }, isOfficeCall: true },
  '99204': { desc: 'New patient - complex', prices: { AETNA: 178.19, BC: 179.33, BCN: 179.33, CIGNA: 170.46, HAP: 170.46, UHC: 169.62, PTPAY: 200, OTHER: 179.33 }, isOfficeCall: true },
  '99205': { desc: 'New patient - high complexity', prices: { AETNA: 221.76, BC: 232.26, BCN: 232.26, CIGNA: 220.94, HAP: 220.94, UHC: 219.82, PTPAY: 250, OTHER: 232.26 }, isOfficeCall: true },

  // Office Calls - Established Patient
  '99211': { desc: 'Established - minimal', prices: { AETNA: 23.69, BC: 24.78, BCN: 24.78, CIGNA: 23.57, HAP: 23.57, UHC: 23.44, PTPAY: 45, OTHER: 24.78 }, isOfficeCall: true },
  '99212': { desc: 'Established - brief', prices: { AETNA: 59.88, BC: 54.61, BCN: 54.61, CIGNA: 44.59, HAP: 44.59, UHC: 44.67, PTPAY: 75, OTHER: 54.61 }, isOfficeCall: true },
  '99213': { desc: 'Established - standard', prices: { AETNA: 96.16, BC: 85.82, BCN: 85.82, CIGNA: 73.93, HAP: 73.93, UHC: 74.92, PTPAY: 95, OTHER: 85.82 }, isOfficeCall: true },
  '99214': { desc: 'Established - complex', prices: { AETNA: 136.24, BC: 124.45, BCN: 124.45, CIGNA: 109.19, HAP: 109.19, UHC: 110.16, PTPAY: 150, OTHER: 124.45 }, isOfficeCall: true },
  '99215': { desc: 'Established - high complexity', prices: { AETNA: 182.04, BC: 190.44, BCN: 190.44, CIGNA: 181.12, HAP: 181.12, UHC: 180.20, PTPAY: 200, OTHER: 190.44 }, isOfficeCall: true },

  // Office Calls - 90 series (Medicare)
  '90212': { desc: 'Est patient 90 - brief', prices: { AETNA: 59.88, BC: 54.61, BCN: 54.61, CIGNA: 44.59, HAP: 44.59, UHC: 44.67, PTPAY: 75, OTHER: 54.61 }, isOfficeCall: true },
  '90213': { desc: 'Est patient 90 - standard', prices: { AETNA: 96.16, BC: 85.82, BCN: 85.82, CIGNA: 73.93, HAP: 73.93, UHC: 74.92, PTPAY: 95, OTHER: 85.82 }, isOfficeCall: true },
  '90214': { desc: 'Est patient 90 - complex', prices: { AETNA: 136.24, BC: 124.45, BCN: 124.45, CIGNA: 109.19, HAP: 109.19, UHC: 110.16, PTPAY: 150, OTHER: 124.45 }, isOfficeCall: true },

  // Office Calls - 91 series
  '91212': { desc: 'Est patient 91 - brief', prices: { AETNA: 59.88, BC: 54.61, BCN: 54.61, CIGNA: 44.59, HAP: 44.59, UHC: 44.67, PTPAY: 75, OTHER: 54.61 }, isOfficeCall: true },
  '91213': { desc: 'Est patient 91 - standard', prices: { AETNA: 96.16, BC: 85.82, BCN: 85.82, CIGNA: 73.93, HAP: 73.93, UHC: 74.92, PTPAY: 95, OTHER: 85.82 }, isOfficeCall: true },
  '91214': { desc: 'Est patient 91 - complex', prices: { AETNA: 136.24, BC: 124.45, BCN: 124.45, CIGNA: 109.19, HAP: 109.19, UHC: 110.16, PTPAY: 150, OTHER: 124.45 }, isOfficeCall: true },

  // Biopsies
  '11102': { desc: 'Tangential biopsy (single)', prices: { AETNA: 119.31, BC: 124.32, BCN: 124.32, CIGNA: 98.36, HAP: 98.36, UHC: 112.28, PTPAY: 150, OTHER: 124.32 }},
  '11103': { desc: 'Tangential biopsy (each addl)', prices: { AETNA: 60.46, BC: 62.16, BCN: 62.16, CIGNA: 53.03, HAP: 53.03, UHC: 60.83, PTPAY: 75, OTHER: 62.16 }, isSequential: true },
  '11104': { desc: 'Punch biopsy (single)', prices: { AETNA: 150.43, BC: 154.98, BCN: 154.98, CIGNA: 123.43, HAP: 123.43, UHC: 141.64, PTPAY: 175, OTHER: 154.98 }},
  '11105': { desc: 'Punch biopsy (each addl)', prices: { AETNA: 71.37, BC: 73.74, BCN: 73.74, CIGNA: 60.83, HAP: 60.83, UHC: 69.75, PTPAY: 85, OTHER: 73.74 }, isSequential: true },
  '11106': { desc: 'Incisional biopsy (single)', prices: { AETNA: 186.72, BC: 192.78, BCN: 192.78, CIGNA: 149.55, HAP: 149.55, UHC: 171.56, PTPAY: 210, OTHER: 192.78 }},
  '11107': { desc: 'Incisional biopsy (each addl)', prices: { AETNA: 86.17, BC: 88.20, BCN: 88.20, CIGNA: 71.71, HAP: 71.71, UHC: 82.23, PTPAY: 95, OTHER: 88.20 }, isSequential: true },

  // Skin Tags
  '11200': { desc: 'Skin tags 1-15', prices: { AETNA: 110.40, BC: 117.18, BCN: 117.18, CIGNA: 85.57, HAP: 85.57, UHC: 101.72, PTPAY: 105, OTHER: 117.18 }},
  '11201': { desc: 'Skin tags each addl 10', prices: { AETNA: 22.77, BC: 23.10, BCN: 23.10, CIGNA: 19.01, HAP: 19.01, UHC: 22.26, PTPAY: 79, OTHER: 23.10 }, isSequential: true },

  // Benign Shave - Trunk/Arms/Legs
  '11300': { desc: 'Shave trunk/arm/leg ≤0.5cm', prices: { AETNA: 60.46, BC: 62.16, BCN: 62.16, CIGNA: 53.03, HAP: 53.03, UHC: 60.83, PTPAY: 115, OTHER: 62.16 }},
  '11301': { desc: 'Shave trunk/arm/leg 0.6-1cm', prices: { AETNA: 77.37, BC: 80.83, BCN: 80.83, CIGNA: 60.83, HAP: 60.83, UHC: 81.13, PTPAY: 158, OTHER: 80.83 }},
  '11302': { desc: 'Shave trunk/arm/leg 1.1-2cm', prices: { AETNA: 91.71, BC: 96.06, BCN: 96.06, CIGNA: 70.40, HAP: 70.40, UHC: 95.28, PTPAY: 168, OTHER: 96.06 }},
  '11303': { desc: 'Shave trunk/arm/leg >2cm', prices: { AETNA: 119.31, BC: 124.32, BCN: 124.32, CIGNA: 92.44, HAP: 92.44, UHC: 120.64, PTPAY: 195, OTHER: 124.32 }},

  // Benign Shave - Scalp/Neck/Hands/Feet/Genitalia
  '11305': { desc: 'Shave scalp/neck/hands/ft ≤0.5cm', prices: { AETNA: 68.02, BC: 68.04, BCN: 68.04, CIGNA: 56.05, HAP: 56.05, UHC: 68.95, PTPAY: 125, OTHER: 68.04 }},
  '11306': { desc: 'Shave scalp/neck/hands/ft 0.6-1cm', prices: { AETNA: 84.07, BC: 88.08, BCN: 88.08, CIGNA: 63.85, HAP: 63.85, UHC: 88.19, PTPAY: 160, OTHER: 88.08 }},
  '11307': { desc: 'Shave scalp/neck/hands/ft 1.1-2cm', prices: { AETNA: 100.51, BC: 105.18, BCN: 105.18, CIGNA: 77.18, HAP: 77.18, UHC: 105.00, PTPAY: 180, OTHER: 105.18 }},
  '11308': { desc: 'Shave scalp/neck/hands/ft >2cm', prices: { AETNA: 137.23, BC: 143.22, BCN: 143.22, CIGNA: 106.47, HAP: 106.47, UHC: 142.87, PTPAY: 215, OTHER: 143.22 }},

  // Benign Shave - Face/Ears/Eyelids/Nose/Lips/Mucous membrane
  '11310': { desc: 'Shave face/ear/nose ≤0.5cm', prices: { AETNA: 68.02, BC: 68.04, BCN: 68.04, CIGNA: 65.05, HAP: 65.05, UHC: 106.26, PTPAY: 155, OTHER: 68.04 }},
  '11311': { desc: 'Shave face/ear/nose 0.6-1cm', prices: { AETNA: 94.54, BC: 98.94, BCN: 98.94, CIGNA: 71.04, HAP: 71.04, UHC: 116.48, PTPAY: 170, OTHER: 98.94 }},
  '11312': { desc: 'Shave face/ear/nose 1.1-2cm', prices: { AETNA: 116.49, BC: 121.86, BCN: 121.86, CIGNA: 85.05, HAP: 85.05, UHC: 133.65, PTPAY: 195, OTHER: 121.86 }},
  '11313': { desc: 'Shave face/ear/nose >2cm', prices: { AETNA: 154.02, BC: 160.98, BCN: 160.98, CIGNA: 117.93, HAP: 117.93, UHC: 170.96, PTPAY: 235, OTHER: 160.98 }},

  // Benign Excision - Trunk/Arms/Legs
  '11400': { desc: 'Exc benign trunk/arm/leg ≤0.5cm', prices: { AETNA: 146.33, BC: 150.78, BCN: 150.78, CIGNA: 115.15, HAP: 115.15, UHC: 163.62, PTPAY: 165, OTHER: 150.78 }},
  '11401': { desc: 'Exc benign trunk/arm/leg 0.6-1cm', prices: { AETNA: 183.00, BC: 189.84, BCN: 189.84, CIGNA: 140.09, HAP: 140.09, UHC: 195.99, PTPAY: 195, OTHER: 189.84 }},
  '11402': { desc: 'Exc benign trunk/arm/leg 1.1-2cm', prices: { AETNA: 205.84, BC: 214.02, BCN: 214.02, CIGNA: 161.02, HAP: 161.02, UHC: 227.22, PTPAY: 215, OTHER: 214.02 }},
  '11403': { desc: 'Exc benign trunk/arm/leg 2.1-3cm', prices: { AETNA: 240.03, BC: 249.48, BCN: 249.48, CIGNA: 186.46, HAP: 186.46, UHC: 270.02, PTPAY: 245, OTHER: 249.48 }},
  '11404': { desc: 'Exc benign trunk/arm/leg 3.1-4cm', prices: { AETNA: 287.37, BC: 298.56, BCN: 298.56, CIGNA: 226.75, HAP: 226.75, UHC: 326.87, PTPAY: 295, OTHER: 298.56 }},
  '11406': { desc: 'Exc benign trunk/arm/leg >4cm', prices: { AETNA: 381.47, BC: 396.36, BCN: 396.36, CIGNA: 307.60, HAP: 307.60, UHC: 440.24, PTPAY: 375, OTHER: 396.36 }},

  // Benign Excision - Scalp/Neck/Hands/Feet/Genitalia
  '11420': { desc: 'Exc benign scalp/neck/hf ≤0.5cm', prices: { AETNA: 154.02, BC: 160.98, BCN: 160.98, CIGNA: 123.91, HAP: 123.91, UHC: 175.02, PTPAY: 175, OTHER: 160.98 }},
  '11421': { desc: 'Exc benign scalp/neck/hf 0.6-1cm', prices: { AETNA: 194.96, BC: 202.50, BCN: 202.50, CIGNA: 150.21, HAP: 150.21, UHC: 217.72, PTPAY: 210, OTHER: 202.50 }},
  '11422': { desc: 'Exc benign scalp/neck/hf 1.1-2cm', prices: { AETNA: 218.27, BC: 228.42, BCN: 228.42, CIGNA: 173.13, HAP: 173.13, UHC: 248.09, PTPAY: 230, OTHER: 228.42 }},
  '11423': { desc: 'Exc benign scalp/neck/hf 2.1-3cm', prices: { AETNA: 262.91, BC: 274.14, BCN: 274.14, CIGNA: 206.02, HAP: 206.02, UHC: 301.23, PTPAY: 270, OTHER: 274.14 }},
  '11424': { desc: 'Exc benign scalp/neck/hf 3.1-4cm', prices: { AETNA: 311.93, BC: 324.78, BCN: 324.78, CIGNA: 246.49, HAP: 246.49, UHC: 365.05, PTPAY: 315, OTHER: 324.78 }},
  '11426': { desc: 'Exc benign scalp/neck/hf >4cm', prices: { AETNA: 421.96, BC: 439.26, BCN: 439.26, CIGNA: 341.56, HAP: 341.56, UHC: 501.94, PTPAY: 420, OTHER: 439.26 }},

  // Benign Excision - Face/Ears/Eyelids/Nose/Lips
  '11440': { desc: 'Exc benign face/ear/nose ≤0.5cm', prices: { AETNA: 148.27, BC: 151.62, BCN: 151.62, CIGNA: 116.49, HAP: 116.49, UHC: 180.06, PTPAY: 180, OTHER: 151.62 }},
  '11441': { desc: 'Exc benign face/ear/nose 0.6-1cm', prices: { AETNA: 177.93, BC: 185.64, BCN: 185.64, CIGNA: 140.09, HAP: 140.09, UHC: 222.93, PTPAY: 220, OTHER: 185.64 }},
  '11442': { desc: 'Exc benign face/ear/nose 1.1-2cm', prices: { AETNA: 219.73, BC: 228.90, BCN: 228.90, CIGNA: 175.00, HAP: 175.00, UHC: 265.71, PTPAY: 255, OTHER: 228.90 }},
  '11443': { desc: 'Exc benign face/ear/nose 2.1-3cm', prices: { AETNA: 276.40, BC: 287.70, BCN: 287.70, CIGNA: 214.30, HAP: 214.30, UHC: 314.35, PTPAY: 305, OTHER: 287.70 }},
  '11444': { desc: 'Exc benign face/ear/nose 3.1-4cm', prices: { AETNA: 362.24, BC: 377.10, BCN: 377.10, CIGNA: 290.55, HAP: 290.55, UHC: 406.06, PTPAY: 380, OTHER: 377.10 }},
  '11446': { desc: 'Exc benign face/ear/nose >4cm', prices: { AETNA: 479.00, BC: 498.42, BCN: 498.42, CIGNA: 393.00, HAP: 393.00, UHC: 524.38, PTPAY: 485, OTHER: 498.42 }},

  // Malignant Excision - Trunk/Arms/Legs
  '11600': { desc: 'Exc malig trunk/arm/leg ≤0.5cm', prices: { AETNA: 218.76, BC: 226.32, BCN: 226.32, CIGNA: 170.34, HAP: 170.34, UHC: 250.74, PTPAY: 250, OTHER: 226.32 }},
  '11601': { desc: 'Exc malig trunk/arm/leg 0.6-1cm', prices: { AETNA: 270.85, BC: 282.12, BCN: 282.12, CIGNA: 205.36, HAP: 205.36, UHC: 308.06, PTPAY: 290, OTHER: 282.12 }},
  '11602': { desc: 'Exc malig trunk/arm/leg 1.1-2cm', prices: { AETNA: 307.55, BC: 320.22, BCN: 320.22, CIGNA: 232.96, HAP: 232.96, UHC: 351.29, PTPAY: 310, OTHER: 320.22 }},
  '11603': { desc: 'Exc malig trunk/arm/leg 2.1-3cm', prices: { AETNA: 359.64, BC: 374.28, BCN: 374.28, CIGNA: 272.30, HAP: 272.30, UHC: 412.94, PTPAY: 350, OTHER: 374.28 }},
  '11604': { desc: 'Exc malig trunk/arm/leg 3.1-4cm', prices: { AETNA: 422.92, BC: 440.28, BCN: 440.28, CIGNA: 323.84, HAP: 323.84, UHC: 490.45, PTPAY: 405, OTHER: 440.28 }},
  '11606': { desc: 'Exc malig trunk/arm/leg >4cm', prices: { AETNA: 528.40, BC: 550.02, BCN: 550.02, CIGNA: 412.58, HAP: 412.58, UHC: 623.95, PTPAY: 495, OTHER: 550.02 }},

  // Malignant Excision - Scalp/Neck/Hands/Feet/Genitalia
  '11620': { desc: 'Exc malig scalp/neck/hf ≤0.5cm', prices: { AETNA: 227.17, BC: 236.58, BCN: 236.58, CIGNA: 178.98, HAP: 178.98, UHC: 265.77, PTPAY: 262, OTHER: 236.58 }},
  '11621': { desc: 'Exc malig scalp/neck/hf 0.6-1cm', prices: { AETNA: 286.90, BC: 298.80, BCN: 298.80, CIGNA: 219.49, HAP: 219.49, UHC: 332.26, PTPAY: 307, OTHER: 298.80 }},
  '11622': { desc: 'Exc malig scalp/neck/hf 1.1-2cm', prices: { AETNA: 328.64, BC: 342.30, BCN: 342.30, CIGNA: 253.79, HAP: 253.79, UHC: 386.87, PTPAY: 335, OTHER: 342.30 }},
  '11623': { desc: 'Exc malig scalp/neck/hf 2.1-3cm', prices: { AETNA: 387.48, BC: 403.38, BCN: 403.38, CIGNA: 302.04, HAP: 302.04, UHC: 459.65, PTPAY: 380, OTHER: 403.38 }},
  '11624': { desc: 'Exc malig scalp/neck/hf 3.1-4cm', prices: { AETNA: 470.31, BC: 489.66, BCN: 489.66, CIGNA: 371.39, HAP: 371.39, UHC: 561.04, PTPAY: 450, OTHER: 489.66 }},
  '11626': { desc: 'Exc malig scalp/neck/hf >4cm', prices: { AETNA: 598.13, BC: 622.74, BCN: 622.74, CIGNA: 479.63, HAP: 479.63, UHC: 721.30, PTPAY: 561, OTHER: 622.74 }},

  // Malignant Excision - Face/Ears/Eyelids/Nose/Lips
  '11640': { desc: 'Exc malig face/ear/nose ≤0.5cm', prices: { AETNA: 219.73, BC: 228.90, BCN: 228.90, CIGNA: 175.67, HAP: 175.67, UHC: 265.71, PTPAY: 257, OTHER: 228.90 }},
  '11641': { desc: 'Exc malig face/ear/nose 0.6-1cm', prices: { AETNA: 279.09, BC: 290.46, BCN: 290.46, CIGNA: 216.78, HAP: 216.78, UHC: 333.49, PTPAY: 300, OTHER: 290.46 }},
  '11642': { desc: 'Exc malig face/ear/nose 1.1-2cm', prices: { AETNA: 337.44, BC: 351.30, BCN: 351.30, CIGNA: 266.22, HAP: 266.22, UHC: 406.06, PTPAY: 351, OTHER: 351.30 }},
  '11643': { desc: 'Exc malig face/ear/nose 2.1-3cm', prices: { AETNA: 406.15, BC: 422.94, BCN: 422.94, CIGNA: 321.98, HAP: 321.98, UHC: 493.45, PTPAY: 424, OTHER: 422.94 }},
  '11644': { desc: 'Exc malig face/ear/nose 3.1-4cm', prices: { AETNA: 509.28, BC: 530.28, BCN: 530.28, CIGNA: 409.19, HAP: 409.19, UHC: 619.54, PTPAY: 524, OTHER: 530.28 }},
  '11646': { desc: 'Exc malig face/ear/nose >4cm', prices: { AETNA: 648.68, BC: 675.48, BCN: 675.48, CIGNA: 528.44, HAP: 528.44, UHC: 797.22, PTPAY: 651, OTHER: 675.48 }},

  // Destruction/LN2 - Premalignant
  '17000': { desc: 'Destruct premal 1st lesion', prices: { AETNA: 50.76, BC: 50.02, BCN: 50.02, CIGNA: 42.85, HAP: 42.85, UHC: 56.05, PTPAY: 98, OTHER: 50.02 }},
  '17003': { desc: 'Destruct premal 2-14 each', prices: { AETNA: 2.38, BC: 2.97, BCN: 2.97, CIGNA: 7.04, HAP: 7.04, UHC: 0.93, PTPAY: 22, OTHER: 2.97 }, isSequential: true },
  '17004': { desc: 'Destruct premal 15+ lesions', prices: { AETNA: 139.91, BC: 146.16, BCN: 146.16, CIGNA: 102.71, HAP: 102.71, UHC: 118.13, PTPAY: 288, OTHER: 146.16 }},

  // Destruction - Benign
  '17110': { desc: 'Destruct benign 1-14 lesions', prices: { AETNA: 64.45, BC: 66.06, BCN: 66.06, CIGNA: 50.70, HAP: 50.70, UHC: 70.97, PTPAY: 134, OTHER: 66.06 }},
  '17111': { desc: 'Destruct benign 15+ lesions', prices: { AETNA: 105.23, BC: 109.14, BCN: 109.14, CIGNA: 79.42, HAP: 79.42, UHC: 113.96, PTPAY: 156, OTHER: 109.14 }},

  // Destruction - Malignant (ED&C) Trunk/Arms/Legs
  '17260': { desc: 'Destruct malig trunk/arm/leg ≤0.5cm', prices: { AETNA: 128.76, BC: 134.70, BCN: 134.70, CIGNA: 100.35, HAP: 100.35, UHC: 150.17, PTPAY: 137, OTHER: 134.70 }},
  '17261': { desc: 'Destruct malig trunk/arm/leg 0.6-1cm', prices: { AETNA: 168.26, BC: 175.80, BCN: 175.80, CIGNA: 131.62, HAP: 131.62, UHC: 192.98, PTPAY: 200, OTHER: 175.80 }},
  '17262': { desc: 'Destruct malig trunk/arm/leg 1.1-2cm', prices: { AETNA: 196.13, BC: 204.90, BCN: 204.90, CIGNA: 154.30, HAP: 154.30, UHC: 227.88, PTPAY: 210, OTHER: 204.90 }},
  '17263': { desc: 'Destruct malig trunk/arm/leg 2.1-3cm', prices: { AETNA: 231.50, BC: 241.92, BCN: 241.92, CIGNA: 183.00, HAP: 183.00, UHC: 272.27, PTPAY: 230, OTHER: 241.92 }},
  '17264': { desc: 'Destruct malig trunk/arm/leg 3.1-4cm', prices: { AETNA: 281.45, BC: 294.06, BCN: 294.06, CIGNA: 223.00, HAP: 223.00, UHC: 334.72, PTPAY: 260, OTHER: 294.06 }},
  '17266': { desc: 'Destruct malig trunk/arm/leg >4cm', prices: { AETNA: 360.08, BC: 376.20, BCN: 376.20, CIGNA: 290.35, HAP: 290.35, UHC: 432.99, PTPAY: 315, OTHER: 376.20 }},

  // Destruction - Malignant (ED&C) Scalp/Neck/Hands/Feet/Genitalia
  '17270': { desc: 'Destruct malig scalp/neck/hf ≤0.5cm', prices: { AETNA: 138.53, BC: 144.78, BCN: 144.78, CIGNA: 108.39, HAP: 108.39, UHC: 162.44, PTPAY: 145, OTHER: 144.78 }},
  '17271': { desc: 'Destruct malig scalp/neck/hf 0.6-1cm', prices: { AETNA: 170.62, BC: 178.32, BCN: 178.32, CIGNA: 133.77, HAP: 133.77, UHC: 196.91, PTPAY: 195, OTHER: 178.32 }},
  '17272': { desc: 'Destruct malig scalp/neck/hf 1.1-2cm', prices: { AETNA: 204.09, BC: 213.24, BCN: 213.24, CIGNA: 160.43, HAP: 160.43, UHC: 237.68, PTPAY: 215, OTHER: 213.24 }},
  '17273': { desc: 'Destruct malig scalp/neck/hf 2.1-3cm', prices: { AETNA: 244.16, BC: 255.12, BCN: 255.12, CIGNA: 193.02, HAP: 193.02, UHC: 287.62, PTPAY: 245, OTHER: 255.12 }},
  '17274': { desc: 'Destruct malig scalp/neck/hf 3.1-4cm', prices: { AETNA: 299.32, BC: 312.78, BCN: 312.78, CIGNA: 237.95, HAP: 237.95, UHC: 357.22, PTPAY: 280, OTHER: 312.78 }},
  '17276': { desc: 'Destruct malig scalp/neck/hf >4cm', prices: { AETNA: 385.75, BC: 403.14, BCN: 403.14, CIGNA: 311.60, HAP: 311.60, UHC: 466.73, PTPAY: 340, OTHER: 403.14 }},

  // Destruction - Malignant (ED&C) Face/Ears/Eyelids/Nose/Lips
  '17280': { desc: 'Destruct malig face/ear/nose ≤0.5cm', prices: { AETNA: 153.06, BC: 159.96, BCN: 159.96, CIGNA: 120.48, HAP: 120.48, UHC: 180.88, PTPAY: 155, OTHER: 159.96 }},
  '17281': { desc: 'Destruct malig face/ear/nose 0.6-1cm', prices: { AETNA: 177.93, BC: 185.88, BCN: 185.88, CIGNA: 140.55, HAP: 140.55, UHC: 209.54, PTPAY: 200, OTHER: 185.88 }},
  '17282': { desc: 'Destruct malig face/ear/nose 1.1-2cm', prices: { AETNA: 217.31, BC: 227.10, BCN: 227.10, CIGNA: 171.78, HAP: 171.78, UHC: 258.50, PTPAY: 225, OTHER: 227.10 }},
  '17283': { desc: 'Destruct malig face/ear/nose 2.1-3cm', prices: { AETNA: 262.91, BC: 274.68, BCN: 274.68, CIGNA: 208.58, HAP: 208.58, UHC: 315.82, PTPAY: 255, OTHER: 274.68 }},
  '17284': { desc: 'Destruct malig face/ear/nose 3.1-4cm', prices: { AETNA: 326.25, BC: 340.86, BCN: 340.86, CIGNA: 260.78, HAP: 260.78, UHC: 396.08, PTPAY: 300, OTHER: 340.86 }},
  '17286': { desc: 'Destruct malig face/ear/nose >4cm', prices: { AETNA: 423.89, BC: 442.86, BCN: 442.86, CIGNA: 345.48, HAP: 345.48, UHC: 521.42, PTPAY: 370, OTHER: 442.86 }},

  // Simple Repairs - Trunk/Extremities
  '12001': { desc: 'Repair trunk/extrem ≤2.5cm', prices: { AETNA: 156.50, BC: 163.68, BCN: 163.68, CIGNA: 128.67, HAP: 128.67, UHC: 147.29, PTPAY: 165, OTHER: 163.68 }},
  '12002': { desc: 'Repair trunk/extrem 2.6-7.5cm', prices: { AETNA: 177.60, BC: 185.76, BCN: 185.76, CIGNA: 150.06, HAP: 150.06, UHC: 170.36, PTPAY: 190, OTHER: 185.76 }},
  '12004': { desc: 'Repair trunk/extrem 7.6-12.5cm', prices: { AETNA: 203.09, BC: 212.46, BCN: 212.46, CIGNA: 177.24, HAP: 177.24, UHC: 199.52, PTPAY: 215, OTHER: 212.46 }},
  '12005': { desc: 'Repair trunk/extrem 12.6-20cm', prices: { AETNA: 246.72, BC: 258.06, BCN: 258.06, CIGNA: 221.54, HAP: 221.54, UHC: 247.35, PTPAY: 260, OTHER: 258.06 }},
  '12006': { desc: 'Repair trunk/extrem 20.1-30cm', prices: { AETNA: 298.12, BC: 311.82, BCN: 311.82, CIGNA: 274.47, HAP: 274.47, UHC: 304.50, PTPAY: 315, OTHER: 311.82 }},
  '12007': { desc: 'Repair trunk/extrem >30cm', prices: { AETNA: 378.50, BC: 396.00, BCN: 396.00, CIGNA: 354.10, HAP: 354.10, UHC: 390.42, PTPAY: 400, OTHER: 396.00 }},

  // Simple Repairs - Scalp/Neck/Axillae/Ext Gen/Trunk
  '12011': { desc: 'Repair face/ears/lids ≤2.5cm', prices: { AETNA: 166.31, BC: 173.94, BCN: 173.94, CIGNA: 139.46, HAP: 139.46, UHC: 158.85, PTPAY: 175, OTHER: 173.94 }},
  '12013': { desc: 'Repair face/ears/lids 2.6-5cm', prices: { AETNA: 183.80, BC: 192.24, BCN: 192.24, CIGNA: 159.30, HAP: 159.30, UHC: 180.31, PTPAY: 195, OTHER: 192.24 }},
  '12014': { desc: 'Repair face/ears/lids 5.1-7.5cm', prices: { AETNA: 213.95, BC: 223.86, BCN: 223.86, CIGNA: 191.32, HAP: 191.32, UHC: 214.85, PTPAY: 225, OTHER: 223.86 }},
  '12015': { desc: 'Repair face/ears/lids 7.6-12.5cm', prices: { AETNA: 266.69, BC: 278.94, BCN: 278.94, CIGNA: 246.86, HAP: 246.86, UHC: 274.89, PTPAY: 280, OTHER: 278.94 }},
  '12016': { desc: 'Repair face/ears/lids 12.6-20cm', prices: { AETNA: 333.79, BC: 349.14, BCN: 349.14, CIGNA: 318.89, HAP: 318.89, UHC: 352.77, PTPAY: 350, OTHER: 349.14 }},
  '12017': { desc: 'Repair face/ears/lids 20.1-30cm', prices: { AETNA: 413.29, BC: 432.36, BCN: 432.36, CIGNA: 403.84, HAP: 403.84, UHC: 444.54, PTPAY: 435, OTHER: 432.36 }},
  '12018': { desc: 'Repair face/ears/lids >30cm', prices: { AETNA: 532.04, BC: 556.68, BCN: 556.68, CIGNA: 527.52, HAP: 527.52, UHC: 577.86, PTPAY: 560, OTHER: 556.68 }},

  // Intermediate Repairs - Trunk/Extremities
  '12031': { desc: 'Intermed repair trunk/ext ≤2.5cm', prices: { AETNA: 202.83, BC: 212.22, BCN: 212.22, CIGNA: 177.76, HAP: 177.76, UHC: 199.01, PTPAY: 215, OTHER: 212.22 }},
  '12032': { desc: 'Intermed repair trunk/ext 2.6-7.5cm', prices: { AETNA: 233.35, BC: 244.08, BCN: 244.08, CIGNA: 212.34, HAP: 212.34, UHC: 236.37, PTPAY: 250, OTHER: 244.08 }},
  '12034': { desc: 'Intermed repair trunk/ext 7.6-12.5cm', prices: { AETNA: 278.85, BC: 291.72, BCN: 291.72, CIGNA: 263.64, HAP: 263.64, UHC: 290.97, PTPAY: 295, OTHER: 291.72 }},
  '12035': { desc: 'Intermed repair trunk/ext 12.6-20cm', prices: { AETNA: 340.62, BC: 356.40, BCN: 356.40, CIGNA: 331.94, HAP: 331.94, UHC: 363.61, PTPAY: 360, OTHER: 356.40 }},
  '12036': { desc: 'Intermed repair trunk/ext 20.1-30cm', prices: { AETNA: 415.31, BC: 434.46, BCN: 434.46, CIGNA: 413.05, HAP: 413.05, UHC: 449.85, PTPAY: 435, OTHER: 434.46 }},
  '12037': { desc: 'Intermed repair trunk/ext >30cm', prices: { AETNA: 521.27, BC: 545.40, BCN: 545.40, CIGNA: 527.52, HAP: 527.52, UHC: 571.93, PTPAY: 550, OTHER: 545.40 }},

  // Intermediate Repairs - Scalp/Axillae/Trunk/Ext
  '12041': { desc: 'Intermed repair neck/hf/gen ≤2.5cm', prices: { AETNA: 215.02, BC: 224.94, BCN: 224.94, CIGNA: 190.60, HAP: 190.60, UHC: 212.77, PTPAY: 225, OTHER: 224.94 }},
  '12042': { desc: 'Intermed repair neck/hf/gen 2.6-7.5cm', prices: { AETNA: 255.12, BC: 266.88, BCN: 266.88, CIGNA: 237.79, HAP: 237.79, UHC: 263.70, PTPAY: 270, OTHER: 266.88 }},
  '12044': { desc: 'Intermed repair neck/hf/gen 7.6-12.5cm', prices: { AETNA: 307.98, BC: 322.14, BCN: 322.14, CIGNA: 296.72, HAP: 296.72, UHC: 326.74, PTPAY: 325, OTHER: 322.14 }},
  '12045': { desc: 'Intermed repair neck/hf/gen 12.6-20cm', prices: { AETNA: 381.47, BC: 399.12, BCN: 399.12, CIGNA: 377.22, HAP: 377.22, UHC: 412.68, PTPAY: 400, OTHER: 399.12 }},
  '12046': { desc: 'Intermed repair neck/hf/gen 20.1-30cm', prices: { AETNA: 471.85, BC: 493.68, BCN: 493.68, CIGNA: 475.88, HAP: 475.88, UHC: 517.33, PTPAY: 495, OTHER: 493.68 }},
  '12047': { desc: 'Intermed repair neck/hf/gen >30cm', prices: { AETNA: 601.84, BC: 629.58, BCN: 629.58, CIGNA: 616.61, HAP: 616.61, UHC: 666.84, PTPAY: 630, OTHER: 629.58 }},

  // Intermediate Repairs - Face/Ears/Eyelids/Nose/Lips/Mucous
  '12051': { desc: 'Intermed repair face/ear/nose ≤2.5cm', prices: { AETNA: 237.22, BC: 248.16, BCN: 248.16, CIGNA: 216.64, HAP: 216.64, UHC: 240.53, PTPAY: 250, OTHER: 248.16 }},
  '12052': { desc: 'Intermed repair face/ear/nose 2.6-5cm', prices: { AETNA: 271.71, BC: 284.28, BCN: 284.28, CIGNA: 256.50, HAP: 256.50, UHC: 282.90, PTPAY: 285, OTHER: 284.28 }},
  '12053': { desc: 'Intermed repair face/ear/nose 5.1-7.5cm', prices: { AETNA: 310.54, BC: 324.90, BCN: 324.90, CIGNA: 301.40, HAP: 301.40, UHC: 330.83, PTPAY: 325, OTHER: 324.90 }},
  '12054': { desc: 'Intermed repair face/ear/nose 7.6-12.5cm', prices: { AETNA: 378.76, BC: 396.30, BCN: 396.30, CIGNA: 378.37, HAP: 378.37, UHC: 412.20, PTPAY: 400, OTHER: 396.30 }},
  '12055': { desc: 'Intermed repair face/ear/nose 12.6-20cm', prices: { AETNA: 467.54, BC: 489.18, BCN: 489.18, CIGNA: 476.52, HAP: 476.52, UHC: 516.37, PTPAY: 490, OTHER: 489.18 }},
  '12056': { desc: 'Intermed repair face/ear/nose 20.1-30cm', prices: { AETNA: 583.42, BC: 610.44, BCN: 610.44, CIGNA: 604.34, HAP: 604.34, UHC: 651.91, PTPAY: 615, OTHER: 610.44 }},
  '12057': { desc: 'Intermed repair face/ear/nose >30cm', prices: { AETNA: 739.66, BC: 773.82, BCN: 773.82, CIGNA: 776.98, HAP: 776.98, UHC: 834.20, PTPAY: 775, OTHER: 773.82 }},

  // Complex Repairs - Trunk
  '13100': { desc: 'Complex repair trunk 1.1-2.5cm', prices: { AETNA: 325.33, BC: 340.32, BCN: 340.32, CIGNA: 319.62, HAP: 319.62, UHC: 350.53, PTPAY: 345, OTHER: 340.32 }},
  '13101': { desc: 'Complex repair trunk 2.6-7.5cm', prices: { AETNA: 390.16, BC: 408.12, BCN: 408.12, CIGNA: 397.41, HAP: 397.41, UHC: 432.57, PTPAY: 410, OTHER: 408.12 }},
  '13102': { desc: 'Complex repair trunk each addl 5cm', prices: { AETNA: 49.91, BC: 52.20, BCN: 52.20, CIGNA: 52.91, HAP: 52.91, UHC: 57.44, PTPAY: 55, OTHER: 52.20 }, isSequential: true },

  // Complex Repairs - Scalp/Arms/Legs
  '13120': { desc: 'Complex repair scalp/arm/leg 1.1-2.5cm', prices: { AETNA: 344.37, BC: 360.24, BCN: 360.24, CIGNA: 342.74, HAP: 342.74, UHC: 375.41, PTPAY: 365, OTHER: 360.24 }},
  '13121': { desc: 'Complex repair scalp/arm/leg 2.6-7.5cm', prices: { AETNA: 424.57, BC: 444.18, BCN: 444.18, CIGNA: 440.93, HAP: 440.93, UHC: 479.55, PTPAY: 445, OTHER: 444.18 }, isSequential: true },
  '13122': { desc: 'Complex repair scalp/arm/leg each addl 5cm', prices: { AETNA: 61.36, BC: 64.20, BCN: 64.20, CIGNA: 67.88, HAP: 67.88, UHC: 73.35, PTPAY: 70, OTHER: 64.20 }, isSequential: true },

  // Complex Repairs - Forehead/Cheeks/Chin/Mouth/Neck
  '13131': { desc: 'Complex repair face 1.1-2.5cm', prices: { AETNA: 386.08, BC: 403.86, BCN: 403.86, CIGNA: 392.05, HAP: 392.05, UHC: 428.07, PTPAY: 405, OTHER: 403.86 }, isSequential: true },
  '13132': { desc: 'Complex repair face 2.6-7.5cm', prices: { AETNA: 489.82, BC: 512.46, BCN: 512.46, CIGNA: 516.17, HAP: 516.17, UHC: 561.13, PTPAY: 515, OTHER: 512.46 }, isSequential: true },
  '13133': { desc: 'Complex repair face each addl 5cm', prices: { AETNA: 73.75, BC: 77.16, BCN: 77.16, CIGNA: 83.82, HAP: 83.82, UHC: 90.54, PTPAY: 80, OTHER: 77.16 }, isSequential: true },

  // Complex Repairs - Eyelids/Nose/Ears/Lips
  '13151': { desc: 'Complex repair eyelid/nose/ear/lip 1.1-2.5cm', prices: { AETNA: 451.83, BC: 472.62, BCN: 472.62, CIGNA: 468.06, HAP: 468.06, UHC: 509.98, PTPAY: 475, OTHER: 472.62 }},
  '13152': { desc: 'Complex repair eyelid/nose/ear/lip 2.6-7.5cm', prices: { AETNA: 567.32, BC: 593.52, BCN: 593.52, CIGNA: 605.49, HAP: 605.49, UHC: 657.95, PTPAY: 595, OTHER: 593.52 }, isSequential: true },
  '13153': { desc: 'Complex repair eyelid/nose/ear/lip each addl 5cm', prices: { AETNA: 82.76, BC: 86.58, BCN: 86.58, CIGNA: 96.72, HAP: 96.72, UHC: 104.43, PTPAY: 90, OTHER: 86.58 }, isSequential: true },

  // Complex Repairs - Unusual
  '13160': { desc: 'Late closure complicated wound', prices: { AETNA: 689.98, BC: 722.04, BCN: 722.04, CIGNA: 748.33, HAP: 748.33, UHC: 812.54, PTPAY: 725, OTHER: 722.04 }},

  // Adjacent Tissue Transfer/Rearrangement
  '14000': { desc: 'Adj tissue xfer trunk ≤10 sq cm', prices: { AETNA: 667.10, BC: 697.80, BCN: 697.80, CIGNA: 698.30, HAP: 698.30, UHC: 758.68, PTPAY: 700, OTHER: 697.80 }},
  '14001': { desc: 'Adj tissue xfer trunk 10.1-30 sq cm', prices: { AETNA: 850.90, BC: 890.10, BCN: 890.10, CIGNA: 908.15, HAP: 908.15, UHC: 985.86, PTPAY: 895, OTHER: 890.10 }},
  '14020': { desc: 'Adj tissue xfer scalp/arm/leg ≤10 sq cm', prices: { AETNA: 712.25, BC: 745.02, BCN: 745.02, CIGNA: 752.52, HAP: 752.52, UHC: 817.38, PTPAY: 750, OTHER: 745.02 }},
  '14021': { desc: 'Adj tissue xfer scalp/arm/leg 10.1-30 sq cm', prices: { AETNA: 917.45, BC: 959.64, BCN: 959.64, CIGNA: 992.53, HAP: 992.53, UHC: 1077.86, PTPAY: 965, OTHER: 959.64 }},
  '14040': { desc: 'Adj tissue xfer face/eyelid/nose ≤10 sq cm', prices: { AETNA: 806.66, BC: 843.78, BCN: 843.78, CIGNA: 865.42, HAP: 865.42, UHC: 939.76, PTPAY: 845, OTHER: 843.78 }},
  '14041': { desc: 'Adj tissue xfer face/eyelid/nose 10.1-30 sq cm', prices: { AETNA: 1043.64, BC: 1091.70, BCN: 1091.70, CIGNA: 1146.54, HAP: 1146.54, UHC: 1244.93, PTPAY: 1095, OTHER: 1091.70 }},
  '14060': { desc: 'Adj tissue xfer eyelid/nose/ear/lip ≤10 sq cm', prices: { AETNA: 901.63, BC: 943.08, BCN: 943.08, CIGNA: 977.78, HAP: 977.78, UHC: 1061.71, PTPAY: 945, OTHER: 943.08 }},
  '14061': { desc: 'Adj tissue xfer eyelid/nose/ear/lip 10.1-30 sq cm', prices: { AETNA: 1182.12, BC: 1236.60, BCN: 1236.60, CIGNA: 1311.82, HAP: 1311.82, UHC: 1424.50, PTPAY: 1240, OTHER: 1236.60 }},

  // I&D
  '10060': { desc: 'I&D abscess simple', prices: { AETNA: 139.94, BC: 146.40, BCN: 146.40, CIGNA: 119.50, HAP: 119.50, UHC: 136.56, PTPAY: 150, OTHER: 146.40 }},
  '10061': { desc: 'I&D abscess complicated', prices: { AETNA: 262.32, BC: 274.38, BCN: 274.38, CIGNA: 241.51, HAP: 241.51, UHC: 270.15, PTPAY: 280, OTHER: 274.38 }},
  '10080': { desc: 'I&D pilonidal cyst simple', prices: { AETNA: 152.49, BC: 159.54, BCN: 159.54, CIGNA: 136.48, HAP: 136.48, UHC: 154.35, PTPAY: 165, OTHER: 159.54 }},
  '10081': { desc: 'I&D pilonidal cyst complicated', prices: { AETNA: 270.85, BC: 283.32, BCN: 283.32, CIGNA: 256.51, HAP: 256.51, UHC: 285.72, PTPAY: 290, OTHER: 283.32 }},
  '10120': { desc: 'Incise/remove foreign body simple', prices: { AETNA: 142.58, BC: 149.16, BCN: 149.16, CIGNA: 126.55, HAP: 126.55, UHC: 143.37, PTPAY: 155, OTHER: 149.16 }},
  '10121': { desc: 'Incise/remove foreign body complicated', prices: { AETNA: 238.02, BC: 248.94, BCN: 248.94, CIGNA: 222.09, HAP: 222.09, UHC: 249.11, PTPAY: 255, OTHER: 248.94 }},
  '10140': { desc: 'I&D hematoma/seroma', prices: { AETNA: 169.23, BC: 177.06, BCN: 177.06, CIGNA: 155.74, HAP: 155.74, UHC: 175.02, PTPAY: 180, OTHER: 177.06 }},
  '10160': { desc: 'Puncture aspiration abscess/cyst', prices: { AETNA: 105.00, BC: 109.86, BCN: 109.86, CIGNA: 93.43, HAP: 93.43, UHC: 106.29, PTPAY: 115, OTHER: 109.86 }},

  // Debridement
  '11000': { desc: 'Debride infected skin ≤10%', prices: { AETNA: 78.24, BC: 81.84, BCN: 81.84, CIGNA: 66.17, HAP: 66.17, UHC: 75.88, PTPAY: 85, OTHER: 81.84 }},
  '11001': { desc: 'Debride infected skin each addl 10%', prices: { AETNA: 21.56, BC: 22.56, BCN: 22.56, CIGNA: 18.82, HAP: 18.82, UHC: 21.54, PTPAY: 25, OTHER: 22.56 }, isSequential: true },
  '11004': { desc: 'Debride skin/subq/muscle/fascia', prices: { AETNA: 528.18, BC: 552.54, BCN: 552.54, CIGNA: 536.76, HAP: 536.76, UHC: 588.60, PTPAY: 555, OTHER: 552.54 }},
  '11042': { desc: 'Debride subq ≤20 sq cm', prices: { AETNA: 112.14, BC: 117.30, BCN: 117.30, CIGNA: 100.44, HAP: 100.44, UHC: 113.58, PTPAY: 120, OTHER: 117.30 }},
  '11043': { desc: 'Debride muscle ≤20 sq cm', prices: { AETNA: 170.95, BC: 178.86, BCN: 178.86, CIGNA: 161.33, HAP: 161.33, UHC: 179.83, PTPAY: 185, OTHER: 178.86 }},
  '11044': { desc: 'Debride bone ≤20 sq cm', prices: { AETNA: 240.66, BC: 251.76, BCN: 251.76, CIGNA: 235.91, HAP: 235.91, UHC: 260.58, PTPAY: 255, OTHER: 251.76 }},

  // Nail Procedures
  '11719': { desc: 'Trim nails any number', prices: { AETNA: 18.02, BC: 18.84, BCN: 18.84, CIGNA: 14.66, HAP: 14.66, UHC: 17.09, PTPAY: 25, OTHER: 18.84 }},
  '11720': { desc: 'Debride nails 1-5', prices: { AETNA: 37.11, BC: 38.82, BCN: 38.82, CIGNA: 32.42, HAP: 32.42, UHC: 36.60, PTPAY: 45, OTHER: 38.82 }},
  '11721': { desc: 'Debride nails 6+', prices: { AETNA: 52.04, BC: 54.42, BCN: 54.42, CIGNA: 47.34, HAP: 47.34, UHC: 52.81, PTPAY: 60, OTHER: 54.42 }},
  '11730': { desc: 'Avulsion nail plate partial', prices: { AETNA: 92.23, BC: 96.48, BCN: 96.48, CIGNA: 78.49, HAP: 78.49, UHC: 89.92, PTPAY: 100, OTHER: 96.48 }},
  '11732': { desc: 'Avulsion nail plate each addl', prices: { AETNA: 35.90, BC: 37.56, BCN: 37.56, CIGNA: 31.63, HAP: 31.63, UHC: 35.77, PTPAY: 45, OTHER: 37.56 }, isSequential: true },
  '11740': { desc: 'Evacuate subungual hematoma', prices: { AETNA: 46.09, BC: 48.24, BCN: 48.24, CIGNA: 37.85, HAP: 37.85, UHC: 44.02, PTPAY: 55, OTHER: 48.24 }},
  '11750': { desc: 'Excision nail/matrix permanent', prices: { AETNA: 199.83, BC: 209.04, BCN: 209.04, CIGNA: 178.41, HAP: 178.41, UHC: 200.93, PTPAY: 215, OTHER: 209.04 }},
  '11755': { desc: 'Biopsy nail unit', prices: { AETNA: 136.37, BC: 142.68, BCN: 142.68, CIGNA: 117.66, HAP: 117.66, UHC: 134.05, PTPAY: 150, OTHER: 142.68 }},
  '11760': { desc: 'Repair nail bed', prices: { AETNA: 207.69, BC: 217.26, BCN: 217.26, CIGNA: 189.53, HAP: 189.53, UHC: 212.65, PTPAY: 220, OTHER: 217.26 }},
  '11762': { desc: 'Reconstruction nail bed', prices: { AETNA: 359.97, BC: 376.62, BCN: 376.62, CIGNA: 341.94, HAP: 341.94, UHC: 380.55, PTPAY: 380, OTHER: 376.62 }},
  '11765': { desc: 'Wedge excision skin nail fold', prices: { AETNA: 122.69, BC: 128.34, BCN: 128.34, CIGNA: 104.33, HAP: 104.33, UHC: 119.41, PTPAY: 135, OTHER: 128.34 }},

  // Pathology
  '88304': { desc: 'Path Level III', prices: { AETNA: 50.78, BC: 68.17, BCN: 68.17, CIGNA: 60.07, HAP: 60.07, UHC: 41.73, PTPAY: 110, OTHER: 68.17 }, isPath: true },
  '88305': { desc: 'Path Level IV', prices: { AETNA: 86.11, BC: 105.03, BCN: 105.03, CIGNA: 103.85, HAP: 103.85, UHC: 69.84, PTPAY: 110, OTHER: 105.03 }, isPath: true },
  '88312': { desc: 'Special stain Group I', prices: { AETNA: 133.55, BC: 178.42, BCN: 178.42, CIGNA: 90.50, HAP: 90.50, UHC: 99.50, PTPAY: 150, OTHER: 178.42 }, isPath: true },
  '88313': { desc: 'Special stain Group II', prices: { AETNA: 102.67, BC: 119.04, BCN: 119.04, CIGNA: 72.50, HAP: 72.50, UHC: 79.10, PTPAY: 130, OTHER: 119.04 }, isPath: true },
  '88342': { desc: 'Immunohistochemistry', prices: { AETNA: 119.66, BC: 169.37, BCN: 169.37, CIGNA: 102.45, HAP: 102.45, UHC: 108.28, PTPAY: 150, OTHER: 169.37 }, isPath: true },

  // Unit-Based (Injections)
  'J0585': { desc: 'Botox per unit (medical)', prices: { AETNA: 6.60, BC: 6.35, BCN: 6.35, CIGNA: 6.32, HAP: 6.32, UHC: 6.23, PTPAY: 7, OTHER: 6.35 }, isUnitBased: true },
  'J0586': { desc: 'Dysport per unit', prices: { AETNA: 1.50, BC: 1.45, BCN: 1.45, CIGNA: 1.44, HAP: 1.44, UHC: 1.42, PTPAY: 2, OTHER: 1.45 }, isUnitBased: true },
  'J1100': { desc: 'Dexamethasone per 4mg', prices: { AETNA: 1.20, BC: 1.15, BCN: 1.15, CIGNA: 1.10, HAP: 1.10, UHC: 1.08, PTPAY: 2, OTHER: 1.15 }, isUnitBased: true },
  'J3301': { desc: 'Kenalog 10mg', prices: { AETNA: 8.50, BC: 8.20, BCN: 8.20, CIGNA: 8.10, HAP: 8.10, UHC: 8.00, PTPAY: 10, OTHER: 8.20 }, isUnitBased: true },

  // Injections - Lesions
  '11900': { desc: 'Inject intralesional ≤7 lesions', prices: { AETNA: 80.41, BC: 84.12, BCN: 84.12, CIGNA: 67.22, HAP: 67.22, UHC: 77.23, PTPAY: 90, OTHER: 84.12 }},
  '11901': { desc: 'Inject intralesional >7 lesions', prices: { AETNA: 114.28, BC: 119.52, BCN: 119.52, CIGNA: 103.47, HAP: 103.47, UHC: 116.72, PTPAY: 125, OTHER: 119.52 }},

  // E&M Consults
  '99241': { desc: 'Office consult - brief', prices: { AETNA: 64.74, BC: 67.74, BCN: 67.74, CIGNA: 55.46, HAP: 55.46, UHC: 62.77, PTPAY: 85, OTHER: 67.74 }},
  '99242': { desc: 'Office consult - limited', prices: { AETNA: 113.76, BC: 119.04, BCN: 119.04, CIGNA: 104.00, HAP: 104.00, UHC: 115.00, PTPAY: 130, OTHER: 119.04 }},
  '99243': { desc: 'Office consult - detailed', prices: { AETNA: 154.63, BC: 161.82, BCN: 161.82, CIGNA: 146.80, HAP: 146.80, UHC: 160.37, PTPAY: 170, OTHER: 161.82 }},
  '99244': { desc: 'Office consult - comprehensive', prices: { AETNA: 227.38, BC: 237.90, BCN: 237.90, CIGNA: 224.04, HAP: 224.04, UHC: 242.41, PTPAY: 245, OTHER: 237.90 }},
  '99245': { desc: 'Office consult - complex', prices: { AETNA: 291.85, BC: 305.34, BCN: 305.34, CIGNA: 293.00, HAP: 293.00, UHC: 315.00, PTPAY: 310, OTHER: 305.34 }},
};

const formatCurrency = (amount) => {
  if (amount === 0 || amount === null || amount === undefined) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatCurrencyAlways = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
};

// UI Components - defined outside main component to prevent re-creation on render
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
  <div
    onClick={onChange}
    className="flex items-center gap-3 cursor-pointer group"
  >
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center
      ${checked ? 'bg-ngd-brown border-ngd-brown' : 'border-ngd-taupe group-hover:border-ngd-gray'}
      ${required && !checked ? 'border-amber-400 bg-amber-50' : ''}`}>
      {checked && <span className="text-white text-xs">✓</span>}
    </div>
    <span className={`text-sm ${required && !checked ? 'text-amber-700 font-medium' : 'text-ngd-gray'}`}>
      {label} {required && !checked && <span className="text-amber-500">*</span>}
    </span>
  </div>
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
        className={`w-full rounded-lg border border-ngd-taupe/50 py-2 text-sm focus:border-ngd-brown focus:ring-2 focus:ring-ngd-taupe/20 outline-none
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

export default function NGDCheckout() {
  const [step, setStep] = useState(1);
  const [showCalculations, setShowCalculations] = useState(true);

  const [patientInfo, setPatientInfo] = useState({
    accountNumber: '',
    doctor: 'fred',
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
  const [codeSearch, setCodeSearch] = useState('');
  const [showCodeDropdown, setShowCodeDropdown] = useState(false);

  const insurerKey = useMemo(() => {
    const entry = Object.entries(INSURANCE_CODES).find(([k]) => k === insurance.insurer);
    return entry ? entry[1] : 'PTPAY';
  }, [insurance.insurer]);

  const filteredCodes = useMemo(() => {
    if (!codeSearch.trim()) return [];
    const search = codeSearch.trim().toLowerCase();
    return Object.entries(PROCEDURE_CODES)
      .filter(([code, data]) =>
        code.toLowerCase().includes(search) ||
        data.desc.toLowerCase().includes(search)
      )
      .slice(0, 20); // Limit to 20 results
  }, [codeSearch]);

  const addProcedure = (code) => {
    if (code && !procedures.find(p => p.code === code)) {
      const codeData = PROCEDURE_CODES[code];
      if (codeData) {
        setProcedures([...procedures, { code, qty: 1 }]);
      } else {
        // Manual code entry - add with custom pricing prompt
        setProcedures([...procedures, { code, qty: 1, isManual: true }]);
      }
    }
    setCodeSearch('');
    setShowCodeDropdown(false);
  };

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
      const isManual = !codeData;
      const price = isManual ? (proc.customPrice || 0) : (codeData.prices[insurerKey] || codeData.prices['OTHER'] || codeData.prices['PTPAY'] || 0);
      const qty = proc.qty || 1;

      if (isManual) {
        // Manual codes go into pvSurg charges
        pvSurgChargesRaw.push({ code: proc.code, price, qty, total: price * qty, isManual: true });
      } else if (codeData.isUnitBased) {
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
              {[
                { id: 'fred', name: 'Dr. Fred' },
                { id: 'karlee', name: 'Dr. Karlee' },
                { id: 'taylor', name: 'Dr. Taylor' }
              ].map(doc => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setPatientInfo(p => ({ ...p, doctor: doc.id }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium
                    ${patientInfo.doctor === doc.id
                      ? 'bg-ngd-brown text-white shadow-sm'
                      : 'bg-ngd-light text-ngd-gray hover:bg-ngd-taupe/30'}`}
                >
                  {doc.name}
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
            label="Provider cosmetic box checked"
            checked={patientInfo.knFnCosmeticChecked}
            onChange={() => setPatientInfo(p => ({ ...p, knFnCosmeticChecked: !p.knFnCosmeticChecked }))}
            required
          />
          <Checkbox
            label="Provider medical box checked"
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
        {/* Searchable Code Input */}
        <div className="mb-4 relative">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={codeSearch}
                onChange={(e) => {
                  setCodeSearch(e.target.value);
                  setShowCodeDropdown(true);
                }}
                onFocus={() => setShowCodeDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && codeSearch.trim()) {
                    e.preventDefault();
                    if (filteredCodes.length > 0) {
                      addProcedure(filteredCodes[0][0]);
                    } else {
                      addProcedure(codeSearch.trim().toUpperCase());
                    }
                  }
                  if (e.key === 'Escape') {
                    setShowCodeDropdown(false);
                  }
                }}
                placeholder="Search by code or description..."
                className="w-full px-3 py-2 border border-ngd-taupe/50 rounded-lg text-sm focus:border-ngd-brown focus:ring-2 focus:ring-ngd-taupe/20 outline-none"
              />
              {showCodeDropdown && codeSearch.trim() && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-ngd-taupe/50 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {filteredCodes.length > 0 ? (
                    filteredCodes.map(([code, data]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => addProcedure(code)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-ngd-light flex items-center gap-2 border-b border-ngd-taupe/10 last:border-b-0"
                      >
                        <span className="font-mono font-medium text-ngd-dark">{code}</span>
                        <span className="text-ngd-gray truncate">{data.desc}</span>
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      onClick={() => addProcedure(codeSearch.trim().toUpperCase())}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-ngd-light text-ngd-gray"
                    >
                      Add custom code: <span className="font-mono font-medium text-ngd-dark">{codeSearch.trim().toUpperCase()}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowCodeDropdown(false)}
              className="px-3 py-2 text-sm text-ngd-gray hover:text-ngd-dark"
            >
              {showCodeDropdown ? '×' : ''}
            </button>
          </div>
        </div>

        {/* Category Quick-Add Dropdown */}
        <div className="mb-4">
          <select
            onChange={(e) => {
              if (e.target.value) {
                addProcedure(e.target.value);
              }
              e.target.value = '';
            }}
            className="w-full px-3 py-2 border border-ngd-taupe/50 rounded-lg text-sm bg-ngd-light/50"
          >
            <option value="">Browse by category...</option>
            <optgroup label="Office Calls">
              {Object.entries(PROCEDURE_CODES).filter(([_, v]) => v.isOfficeCall).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Biopsies">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('1110') || c.startsWith('1110')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Benign Shave">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('113')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Benign Excision">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('114')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Malignant Excision">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('116')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Destruction/ED&C">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('17')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Simple Repairs">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('120')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Intermediate Repairs">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('1203') || c.startsWith('1204') || c.startsWith('1205')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Complex Repairs">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('131')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Tissue Transfer">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('140')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="I&D">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('10')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Debridement">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('110') && !c.startsWith('1102') && !c.startsWith('1103') && !c.startsWith('1104') && !c.startsWith('1105') && !c.startsWith('1106') && !c.startsWith('1107')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Skin Tags">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c === '11200' || c === '11201').map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Nail Procedures">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('117')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Injections">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('119') || c.startsWith('J')).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Pathology">
              {Object.entries(PROCEDURE_CODES).filter(([_, v]) => v.isPath).map(([code, data]) => (
                <option key={code} value={code}>{code} - {data.desc}</option>
              ))}
            </optgroup>
            <optgroup label="Consults">
              {Object.entries(PROCEDURE_CODES).filter(([c]) => c.startsWith('992')).map(([code, data]) => (
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
              const isManual = !codeData;
              const price = isManual ? (proc.customPrice || 0) : (codeData?.prices[insurerKey] || codeData?.prices['OTHER'] || codeData?.prices['PTPAY'] || 0);
              const isMax = proc.code === calculations.maxPvSurgCode;
              const isSequential = codeData?.isSequential || SEQUENTIAL_CODES.includes(proc.code);
              const isUnitBased = codeData?.isUnitBased;

              return (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${isMax ? 'bg-blue-50 border border-blue-200' : isManual ? 'bg-orange-50 border border-orange-200' : 'bg-ngd-light'}`}>
                  <div className="flex-1">
                    <span className="font-mono text-sm font-medium text-ngd-dark">{proc.code}</span>
                    <span className="text-sm text-ngd-gray ml-2">{codeData?.desc || (isManual ? 'Manual entry' : '')}</span>
                    {isManual && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">Manual</span>
                    )}
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
                  {isManual && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-ngd-gray">$</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Price"
                        value={proc.customPrice || ''}
                        onChange={(e) => {
                          const newProcs = [...procedures];
                          newProcs[idx].customPrice = parseFloat(e.target.value) || 0;
                          setProcedures(newProcs);
                        }}
                        className="w-20 px-2 py-1 text-sm border border-orange-300 rounded bg-white"
                      />
                    </div>
                  )}
                  {!isManual && (
                    <span className="text-sm font-medium text-ngd-gray w-20 text-right">
                      {formatCurrencyAlways(price * (proc.qty || 1))}
                    </span>
                  )}
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
            doctor: 'fred',
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
