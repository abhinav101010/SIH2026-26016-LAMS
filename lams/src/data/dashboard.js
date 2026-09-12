/* ============================================================
   Bharat Bhoomi Dashboard Mock Data
   Real-time monitoring of land acquisition projects across India
   ============================================================ */

export const DASHBOARD_STATS = {
  totalProjects: 1248,
  landProposed: 52430,
  landAcquired: 31280,
  pendingProposals: 342,
  compensationDisbursed: 8420,
  affectedFamilies: 184620,
}

export const DASHBOARD_TRENDS = [
  { month: 'Jan', acquired: 1800, proposed: 2200 },
  { month: 'Feb', acquired: 2100, proposed: 2500 },
  { month: 'Mar', acquired: 1950, proposed: 2400 },
  { month: 'Apr', acquired: 2400, proposed: 2800 },
  { month: 'May', acquired: 2700, proposed: 2600 },
  { month: 'Jun', acquired: 3100, proposed: 3000 },
  { month: 'Jul', acquired: 3400, proposed: 3200 },
  { month: 'Aug', acquired: 3800, proposed: 3500 },
  { month: 'Sep', acquired: 4200, proposed: 3400 },
  { month: 'Oct', acquired: 4100, proposed: 3800 },
  { month: 'Nov', acquired: 4500, proposed: 3600 },
  { month: 'Dec', acquired: 5000, proposed: 4000 },
]

export const STATE_PROGRESS = [
  { state: 'Uttar Pradesh', acquired: 7840, proposed: 9200 },
  { state: 'Maharashtra', acquired: 6120, proposed: 7500 },
  { state: 'Rajasthan', acquired: 5230, proposed: 6100 },
  { state: 'Haryana', acquired: 3450, proposed: 3800 },
  { state: 'Gujarat', acquired: 2980, proposed: 3500 },
  { state: 'Karnataka', acquired: 2100, proposed: 2800 },
  { state: 'Tamil Nadu', acquired: 1870, proposed: 2200 },
  { state: 'West Bengal', acquired: 960, proposed: 1400 },
  { state: 'Telangana', acquired: 850, proposed: 1200 },
  { state: 'Madhya Pradesh', acquired: 740, proposed: 1100 },
]

export const STATUS_DISTRIBUTION = [
  { status: 'Proposed', count: 512, amount: 18420, color: 'pending' },
  { status: 'Under Review', count: 234, amount: 8750, color: 'review' },
  { status: 'Approved', count: 186, amount: 12340, color: 'approved' },
  { status: 'Acquired', count: 156, amount: 15280, color: 'possession' },
  { status: 'Rejected', count: 34, amount: 1200, color: 'rejected' },
  { status: 'Delayed', count: 78, amount: 4560, color: 'delayed' },
]

export const TIMELINE_ADHERENCE = [
  { category: 'On Track', count: 892, percentage: 71.5 },
  { category: 'At Risk', count: 210, percentage: 16.8 },
  { category: 'Delayed', count: 146, percentage: 11.7 },
]

export const RECENT_NOTIFICATIONS = [
  { id: 1, title: 'New proposal submitted for Delhi-Mumbai Expressway', message: 'Proposal Bharat Bhoomi-2026-00124 requires your review', time: '2 hours ago', unread: true, type: 'approval' },
  { id: 2, title: 'Compensation disbursement completed', message: '₹245 Cr disbursed to 340 families in Sector 18, Noida', time: '5 hours ago', unread: true, type: 'compensation' },
  { id: 3, title: 'Award declaration issued', message: 'Notification published in Official Gazette for Mumbai-Nagpur project', time: '1 day ago', unread: false, type: 'document' },
  { id: 4, title: 'Document verification pending', message: 'Pending documents for Proposal Bharat Bhoomi-2026-00098', time: '2 days ago', unread: false, type: 'verification' },
  { id: 5, title: 'Possession certificate issued', message: 'Possession completed for 12 parcels in Jaipur-Delhi highway', time: '3 days ago', unread: false, type: 'possession' },
]
