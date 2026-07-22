import { useState } from 'react';

export const useSelector = (initialValue = 'V') => {
  const [selectedValue, setSelectedValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen(!isOpen);
  const select = (value) => {
    setSelectedValue(value);
    setIsOpen(false);
  };

  return { selectedValue, isOpen, toggle, select };
};
