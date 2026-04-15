import { useState } from 'react';

export const useProfile = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFinalUpdate = async (currentPassword, formData) => {
    setIsUpdating(true);
    try {
      // Aquí iría la integración real: await authService.updateProfile(formData, currentPassword)
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsEditModalVisible(false);
      setIsSuccessVisible(true);
    } catch (err) {
      console.error("Error updating profile", err);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isEditModalVisible,
    setIsEditModalVisible,
    isSuccessVisible,
    setIsSuccessVisible,
    isUpdating,
    handleFinalUpdate
  };
};