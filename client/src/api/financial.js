// Centralized API service for landlord financial data
// All financial data fetching for reports, income, arrears, etc. should use these functions

const API_URL = import.meta.env.VITE_API_URL || '';

export async function fetchFinancialReports(token) {
  const res = await fetch(`${API_URL}/api/financial/reports`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch financial reports');
  return res.json();
}

export async function fetchMonthlyIncome(token) {
  const res = await fetch(`${API_URL}/api/financial/monthly-income`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch monthly income');
  return res.json();
}

export async function fetchRentArrears(token) {
  const res = await fetch(`${API_URL}/api/financial/rent-arrears`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch rent arrears');
  return res.json();
}

export async function fetchOccupancyStats(token) {
  const res = await fetch(`${API_URL}/api/financial/occupancy`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch occupancy stats');
  return res.json();
}
