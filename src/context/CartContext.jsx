import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

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
  const addTicket = (ticket) => {
    setCart((prev) => ({
      ...prev,
      tickets: [...prev.tickets, ticket],
    }));
  };

  // Quitar boleto
  const removeTicket = (seatId) => {
    setCart((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((t) => t.seatId !== seatId),
    }));
  };

  // Agregar producto de confitería o aumentar cantidad
  const addProduct = (product) => {
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
  };

  // Actualizar cantidad directamente desde selectores numéricos
  const updateProductQuantity = (productId, newQuantity) => {
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
  };

  // Quitar producto por completo del carrito
  const removeProduct = (productId) => {
    setCart((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.productId !== productId),
    }));
  };

  // Guardar película (Verificando si es una nueva para limpiar asientos viejos)
  const setMovie = (movie) => {
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
  };

  // Guardar showtime
  const setShowtime = (showtime) => {
    setCart((prev) => ({ ...prev, showtime }));
  };

  // Totales (Lógica pura, se mantiene intacta)
  const getTotals = () => {
    const ticketTotal = cart.tickets.reduce((acc, t) => acc + t.price, 0);
    const productTotal = cart.products.reduce((acc, p) => acc + p.price * p.quantity, 0);

    const subtotal = ticketTotal + productTotal;
    const iva = subtotal * 0.16; // IVA de Venezuela (16%) 
    const total = subtotal + iva;

    return { ticketTotal, productTotal, subtotal, iva, total };
  };

  // Limpiar carrito al finalizar el pago exitoso
  const clearCart = async () => {
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
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addTicket,
        removeTicket,
        addProduct,
        updateProductQuantity, // Expuesto para tus botones +/- de la vista de snacks
        removeProduct,
        setMovie,
        setShowtime,
        getTotals,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}