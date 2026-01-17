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
  '99202': { desc: 'New patient - minor', prices: { AETNA: 76.77, 'AH&L': 76.02, BC: 82.88, BCN: 82.88, CIGNA: 76.02, HAP: 76.02, MR: 75.29, PRIOR: 77.99, UHC: 76.87, PTPAY: 119, OTHER: 82.88 }, isOfficeCall: true },
  '99203': { desc: 'New patient - moderate', prices: { AETNA: 119.71, 'AH&L': 111.32, BC: 117.35, BCN: 117.35, CIGNA: 111.32, HAP: 111.32, MR: 119.18, PRIOR: 121.67, UHC: 111.78, PTPAY: 140, OTHER: 117.35 }, isOfficeCall: true },
  '99204': { desc: 'New patient - complex', prices: { AETNA: 178.19, 'AH&L': 170.46, BC: 179.33, BCN: 179.33, CIGNA: 170.46, HAP: 170.46, MR: 179.97, PRIOR: 182.33, UHC: 169.62, PTPAY: 0, OTHER: 179.33 }, isOfficeCall: true },
  '99205': { desc: 'New patient - high complexity', prices: { AETNA: 221.76, 'AH&L': 220.94, BC: 232.26, BCN: 232.26, CIGNA: 220.94, HAP: 220.94, MR: 223.50, PRIOR: 227.00, UHC: 219.82, PTPAY: 250, OTHER: 232.26 }, isOfficeCall: true },

  // Office Calls - Established Patient
  '99211': { desc: 'Established - minimal', prices: { AETNA: 23.69, 'AH&L': 23.57, BC: 24.78, BCN: 24.78, CIGNA: 23.57, HAP: 23.57, MR: 23.50, PRIOR: 24.00, UHC: 23.44, PTPAY: 45, OTHER: 24.78 }, isOfficeCall: true },
  '99212': { desc: 'Established - brief', prices: { AETNA: 59.88, 'AH&L': 44.59, BC: 54.61, BCN: 54.61, CIGNA: 44.59, HAP: 44.59, MR: 59.54, PRIOR: 61.38, UHC: 44.67, PTPAY: 75, OTHER: 54.61 }, isOfficeCall: true },
  '99213': { desc: 'Established - standard', prices: { AETNA: 96.16, 'AH&L': 73.93, BC: 85.82, BCN: 85.82, CIGNA: 73.93, HAP: 73.93, MR: 95.55, PRIOR: 99.28, UHC: 74.92, PTPAY: 95, OTHER: 85.82 }, isOfficeCall: true },
  '99214': { desc: 'Established - complex', prices: { AETNA: 136.24, 'AH&L': 109.19, BC: 124.45, BCN: 124.45, CIGNA: 109.19, HAP: 109.19, MR: 136.48, PRIOR: 139.72, UHC: 110.16, PTPAY: 0, OTHER: 124.45 }, isOfficeCall: true },
  '99215': { desc: 'Established - high complexity', prices: { AETNA: 182.04, 'AH&L': 181.12, BC: 190.44, BCN: 190.44, CIGNA: 181.12, HAP: 181.12, MR: 183.00, PRIOR: 186.00, UHC: 180.20, PTPAY: 200, OTHER: 190.44 }, isOfficeCall: true },

  // Office Calls - 90 series (Medicare)
  '90212': { desc: 'Est patient 90 - brief', prices: { AETNA: 59.88, 'AH&L': 44.59, BC: 54.61, BCN: 54.61, CIGNA: 44.59, HAP: 44.59, MR: 59.54, PRIOR: 61.38, UHC: 44.67, PTPAY: 75, OTHER: 54.61 }, isOfficeCall: true },
  '90213': { desc: 'Est patient 90 - standard', prices: { AETNA: 96.16, 'AH&L': 73.93, BC: 85.82, BCN: 85.82, CIGNA: 73.93, HAP: 73.93, MR: 95.55, PRIOR: 99.28, UHC: 74.92, PTPAY: 95, OTHER: 85.82 }, isOfficeCall: true },
  '90214': { desc: 'Est patient 90 - complex', prices: { AETNA: 136.24, 'AH&L': 109.19, BC: 124.45, BCN: 124.45, CIGNA: 109.19, HAP: 109.19, MR: 136.48, PRIOR: 139.72, UHC: 110.16, PTPAY: 150, OTHER: 124.45 }, isOfficeCall: true },

  // Office Calls - 91 series
  '91212': { desc: 'Est patient 91 - brief', prices: { AETNA: 59.88, 'AH&L': 44.59, BC: 54.61, BCN: 54.61, CIGNA: 44.59, HAP: 44.59, MR: 59.54, PRIOR: 61.38, UHC: 44.67, PTPAY: 75, OTHER: 54.61 }, isOfficeCall: true },
  '91213': { desc: 'Est patient 91 - standard', prices: { AETNA: 96.16, 'AH&L': 73.93, BC: 85.82, BCN: 85.82, CIGNA: 73.93, HAP: 73.93, MR: 95.55, PRIOR: 99.28, UHC: 74.92, PTPAY: 95, OTHER: 85.82 }, isOfficeCall: true },
  '91214': { desc: 'Est patient 91 - complex', prices: { AETNA: 136.24, 'AH&L': 109.19, BC: 124.45, BCN: 124.45, CIGNA: 109.19, HAP: 109.19, MR: 136.48, PRIOR: 139.72, UHC: 110.16, PTPAY: 150, OTHER: 124.45 }, isOfficeCall: true },

  // Biopsies
  '11102': { desc: 'Tangential biopsy (single)', prices: { AETNA: 121.64, 'AH&L': 98.25, BC: 124.32, BCN: 124.32, CIGNA: 98.25, HAP: 98.25, MR: 94.38, PRIOR: 134.92, UHC: 112.72, PTPAY: 0, OTHER: 124.32 }},
  '11103': { desc: 'Tangential biopsy (each addl)', prices: { AETNA: 60.46, 'AH&L': 53.03, BC: 62.16, BCN: 62.16, CIGNA: 53.03, HAP: 53.03, MR: 48.45, PRIOR: 67.45, UHC: 60.83, PTPAY: 0, OTHER: 62.16 }, isSequential: true },
  '11104': { desc: 'Punch biopsy (single)', prices: { AETNA: 150.9, 'AH&L': 123.43, BC: 154.98, BCN: 154.98, CIGNA: 123.43, HAP: 123.43, MR: 120.12, PRIOR: 168.19, UHC: 141.64, PTPAY: 0, OTHER: 154.98 }},
  '11105': { desc: 'Punch biopsy (each addl)', prices: { AETNA: 71.37, 'AH&L': 60.83, BC: 74.76, BCN: 74.76, CIGNA: 60.83, HAP: 60.83, MR: 60.54, PRIOR: 81.13, UHC: 69.75, PTPAY: 0, OTHER: 74.76 }, isSequential: true },
  '11106': { desc: 'Incisional biopsy (single)', prices: { AETNA: 186.72, 'AH&L': 149.55, BC: 192.78, BCN: 192.78, CIGNA: 149.55, HAP: 149.55, MR: 150.05, PRIOR: 209.2, UHC: 171.56, PTPAY: 0, OTHER: 192.78 }},
  '11107': { desc: 'Incisional biopsy (each addl)', prices: { AETNA: 86.17, 'AH&L': 71.71, BC: 88.2, BCN: 88.2, CIGNA: 71.71, HAP: 71.71, MR: 70.4, PRIOR: 95.72, UHC: 82.23, PTPAY: 0, OTHER: 88.2 }, isSequential: true },

  // Skin Tags
  '11200': { desc: 'Skin tags 1-15', prices: { AETNA: 110.4, 'AH&L': 85.57, BC: 117.18, BCN: 117.18, CIGNA: 85.57, HAP: 85.57, MR: 91.82, PRIOR: 127.17, UHC: 101.72, PTPAY: 105, OTHER: 117.18 }},
  '11201': { desc: 'Skin tags each addl 10', prices: { AETNA: 22.77, 'AH&L': 19.01, BC: 23.1, BCN: 23.1, CIGNA: 19.01, HAP: 19.01, MR: 18.78, PRIOR: 25.07, UHC: 22.26, PTPAY: 79, OTHER: 23.1 }, isSequential: true },

  // Benign Shave - Trunk/Arms/Legs
  '11300': { desc: 'Shave trunk/arm/leg ≤0.5cm', prices: { AETNA: 121.41, 'AH&L': 68.86, BC: 123.9, BCN: 123.9, CIGNA: 68.86, HAP: 68.86, MR: 95.28, PRIOR: 134.45, UHC: 111.7, PTPAY: 115, OTHER: 123.9 }},
  '11301': { desc: 'Shave trunk/arm/leg 0.6-1cm', prices: { AETNA: 146.88, 'AH&L': 92.44, BC: 150.78, BCN: 150.78, CIGNA: 92.44, HAP: 92.44, MR: 115.12, PRIOR: 163.62, UHC: 137.92, PTPAY: 158, OTHER: 150.78 }},
  '11302': { desc: 'Shave trunk/arm/leg 1.1-2cm', prices: { AETNA: 165.42, 'AH&L': 110.54, BC: 170.94, BCN: 170.94, CIGNA: 110.54, HAP: 110.54, MR: 130.35, PRIOR: 185.5, UHC: 162.68, PTPAY: 168, OTHER: 170.94 }},
  '11303': { desc: 'Shave trunk/arm/leg >2cm', prices: { AETNA: 183.89, 'AH&L': 130.86, BC: 189.84, BCN: 189.84, CIGNA: 130.86, HAP: 130.86, MR: 146.7, PRIOR: 206.02, UHC: 179.96, PTPAY: 188, OTHER: 189.84 }},

  // Benign Shave - Scalp/Neck/Hands/Feet/Genitalia
  '11305': { desc: 'Shave scalp/neck/hands/ft ≤0.5cm', prices: { AETNA: 127.23, 'AH&L': 68.02, BC: 130.2, BCN: 130.2, CIGNA: 68.02, HAP: 68.02, MR: 100.26, PRIOR: 141.29, UHC: 112.74, PTPAY: 125, OTHER: 130.2 }},
  '11306': { desc: 'Shave scalp/neck/hands/ft 0.6-1cm', prices: { AETNA: 148.27, 'AH&L': 94.4, BC: 151.62, BCN: 151.62, CIGNA: 94.4, HAP: 94.4, MR: 116.48, PRIOR: 164.54, UHC: 140.09, PTPAY: 150, OTHER: 151.62 }},
  '11307': { desc: 'Shave scalp/neck/hands/ft 1.1-2cm', prices: { AETNA: 168.39, 'AH&L': 111.19, BC: 171.36, BCN: 171.36, CIGNA: 111.19, HAP: 111.19, MR: 131.65, PRIOR: 185.95, UHC: 165.1, PTPAY: 168, OTHER: 171.36 }},
  '11308': { desc: 'Shave scalp/neck/hands/ft >2cm', prices: { AETNA: 177.93, 'AH&L': 122.64, BC: 180.6, BCN: 180.6, CIGNA: 122.64, HAP: 122.64, MR: 140.49, PRIOR: 195.99, UHC: 172.88, PTPAY: 177, OTHER: 180.6 }},

  // Benign Shave - Face/Ears/Eyelids/Nose/Lips/Mucous membrane
  '11310': { desc: 'Shave face/ear/nose ≤0.5cm', prices: { AETNA: 140.28, 'AH&L': 84.67, BC: 143.22, BCN: 143.22, CIGNA: 84.67, HAP: 84.67, MR: 110.25, PRIOR: 155.42, UHC: 130.56, PTPAY: 155, OTHER: 143.22 }},
  '11311': { desc: 'Shave face/ear/nose 0.6-1cm', prices: { AETNA: 165.28, 'AH&L': 106.29, BC: 170.94, BCN: 170.94, CIGNA: 106.29, HAP: 106.29, MR: 131.54, PRIOR: 185.5, UHC: 127.93, PTPAY: 140, OTHER: 170.94 }},
  '11312': { desc: 'Shave face/ear/nose 1.1-2cm', prices: { AETNA: 189.35, 'AH&L': 123.66, BC: 194.46, BCN: 194.46, CIGNA: 123.66, HAP: 123.66, MR: 149.98, PRIOR: 211.02, UHC: 184.93, PTPAY: 189, OTHER: 194.46 }},
  '11313': { desc: 'Shave face/ear/nose >2cm', prices: { AETNA: 219.71, 'AH&L': 153.97, BC: 226.38, BCN: 226.38, CIGNA: 153.97, HAP: 153.97, MR: 176.52, PRIOR: 245.67, UHC: 215.14, PTPAY: 220, OTHER: 226.38 }},

  // Benign Excision - Trunk/Arms/Legs
  '11400': { desc: 'Exc benign trunk/arm/leg ≤0.5cm', prices: { AETNA: 154.02, 'AH&L': 119.86, BC: 161.28, BCN: 161.28, CIGNA: 119.86, HAP: 119.86, MR: 127.13, PRIOR: 175.02, UHC: 142.07, PTPAY: 165, OTHER: 161.28 }},
  '11401': { desc: 'Exc benign trunk/arm/leg 0.6-1cm', prices: { AETNA: 188.95, 'AH&L': 146.74, BC: 196.14, BCN: 196.14, CIGNA: 146.74, HAP: 146.74, MR: 154.87, PRIOR: 212.85, UHC: 171.48, PTPAY: 195, OTHER: 196.14 }},
  '11402': { desc: 'Exc benign trunk/arm/leg 1.1-2cm', prices: { AETNA: 207.56, 'AH&L': 163.8, BC: 216.72, BCN: 216.72, CIGNA: 163.8, HAP: 163.8, MR: 171.01, PRIOR: 235.19, UHC: 191.34, PTPAY: 195, OTHER: 216.72 }},
  '11403': { desc: 'Exc benign trunk/arm/leg 2.1-3cm', prices: { AETNA: 239.95, 'AH&L': 189.45, BC: 250.74, BCN: 250.74, CIGNA: 189.45, HAP: 189.45, MR: 200.86, PRIOR: 272.1, UHC: 222.57, PTPAY: 325, OTHER: 250.74 }},
  '11404': { desc: 'Exc benign trunk/arm/leg 3.1-4cm', prices: { AETNA: 287.37, 'AH&L': 226.75, BC: 298.56, BCN: 298.56, CIGNA: 226.75, HAP: 226.75, MR: 240.00, PRIOR: 324.00, UHC: 326.87, PTPAY: 295, OTHER: 298.56 }},
  '11406': { desc: 'Exc benign trunk/arm/leg >4cm', prices: { AETNA: 381.47, 'AH&L': 307.60, BC: 396.36, BCN: 396.36, CIGNA: 307.60, HAP: 307.60, MR: 320.00, PRIOR: 430.00, UHC: 440.24, PTPAY: 375, OTHER: 396.36 }},

  // Benign Excision - Scalp/Neck/Hands/Feet/Genitalia
  '11420': { desc: 'Exc benign scalp/neck/hf ≤0.5cm', prices: { AETNA: 153.67, 'AH&L': 119.2, BC: 159.6, BCN: 159.6, CIGNA: 119.2, HAP: 119.2, MR: 124.37, PRIOR: 173.2, UHC: 139.93, PTPAY: 155, OTHER: 159.6 }},
  '11421': { desc: 'Exc benign scalp/neck/hf 0.6-1cm', prices: { AETNA: 193.96, 'AH&L': 155.43, BC: 200.76, BCN: 200.76, CIGNA: 155.43, HAP: 155.43, MR: 159.51, PRIOR: 217.87, UHC: 180.05, PTPAY: 185, OTHER: 200.76 }},
  '11422': { desc: 'Exc benign scalp/neck/hf 1.1-2cm', prices: { AETNA: 217.59, 'AH&L': 173.46, BC: 226.38, BCN: 226.38, CIGNA: 173.46, HAP: 173.46, MR: 180.38, PRIOR: 245.67, UHC: 202.5, PTPAY: 205, OTHER: 226.38 }},
  '11423': { desc: 'Exc benign scalp/neck/hf 2.1-3cm', prices: { AETNA: 248.57, 'AH&L': 201.08, BC: 260.82, BCN: 260.82, CIGNA: 201.08, HAP: 201.08, MR: 210.3, PRIOR: 283.04, UHC: 233.51, PTPAY: 287, OTHER: 260.82 }},
  '11424': { desc: 'Exc benign scalp/neck/hf 3.1-4cm', prices: { AETNA: 311.93, 'AH&L': 246.49, BC: 324.78, BCN: 324.78, CIGNA: 246.49, HAP: 246.49, MR: 260.00, PRIOR: 352.00, UHC: 365.05, PTPAY: 315, OTHER: 324.78 }},
  '11426': { desc: 'Exc benign scalp/neck/hf >4cm', prices: { AETNA: 421.96, 'AH&L': 341.56, BC: 439.26, BCN: 439.26, CIGNA: 341.56, HAP: 341.56, MR: 355.00, PRIOR: 477.00, UHC: 501.94, PTPAY: 420, OTHER: 439.26 }},

  // Benign Excision - Face/Ears/Eyelids/Nose/Lips
  '11440': { desc: 'Exc benign face/ear/nose ≤0.5cm', prices: { AETNA: 172.41, 'AH&L': 131.99, BC: 179.34, BCN: 179.34, CIGNA: 131.99, HAP: 131.99, MR: 140.83, PRIOR: 194.62, UHC: 153.58, PTPAY: 157, OTHER: 179.34 }},
  '11441': { desc: 'Exc benign face/ear/nose 0.6-1cm', prices: { AETNA: 210.59, 'AH&L': 166.41, BC: 218.4, BCN: 218.4, CIGNA: 166.41, HAP: 166.41, MR: 173.92, PRIOR: 237, UHC: 193.13, PTPAY: 198, OTHER: 218.4 }},
  '11442': { desc: 'Exc benign face/ear/nose 1.1-2cm', prices: { AETNA: 234.34, 'AH&L': 187.63, BC: 244.02, BCN: 244.02, CIGNA: 187.63, HAP: 187.63, MR: 194.59, PRIOR: 264.8, UHC: 216.76, PTPAY: 268, OTHER: 244.02 }},
  '11443': { desc: 'Exc benign face/ear/nose 2.1-3cm', prices: { AETNA: 277.52, 'AH&L': 224.26, BC: 288.96, BCN: 288.96, CIGNA: 224.26, HAP: 224.26, MR: 231.97, PRIOR: 313.57, UHC: 259.72, PTPAY: 319, OTHER: 288.96 }},
  '11444': { desc: 'Exc benign face/ear/nose 3.1-4cm', prices: { AETNA: 362.24, 'AH&L': 290.55, BC: 377.10, BCN: 377.10, CIGNA: 290.55, HAP: 290.55, MR: 300.00, PRIOR: 409.00, UHC: 406.06, PTPAY: 380, OTHER: 377.10 }},
  '11446': { desc: 'Exc benign face/ear/nose >4cm', prices: { AETNA: 479.00, 'AH&L': 393.00, BC: 498.42, BCN: 498.42, CIGNA: 393.00, HAP: 393.00, MR: 400.00, PRIOR: 541.00, UHC: 524.38, PTPAY: 485, OTHER: 498.42 }},

  // Malignant Excision - Trunk/Arms/Legs
  '11600': { desc: 'Exc malig trunk/arm/leg ≤0.5cm', prices: { AETNA: 238.8, 'AH&L': 188.19, BC: 314.77, BCN: 314.77, CIGNA: 188.19, HAP: 188.19, MR: 198.37, PRIOR: 269.37, UHC: 221.03, PTPAY: 298, OTHER: 314.77 }},
  '11601': { desc: 'Exc malig trunk/arm/leg 0.6-1cm', prices: { AETNA: 276.46, 'AH&L': 226.1, BC: 287.7, BCN: 287.7, CIGNA: 226.1, HAP: 226.1, MR: 227.32, PRIOR: 312.21, UHC: 263.92, PTPAY: 268, OTHER: 287.7 }},
  '11602': { desc: 'Exc malig trunk/arm/leg 1.1-2cm', prices: { AETNA: 295.9, 'AH&L': 246.49, BC: 308.7, BCN: 308.7, CIGNA: 246.49, HAP: 246.49, MR: 239.87, PRIOR: 335, UHC: 286.34, PTPAY: 293, OTHER: 308.7 }},
  '11603': { desc: 'Exc malig trunk/arm/leg 2.1-3cm', prices: { AETNA: 338.76, 'AH&L': 246.49, BC: 446.32, BCN: 446.32, CIGNA: 246.49, HAP: 246.49, MR: 277.72, PRIOR: 381.94, UHC: 328.49, PTPAY: 440, OTHER: 446.32 }},
  '11604': { desc: 'Exc malig trunk/arm/leg 3.1-4cm', prices: { AETNA: 422.92, 'AH&L': 323.84, BC: 440.28, BCN: 440.28, CIGNA: 323.84, HAP: 323.84, MR: 350.00, PRIOR: 478.00, UHC: 490.45, PTPAY: 405, OTHER: 440.28 }},
  '11606': { desc: 'Exc malig trunk/arm/leg >4cm', prices: { AETNA: 528.40, 'AH&L': 412.58, BC: 550.02, BCN: 550.02, CIGNA: 412.58, HAP: 412.58, MR: 440.00, PRIOR: 597.00, UHC: 623.95, PTPAY: 495, OTHER: 550.02 }},

  // Malignant Excision - Scalp/Neck/Hands/Feet/Genitalia
  '11620': { desc: 'Exc malig scalp/neck/hf ≤0.5cm', prices: { AETNA: 240, 'AH&L': 191.13, BC: 315.83, BCN: 315.83, CIGNA: 191.13, HAP: 191.13, MR: 198.71, PRIOR: 270.27, UHC: 223.42, PTPAY: 300, OTHER: 315.83 }},
  '11621': { desc: 'Exc malig scalp/neck/hf 0.6-1cm', prices: { AETNA: 278.13, 'AH&L': 227.73, BC: 366.96, BCN: 366.96, CIGNA: 227.73, HAP: 227.73, MR: 228.62, PRIOR: 314.04, UHC: 265.71, PTPAY: 351, OTHER: 366.96 }},
  '11622': { desc: 'Exc malig scalp/neck/hf 1.1-2cm', prices: { AETNA: 305.91, 'AH&L': 255.43, BC: 404.24, BCN: 404.24, CIGNA: 255.43, HAP: 255.43, MR: 250.1, PRIOR: 345.94, UHC: 296.49, PTPAY: 400, OTHER: 404.24 }},
  '11623': { desc: 'Exc malig scalp/neck/hf 2.1-3cm', prices: { AETNA: 360.05, 'AH&L': 300.34, BC: 473.48, BCN: 473.48, CIGNA: 300.34, HAP: 300.34, MR: 297.62, PRIOR: 405.19, UHC: 348.98, PTPAY: 459, OTHER: 473.48 }},
  '11624': { desc: 'Exc malig scalp/neck/hf 3.1-4cm', prices: { AETNA: 470.31, 'AH&L': 371.39, BC: 489.66, BCN: 489.66, CIGNA: 371.39, HAP: 371.39, MR: 390.00, PRIOR: 531.00, UHC: 561.04, PTPAY: 450, OTHER: 489.66 }},
  '11626': { desc: 'Exc malig scalp/neck/hf >4cm', prices: { AETNA: 598.13, 'AH&L': 479.63, BC: 622.74, BCN: 622.74, CIGNA: 479.63, HAP: 479.63, MR: 500.00, PRIOR: 676.00, UHC: 721.30, PTPAY: 561, OTHER: 622.74 }},

  // Malignant Excision - Face/Ears/Eyelids/Nose/Lips
  '11640': { desc: 'Exc malig face/ear/nose ≤0.5cm', prices: { AETNA: 245.03, 'AH&L': 197.67, BC: 255.78, BCN: 255.78, CIGNA: 197.67, HAP: 197.67, MR: 202.05, PRIOR: 277.57, UHC: 230.55, PTPAY: 236, OTHER: 255.78 }},
  '11641': { desc: 'Exc malig face/ear/nose 0.6-1cm', prices: { AETNA: 287.1, 'AH&L': 237.08, BC: 298.62, BCN: 298.62, CIGNA: 237.08, HAP: 237.08, MR: 237.59, PRIOR: 324.06, UHC: 274.64, PTPAY: 282, OTHER: 298.62 }},
  '11642': { desc: 'Exc malig face/ear/nose 1.1-2cm', prices: { AETNA: 324.49, 'AH&L': 270.98, BC: 338.1, BCN: 338.1, CIGNA: 270.98, HAP: 270.98, MR: 267.74, PRIOR: 366.91, UHC: 314.37, PTPAY: 387, OTHER: 338.1 }},
  '11643': { desc: 'Exc malig face/ear/nose 2.1-3cm', prices: { AETNA: 383.29, 'AH&L': 321.56, BC: 398.58, BCN: 398.58, CIGNA: 321.56, HAP: 321.56, MR: 319.16, PRIOR: 432.54, UHC: 371.85, PTPAY: 457, OTHER: 398.58 }},
  '11644': { desc: 'Exc malig face/ear/nose 3.1-4cm', prices: { AETNA: 509.28, 'AH&L': 409.19, BC: 530.28, BCN: 530.28, CIGNA: 409.19, HAP: 409.19, MR: 425.00, PRIOR: 575.00, UHC: 619.54, PTPAY: 524, OTHER: 530.28 }},
  '11646': { desc: 'Exc malig face/ear/nose >4cm', prices: { AETNA: 648.68, 'AH&L': 528.44, BC: 675.48, BCN: 675.48, CIGNA: 528.44, HAP: 528.44, MR: 545.00, PRIOR: 733.00, UHC: 797.22, PTPAY: 651, OTHER: 675.48 }},

  // Destruction/LN2 - Premalignant
  '17000': { desc: 'ED/LN2/AK 1st lesion', prices: { AETNA: 80.92, 'AH&L': 79.9, BC: 86.1, BCN: 86.1, CIGNA: 79.9, HAP: 79.9, MR: 66.28, PRIOR: 93.43, UHC: 76.53, PTPAY: 98, OTHER: 86.1 }},
  '17003': { desc: 'ED/LN2/AK 2-14 each', prices: { AETNA: 7.93, 'AH&L': 7.13, BC: 8.4, BCN: 8.4, CIGNA: 7.13, HAP: 7.13, MR: 6.17, PRIOR: 9.12, UHC: 6.54, PTPAY: 22, OTHER: 8.4 }, isSequential: true },
  '17004': { desc: 'ED/LN2/AK 15+ lesions', prices: { AETNA: 203.62, 'AH&L': 172.07, BC: 210, BCN: 210, CIGNA: 172.07, HAP: 172.07, MR: 161.34, PRIOR: 227.89, UHC: 172.7, PTPAY: 288, OTHER: 210 }},

  // Destruction - Benign
  '17110': { desc: 'MC/Flat/SK/V/Milia 1-14', prices: { AETNA: 135.8, 'AH&L': 108.7, BC: 142.8, BCN: 142.8, CIGNA: 108.7, HAP: 108.7, MR: 109.49, PRIOR: 154.97, UHC: 126.16, PTPAY: 134, OTHER: 142.8 }},
  '17111': { desc: 'MC/Flat/SK/V/Milia 15+', prices: { AETNA: 159.2, 'AH&L': 129.34, BC: 167.58, BCN: 167.58, CIGNA: 129.34, HAP: 129.34, MR: 128.42, PRIOR: 181.85, UHC: 150.39, PTPAY: 156, OTHER: 167.58 }},

  // Destruction - Malignant (ED&C) Trunk/Arms/Legs
  '17260': { desc: 'DEF Malig trunk/arm/leg ≤0.5cm', prices: { AETNA: 121.04, 'AH&L': 94, BC: 126, BCN: 126, CIGNA: 94, HAP: 94, MR: 96.5, PRIOR: 136.74, UHC: 109.5, PTPAY: 137, OTHER: 126 }},
  '17261': { desc: 'DEF Malig trunk/arm/leg 0.6-1cm', prices: { AETNA: 178.19, 'AH&L': 143.29, BC: 187.32, BCN: 187.32, CIGNA: 143.29, HAP: 143.29, MR: 143.52, PRIOR: 203.29, UHC: 164.34, PTPAY: 200, OTHER: 187.32 }},
  '17262': { desc: 'ED&C trunk/arm/leg 1.1-2cm', prices: { AETNA: 215.95, 'AH&L': 174.33, BC: 224.7, BCN: 224.7, CIGNA: 174.33, HAP: 174.33, MR: 173, PRIOR: 243.84, UHC: 201.28, PTPAY: 245, OTHER: 224.7 }},
  '17263': { desc: 'DEF Malig trunk/arm/leg 2.1-3cm', prices: { AETNA: 233.55, 'AH&L': 190.8, BC: 243.6, BCN: 243.6, CIGNA: 190.8, HAP: 190.8, MR: 187.89, PRIOR: 264.35, UHC: 220.14, PTPAY: 295, OTHER: 243.6 }},
  '17264': { desc: 'DEF Malig trunk/arm/leg 3.1-4cm', prices: { AETNA: 281.45, 'AH&L': 223.00, BC: 294.06, BCN: 294.06, CIGNA: 223.00, HAP: 223.00, MR: 230.00, PRIOR: 320.00, UHC: 334.72, PTPAY: 260, OTHER: 294.06 }},
  '17266': { desc: 'DEF Malig trunk/arm/leg >4cm', prices: { AETNA: 360.08, 'AH&L': 290.35, BC: 376.20, BCN: 376.20, CIGNA: 290.35, HAP: 290.35, MR: 300.00, PRIOR: 408.00, UHC: 432.99, PTPAY: 315, OTHER: 376.20 }},

  // Destruction - Malignant (ED&C) Scalp/Neck/Hands/Feet/Genitalia
  '17270': { desc: 'DEF Malig scalp/neck/hf ≤0.5cm', prices: { AETNA: 181.44, 'AH&L': 149.69, BC: 189.84, BCN: 189.84, CIGNA: 149.69, HAP: 149.69, MR: 146.52, PRIOR: 206.02, UHC: 173.3, PTPAY: 215, OTHER: 189.84 }},
  '17271': { desc: 'DEF Malig scalp/neck/hf 0.6-1cm', prices: { AETNA: 201.54, 'AH&L': 163.53, BC: 210.42, BCN: 210.42, CIGNA: 163.53, HAP: 163.53, MR: 161.69, PRIOR: 228.35, UHC: 188, PTPAY: 245, OTHER: 210.42 }},
  '17272': { desc: 'DEF Malig scalp/neck/hf 1.1-2cm', prices: { AETNA: 228.42, 'AH&L': 186.21, BC: 237.72, BCN: 237.72, CIGNA: 186.21, HAP: 186.21, MR: 183.36, PRIOR: 257.97, UHC: 214.6, PTPAY: 267, OTHER: 237.72 }},
  '17273': { desc: 'DEF Malig scalp/neck/hf 2.1-3cm', prices: { AETNA: 253.42, 'AH&L': 207.84, BC: 264.18, BCN: 264.18, CIGNA: 207.84, HAP: 207.84, MR: 204.15, PRIOR: 286.69, UHC: 240.02, PTPAY: 297, OTHER: 264.18 }},
  '17274': { desc: 'DEF Malig scalp/neck/hf 3.1-4cm', prices: { AETNA: 168.85, 'AH&L': 140.35, BC: 178.08, BCN: 178.08, CIGNA: 140.35, HAP: 140.35, MR: 140.00, PRIOR: 193.00, UHC: 162.17, PTPAY: 225, OTHER: 178.08 }},
  '17276': { desc: 'DEF Malig scalp/neck/hf >4cm', prices: { AETNA: 385.75, 'AH&L': 311.60, BC: 403.14, BCN: 403.14, CIGNA: 311.60, HAP: 311.60, MR: 325.00, PRIOR: 438.00, UHC: 466.73, PTPAY: 340, OTHER: 403.14 }},

  // Destruction - Malignant (ED&C) Face/Ears/Eyelids/Nose/Lips
  '17280': { desc: 'DEF Malig face/ear/nose ≤0.5cm', prices: { AETNA: 168.85, 'AH&L': 140.35, BC: 178.08, BCN: 178.08, CIGNA: 140.35, HAP: 140.35, MR: 137.72, PRIOR: 193.25, UHC: 162.17, PTPAY: 225, OTHER: 178.08 }},
  '17281': { desc: 'DEF Malig face/ear/nose 0.6-1cm', prices: { AETNA: 218.12, 'AH&L': 178.04, BC: 227.22, BCN: 227.22, CIGNA: 178.04, HAP: 178.04, MR: 175.33, PRIOR: 246.57, UHC: 205.49, PTPAY: 245, OTHER: 227.22 }},
  '17282': { desc: 'DEF Malig face/ear/nose 1.1-2cm', prices: { AETNA: 249.49, 'AH&L': 204.57, BC: 259.56, BCN: 259.56, CIGNA: 204.57, HAP: 204.57, MR: 200.59, PRIOR: 281.67, UHC: 236.06, PTPAY: 295, OTHER: 259.56 }},
  '17283': { desc: 'DEF Malig face/ear/nose 2.1-3cm', prices: { AETNA: 295.3, 'AH&L': 245.85, BC: 307.44, BCN: 307.44, CIGNA: 245.85, HAP: 245.85, MR: 237.93, PRIOR: 333.64, UHC: 283.55, PTPAY: 352, OTHER: 307.44 }},
  '17284': { desc: 'DEF Malig face/ear/nose 3.1-4cm', prices: { AETNA: 326.25, 'AH&L': 260.78, BC: 340.86, BCN: 340.86, CIGNA: 260.78, HAP: 260.78, MR: 270.00, PRIOR: 370.00, UHC: 396.08, PTPAY: 300, OTHER: 340.86 }},
  '17286': { desc: 'DEF Malig face/ear/nose >4cm', prices: { AETNA: 423.89, 'AH&L': 345.48, BC: 442.86, BCN: 442.86, CIGNA: 345.48, HAP: 345.48, MR: 355.00, PRIOR: 481.00, UHC: 521.42, PTPAY: 370, OTHER: 442.86 }},

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
  '12031': { desc: 'Intermed repair trunk/ext ≤2.5cm', prices: { AETNA: 317.44, 'AH&L': 234.21, BC: 328.44, BCN: 328.44, CIGNA: 234.21, HAP: 234.21, MR: 258.58, PRIOR: 356.42, UHC: 273.38, PTPAY: 0, OTHER: 328.44 }},
  '12032': { desc: 'Intermed repair trunk/ext 2.6-7.5cm', prices: { AETNA: 366.75, 'AH&L': 302.48, BC: 381.78, BCN: 381.78, CIGNA: 302.48, HAP: 302.48, MR: 298.26, PRIOR: 414.31, UHC: 348.9, PTPAY: 0, OTHER: 381.78 }},
  '12034': { desc: 'Intermed repair trunk/ext 7.6-12.5cm', prices: { AETNA: 405.03, 'AH&L': 309.76, BC: 419.58, BCN: 419.58, CIGNA: 309.76, HAP: 309.76, MR: 335.75, PRIOR: 455.32, UHC: 360.98, PTPAY: 0, OTHER: 419.58 }},
  '12035': { desc: 'Intermed repair trunk/ext 12.6-20cm', prices: { AETNA: 340.62, 'AH&L': 331.94, BC: 356.40, BCN: 356.40, CIGNA: 331.94, HAP: 331.94, MR: 290.00, PRIOR: 385.00, UHC: 363.61, PTPAY: 360, OTHER: 356.40 }},
  '12036': { desc: 'Intermed repair trunk/ext 20.1-30cm', prices: { AETNA: 415.31, 'AH&L': 413.05, BC: 434.46, BCN: 434.46, CIGNA: 413.05, HAP: 413.05, MR: 355.00, PRIOR: 470.00, UHC: 449.85, PTPAY: 435, OTHER: 434.46 }},
  '12037': { desc: 'Intermed repair trunk/ext >30cm', prices: { AETNA: 521.27, 'AH&L': 527.52, BC: 545.40, BCN: 545.40, CIGNA: 527.52, HAP: 527.52, MR: 445.00, PRIOR: 590.00, UHC: 571.93, PTPAY: 550, OTHER: 545.40 }},

  // Intermediate Repairs - Scalp/Axillae/Trunk/Ext
  '12041': { desc: 'Intermed repair neck/hf/gen ≤2.5cm', prices: { AETNA: 319.05, 'AH&L': 238.79, BC: 418.62, BCN: 418.62, CIGNA: 238.79, HAP: 238.79, MR: 262.08, PRIOR: 358.24, UHC: 273.02, PTPAY: 0, OTHER: 418.62 }},
  '12042': { desc: 'Intermed repair neck/hf/gen 2.6-7.5cm', prices: { AETNA: 374.92, 'AH&L': 288.18, BC: 493.19, BCN: 493.19, CIGNA: 288.18, HAP: 288.18, MR: 304.68, PRIOR: 422.06, UHC: 334, PTPAY: 0, OTHER: 493.19 }},
  '12044': { desc: 'Intermed repair neck/hf/gen 7.6-12.5cm', prices: { AETNA: 461.38, 'AH&L': 352.15, BC: 609.83, BCN: 609.83, CIGNA: 352.15, HAP: 352.15, MR: 388.77, PRIOR: 521.87, UHC: 413.61, PTPAY: 0, OTHER: 609.83 }},
  '12045': { desc: 'Intermed repair neck/hf/gen 12.6-20cm', prices: { AETNA: 381.47, 'AH&L': 377.22, BC: 399.12, BCN: 399.12, CIGNA: 377.22, HAP: 377.22, MR: 325.00, PRIOR: 430.00, UHC: 412.68, PTPAY: 400, OTHER: 399.12 }},
  '12046': { desc: 'Intermed repair neck/hf/gen 20.1-30cm', prices: { AETNA: 471.85, 'AH&L': 475.88, BC: 493.68, BCN: 493.68, CIGNA: 475.88, HAP: 475.88, MR: 405.00, PRIOR: 535.00, UHC: 517.33, PTPAY: 495, OTHER: 493.68 }},
  '12047': { desc: 'Intermed repair neck/hf/gen >30cm', prices: { AETNA: 601.84, 'AH&L': 616.61, BC: 629.58, BCN: 629.58, CIGNA: 616.61, HAP: 616.61, MR: 515.00, PRIOR: 680.00, UHC: 666.84, PTPAY: 630, OTHER: 629.58 }},

  // Intermediate Repairs - Face/Ears/Eyelids/Nose/Lips/Mucous
  '12051': { desc: 'Intermed repair face/ear/nose ≤2.5cm', prices: { AETNA: 343.15, 'AH&L': 258.45, BC: 448.98, BCN: 448.98, CIGNA: 258.45, HAP: 258.45, MR: 282.64, PRIOR: 384.22, UHC: 297.24, PTPAY: 0, OTHER: 448.98 }},
  '12052': { desc: 'Intermed repair face/ear/nose 2.6-5cm', prices: { AETNA: 382.9, 'AH&L': 295.95, BC: 501.71, BCN: 501.71, CIGNA: 295.95, HAP: 295.95, MR: 312.51, PRIOR: 429.34, UHC: 339.76, PTPAY: 0, OTHER: 501.71 }},
  '12053': { desc: 'Intermed repair face/ear/nose 5.1-7.5cm', prices: { AETNA: 441.25, 'AH&L': 342.48, BC: 576.81, BCN: 576.81, CIGNA: 342.48, HAP: 342.48, MR: 361.43, PRIOR: 493.61, UHC: 398.19, PTPAY: 0, OTHER: 576.81 }},
  '12054': { desc: 'Intermed repair face/ear/nose 7.6-12.5cm', prices: { AETNA: 467.93, 'AH&L': 365.7, BC: 607.16, BCN: 607.16, CIGNA: 365.7, HAP: 365.7, MR: 393.7, PRIOR: 519.59, UHC: 415.93, PTPAY: 0, OTHER: 607.16 }},
  '12055': { desc: 'Intermed repair face/ear/nose 12.6-20cm', prices: { AETNA: 467.54, 'AH&L': 476.52, BC: 489.18, BCN: 489.18, CIGNA: 476.52, HAP: 476.52, MR: 400.00, PRIOR: 528.00, UHC: 516.37, PTPAY: 490, OTHER: 489.18 }},
  '12056': { desc: 'Intermed repair face/ear/nose 20.1-30cm', prices: { AETNA: 583.42, 'AH&L': 604.34, BC: 610.44, BCN: 610.44, CIGNA: 604.34, HAP: 604.34, MR: 500.00, PRIOR: 660.00, UHC: 651.91, PTPAY: 615, OTHER: 610.44 }},
  '12057': { desc: 'Intermed repair face/ear/nose >30cm', prices: { AETNA: 739.66, 'AH&L': 776.98, BC: 773.82, BCN: 773.82, CIGNA: 776.98, HAP: 776.98, MR: 635.00, PRIOR: 837.00, UHC: 834.20, PTPAY: 775, OTHER: 773.82 }},

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
  '10040': { desc: 'Acne/Milia/Comedones IL/N2', prices: { AETNA: 139.91, 'AH&L': 102.71, BC: 146.16, BCN: 146.16, CIGNA: 102.71, HAP: 102.71, MR: 0, PRIOR: 0, UHC: 118.1, PTPAY: 128, OTHER: 146.16 }},
  '10060': { desc: 'I&D abscess simple', prices: { AETNA: 151.74, 'AH&L': 111.66, BC: 161.28, BCN: 161.28, CIGNA: 111.66, HAP: 111.66, MR: 128.61, PRIOR: 175.02, UHC: 134.67, PTPAY: 160, OTHER: 161.28 }},
  '10061': { desc: 'I&D abscess complicated', prices: { AETNA: 259.2, 'AH&L': 197.68, BC: 270.48, BCN: 270.48, CIGNA: 197.68, HAP: 197.68, MR: 223.15, PRIOR: 293.52, UHC: 238.55, PTPAY: 240, OTHER: 270.48 }},
  '10080': { desc: 'I&D pilonidal cyst simple', prices: { AETNA: 152.49, 'AH&L': 136.48, BC: 159.54, BCN: 159.54, CIGNA: 136.48, HAP: 136.48, MR: 130.00, PRIOR: 175.00, UHC: 154.35, PTPAY: 165, OTHER: 159.54 }},
  '10081': { desc: 'I&D pilonidal cyst complicated', prices: { AETNA: 270.85, 'AH&L': 256.51, BC: 283.32, BCN: 283.32, CIGNA: 256.51, HAP: 256.51, MR: 235.00, PRIOR: 310.00, UHC: 285.72, PTPAY: 290, OTHER: 283.32 }},
  '10120': { desc: 'Foreign body simple', prices: { AETNA: 182.43, 'AH&L': 138.21, BC: 242.33, BCN: 242.33, CIGNA: 138.21, HAP: 138.21, MR: 156.57, PRIOR: 207.39, UHC: 173.99, PTPAY: 240, OTHER: 242.33 }},
  '10121': { desc: 'Foreign body complicated', prices: { AETNA: 321.55, 'AH&L': 270.5, BC: 423.42, BCN: 423.42, CIGNA: 270.5, HAP: 270.5, MR: 277.86, PRIOR: 362.34, UHC: 316.18, PTPAY: 425, OTHER: 423.42 }},
  '10140': { desc: 'I&D hematoma/seroma', prices: { AETNA: 204.62, 'AH&L': 158.19, BC: 213.78, BCN: 213.78, CIGNA: 158.19, HAP: 158.19, MR: 175.11, PRIOR: 231.99, UHC: 187.6, PTPAY: 195, OTHER: 213.78 }},
  '10160': { desc: 'Puncture aspiration abscess/cyst', prices: { AETNA: 105.00, 'AH&L': 93.43, BC: 109.86, BCN: 109.86, CIGNA: 93.43, HAP: 93.43, MR: 90.00, PRIOR: 120.00, UHC: 106.29, PTPAY: 115, OTHER: 109.86 }},

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

  // Pathology (AH&L shows "NO" in spreadsheet - using 0)
  '88304': { desc: 'Path Level III', prices: { AETNA: 50.78, 'AH&L': 0, BC: 68.17, BCN: 0, CIGNA: 60.07, HAP: 60.07, MR: 10.48, PRIOR: 64.22, UHC: 41.73, PTPAY: 110, OTHER: 68.17 }, isPath: true },
  '88305': { desc: 'Path Level IV', prices: { AETNA: 86.13, 'AH&L': 0, BC: 105.03, BCN: 0, CIGNA: 102.27, HAP: 102.27, MR: 34.94, PRIOR: 107.87, UHC: 69.84, PTPAY: 110, OTHER: 105.03 }, isPath: true },
  '88312': { desc: 'Special stain Group I', prices: { AETNA: 133.55, 'AH&L': 0, BC: 178.42, BCN: 0, CIGNA: 90.50, HAP: 90.50, MR: 25.03, PRIOR: 168.08, UHC: 99.50, PTPAY: 0, OTHER: 178.42 }, isPath: true },
  '88313': { desc: 'Special stain Group II', prices: { AETNA: 96.73, 'AH&L': 0, BC: 131.02, BCN: 0, CIGNA: 63.67, HAP: 63.67, MR: 11.47, PRIOR: 123.43, UHC: 70.58, PTPAY: 0, OTHER: 131.02 }, isPath: true },
  '88342': { desc: 'Immunohistochemistry', prices: { AETNA: 119.66, 'AH&L': 0, BC: 179.49, BCN: 0, CIGNA: 102.45, HAP: 102.45, MR: 32.62, PRIOR: 169.09, UHC: 108.28, PTPAY: 0, OTHER: 179.49 }, isPath: true },
  '88341': { desc: 'Immunohistochem (addl)', prices: { AETNA: 102.98, 'AH&L': 0, BC: 153.92, BCN: 0, CIGNA: 62.18, HAP: 62.18, MR: 26.67, PRIOR: 145, UHC: 91.84, PTPAY: 0, OTHER: 153.92 }, isPath: true },

  // Unit-Based (Injections)
  'J0585': { desc: 'Botox per unit (medical)', prices: { AETNA: 6.60, 'AH&L': 6.32, BC: 6.38, BCN: 6.38, CIGNA: 6.32, HAP: 6.32, MR: 0, PRIOR: 6.65, UHC: 6.23, PTPAY: 7, OTHER: 6.38 }, isUnitBased: true },
  'J0586': { desc: 'Dysport per unit', prices: { AETNA: 1.50, 'AH&L': 1.44, BC: 1.45, BCN: 1.45, CIGNA: 1.44, HAP: 1.44, MR: 0, PRIOR: 1.50, UHC: 1.42, PTPAY: 2, OTHER: 1.45 }, isUnitBased: true },
  'J1020': { desc: 'Injection IM 1cc - 20mg', prices: { AETNA: 7.3, 'AH&L': 7.04, BC: 2.97, BCN: 2.97, CIGNA: 7.04, HAP: 7.04, MR: 8.01, PRIOR: 7.3, UHC: 1.49, PTPAY: 34, OTHER: 2.97 }, isUnitBased: true },
  'J1100': { desc: 'Dexamethasone per 4mg', prices: { AETNA: 1.20, 'AH&L': 1.10, BC: 1.15, BCN: 1.15, CIGNA: 1.10, HAP: 1.10, MR: 0, PRIOR: 1.20, UHC: 1.08, PTPAY: 2, OTHER: 1.15 }, isUnitBased: true },
  'J3301': { desc: 'Kenalog 10mg', prices: { AETNA: 8.50, 'AH&L': 8.10, BC: 8.20, BCN: 8.20, CIGNA: 8.10, HAP: 8.10, MR: 0, PRIOR: 8.50, UHC: 8.00, PTPAY: 10, OTHER: 8.20 }, isUnitBased: true },
  'J7308': { desc: 'PDT (Photodynamic Therapy)', prices: { AETNA: 408.88, 'AH&L': 392.32, BC: 401.85, BCN: 401.85, CIGNA: 392.32, HAP: 392.32, MR: 389.83, PRIOR: 411.95, UHC: 393.46, PTPAY: 390, OTHER: 401.85 }},

  // Injections - Lesions
  '11900': { desc: 'Inject intralesional ≤7 lesions', prices: { AETNA: 68.91, 'AH&L': 55.43, BC: 72.24, BCN: 72.24, CIGNA: 55.43, HAP: 55.43, MR: 56.59, PRIOR: 78.4, UHC: 64.05, PTPAY: 78, OTHER: 72.24 }},
  '11901': { desc: 'Inject intralesional >7 lesions', prices: { AETNA: 84.9, 'AH&L': 70.18, BC: 88.2, BCN: 88.2, CIGNA: 70.18, HAP: 70.18, MR: 69, PRIOR: 95.72, UHC: 81.16, PTPAY: 98, OTHER: 88.2 }},

  // Chemical Peels / Dermabrasion
  '15788': { desc: 'Epidermal Peel', prices: { AETNA: 464.8, 'AH&L': 450.66, BC: 486.36, BCN: 486.36, CIGNA: 450.66, HAP: 450.66, MR: 0, PRIOR: 0, UHC: 0, PTPAY: 0, OTHER: 486.36 }},

  // LN2 for acne
  '17340': { desc: 'LN2 for acne', prices: { AETNA: 64.7, 'AH&L': 0, BC: 84.68, BCN: 0, CIGNA: 0, HAP: 0, MR: 0, PRIOR: 0, UHC: 0, PTPAY: 0, OTHER: 84.68 }},

  // Finger/Hand
  '26010': { desc: 'Drainage of finger abscess', prices: { AETNA: 529, 'AH&L': 256.85, BC: 534.73, BCN: 534.73, CIGNA: 256.85, HAP: 256.85, MR: 370.52, PRIOR: 534.46, UHC: 302.03, PTPAY: 0, OTHER: 534.73 }},

  // Intranasal
  '30100': { desc: 'Intranasal Biopsy', prices: { AETNA: 191.82, 'AH&L': 142.18, BC: 221.56, BCN: 221.56, CIGNA: 142.18, HAP: 142.18, MR: 140.55, PRIOR: 195.08, UHC: 160.26, PTPAY: 0, OTHER: 221.56 }},

  // Specialty Biopsies - Oral
  '40490': { desc: 'R/O Biopsy Lip', prices: { AETNA: 161.01, 'AH&L': 129.55, BC: 153.72, BCN: 153.72, CIGNA: 129.55, HAP: 129.55, MR: 120.32, PRIOR: 222.08, UHC: 187.48, PTPAY: 185, OTHER: 153.72 }},
  '40808': { desc: 'R/O Biopsy inside mouth', prices: { AETNA: 220.15, 'AH&L': 184.66, BC: 268.96, BCN: 268.96, CIGNA: 184.66, HAP: 184.66, MR: 166.69, PRIOR: 306.41, UHC: 271.27, PTPAY: 290, OTHER: 268.96 }},
  '41100': { desc: 'R/O Biopsy Tongue', prices: { AETNA: 245.81, 'AH&L': 170.97, BC: 297.72, BCN: 297.72, CIGNA: 170.97, HAP: 170.97, MR: 187.65, PRIOR: 339.18, UHC: 246, PTPAY: 275, OTHER: 297.72 }},

  // Specialty Biopsies - Penile
  '54055': { desc: 'ED Penile Lesions', prices: { AETNA: 180.05, 'AH&L': 118.06, BC: 224.22, BCN: 224.22, CIGNA: 118.06, HAP: 118.06, MR: 139.2, PRIOR: 228.38, UHC: 137.66, PTPAY: 195, OTHER: 224.22 }},
  '54056': { desc: 'Cryo Penile Lesions', prices: { AETNA: 188, 'AH&L': 141, BC: 185.64, BCN: 185.64, CIGNA: 141, HAP: 141, MR: 143.52, PRIOR: 239.77, UHC: 164.17, PTPAY: 168, OTHER: 185.64 }},
  '54060': { desc: 'Surg Rem Penile', prices: { AETNA: 255.16, 'AH&L': 182.26, BC: 314.77, BCN: 314.77, CIGNA: 182.26, HAP: 182.26, MR: 202.07, PRIOR: 320.6, UHC: 208.1, PTPAY: 285, OTHER: 314.77 }},
  '54100': { desc: 'R/O Biopsy Penis', prices: { AETNA: 264.71, 'AH&L': 198.47, BC: 323.29, BCN: 323.29, CIGNA: 198.47, HAP: 198.47, MR: 202.95, PRIOR: 329.27, UHC: 229.44, PTPAY: 307, OTHER: 323.29 }},

  // Specialty Biopsies - Gynecologic
  '56605': { desc: 'R/O Biopsy Vulva', prices: { AETNA: 123.58, 'AH&L': 85.04, BC: 120.54, BCN: 120.54, CIGNA: 85.04, HAP: 85.04, MR: 96.4, PRIOR: 144.74, UHC: 95.72, PTPAY: 295, OTHER: 120.54 }},
  '57100': { desc: 'R/O Biopsy Vaginal mucosa', prices: { AETNA: 132.15, 'AH&L': 90.78, BC: 165.11, BCN: 165.11, CIGNA: 90.78, HAP: 90.78, MR: 108.2, PRIOR: 156.34, UHC: 105.07, PTPAY: 245, OTHER: 165.11 }},

  // Botox - Axilla (hyperhidrosis)
  '64650': { desc: 'Botox injection Axilla', prices: { AETNA: 120.34, 'AH&L': 107.83, BC: 140.07, BCN: 140.07, CIGNA: 107.83, HAP: 107.83, MR: 0, PRIOR: 152.12, UHC: 90.24, PTPAY: 165, OTHER: 140.07 }},

  // Specialty Biopsies - Other
  '67810': { desc: 'R/O Biopsy Eyelid', prices: { AETNA: 258, 'AH&L': 213.36, BC: 288.14, BCN: 288.14, CIGNA: 213.36, HAP: 213.36, MR: 178.69, PRIOR: 315.56, UHC: 195.93, PTPAY: 309, OTHER: 288.14 }},
  '69100': { desc: 'R/O Biopsy Ear', prices: { AETNA: 126.3, 'AH&L': 101.6, BC: 150.73, BCN: 150.73, CIGNA: 101.6, HAP: 101.6, MR: 91.89, PRIOR: 139.25, UHC: 115.55, PTPAY: 165, OTHER: 150.73 }},

  // PDT Codes
  '96567': { desc: 'PDT (no direct physician)', prices: { AETNA: 163.83, 'AH&L': 131.51, BC: 210.38, BCN: 210.38, CIGNA: 131.51, HAP: 131.51, MR: 124.98, PRIOR: 181.4, UHC: 140.46, PTPAY: 205, OTHER: 210.38 }},
  '96573': { desc: 'PDT', prices: { AETNA: 270.36, 'AH&L': 180.76, BC: 350.45, BCN: 350.45, CIGNA: 180.76, HAP: 180.76, MR: 210.54, PRIOR: 302.18, UHC: 197.64, PTPAY: 0, OTHER: 350.45 }},

  // Telederm
  '98005': { desc: 'Telederm x 20 min', prices: { AETNA: 0, 'AH&L': 0, BC: 72.95, BCN: 72.95, CIGNA: 0, HAP: 0, MR: 0, PRIOR: 0, UHC: 0, PTPAY: 0, OTHER: 72.95 }},

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

    // Deductible waterfall and copay logic
    let remainingDed = deductible;
    let pvSurgTowardsDed = 0;
    let pathTowardsDed = 0;
    let ocTowardsDed = 0;
    let pvSurgAfterDed = pvSurgTotal;
    let pathAfterDed = pathTotal;
    let ocAfterDed = ocTotal;

    // Coinsurance
    let pvSurgCoinsurance = 0;
    let pathCoinsurance = 0;
    let ocCoinsurance = 0;

    // Copay logic
    let copayCollected = 0;
    let copayType = null;
    let pathCopayCollected = 0;

    // Special case: Deductible met by PV/Surg + OC with copay
    // If deductible is fully met by PV/surg codes AND there's an OC with a copay:
    // - Charge full deductible (from PV/surg)
    // - Charge OC copay (not blocked)
    // - Apply coinsurance to remaining PV/surg amount
    // - OC does NOT go toward deductible or get coinsurance
    const deductibleCanBeMetByPvSurg = deductible > 0 && pvSurgTotal >= deductible;
    const hasOcWithCopay = ocTotal > 0 && ocCopay > 0;
    const specialOcCopayRule = deductibleCanBeMetByPvSurg && hasOcWithCopay;
    let copaysBlocked = false;

    if (deductibleCanBeMetByPvSurg && hasOcWithCopay) {
      // Special rule applies
      pvSurgTowardsDed = deductible;
      pvSurgAfterDed = pvSurgTotal - deductible;
      remainingDed = 0;

      // OC does NOT go toward deductible in this case
      ocTowardsDed = 0;
      ocAfterDed = 0; // OC doesn't get coinsurance either - copay is collected instead

      // Path still goes through normal waterfall (but deductible already met)
      pathTowardsDed = 0;
      pathAfterDed = pathTotal;

      // Apply coinsurance to PV/Surg remainder only
      if (coinsurancePct > 0) {
        pvSurgCoinsurance = pvSurgAfterDed * (coinsurancePct / 100);
      }
      // Path coinsurance still applies
      if (pathCoinsurancePct > 0) {
        pathCoinsurance = pathAfterDed * (pathCoinsurancePct / 100);
      }
      // No OC coinsurance - we're collecting copay instead

      // Collect OC copay
      copayCollected = ocCopay;
      copayType = 'Office Call Copay';

      // Path copay - still blocked if there's coinsurance on path
      if (pathTotal > 0 && pathCopay > 0 && pathCoinsurancePct === 0) {
        pathCopayCollected = pathCopay;
      }
    } else {
      // Standard waterfall logic
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

      // Standard coinsurance
      if (coinsurancePct > 0) {
        pvSurgCoinsurance = pvSurgAfterDed * (coinsurancePct / 100);
        ocCoinsurance = ocAfterDed * (coinsurancePct / 100);
      }
      if (pathCoinsurancePct > 0) {
        pathCoinsurance = pathAfterDed * (pathCoinsurancePct / 100);
      }

      // Standard copay logic
      const hasDeductible = deductible > 0;
      const hasCoinsurance = coinsurancePct > 0 || pathCoinsurancePct > 0;
      copaysBlocked = hasDeductible || hasCoinsurance;

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
    }

    const deductibleApplied = pvSurgTowardsDed + pathTowardsDed + ocTowardsDed;
    const remainingDeductible = remainingDed;
    const totalCoinsurance = pvSurgCoinsurance + pathCoinsurance + ocCoinsurance;

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
      specialOcCopayRule,
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

              {calculations.specialOcCopayRule ? (
                <div className="bg-blue-50 text-blue-700 text-xs p-2 rounded mb-2">
                  ✓ Special Rule: Deductible met by PV/Surg → OC Copay collected + Coinsurance on PV/Surg remainder
                </div>
              ) : calculations.copaysBlocked ? (
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
                dimmed={calculations.copaysBlocked && !calculations.specialOcCopayRule}
              />
              <CalcRow
                label="PV/Surg Copay Available"
                value={formatCurrency(parseFloat(insurance.pvSurgCopay) || 0)}
                dimmed={calculations.copaysBlocked || calculations.specialOcCopayRule}
              />

              {!calculations.copaysBlocked && !calculations.specialOcCopayRule && calculations.copayType && (
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
                  {(isSequential || isUnitBased || codeData?.isPath) && (
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
