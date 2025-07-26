import React from 'react';
import { render, screen } from '@testing-library/react';
import LandlordDashboard from '../src/components/dashboards/LandlordDashboard';

describe('LandlordDashboard', () => {
  it('renders the dashboard title', () => {
    render(<LandlordDashboard />);
    expect(screen.getByText(/Landlord Dashboard/i)).toBeInTheDocument();
  });
});
