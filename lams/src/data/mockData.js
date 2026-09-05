/* ============================================================
   NLAMS Base Mock Data
   Static reference data for the application
   ============================================================ */

export const USER_ROLES = ['Administrator', 'District Collector', 'Sub-Registrar', 'NHAI Official', 'Ministry Official', 'Surveyor']

export const CURRENT_USER = {
  id: 'USR-001',
  name: 'Abhinav Sharma',
  email: 'abhinav.sharma@nlams.gov.in',
  role: 'Administrator',
  department: 'Ministry of Road Transport & Highways',
  avatar: null,
  phone: '+91-98765-43210',
  employeeId: 'NLAMS/ADMIN/001',
  joinedDate: '2024-03-15',
  lastLogin: '2026-08-31T10:30:00+05:30',
}

export const STATES = [
  { code: 'AN', name: 'Andaman and Nicobar Islands', lat: 12.5674, lng: 92.7294 },
  { code: 'AP', name: 'Andhra Pradesh', lat: 15.9129, lng: 79.0315 },
  { code: 'AR', name: 'Arunachal Pradesh', lat: 28.214, lng: 92.9365 },
  { code: 'AS', name: 'Assam', lat: 26.2771, lng: 91.7262 },
  { code: 'BR', name: 'Bihar', lat: 25.6852, lng: 85.2799 },
  { code: 'CH', name: 'Chandigarh', lat: 30.7343, lng: 76.7912 },
  { code: 'CG', name: 'Chhattisgarh', lat: 19.1971, lng: 81.1383 },
  { code: 'DL', name: 'Delhi', lat: 28.7041, lng: 77.1025 },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', lat: 20.3977, lng: 72.9534 },
  { code: 'GA', name: 'Goa', lat: 15.4909, lng: 74.1262 },
  { code: 'GJ', name: 'Gujarat', lat: 22.2587, lng: 71.1924 },
  { code: 'HR', name: 'Haryana', lat: 30.7343, lng: 76.7912 },
  { code: 'HP', name: 'Himachal Pradesh', lat: 32.2184, lng: 77.3107 },
  { code: 'JK', name: 'Jammu and Kashmir', lat: 33.0812, lng: 75.2983 },
  { code: 'JH', name: 'Jharkhand', lat: 23.6102, lng: 85.2799 },
  { code: 'KA', name: 'Karnataka', lat: 12.2958, lng: 76.4801 },
  { code: 'KL', name: 'Kerala', lat: 10.8505, lng: 76.2747 },
  { code: 'LA', name: 'Ladakh', lat: 34.3478, lng: 78.0513 },
  { code: 'LD', name: 'Lakshadweep', lat: 10.5724, lng: 73.2107 },
  { code: 'MP', name: 'Madhya Pradesh', lat: 22.9734, lng: 78.6569 },
  { code: 'MH', name: 'Maharashtra', lat: 19.783, lng: 79.5109 },
  { code: 'MN', name: 'Manipur', lat: 24.6939, lng: 90.7065 },
  { code: 'ML', name: 'Meghalaya', lat: 25.5165, lng: 89.9312 },
  { code: 'MZ', name: 'Mizoram', lat: 23.1641, lng: 92.2692 },
  { code: 'NL', name: 'Nagaland', lat: 25.5724, lng: 93.7121 },
  { code: 'OR', name: 'Odisha', lat: 20.1476, lng: 84.9732 },
  { code: 'PY', name: 'Puducherry', lat: 11.914, lng: 79.808 },
  { code: 'PB', name: 'Punjab', lat: 30.9124, lng: 75.283 },
  { code: 'RJ', name: 'Rajasthan', lat: 26.2382, lng: 73.0248 },
  { code: 'SK', name: 'Sikkim', lat: 27.3385, lng: 88.3316 },
  { code: 'TN', name: 'Tamil Nadu', lat: 11.0604, lng: 79.0173 },
  { code: 'TG', name: 'Telangana', lat: 17.1232, lng: 79.2082 },
  { code: 'TR', name: 'Tripura', lat: 23.5727, lng: 91.4487 },
  { code: 'UP', name: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462 },
  { code: 'UK', name: 'Uttarakhand', lat: 30.0668, lng: 78.7261 },
  { code: 'WB', name: 'West Bengal', lat: 23.5773, lng: 87.3594 },
]

export const DISTRICTS_MAP = {
  HR: ['Gurugram', 'Gurgaon', 'Rewari', 'Palwal', 'Panchkula', 'Ambala', 'Karnal', 'Panipat', 'Sonipat', 'Jhajjar', 'Bhiwani', 'Mahendergarh', 'Hisar', 'Sirsa', 'Rohtak', 'Kaithal', 'Yamunanagar', 'Chandni Kharar'],
  UP: ['Agra', 'Aligarh', 'Allahabad', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya', 'Bijnor', 'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah', 'Faizabad', 'Farrukhabad', 'Fatehpur', 'Gonda', 'Hamirpur', 'Hardoi', 'Jalaun', 'Jalna', 'Jaunpur', 'Jhansi', 'Kalimpong', 'Kanpur', 'Kushinagar', 'Lucknow', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Mirzapur', 'Moradabad', 'Muzaffarnagar', 'Nainital', 'Pilibhit', 'Pratapgarh', 'Raebareli', 'Rampur', 'Sant Ravidas Nagar', 'Saharanpur', 'Sant Kabir Nagar', 'Shamli', 'Shivpuri', 'Siddharthnagar', 'Sitapur', 'Sultanpur', 'Unnao', 'Varanasi'],
  RJ: ['Ajmer', 'Alwar', 'Banswara', 'Barmer', 'Bharatpur', 'Bhilwara', 'Chittorgarh', 'Churu', 'Dausa', 'Dholpur', 'Dungarpur', 'Jaipur', 'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Kota', 'Nagaur', 'Pali', 'Pratapgarh', 'Rajsamand', 'Sawai Madhopur', 'Sikar', 'Sirohi', 'Sri Ganganagar', 'Tonk', 'Udaipur'],
  MH: ['Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur', 'Latur', 'Mumbai', 'Nanded', 'Nandurbar', 'Nashik', 'Osmanabad', 'Parbhan', 'Pimpri-Chinchwad', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Yavatmal'],
  GJ: ['Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Dahod', 'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahesana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal', 'Patan', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'],
  KA: ['Bagalkot', 'Ballari', 'Belagavi', 'Bellary', 'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chitradurga', 'Dakshina Kannada', 'Davangere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur', 'Raigad', 'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada', 'Vijayapura'],
  TN: ['Ariyalur', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul', 'Erode', 'Kanchipuram', 'Karur', 'Krishnagiri', 'Madurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai', 'Ramanadhapuram', 'Salem', 'Sivaganga', 'Thanjavur', 'Theni', 'Thoothukudi', 'Tirunelveli', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Vellore', 'Viluppuram', 'Virudhunagar'],
  TG: ['Adilabad', 'Bhadradri Kothagudam', 'Jangaon', 'Jogulamba Gadwal', 'Khammam', 'Mahabubabad', 'Mahbubnagar', 'Mancherial', 'Medchal-Malkajgan', 'Mulugu', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Panipat', 'Rajanna Srikakulam', 'Sangareddy', 'Siddipet', 'Suryapet', 'Vikarabad', 'Warangal', 'Yadadri Bhuvanagiri'],
  BR: ['Araria', 'Arwal', 'Aurangabad', 'Banka', 'Bankura', 'Begusarai', 'Bhagalpur', 'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Ganga', 'Gopalganj', 'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagen', 'Kishanganj', 'Lakhisarai', 'Latehar', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda', 'Nawada', 'Pashchim Champaran', 'Patna', 'Rohtas', 'Saharasa', 'Samastipur', 'Saran', 'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'South Buxar', 'Subol', 'SUP', 'Vaishali', 'West Champaran'],
  JH: ['Deoghar', 'Dumka', 'East Singhbhum', 'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Jamshedpur', 'Jamui', 'Khunti', 'Koderma', 'Latehar', 'Lohardaga', 'Madhupur', 'Munger', 'Musabani', 'Nagarjun', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi', 'Sahebganj', 'Seraikela-Kharia', 'Simdega', 'Sivasagar', 'West Singhbhum'],
  WB: ['Bankura', 'Bardhaman', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur', 'Darjeeling', 'East Burdwan', 'East Midnapur', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jamshedpur', 'Kalimpong', 'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas', 'North Dinajpur', 'South 24 Parganas', 'South Dinajpur', 'Purba Medinipur', 'Paschim Medinipur', 'Purulia', 'Uttar 24 Parganas', 'Uttar Dinajpur'],
  OD: ['Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack', 'Deogarh', 'Dhenkanal', 'Ganjam', 'Gajapati', 'Jagatsinghpur', 'Jajpur', 'Jharsuguda', 'Kalahandi', 'Kendrapara', 'Kendujhar', 'Khordha', 'Koraput', 'Mahanadi', 'Mayurbhanj', 'Mercury', 'Munger', 'Muthus', 'Nabarangpur', 'Nayagarh', 'Nilgiris', 'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Sangar', 'Soner', 'Subarnapur', 'Sundergarh', 'Talcher', 'Titiland', 'Zamindari'],
  AS: ['Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta', 'Barpeta'],
  ML: ['East Garo Hills', 'Jaintia Hills', 'Khasi Hills', 'North Garo Hills', 'South Garo Hills', 'West Garo Hills', 'West Khasi Hills'],
  MZ: ['Aizawl', 'Champhai', 'Hnahthial', 'Khataul', 'Kolasib', 'Lawngtlai', 'Lunglei', 'Mizoram', 'Saiha', 'Serchhip'],
  NL: ['Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung', 'Mon', 'Mokokchung', 'Peren', 'Phek', 'Tuensang', 'Wokha', 'Zunheboto'],
  MN: ['Bishnupur', 'Churachandpur', 'Chandel', 'Imphal East', 'Imphal West', 'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Porompat', 'Senapati', 'Tamenglong', 'Thouba', 'Ukhrul'],
  TR: ['Unakoti', 'West Tripura', 'South Tripura', 'Gomati', 'Dhalai', 'Khowai', 'North Tripura', 'Sepahijala', 'Dharmanagar'],
  SK: ['East Sikkim', 'North Sikkim', 'South Sikkim', 'West Sikkim'],
  AR: ['East Kameng', 'East Siang', 'Lower Subansiri', 'Lower Dibang Valley', 'Upper Kameng', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang', 'Upper Dibang Valley', 'Lower Subansiri', 'Kurung Kumey', 'Pakke Khamti', 'Anjaw', 'Changlang', 'Dima Hasao', 'East Garo Hills'],
  CG: ['Balod', 'Baloda Bijapur', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur', 'Bilaspur', 'Champa', 'Chhattisgarh', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband', 'Gaurella', 'Jagdalpur', 'Jashpur', 'Kabeer', 'Kanker', 'Khairagarh', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund', 'Mahasunda', 'Mul', 'Narayanpur', 'Nagal', 'Parbhani', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sabha', 'Sarguja', 'Sukma', 'Surguja', 'Tanakpur'],
  HP: ['Bilaspur', 'Chamba', 'Chamba', 'Chhattisgarh', 'Chirana', 'Hamirpur', 'Kinnaur', 'Kullu', 'Lahaul', 'Mandi', 'Mehrana', 'Mor', 'Munda', 'Nahan', 'Nalagarh', 'Rampur', 'Shimla', 'Sirsa', 'Solan', 'Sukhi', 'Sundernagar', 'Una', 'Yamun'],
  UT: ['Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu', 'Lakshadweep', 'Andaman and Nicobar', 'Ladakh', 'Puducherry', 'Jammu and Kashmir'],
  PB: ['Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Mohali', 'Muktsar', 'Nabha', 'Nawabganj', 'Patiala', 'Punjab', 'Sangrur', 'SAS Nagar', 'Tarn Taran'],
  HR_DIS: ['Ambala', 'Bhiwani', 'Chandni Kharar', 'Chhattarpur', 'Fatehabad', 'Gurgaon', 'Gurugram', 'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Mahendergarh', 'Mohindergarh', 'Mumbai', 'Nahargarh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari', 'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'],
}

export const DEPARTMENTS = [
  'Ministry of Road Transport & Highways',
  'Indian Railways',
  'National Highway Authority of India',
  'Ministry of Power',
  'Ministry of Environment, Forest and Climate Change',
  'Ministry of Urban Development',
  'Ministry of Rural Development',
  'Telecom Regulatory Authority of India',
  'Chennai Metropolitan Development Authority',
  'Delhi Development Authority',
  'Mumbai Metropolitan Region Development Authority',
  'Karnataka State Highway Department',
  'Uttar Pradesh Public Works Department',
  'Rajasthan Public Works Department',
  'Gujarat State Roads & Buildings Department',
]

export const PROJECT_TYPES = [
  'Highway',
  'Railway',
  'Airport',
  'Ports',
  'Power Line',
  'Pipeline',
  'Urban Infrastructure',
  'Rural Infrastructure',
  'Telecom Tower',
  'Smart City',
  'Irrigation',
  'Industrial Sector',
]

export const LAND_TYPES = ['Agricultural', 'Barren', 'Forest', 'Wasteland', 'Commercial', 'Residential', 'Industrial']

export const getDistrictsByState = (stateName) => {
  const state = STATES.find((s) => s.name === stateName)
  if (!state) return []
  return DISTRICTS_MAP[state.code] || []
}
