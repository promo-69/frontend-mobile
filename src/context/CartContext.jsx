import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';

export const CartContext = createContext();

const ASYNC_STORAGE_KEY = 'cineflix_cart';

export function CartProvider({ children }) {
  // Estado global del carrito
  const [cart, setCart] = useState({
    tickets: [],
    products: [],
    movie: null,
    showtime: null,
  });

  // Cargar carrito de forma ASÍNCRONA desde AsyncStorage
  useEffect(() => {
    async function loadSavedCart() {
      try {
        const saved = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        if (saved) {
          setCart(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error cargando el carrito desde AsyncStorage:', error);
      }
    }
    loadSavedCart();
  }, []);

  // Guardar carrito asíncronamente cada vez que cambie el estado
  useEffect(() => {
    async function saveCart() {
      try {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error guardando el carrito en AsyncStorage:', error);
      }
    }
    saveCart();
  }, [cart]);

  // Agregar boletos
  const addTicket = useCallback((ticket) => {
    setCart((prev) => ({
      ...prev,
      tickets: [...prev.tickets, ticket],
    }));
  }, []);

  // Alternar selección de asiento (Toggle) para simplificar la lógica en SelectSeats
  const toggleSeat = useCallback((seatId, seatData) => {
    setCart((prev) => {
      const isSelected = prev.tickets.some((t) => t.seatId === seatId);
      if (isSelected) {
        return {
          ...prev,
          tickets: prev.tickets.filter((t) => t.seatId !== seatId),
        };
      }
      return {
        ...prev,
        tickets: [...prev.tickets, { seatId, ...seatData }],
      };
    });
  }, []);

  // Quitar boleto
  const removeTicket = useCallback((seatId) => {
    setCart((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((t) => t.seatId !== seatId),
    }));
  }, []);

  // Agregar producto o combo de confitería, o aumentar cantidad si ya existe
  const addProduct = useCallback((product) => {
    setCart((prev) => {
      const isCombo = !!product.comboId;
      const matchKey = isCombo ? 'comboId' : 'productId';
      const matchId = isCombo ? product.comboId : product.productId;
      const exists = prev.products.find((p) => p[matchKey] === matchId);

      if (exists) {
        return {
          ...prev,
          products: prev.products.map((p) =>
            p[matchKey] === matchId
              ? { ...p, quantity: p.quantity + product.quantity }
              : p
          ),
        };
      }
      return {
        ...prev,
        products: [...prev.products, product],
      };
    });
  }, []);

  // Actualizar cantidad directamente desde selectores numéricos
  // isCombo: true cuando el item es un combo (usa comboId en lugar de productId)
  const updateProductQuantity = useCallback(
    (itemId, newQuantity, isCombo = false) => {
      if (newQuantity <= 0) {
        removeProduct(itemId, isCombo);
        return;
      }
      const matchKey = isCombo ? 'comboId' : 'productId';
      setCart((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p[matchKey] === itemId ? { ...p, quantity: newQuantity } : p
        ),
      }));
    },
    []
  );

  // Quitar producto o combo por completo del carrito
  const removeProduct = useCallback((itemId, isCombo = false) => {
    const matchKey = isCombo ? 'comboId' : 'productId';
    setCart((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p[matchKey] !== itemId),
    }));
  }, []);

  // Guardar película (Verificando si es una nueva para limpiar asientos viejos)
  const setMovie = useCallback((movie) => {
    setCart((prev) => {
      // Si la película cambia, se limpian los tickets anteriores
      if (prev.movie && prev.movie.id !== movie.id) {
        return {
          ...prev,
          movie,
          tickets: [],
          products: [], // Opcional: limpiar snacks si cambia de peli
          showtime: null,
        };
      }
      return { ...prev, movie };
    });
  }, []);

  // Sincronizar detalles del carrito y limpiar selección si cambia la función
  const updateCartDetails = useCallback((movieData, showtimeData) => {
    setCart((prev) => {
      const isDifferentShowtime =
        prev.showtime && prev.showtime.id !== showtimeData.id;
      const isDifferentMovie = prev.movie && prev.movie.id !== movieData.id;

      return {
        ...prev,
        movie: movieData,
        showtime: showtimeData,
        tickets: isDifferentShowtime || isDifferentMovie ? [] : prev.tickets,
      };
    });
  }, []);

  // Guardar showtime
  const setShowtime = useCallback((showtime) => {
    setCart((prev) => ({ ...prev, showtime }));
  }, []);

  // Totales (Lógica pura, se mantiene intacta)
  const totalsCalculated = useMemo(() => {
    const ticketTotal = cart.tickets.reduce((acc, t) => acc + t.price, 0);
    const productTotal = cart.products.reduce(
      (acc, p) => acc + p.price * p.quantity,
      0
    );

    const subtotal = ticketTotal + productTotal;
    const iva = subtotal * 0.16; // IVA de Venezuela (16%)
    const total = subtotal + iva;

    return { ticketTotal, productTotal, subtotal, iva, total };
  }, [cart.tickets, cart.products]);

  // Limpiar carrito al finalizar el pago exitoso
  const clearCart = useCallback(async () => {
    setCart({
      tickets: [],
      products: [],
      movie: null,
      showtime: null,
    });
    try {
      await AsyncStorage.removeItem(ASYNC_STORAGE_KEY);
    } catch (error) {
      console.error('Error eliminando AsyncStorage:', error);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        toggleSeat,
        addTicket,
        removeTicket,
        addProduct,
        updateProductQuantity, // Expuesto para los botones +/- de la vista de snacks
        removeProduct,
        setMovie,
        setShowtime,
        updateCartDetails,
        ...totalsCalculated,
        totalAmount: totalsCalculated.total,
        clearCart,
        getTotals: () => totalsCalculated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
