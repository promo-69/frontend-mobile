import Toast from 'react-native-toast-message';

/**
 * ToastHelper que envuelve la dependencia para proveer un limpio 
 * y centralizado mensajes de retraolimentacion no intrusivos
 */
export const ToastHelper = {
  showSuccess: (title, description = '') => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: description,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },

  showError: (title, description = '') => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: description || undefined,
      position: 'top',
      visibilityTime: 5000,
      autoHide: true,
      topOffset: 60,
    });
  },

  showInfo: (title, description = '') => {
    Toast.show({
      type: 'info',
      text1: title,
      text2: description || undefined,
      position: 'top',
      visibilityTime: 4000,
      autoHide: true,
      topOffset: 60,
    });
  },
};
