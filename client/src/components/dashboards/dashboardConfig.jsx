import {
  FaHome,
  FaTools,
  FaClipboardList,
  FaCheckCircle,
  FaComments,
  FaBullhorn,
  FaSyncAlt,
  FaMoneyCheckAlt,
  FaHistory,
  FaTasks,
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaCogs,
  FaBook,
  FaFileAlt,
  FaCreditCard,
  FaReceipt,
  FaBell,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaUserTie,
  FaClipboardCheck,
  FaChartBar,
  FaBalanceScale
} from 'react-icons/fa';

export const landlordMenu = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'Properties', icon: <FaBuilding />, key: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Tenant Statements', icon: <FaFileInvoiceDollar />, key: 'tenant-statements' },
  { label: 'Add Tenant to Property', icon: <FaUsers />, key: 'add-tenant' },
  { label: 'Assign Caretaker to Property', icon: <FaUserTie />, key: 'assign-caretaker' },
  { label: 'Caretaker Management', icon: <FaUserTie />, key: 'caretaker-management' },
  { label: 'Caretaker Actions', icon: <FaClipboardCheck />, key: 'caretaker-actions' },
  { label: 'Legal Documents', icon: <FaFileAlt />, key: 'legal-documents' },
  { label: 'Tenant Check-in Docs', icon: <FaUsers />, key: 'tenant-checkin' },
  { label: 'Monthly Income', icon: <FaChartBar />, key: 'monthly-income' },
  { label: 'Occupancy vs. Vacancy', icon: <FaBalanceScale />, key: 'occupancy-vacancy' },
  { label: 'Rent Arrears', icon: <FaFileInvoiceDollar />, key: 'rent-arrears' },
];

export const caretakerMenu = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'Maintenance Needs', icon: <FaTools />, key: 'maintenance-needs' },
  { label: 'Maintenance Tasks', icon: <FaTasks />, key: 'maintenance-tasks' },
  { label: 'Resolved Issues', icon: <FaCheckCircle />, key: 'resolved-issues' },
  { label: 'Tenant Communication', icon: <FaComments />, key: 'tenant-communication' },
  { label: 'Tenant Check-in Docs', icon: <FaClipboardCheck />, key: 'checklist' },
  { label: 'Announcements & Reports', icon: <FaBullhorn />, key: 'announcements-reports' },
  { label: 'Action Updates', icon: <FaSyncAlt />, key: 'action-updates' },
  { label: 'Rent Status', icon: <FaMoneyCheckAlt />, key: 'rent-status' },
  { label: 'Service History', icon: <FaHistory />, key: 'service-history' },
  { label: 'Active Requests', icon: <FaClipboardList />, key: 'active-requests' },
];

export const superAdminMenu = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'User Management', icon: <FaUsers />, key: 'user-management' },
  { label: 'Properties', icon: <FaBuilding />, key: 'properties' },
  { label: 'Financial Reports', icon: <FaMoneyBillWave />, key: 'financial-reports' },
  { label: 'Maintenance', icon: <FaTools />, key: 'maintenance' },
  { label: 'Announcements', icon: <FaBullhorn />, key: 'announcements' },
  { label: 'Subscriptions', icon: <FaClipboardList />, key: 'subscriptions' },
  { label: 'System Settings', icon: <FaCogs />, key: 'system-settings' },
  { label: 'Audit Logs', icon: <FaBook />, key: 'audit-logs' },
];

export const tenantMenu = [
  { label: 'Dashboard', icon: <FaHome />, key: 'dashboard' },
  { label: 'Housing Agreement', icon: <FaFileAlt />, key: 'housing-agreement' },
  { label: 'Tenant Check-in Docs', icon: <FaClipboardCheck />, key: 'tenant-checkin' },
  { label: 'Rent Payment History', icon: <FaMoneyBillWave />, key: 'rent-payment-history' },
  { label: 'Payment Status', icon: <FaMoneyCheckAlt />, key: 'payment-status' },
  { label: 'Make Payment', icon: <FaCreditCard />, key: 'make-payment' },
  { label: 'Receipts', icon: <FaReceipt />, key: 'receipts' },
  { label: 'Maintenance Requests', icon: <FaTools />, key: 'maintenance-requests' },
  { label: 'Announcements', icon: <FaComments />, key: 'announcements' },
  { label: 'Reminders', icon: <FaBell />, key: 'reminders' },
  { label: 'Late Penalties', icon: <FaExclamationTriangle />, key: 'late-penalties' }
];