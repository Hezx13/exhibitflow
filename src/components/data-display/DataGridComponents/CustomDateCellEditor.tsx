import React, { forwardRef, useImperativeHandle, useState } from 'react';

interface CustomDateCellEditorProps {
  value: string;
}

const CustomDateCellEditor = forwardRef((props: CustomDateCellEditorProps, ref) => {
  const toInputDateFormat = (isoString: string): string => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert the cell value from ISO format to "YYYY-MM-DD"
  const [value, setValue] = useState(() => toInputDateFormat(props.value));

  useImperativeHandle(ref, () => ({
    getValue() {
      // When editing is complete, convert the date back to ISO
      return value ? new Date(value).toISOString() : null;
    },
  }));

  return (
    <input
      type="date"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      autoFocus
      style={{ width: '100%' }}
    />
  );
});

export default CustomDateCellEditor;