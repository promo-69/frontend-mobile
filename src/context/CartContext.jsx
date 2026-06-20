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
  const [cart, setCart] = useState({
    tickets: [],
    products: [],
    movie: null,
    showtime: null,
  });

  // Cargar carrito desde AsyncStorage
  useEffect(() => {
    async function loadSavedCart() {
      try {
        const saved = await AsyncStorage.getItem(ASYNC_STORAGE_KEY);
        if (saved) setCart(JSON.parse(saved));
      } catch (error) {
        console.error('Error cargando el carrito:', error);
      }
    }
    loadSavedCart();
  }, []);

  // Guardar carrito en AsyncStorage
  useEffect(() => {
    async function saveCart() {
      try {
        await AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error guardando el carrito:', error);
      }
    }
    saveCart();
  }, [cart]);

  // --- Funciones del carrito ---
  const addTicket = useCallback((ticket) => {
    setCart((prev) => ({ ...prev, tickets: [...prev.tickets, ticket] }));
  }, []);

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

  const removeTicket = useCallback((seatId) => {
    setCart((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((t) => t.seatId !== seatId),
    }));
  }, []);

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

  const removeProduct = useCallback((itemId, isCombo = false) => {
    const matchKey = isCombo ? 'comboId' : 'productId';
    setCart((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p[matchKey] !== itemId),
    }));
  }, []);

  const setMovie = useCallback((movie) => {
    setCart((prev) => {
      if (prev.movie && prev.movie.id !== movie.id) {
        return {
          ...prev,
          movie,
          tickets: [],
          products: [],
          showtime: null,
        };
      }
      return { ...prev, movie };
    });
  }, []);

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

  const setShowtime = useCallback((showtime) => {
    setCart((prev) => ({ ...prev, showtime }));
  }, []);

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

  // Totales
  const totalsCalculated = useMemo(() => {
    const ticketTotal = cart.tickets.reduce((acc, t) => acc + t.price, 0);
    const productTotal = cart.products.reduce(
      (acc, p) => acc + p.price * p.quantity,
      0
    );
    const subtotal = ticketTotal + productTotal;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { ticketTotal, productTotal, subtotal, iva, total };
  }, [cart.tickets, cart.products]);

  return (
    <CartContext.Provider
      value={{
        cart,
        addTicket,
        toggleSeat,
        removeTicket,
        addProduct,
        updateProductQuantity,
        removeProduct,
        setMovie,
        setShowtime,
        updateCartDetails,
        clearCart,
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
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
