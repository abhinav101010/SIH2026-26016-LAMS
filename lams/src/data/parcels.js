/* ============================================================
   NLAMS Land Parcels Mock Data
   ============================================================ */

const PARCEL_BASE = [
  // Haryana - Delhi-Mumbai Expressway
  { id: 'PAR-001', proposalId: 'NLAMS-2026-00124', area: 12.5, owner: 'Ramesh Kumar', status: 'acquired', coordinates: [[77.042, 28.409], [77.068, 28.409], [77.068, 28.384], [77.042, 28.384]], surveyNo: '123/4', village: 'Manesar', acquiredDate: '2026-07-15' },
  { id: 'PAR-002', proposalId: 'NLAMS-2026-00124', area: 8.2, owner: 'Sita Devi', status: 'acquired', coordinates: [[77.072, 28.405], [77.095, 28.405], [77.095, 28.381], [77.072, 28.381]], surveyNo: '124/7', village: 'Manesar', acquiredDate: '2026-07-18' },
  { id: 'PAR-003', proposalId: 'NLAMS-2026-00124', area: 15.3, owner: 'Mohan Lal', status: 'pending', coordinates: [[77.098, 28.402], [77.125, 28.402], [77.125, 28.378], [77.098, 28.378]], surveyNo: '125/3', village: 'Damdma', acquiredDate: null },
  { id: 'PAR-004', proposalId: 'NLAMS-2026-00124', area: 6.0, owner: 'Kishore Kumar', status: 'disputed', coordinates: [[77.128, 28.399], [77.152, 28.399], [77.152, 28.375], [77.128, 28.375]], surveyNo: '126/1', village: 'Damdma', acquiredDate: null },
  // Maharashtra - Mumbai-Ahmedabad HSR
  { id: 'PAR-005', proposalId: 'NLAMS-2026-00123', area: 22.4, owner: 'Patel Brothers', status: 'acquired', coordinates: [[73.006, 20.452], [73.032, 20.452], [73.032, 20.428], [73.006, 20.428]], surveyNo: '45/2', village: 'Thane', acquiredDate: '2026-06-20' },
  { id: 'PAR-006', proposalId: 'NLAMS-2026-00123', area: 18.7, owner: 'Suresh Merchant', status: 'acquired', coordinates: [[73.035, 20.450], [73.062, 20.450], [73.062, 20.426], [73.035, 20.426]], surveyNo: '46/5', village: 'Thane', acquiredDate: '2026-06-22' },
  { id: 'PAR-007', proposalId: 'NLAMS-2026-00123', area: 35.1, owner: 'Municipal Corp', status: 'pending', coordinates: [[73.065, 20.448], [73.098, 20.448], [73.098, 20.424], [73.065, 20.424]], surveyNo: '47/1', village: 'Bhiwandi', acquiredDate: null },
  // Tamil Nadu - Chennai-Bengaluru
  { id: 'PAR-008', proposalId: 'NLAMS-2026-00122', area: 45.2, owner: 'Tamil Nadu Horticulture', status: 'acquired', coordinates: [[78.650, 12.961], [78.682, 12.961], [78.682, 12.935], [78.650, 12.935]], surveyNo: '88/3', village: 'Hosur', acquiredDate: '2026-05-10' },
  { id: 'PAR-009', proposalId: 'NLAMS-2026-00122', area: 38.6, owner: 'Raja Rani Industries', status: 'acquired', coordinates: [[78.685, 12.959], [78.718, 12.959], [78.718, 12.933], [78.685, 12.933]], surveyNo: '89/2', village: 'Hosur', acquiredDate: '2026-05-15' },
  { id: 'PAR-010', proposalId: 'NLAMS-2026-00122', area: 26.3, owner: 'Singh Family', status: 'acquired', coordinates: [[78.722, 12.957], [78.752, 12.957], [78.752, 12.931], [78.722, 12.931]], surveyNo: '90/7', village: 'Hosur', acquiredDate: '2026-05-20' },
  // Rajasthan - Power Line
  { id: 'PAR-011', proposalId: 'NLAMS-2026-00121', area: 5.5, owner: 'Kumar Estate', status: 'pending', coordinates: [[75.550, 25.204], [75.575, 25.204], [75.575, 25.186], [75.550, 25.186]], surveyNo: '12/8', village: 'Kota', acquiredDate: null },
  { id: 'PAR-012', proposalId: 'NLAMS-2026-00121', area: 12.8, owner: 'Sharma Traders', status: 'notification', coordinates: [[75.580, 25.202], [75.610, 25.202], [75.610, 25.184], [75.580, 25.184]], surveyNo: '13/4', village: 'Kota', acquiredDate: null },
  // Telangana - Hyderabad Metro
  { id: 'PAR-013', proposalId: 'NLAMS-2026-00120', area: 3.2, owner: 'Reddy Properties', status: 'acquired', coordinates: [[78.650, 17.385], [78.675, 17.385], [78.675, 17.367], [78.650, 17.367]], surveyNo: '56/1', village: 'Hyderabad', acquiredDate: '2026-04-12' },
  { id: 'PAR-014', proposalId: 'NLAMS-2026-00120', area: 4.5, owner: 'Kiran Constructions', status: 'disputed', coordinates: [[78.680, 17.383], [78.705, 17.383], [78.705, 17.365], [78.680, 17.365]], surveyNo: '57/3', village: 'Hyderabad', acquiredDate: null },
  // Uttar Pradesh - Lucknow-Agra
  { id: 'PAR-015', proposalId: 'NLAMS-2026-00119', area: 8.8, owner: 'Agarwal Farms', status: 'notification', coordinates: [[77.950, 27.150], [77.975, 27.150], [77.975, 27.128], [77.950, 27.128]], surveyNo: '33/5', village: 'Agra', acquiredDate: null },
  { id: 'PAR-016', proposalId: 'NLAMS-2026-00119', area: 11.2, owner: 'Yadav Ranch', status: 'pending', coordinates: [[77.980, 27.148], [78.010, 27.148], [78.010, 27.126], [77.980, 27.126]], surveyNo: '34/2', village: 'Agra', acquiredDate: null },
  { id: 'PAR-017', proposalId: 'NLAMS-2026-00119', area: 9.5, owner: 'Sharma Lands', status: 'acquired', coordinates: [[78.015, 27.146], [78.045, 27.146], [78.045, 27.124], [78.015, 27.124]], surveyNo: '35/1', village: 'Fatehpur', acquiredDate: '2026-06-01' },
  // Bihar - Patna Metro
  { id: 'PAR-018', proposalId: 'NLAMS-2026-00112', area: 4.2, owner: 'Patna Rice Mills', status: 'review', coordinates: [[85.200, 25.610], [85.225, 25.610], [85.225, 25.588], [85.200, 25.588]], surveyNo: '78/4', village: 'Patna', acquiredDate: null },
  { id: 'PAR-019', proposalId: 'NLAMS-2026-00112', area: 3.8, owner: 'Kumar Residency', status: 'review', coordinates: [[85.230, 25.608], [85.255, 25.608], [85.255, 25.586], [85.230, 25.586]], surveyNo: '79/2', village: 'Patna', acquiredDate: null },
  // Assam - Airport
  { id: 'PAR-020', proposalId: 'NLAMS-2026-00111', area: 12.5, owner: 'Assam Tea Estate', status: 'acquired', coordinates: [[91.700, 26.120], [91.730, 26.120], [91.730, 26.098], [91.700, 26.098]], surveyNo: '22/5', village: 'Guwahati', acquiredDate: '2026-03-15' },
]

export const PARCELS = PARCEL_BASE

export const getParcelsByProposal = (proposalId) =>
  PARCELS.filter((p) => p.proposalId === proposalId)

export const getParcelsByStatus = (status) =>
  PARCELS.filter((p) => p.status === status)

export const ALL_PARCELS = PARCELS
