import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

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

  // Agregar producto de confitería o aumentar cantidad
  const addProduct = useCallback((product) => {
    setCart((prev) => {
      const exists = prev.products.find((p) => p.productId === product.productId);

      if (exists) {
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.productId === product.productId
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
  const updateProductQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeProduct(productId);
      return;
    }

    setCart((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.productId === productId ? { ...p, quantity: newQuantity } : p
      ),
    }));
  }, []);

  // Quitar producto por completo del carrito
  const removeProduct = useCallback((productId) => {
    setCart((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.productId !== productId),
    }));
  }, []);

  // Guardar película (Verificando si es una nueva para limpiar asientos viejos)
  const setMovie = useCallback((movie) => {
    setCart((prev) => {
      // Si la película cambia, lo ideal en mobile UX es limpiar los tickets anteriores
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
      const isDifferentShowtime = prev.showtime && prev.showtime.id !== showtimeData.id;
      const isDifferentMovie = prev.movie && prev.movie.id !== movieData.id;
      
      return {
        ...prev,
        movie: movieData,
        showtime: showtimeData,
        tickets: (isDifferentShowtime || isDifferentMovie) ? [] : prev.tickets,
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
    const productTotal = cart.products.reduce((acc, p) => acc + p.price * p.quantity, 0);

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
        updateProductQuantity, // Expuesto para tus botones +/- de la vista de snacks
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
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}