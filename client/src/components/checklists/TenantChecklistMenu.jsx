import React from 'react';
import ChecklistSection from './ChecklistSection';

// This is a wrapper for the checklist section in the tenant dashboard (read-only)
const TenantChecklistMenu = ({ property }) => {
  // In a real app, property would be selected or passed in context
  // For now, we assume tenant can only view (read-only)
  return (
    <ChecklistSection role="tenant" property={property} canEdit={false} />
  );
};

export default TenantChecklistMenu;
