import React, { createContext, useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);

  // Load cart on login / change of user
  useEffect(() => {
    if (user && user.role === 'cliente') {
      const savedCart = localStorage.getItem(`cart_${user.codigoCliente}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error('Failed to parse saved cart:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  }, [user]);

  // Save cart whenever it changes
  useEffect(() => {
    if (user && user.role === 'cliente') {
      localStorage.setItem(`cart_${user.codigoCliente}`, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productoId === product._id);
      const addQty = Number(qty);
      
      if (addQty <= 0) return prevItems;

      if (existingItem) {
        return prevItems.map((item) =>
          item.productoId === product._id
            ? { ...item, cantidad: item.cantidad + addQty }
            : item
        );
      }

      return [
        ...prevItems,
        {
          productoId: product._id,
          codigo: product.codigo,
          nombre: product.nombre,
          marca: product.marca,
          precioSinIVA: product.precioSinIVA,
          imagen: product.imagen,
          cantidad: addQty
        }
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.productoId !== productId));
  };

  const updateQuantity = (productId, qty) => {
    const newQty = Number(qty);
    
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.productoId === productId ? { ...item, cantidad: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    if (user && user.role === 'cliente') {
      localStorage.removeItem(`cart_${user.codigoCliente}`);
    }
  };

  const getCartSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.precioSinIVA * item.cantidad, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartSubtotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
