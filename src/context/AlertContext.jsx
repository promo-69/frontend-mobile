import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppAlert } from '../components/ui/AppAlert';

const AlertContext = createContext(null);

// Handler global para poder llamar appAlert() desde cualquier módulo,
// incluso fuera de componentes (services, helpers, etc.).
let globalShow = null;

export const appAlert = (title, message, buttons, options = {}) => {
  if (globalShow) {
    globalShow(title, message, buttons, options);
  } else {
    // Provider no montado: degradamos al Alert nativo (nunca perder un aviso).
    Alert.alert(title, message, buttons);
  }
};

export const AlertProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  const show = useCallback((title, message, buttons, options = {}) => {
    const list = Array.isArray(buttons) && buttons.length > 0 ? buttons : null;

    let cancelBtn = null;
    let confirmBtn = null;

    if (!list) {
      confirmBtn = { text: 'Entendido' };
    } else if (list.length === 1) {
      confirmBtn = list[0];
    } else {
      cancelBtn = list.find((b) => b?.style === 'cancel') ?? list[0];
      confirmBtn = list.find((b) => b !== cancelBtn) ?? list[list.length - 1];
    }

    const variant =
      options.variant ??
      (confirmBtn?.style === 'destructive' ? 'danger' : 'primary');

    setConfig({
      title,
      message,
      variant,
      icon: options.icon,
      confirmLabel: confirmBtn?.text || 'Entendido',
      cancelLabel: cancelBtn?.text,
      onConfirm: () => {
        setConfig(null);
        confirmBtn?.onPress?.();
      },
      onCancel: () => {
        setConfig(null);
        cancelBtn?.onPress?.();
      },
    });
  }, []);

  // Registrar/limpiar el handler global.
  useEffect(() => {
    globalShow = show;
    return () => {
      if (globalShow === show) globalShow = null;
    };
  }, [show]);

  return (
    <AlertContext.Provider value={show}>
      {children}
      <AppAlert
        visible={!!config}
        title={config?.title}
        message={config?.message}
        icon={config?.icon}
        variant={config?.variant}
        confirmLabel={config?.confirmLabel}
        cancelLabel={config?.cancelLabel}
        onConfirm={config?.onConfirm}
        onCancel={config?.onCancel}
      />
    </AlertContext.Provider>
  );
};

/** Hook opcional para componentes (equivalente a usar appAlert directamente). */
export const useAppAlert = () => {
  const contextShow = useContext(AlertContext);
  return contextShow ?? appAlert;
};
