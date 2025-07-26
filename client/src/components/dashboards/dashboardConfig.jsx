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
  { label: 'Dashboard', icon: <FaHome /> },
  { label: 'Housing Agreement', icon: <FaFileAlt /> },
  { label: 'Rent Payment History', icon: <FaMoneyBillWave /> },
  { label: 'Make Payment', icon: <FaCreditCard /> },
  { label: 'Receipts', icon: <FaReceipt /> },
  { label: 'Maintenance Requests', icon: <FaTools /> },
  { label: 'Announcements', icon: <FaComments /> },
  { label: 'Reminders', icon: <FaBell /> },
  { label: 'Late Penalties', icon: <FaExclamationTriangle /> }
];