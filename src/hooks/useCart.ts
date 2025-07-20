
import { useState } from 'react';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'lanche' | 'bebida' | 'sobremesa';
  available: boolean;
  quantity?: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  items: MenuItem[];
  totalPrice: number;
  deliveryMethod: 'balcao' | 'drive' | 'delivery';
  deliveryFee: number;
  finalTotal: number;
  observations: string;
  status: OrderStatus;
  createdAt: Date;
  estimatedTime?: number; // em minutos
}

export const useCart = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addItem = (newItem: MenuItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === newItem.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === newItem.id 
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...newItem, quantity: 1 }];
      }
    });
  };

  const removeItem = (id: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === id);
      
      if (existingItem && existingItem.quantity && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.id === id 
            ? { ...item, quantity: item.quantity! - 1 }
            : item
        );
      } else {
        return prevItems.filter(item => item.id !== id);
      }
    });
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  const createOrder = (deliveryMethod: 'balcao' | 'drive' | 'delivery', observations: string = '') => {
    const deliveryFee = deliveryMethod === 'delivery' ? 5.90 : 0;
    const totalPrice = getTotalPrice();
    const finalTotal = totalPrice + deliveryFee;
    
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...items],
      totalPrice,
      deliveryMethod,
      deliveryFee,
      finalTotal,
      observations,
      status: 'pending',
      createdAt: new Date(),
      estimatedTime: Math.floor(Math.random() * 20) + 15 // 15-35 minutos
    };

    setOrders(prevOrders => [newOrder, ...prevOrders]);
    clearCart();
    
    return newOrder.id;
  };

  const getOrderById = (orderId: string) => {
    return orders.find(order => order.id === orderId);
  };

  const getOrderHistory = () => {
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  // Simular mudança de status do pedido
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return {
    items,
    addItem,
    removeItem,
    getTotalPrice,
    clearCart,
    createOrder,
    orders,
    getOrderById,
    getOrderHistory,
    updateOrderStatus
  };
};
