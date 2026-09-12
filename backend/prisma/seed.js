const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.landParcel.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.proposal.deleteMany()

  const hashedPassword = await bcrypt.hash('123456', 10)

  const departments = [
    { name: 'NHAI', code: 'NHAI', description: 'National Highways Authority of India' },
    { name: 'Indian Railways', code: 'IR', description: 'Indian Railways' },
    { name: 'Ministry of Road Transport & Highways', code: 'MORTH', description: 'Ministry of Road Transport & Highways' },
    { name: 'Ministry of Commerce', code: 'MOC', description: 'Ministry of Commerce' },
    { name: 'Power Grid Corporation', code: 'PGCIL', description: 'Power Grid Corporation' },
    { name: 'Hyderabad Metro Rail', code: 'HMRL', description: 'Hyderabad Metro Rail' },
    { name: 'Uttar Pradesh PWD', code: 'UPPWD', description: 'Uttar Pradesh Public Works Department' },
    { name: 'KMRL', code: 'KMRL', description: 'Kochi Metro Rail Limited' },
    { name: 'NCRTC', code: 'NCRTC', description: 'National Capital Region Transport Corporation' },
    { name: 'Bhubaneswar Smart City', code: 'BSCL', description: 'Bhubaneswar Smart City Limited' },
    { name: 'Karnataka PWD', code: 'KPWD', description: 'Karnataka Public Works Department' },
    { name: 'GAIL', code: 'GAIL', description: 'Gas Authority of India Limited' },
    { name: 'Patna Metro Rail', code: 'PMR', description: 'Patna Metro Rail' },
    { name: 'Airports Authority of India', code: 'AAI', description: 'Airports Authority of India' },
  ]

  const deptMap = {}
  for (const d of departments) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    })
    deptMap[d.name] = dept.id
    console.log('Department ready:', d.name)
  }

  const users = await prisma.user.createMany({
    data: [
      {
        name: 'Abhinav Sharma',
        email: 'admin@bharatbhoomi.gov.in',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        department: 'Ministry of Road Transport & Highways',
        departmentId: deptMap['Ministry of Road Transport & Highways'],
        phone: '+91-98765-43210',
        employeeId: 'Bharat Bhoomi/ADMIN/001',
        joinedDate: new Date('2024-03-15'),
        lastLogin: new Date('2026-08-31T10:30:00+05:30'),
      },
      {
        name: 'Rahul Verma',
        email: 'proposal@gmail.com',
        password: hashedPassword,
        role: 'PROPOSAL_OFFICER',
        department: 'NHAI',
        departmentId: deptMap['NHAI'],
        phone: '+91-98765-43211',
        employeeId: 'Bharat Bhoomi/OFF/002',
        joinedDate: new Date('2024-04-01'),
      },
      {
        name: 'Priya Singh',
        email: 'authority@gmail.com',
        password: hashedPassword,
        role: 'REVIEWING_AUTHORITY',
        department: 'Ministry of Road Transport & Highways',
        departmentId: deptMap['Ministry of Road Transport & Highways'],
        phone: '+91-98765-43212',
        employeeId: 'Bharat Bhoomi/REV/003',
        joinedDate: new Date('2024-04-15'),
      },
      {
        name: 'Amit Kumar',
        email: 'fieldoff@gmail.com',
        password: hashedPassword,
        role: 'FIELD_OFFICER',
        department: 'NHAI',
        departmentId: deptMap['NHAI'],
        phone: '+91-98765-43213',
        employeeId: 'Bharat Bhoomi/FLD/004',
        joinedDate: new Date('2024-05-01'),
      },
      {
        name: 'Sneha Gupta',
        email: 'viewer@gmail.com',
        password: hashedPassword,
        role: 'PROPOSAL_OFFICER',
        department: 'Ministry of Road Transport & Highways',
        departmentId: deptMap['Ministry of Road Transport & Highways'],
        phone: '+91-98765-43214',
        employeeId: 'Bharat Bhoomi/VIEW/005',
        joinedDate: new Date('2024-05-15'),
      },
    ],
    skipDuplicates: true,
  })

  console.log('Users seeded:', users.count)

  const projects = await prisma.project.createMany({
    data: [
      { name: 'Delhi-Mumbai Expressway', type: 'Highway', state: 'Haryana', districts: ['Gurgaon', 'Mahendergarh'], department: 'NHAI', startDate: new Date('2025-01-15'), expectedCompletion: new Date('2027-12-31'), totalLength: 240, status: 'ongoing', budget: 8420, center: [77.05, 28.4], zoom: 10 },
      { name: 'Mumbai-Ahmedabad High-Speed Rail', type: 'Railway', state: 'Maharashtra', districts: ['Ahmedabad', 'Kheda'], department: 'Indian Railways', startDate: new Date('2025-03-20'), expectedCompletion: new Date('2029-06-30'), totalLength: 502, status: 'ongoing', budget: 12800, center: [72.5, 20.4], zoom: 8 },
      { name: 'Chennai-Bengaluru Industrial Corridor', type: 'Industrial Sector', state: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Erode'], department: 'Ministry of Commerce', startDate: new Date('2025-02-10'), expectedCompletion: new Date('2027-06-30'), totalLength: 350, status: 'ongoing', budget: 15600, center: [78.68, 12.96], zoom: 9 },
      { name: 'Amritsar-Kolkata Railway Doubling', type: 'Railway', state: 'Punjab', districts: ['Amritsar', 'Ludhiana', 'Jalandhar'], department: 'Indian Railways', startDate: new Date('2025-04-05'), expectedCompletion: new Date('2027-02-28'), totalLength: 1600, status: 'ongoing', budget: 18200, center: [75.2, 30.9], zoom: 7 },
      { name: 'Ahmedabad-Mumbai High-Speed Rail', type: 'Railway', state: 'Gujarat', districts: ['Ahmedabad', 'Surat'], department: 'Indian Railways', startDate: new Date('2025-05-12'), expectedCompletion: new Date('2026-12-31'), totalLength: 508, status: 'ongoing', budget: 11000, center: [72.55, 20.5], zoom: 8 },
      { name: 'Hyderabad Metro Rail Extension', type: 'Urban Infrastructure', state: 'Telangana', districts: ['Hyderabad', 'Medchal'], department: 'Hyderabad Metro Rail', startDate: new Date('2025-06-18'), expectedCompletion: new Date('2028-03-31'), totalLength: 75, status: 'ongoing', budget: 4250, center: [78.65, 17.37], zoom: 10 },
    ],
    skipDuplicates: true,
  })

  console.log('Projects seeded:', projects.count)

  const proposals = [
    { proposalNumber: 'Bharat Bhoomi-2026-00124', projectName: 'Delhi–Mumbai Expressway (Phase II)', projectType: 'Highway', department: 'NHAI', departmentId: deptMap['NHAI'], state: 'Haryana', district: 'Gurugram', totalLandRequired: 240, numberOfParcels: 4, landType: 'Agricultural', affectedFamilies: 342, purpose: 'Expansion of the Delhi–Mumbai Expressway.', estimatedCost: 8420, status: 'APPROVED', priority: 'High', progress: 78, submittedDate: new Date('2026-08-24'), targetCompletion: new Date('2027-03-15'), description: 'Expansion of the Delhi–Mumbai Expressway.', currentStage: 'Notification', submittedBy: 'NHAI' },
    { proposalNumber: 'Bharat Bhoomi-2026-00123', projectName: 'Mumbai-Ahmedabad High-Speed Rail Corridor', projectType: 'Railway', department: 'Indian Railways', departmentId: deptMap['Indian Railways'], state: 'Maharashtra', district: 'Ahmednagar', totalLandRequired: 560, numberOfParcels: 3, landType: 'Agricultural', affectedFamilies: 890, purpose: 'Bullet train corridor connecting Mumbai and Ahmedabad.', estimatedCost: 12800, status: 'APPROVED', priority: 'Critical', progress: 65, submittedDate: new Date('2026-08-22'), targetCompletion: new Date('2028-06-30'), description: 'Bullet train corridor.', currentStage: 'Award', submittedBy: 'Indian Railways' },
    { proposalNumber: 'Bharat Bhoomi-2026-00122', projectName: 'Chennai-Bengaluru Industrial Corridor', projectType: 'Industrial Sector', department: 'Ministry of Commerce', departmentId: deptMap['Ministry of Commerce'], state: 'Tamil Nadu', district: 'Chennai', totalLandRequired: 1120, numberOfParcels: 3, landType: 'Agricultural', affectedFamilies: 1250, purpose: 'Industrial corridor development.', estimatedCost: 15600, status: 'ACQUIRED', priority: 'High', progress: 95, submittedDate: new Date('2026-08-20'), targetCompletion: new Date('2026-12-31'), description: 'Industrial corridor development.', currentStage: 'Compensation', submittedBy: 'Ministry of Commerce' },
    { proposalNumber: 'Bharat Bhoomi-2026-00121', projectName: 'Jaipur-Kota Transmission Line Upgrade', projectType: 'Power Line', department: 'Power Grid Corporation', departmentId: deptMap['Power Grid Corporation'], state: 'Rajasthan', district: 'Kota', totalLandRequired: 85, numberOfParcels: 2, landType: 'Agricultural', affectedFamilies: 156, purpose: 'Transmission infrastructure upgrade.', estimatedCost: 2100, status: 'UNDER_REVIEW', priority: 'Medium', progress: 42, submittedDate: new Date('2026-08-18'), targetCompletion: new Date('2027-09-30'), description: 'Transmission infrastructure upgrade.', currentStage: 'Administrative Review', submittedBy: 'Power Grid Corporation' },
    { proposalNumber: 'Bharat Bhoomi-2026-00120', projectName: 'Hyderabad Metro Rail Phase III', projectType: 'Urban Infrastructure', department: 'Hyderabad Metro Rail', departmentId: deptMap['Hyderabad Metro Rail'], state: 'Telangana', district: 'Hyderabad', totalLandRequired: 65, numberOfParcels: 2, landType: 'Commercial', affectedFamilies: 89, purpose: 'Metro extension.', estimatedCost: 4250, status: 'APPROVED', priority: 'Medium', progress: 55, submittedDate: new Date('2026-08-15'), targetCompletion: new Date('2028-03-31'), description: 'Metro extension.', currentStage: 'Award', submittedBy: 'Hyderabad Metro Rail' },
    { proposalNumber: 'Bharat Bhoomi-2026-00119', projectName: 'Lucknow-Agra Expressway Maintenance', projectType: 'Highway', department: 'Uttar Pradesh PWD', departmentId: deptMap['Uttar Pradesh PWD'], state: 'Uttar Pradesh', district: 'Agra', totalLandRequired: 120, numberOfParcels: 3, landType: 'Agricultural', affectedFamilies: 210, purpose: 'Highway maintenance.', estimatedCost: 1850, status: 'DRAFT', priority: 'High', progress: 25, submittedDate: new Date('2026-08-12'), targetCompletion: new Date('2027-06-30'), description: 'Highway maintenance.', currentStage: 'Document Verification', submittedBy: 'Uttar Pradesh PWD' },
    { proposalNumber: 'Bharat Bhoomi-2026-00118', projectName: 'Kochi Metro Rail Extension', projectType: 'Urban Infrastructure', department: 'KMRL', departmentId: deptMap['KMRL'], state: 'Kerala', district: 'Ernakulam', totalLandRequired: 45, numberOfParcels: 1, landType: 'Residential', affectedFamilies: 76, purpose: 'Metro extension in Kochi.', estimatedCost: 1980, status: 'UNDER_REVIEW', priority: 'Medium', progress: 38, submittedDate: new Date('2026-08-10'), targetCompletion: new Date('2027-12-31'), description: 'Metro extension in Kochi.', currentStage: 'Administrative Review', submittedBy: 'KMRL' },
    { proposalNumber: 'Bharat Bhoomi-2026-00117', projectName: 'Noida-Greater Noida Metro Line', projectType: 'Urban Infrastructure', department: 'NCRTC', departmentId: deptMap['NCRTC'], state: 'Uttar Pradesh', district: 'Gaziabad', totalLandRequired: 95, numberOfParcels: 2, landType: 'Agricultural', affectedFamilies: 168, purpose: 'Noida-Greater Noida metro.', estimatedCost: 3750, status: 'APPROVED', priority: 'High', progress: 60, submittedDate: new Date('2026-08-08'), targetCompletion: new Date('2027-09-30'), description: 'Noida-Greater Noida metro.', currentStage: 'Award', submittedBy: 'NCRTC' },
    { proposalNumber: 'Bharat Bhoomi-2026-00116', projectName: 'Bhubaneswar Smart City Drainage Project', projectType: 'Urban Infrastructure', department: 'Bhubaneswar Smart City', departmentId: deptMap['Bhubaneswar Smart City'], state: 'Odisha', district: 'Khordha', totalLandRequired: 75, numberOfParcels: 1, landType: 'Wasteland', affectedFamilies: 134, purpose: 'Drainage upgrade.', estimatedCost: 860, status: 'REJECTED', priority: 'Low', progress: 30, submittedDate: new Date('2026-08-05'), targetCompletion: new Date('2027-04-30'), description: 'Drainage upgrade.', currentStage: 'Approved', submittedBy: 'Bhubaneswar Smart City' },
    { proposalNumber: 'Bharat Bhoomi-2026-00115', projectName: 'Amritsar-Kolkata Railway Doubling', projectType: 'Railway', department: 'Indian Railways', departmentId: deptMap['Indian Railways'], state: 'Punjab', district: 'Amritsar', totalLandRequired: 340, numberOfParcels: 3, landType: 'Agricultural', affectedFamilies: 567, purpose: 'Railway doubling.', estimatedCost: 18200, status: 'ACQUIRED', priority: 'High', progress: 92, submittedDate: new Date('2026-08-03'), targetCompletion: new Date('2027-02-28'), description: 'Railway doubling.', currentStage: 'Compensation', submittedBy: 'Indian Railways' },
    { proposalNumber: 'Bharat Bhoomi-2026-00114', projectName: 'Bangalore-Mysore Expressway Land Acquisition', projectType: 'Highway', department: 'Karnataka PWD', departmentId: deptMap['Karnataka PWD'], state: 'Karnataka', district: 'Mandya', totalLandRequired: 180, numberOfParcels: 2, landType: 'Agricultural', affectedFamilies: 423, purpose: 'Expressway expansion.', estimatedCost: 4200, status: 'DRAFT', priority: 'High', progress: 10, submittedDate: new Date('2026-07-30'), targetCompletion: new Date('2028-03-31'), description: 'Expressway expansion.', currentStage: 'Proposal Submitted', submittedBy: 'Karnataka PWD' },
    { proposalNumber: 'Bharat Bhoomi-2026-00113', projectName: 'Hyderabad-Warangal Gas Pipeline', projectType: 'Pipeline', department: 'GAIL', departmentId: deptMap['GAIL'], state: 'Telangana', district: 'Nalgonda', totalLandRequired: 135, numberOfParcels: 2, landType: 'Agricultural', affectedFamilies: 312, purpose: 'Gas pipeline project.', estimatedCost: 9500, status: 'APPROVED', priority: 'Medium', progress: 70, submittedDate: new Date('2026-07-28'), targetCompletion: new Date('2027-10-31'), description: 'Gas pipeline project.', currentStage: 'Notification', submittedBy: 'GAIL' },
    { proposalNumber: 'Bharat Bhoomi-2026-00112', projectName: 'Patna Metro Rail Project', projectType: 'Urban Infrastructure', department: 'Patna Metro Rail', departmentId: deptMap['Patna Metro Rail'], state: 'Bihar', district: 'Patna', totalLandRequired: 80, numberOfParcels: 2, landType: 'Residential', affectedFamilies: 201, purpose: 'Patna metro project.', estimatedCost: 3400, status: 'UNDER_REVIEW', priority: 'High', progress: 45, submittedDate: new Date('2026-07-25'), targetCompletion: new Date('2028-12-31'), description: 'Patna metro project.', currentStage: 'Administrative Review', submittedBy: 'Patna Metro Rail' },
    { proposalNumber: 'Bharat Bhoomi-2026-00111', projectName: 'Guwahati Airport Expansion', projectType: 'Airport', department: 'Airports Authority of India', departmentId: deptMap['Airports Authority of India'], state: 'Assam', district: 'Kamrup', totalLandRequired: 210, numberOfParcels: 2, landType: 'Agricultural', affectedFamilies: 89, purpose: 'Airport expansion.', estimatedCost: 1850, status: 'APPROVED', priority: 'High', progress: 85, submittedDate: new Date('2026-07-20'), targetCompletion: new Date('2027-03-31'), description: 'Airport expansion.', currentStage: 'Award', submittedBy: 'AAI' },
    { proposalNumber: 'Bharat Bhoomi-2026-00110', projectName: 'Ranchi-Dumka Railway Line', projectType: 'Railway', department: 'Indian Railways', departmentId: deptMap['Indian Railways'], state: 'Jharkhand', district: 'Dumka', totalLandRequired: 160, numberOfParcels: 2, landType: 'Agricultural', affectedFamilies: 298, purpose: 'New railway line.', estimatedCost: 5600, status: 'ACQUIRED', priority: 'Medium', progress: 90, submittedDate: new Date('2026-07-15'), targetCompletion: new Date('2027-01-31'), description: 'New railway line.', currentStage: 'Compensation', submittedBy: 'Indian Railways' },
  ]

  for (const p of proposals) {
    await prisma.proposal.create({ data: p })
  }

  console.log('Proposals seeded:', proposals.length)

  const parcels = [
    { proposalNumber: 'Bharat Bhoomi-2026-00124', parcelNumber: 'PAR-001', area: 12.5, landType: 'Agricultural', status: 'acquired', surveyNo: '123/4', village: 'Manesar', owner: 'Ramesh Kumar', geometry: '{"type":"Polygon","coordinates":[[[77.042,28.409],[77.068,28.409],[77.068,28.384],[77.042,28.384],[77.042,28.409]]]}', acquiredDate: new Date('2026-07-15') },
    { proposalNumber: 'Bharat Bhoomi-2026-00124', parcelNumber: 'PAR-002', area: 8.2, landType: 'Agricultural', status: 'acquired', surveyNo: '124/7', village: 'Manesar', owner: 'Sita Devi', geometry: '{"type":"Polygon","coordinates":[[[77.072,28.405],[77.095,28.405],[77.095,28.381],[77.072,28.381],[77.072,28.405]]]}', acquiredDate: new Date('2026-07-18') },
    { proposalNumber: 'Bharat Bhoomi-2026-00124', parcelNumber: 'PAR-003', area: 15.3, landType: 'Agricultural', status: 'pending', surveyNo: '125/3', village: 'Damdma', owner: 'Mohan Lal', geometry: '{"type":"Polygon","coordinates":[[[77.098,28.402],[77.125,28.402],[77.125,28.378],[77.098,28.378],[77.098,28.402]]]}' },
    { proposalNumber: 'Bharat Bhoomi-2026-00124', parcelNumber: 'PAR-004', area: 6.0, landType: 'Agricultural', status: 'disputed', surveyNo: '126/1', village: 'Damdma', owner: 'Kishore Kumar', geometry: '{"type":"Polygon","coordinates":[[[77.128,28.399],[77.152,28.399],[77.152,28.375],[77.128,28.375],[77.128,28.399]]]}' },
    { proposalNumber: 'Bharat Bhoomi-2026-00123', parcelNumber: 'PAR-005', area: 22.4, landType: 'Agricultural', status: 'acquired', surveyNo: '45/2', village: 'Thane', owner: 'Patel Brothers', geometry: '{"type":"Polygon","coordinates":[[[73.006,20.452],[73.032,20.452],[73.032,20.428],[73.006,20.428],[73.006,20.452]]]}', acquiredDate: new Date('2026-06-20') },
    { proposalNumber: 'Bharat Bhoomi-2026-00123', parcelNumber: 'PAR-006', area: 18.7, landType: 'Agricultural', status: 'acquired', surveyNo: '46/5', village: 'Thane', owner: 'Suresh Merchant', geometry: '{"type":"Polygon","coordinates":[[[73.035,20.450],[73.062,20.450],[73.062,20.426],[73.035,20.426],[73.035,20.450]]]}', acquiredDate: new Date('2026-06-22') },
    { proposalNumber: 'Bharat Bhoomi-2026-00122', parcelNumber: 'PAR-008', area: 45.2, landType: 'Agricultural', status: 'acquired', surveyNo: '88/3', village: 'Hosur', owner: 'Tamil Nadu Horticulture', geometry: '{"type":"Polygon","coordinates":[[[78.650,12.961],[78.682,12.961],[78.682,12.935],[78.650,12.935],[78.650,12.961]]]}', acquiredDate: new Date('2026-05-10') },
    { proposalNumber: 'Bharat Bhoomi-2026-00122', parcelNumber: 'PAR-009', area: 38.6, landType: 'Agricultural', status: 'acquired', surveyNo: '89/2', village: 'Hosur', owner: 'Raja Rani Industries', geometry: '{"type":"Polygon","coordinates":[[[78.685,12.959],[78.718,12.959],[78.718,12.933],[78.685,12.933],[78.685,12.959]]]}', acquiredDate: new Date('2026-05-15') },
    { proposalNumber: 'Bharat Bhoomi-2026-00121', parcelNumber: 'PAR-011', area: 5.5, landType: 'Agricultural', status: 'pending', surveyNo: '12/8', village: 'Kota', owner: 'Kumar Estate', geometry: '{"type":"Polygon","coordinates":[[[75.550,25.204],[75.575,25.204],[75.575,25.186],[75.550,25.186],[75.550,25.204]]]}' },
    { proposalNumber: 'Bharat Bhoomi-2026-00121', parcelNumber: 'PAR-012', area: 12.8, landType: 'Agricultural', status: 'notification', surveyNo: '13/4', village: 'Kota', owner: 'Sharma Traders', geometry: '{"type":"Polygon","coordinates":[[[75.580,25.202],[75.610,25.202],[75.610,25.184],[75.580,25.184],[75.580,25.202]]]}' },
    { proposalNumber: 'Bharat Bhoomi-2026-00120', parcelNumber: 'PAR-013', area: 3.2, landType: 'Commercial', status: 'acquired', surveyNo: '56/1', village: 'Hyderabad', owner: 'Reddy Properties', geometry: '{"type":"Polygon","coordinates":[[[78.650,17.385],[78.675,17.385],[78.675,17.367],[78.650,17.367],[78.650,17.385]]]}', acquiredDate: new Date('2026-04-12') },
    { proposalNumber: 'Bharat Bhoomi-2026-00119', parcelNumber: 'PAR-015', area: 8.8, landType: 'Agricultural', status: 'notification', surveyNo: '33/5', village: 'Agra', owner: 'Agarwal Farms', geometry: '{"type":"Polygon","coordinates":[[[77.950,27.150],[77.975,27.150],[77.975,27.128],[77.950,27.128],[77.950,27.150]]]}' },
    { proposalNumber: 'Bharat Bhoomi-2026-00112', parcelNumber: 'PAR-018', area: 4.2, landType: 'Residential', status: 'review', surveyNo: '78/4', village: 'Patna', owner: 'Patna Rice Mills', geometry: '{"type":"Polygon","coordinates":[[[85.200,25.610],[85.225,25.610],[85.225,25.588],[85.200,25.588],[85.200,25.610]]]}' },
    { proposalNumber: 'Bharat Bhoomi-2026-00111', parcelNumber: 'PAR-020', area: 12.5, landType: 'Agricultural', status: 'acquired', surveyNo: '22/5', village: 'Guwahati', owner: 'Assam Tea Estate', geometry: '{"type":"Polygon","coordinates":[[[91.700,26.120],[91.730,26.120],[91.730,26.098],[91.700,26.098],[91.700,26.120]]]}', acquiredDate: new Date('2026-03-15') },
  ]

  for (const p of parcels) {
    const proposal = await prisma.proposal.findUnique({ where: { proposalNumber: p.proposalNumber } })
    if (proposal) {
      const { proposalNumber, ...parcelData } = p
      await prisma.landParcel.create({ data: { ...parcelData, proposalId: proposal.id } })
    }
  }

  console.log('Parcels seeded:', parcels.length)

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@bharatbhoomi.gov.in' } })

  const notifications = [
    { userId: adminUser.id, title: 'New proposal submitted for Delhi-Mumbai Expressway', message: 'Proposal Bharat Bhoomi-2026-00124 requires your review', type: 'approval', category: 'Proposal updates', priority: 'high', action: 'Review now', link: '/proposals/Bharat Bhoomi-2026-00124' },
    { userId: adminUser.id, title: 'Compensation disbursement completed', message: '₹245 Cr disbursed to 340 families in Sector 18, Noida', type: 'compensation', category: 'Compensation updates', priority: 'medium' },
    { userId: adminUser.id, title: 'Award declaration issued', message: 'Notification published in Official Gazette for Mumbai-Nagpur project', type: 'document', category: 'Document verification', priority: 'medium', action: 'View notification' },
    { userId: adminUser.id, title: 'Document verification pending', message: 'Pending documents for Proposal Bharat Bhoomi-2026-00098', type: 'verification', category: 'Approval requests', priority: 'high', action: 'Verify now' },
    { userId: adminUser.id, title: 'Possession certificate issued', message: 'Possession completed for 12 parcels in Jaipur-Delhi highway', type: 'possession', category: 'Proposal updates', priority: 'medium' },
    { userId: adminUser.id, title: 'Deadline reminder: Quarterly report', message: 'Submit quarterly land acquisition progress report by 15 September 2026', type: 'deadline', category: 'Deadline reminders', priority: 'high' },
  ]

  for (const n of notifications) {
    await prisma.notification.create({ data: n })
  }

  console.log('Notifications seeded:', notifications.length)

  const appRoles = await prisma.appRole.createMany({
    data: [
      { name: 'SUPER_ADMIN', description: 'Full system access with all administrative privileges', isSystemRole: true },
      { name: 'PROPOSAL_OFFICER', description: 'Can create and manage land acquisition proposals', isSystemRole: true },
      { name: 'REVIEWING_AUTHORITY', description: 'Can review and approve or reject proposals', isSystemRole: true },
      { name: 'FIELD_OFFICER', description: 'Can update field verification and land parcel data', isSystemRole: true },
    ],
    skipDuplicates: true,
  })
  console.log('AppRoles seeded:', appRoles.count)

  const permissions = await prisma.permission.createMany({
    data: [
      { name: 'ROLES_VIEW', category: 'Roles', description: 'View roles and permissions' },
      { name: 'ROLES_CREATE', category: 'Roles', description: 'Create new roles' },
      { name: 'ROLES_EDIT', category: 'Roles', description: 'Edit role permissions' },
      { name: 'ROLES_DELETE', category: 'Roles', description: 'Delete roles' },
      { name: 'GIS_VIEW', category: 'GIS', description: 'View GIS map' },
      { name: 'GIS_EDIT', category: 'GIS', description: 'Edit map layers' },
      { name: 'GIS_EXPORT', category: 'GIS', description: 'Export GIS data' },
      { name: 'DASHBOARD_VIEW', category: 'Dashboard', description: 'View dashboard and analytics' },
      { name: 'DASHBOARD_STATS', category: 'Dashboard', description: 'View detailed statistics' },
      { name: 'PROPOSALS_VIEW', category: 'Proposals', description: 'View proposals list and details' },
      { name: 'PROPOSALS_CREATE', category: 'Proposals', description: 'Create new proposals' },
      { name: 'PROPOSALS_EDIT', category: 'Proposals', description: 'Edit proposals' },
      { name: 'PROPOSALS_SUBMIT', category: 'Proposals', description: 'Submit proposals for review' },
      { name: 'PROPOSALS_APPROVE', category: 'Proposals', description: 'Approve proposals' },
      { name: 'PROPOSALS_REJECT', category: 'Proposals', description: 'Reject proposals' },
      { name: 'PROPOSALS_DELETE', category: 'Proposals', description: 'Delete proposals' },
      { name: 'USERS_VIEW', category: 'Users', description: 'View users list' },
      { name: 'USERS_CREATE', category: 'Users', description: 'Create new users' },
      { name: 'USERS_EDIT', category: 'Users', description: 'Edit existing users' },
      { name: 'USERS_DELETE', category: 'Users', description: 'Delete users' },
      { name: 'USERS_CHANGE_ROLE', category: 'Users', description: 'Change user roles' },
      { name: 'USERS_RESET_PASSWORD', category: 'Users', description: 'Reset user passwords' },
      { name: 'UPDATE_PARCELS', category: 'Land Parcels', description: 'Update land parcel information' },
      { name: 'DOCUMENTS_VIEW', category: 'Documents', description: 'View documents' },
      { name: 'DOCUMENTS_UPLOAD', category: 'Documents', description: 'Upload documents' },
      { name: 'DOCUMENTS_VERIFY', category: 'Documents', description: 'Verify documents' },
      { name: 'REPORTS_VIEW', category: 'Reports', description: 'View reports' },
      { name: 'REPORTS_EXPORT', category: 'Reports', description: 'Export reports' },
      { name: 'NOTIFICATIONS_VIEW', category: 'Notifications', description: 'View notifications' },
      { name: 'NOTIFICATIONS_MANAGE', category: 'Notifications', description: 'Manage notification settings' },
      { name: 'SETTINGS_VIEW', category: 'Settings', description: 'View settings' },
      { name: 'SETTINGS_EDIT', category: 'Settings', description: 'Edit settings' },
      { name: 'AUDIT_VIEW', category: 'Audit', description: 'View audit logs' },
      { name: 'AUDIT_EXPORT', category: 'Audit', description: 'Export audit logs' },
      { name: 'MANAGE_COMPENSATION', category: 'Compensation', description: 'Manage compensation disbursement' },
      { name: 'MANAGE_POSSESSION', category: 'Possession', description: 'Manage physical possession' },
    ],
    skipDuplicates: true,
  })
  console.log('Permissions seeded:', permissions.count)

  const seededPermissions = await prisma.permission.findMany()
  const permissionMap = Object.fromEntries(seededPermissions.map(p => [p.name, p.id]))

  const rolePermissions = [
    { role: 'FIELD_OFFICER', permissions: ['GIS_VIEW','DASHBOARD_VIEW','PROPOSALS_VIEW','UPDATE_PARCELS','DOCUMENTS_VIEW','DOCUMENTS_UPLOAD','NOTIFICATIONS_VIEW','AUDIT_VIEW','MANAGE_POSSESSION'] },
    { role: 'PROPOSAL_OFFICER', permissions: ['GIS_VIEW','DASHBOARD_VIEW','DASHBOARD_STATS','PROPOSALS_VIEW','PROPOSALS_CREATE','PROPOSALS_EDIT','PROPOSALS_SUBMIT','PROPOSALS_DELETE','DOCUMENTS_VIEW','DOCUMENTS_UPLOAD','NOTIFICATIONS_VIEW','SETTINGS_VIEW','AUDIT_VIEW','USERS_VIEW'] },
    { role: 'REVIEWING_AUTHORITY', permissions: ['GIS_VIEW','DASHBOARD_VIEW','DASHBOARD_STATS','PROPOSALS_VIEW','PROPOSALS_APPROVE','PROPOSALS_REJECT','DOCUMENTS_VIEW','DOCUMENTS_VERIFY','NOTIFICATIONS_VIEW','SETTINGS_VIEW','AUDIT_VIEW','USERS_VIEW'] },
    { role: 'SUPER_ADMIN', permissions: ['ROLES_EDIT','ROLES_DELETE','GIS_VIEW','GIS_EDIT','DASHBOARD_VIEW','DASHBOARD_STATS','GIS_EXPORT','PROPOSALS_VIEW','PROPOSALS_CREATE','PROPOSALS_EDIT','PROPOSALS_SUBMIT','PROPOSALS_APPROVE','PROPOSALS_REJECT','PROPOSALS_DELETE','USERS_VIEW','USERS_CREATE','USERS_EDIT','USERS_DELETE','USERS_CHANGE_ROLE','USERS_RESET_PASSWORD','ROLES_VIEW','UPDATE_PARCELS','DOCUMENTS_VIEW','DOCUMENTS_UPLOAD','DOCUMENTS_VERIFY','REPORTS_VIEW','REPORTS_EXPORT','NOTIFICATIONS_VIEW','NOTIFICATIONS_MANAGE','SETTINGS_VIEW','SETTINGS_EDIT','AUDIT_VIEW','AUDIT_EXPORT','MANAGE_COMPENSATION','MANAGE_POSSESSION','ROLES_CREATE'] },
  ]

  for (const rp of rolePermissions) {
    const appRole = await prisma.appRole.findUnique({ where: { name: rp.role } })
    if (!appRole) continue
    for (const permName of rp.permissions) {
      const permId = permissionMap[permName]
      if (!permId) continue
      const existing = await prisma.rolePermission.findFirst({
        where: { role: rp.role, permissionId: permId },
      })
      if (existing) {
        await prisma.rolePermission.update({
          where: { id: existing.id },
          data: { appRoleId: appRole.id },
        })
      } else {
        await prisma.rolePermission.create({
          data: { role: rp.role, permissionId: permId, appRoleId: appRole.id },
        })
      }
    }
  }
  console.log('Role permissions seeded')


  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
