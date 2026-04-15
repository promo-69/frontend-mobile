import { useState, useEffect } from 'react';

export const useProfile = (userData, onSave) => {
  const [step, setStep] = useState('view');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(userData);
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    let newErrors = { email: '', password: '' };
    let isValid = true;
    if (!formData.email.includes('@')) {
      newErrors.email = 'Correo inválido';
      isValid = false;
    }
    const passRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;
    if (!passRegex.test(formData.password)) {
      newErrors.password = 'Clave inválida (8-20 caracteres, letras, números y símbolos)';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
      setStep('view');
      setShowSuccess(true);
    }
  };

  return {
    step, setStep,
    formData, setFormData,
    showSuccess, setShowSuccess,
    showPassword, setShowPassword,
    errors, handleSave
  };
};