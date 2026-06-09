import { createContext, useCallback, useContext, useState } from 'react';

const BottomSheetContext = createContext({});

export const BottomSheetProvider = ({ children }) => {
  const [config, setConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // info, warning, error, auth
    primaryButton: null, // { text, onPress, style }
    secondaryButton: null,
  });

  const showBottomSheet = useCallback((options) => {
    setConfig({
      visible: true,
      title: options.title || '',
      message: options.message || '',
      type: options.type || 'info',
      primaryButton: options.primaryButton || null,
      secondaryButton: options.secondaryButton || null,
    });
  }, []);

  const hideBottomSheet = useCallback(() => {
    setConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <BottomSheetContext.Provider
      value={{
        ...config,
        showBottomSheet,
        hideBottomSheet,
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error(
      'useBottomSheet debe ser usado dentro de un BottomSheetProvider'
    );
  }
  return context;
};
