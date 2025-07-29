import React from 'react';
import ChecklistSection from './ChecklistSection';

// This is a wrapper for the checklist section in the caretaker dashboard
const CaretakerChecklistMenu = ({ property }) => {
  // In a real app, property would be selected or passed in context
  // For now, we assume caretaker can always edit for their assigned property
  return (
    <ChecklistSection role="caretaker" property={property} canEdit={true} />
  );
};

export default CaretakerChecklistMenu;
