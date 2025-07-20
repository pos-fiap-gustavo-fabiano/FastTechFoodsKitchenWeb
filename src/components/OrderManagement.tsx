
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatusAnimation from './StatusAnimation';
import { User } from '@/hooks/useAuth';
import { OrdersApi, ApiOrder, UpdateOrderStatusRequest } from '@/lib/api';
import { toast } from "sonner";

interface OrderManagementProps {
  user: User;
}

const OrderManagement = ({ user }: OrderManagementProps) => {
  const [orders, setOrders] = useState<ApiOrder[]>([]);

  // Carregar pedidos da API
  const loadOrders = async () => {
    try {
      const ordersData = await OrdersApi.getOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Chamar API real
      const updateData: UpdateOrderStatusRequest = {
        status: newStatus,
        updatedBy: user.id,
        userName: user.name,
        notes: `Status alterado para ${newStatus}`
      };

      await OrdersApi.updateOrderStatus(orderId, updateData);
      toast.success(`Pedido ${orderId} atualizado!`);
      
      // Recarregar pedidos após atualização
      await loadOrders();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do pedido');
    }
  };

  const getStatusActions = (order: ApiOrder) => {
    switch (order.status) {
      case 'Received':
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => updateOrderStatus(order.id, 'accepted')}
            >
              Aceitar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateOrderStatus(order.id, 'cancelled')}
            >
              Rejeitar
            </Button>
          </div>
        );
      case 'accepted':
        return (
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
            onClick={() => updateOrderStatus(order.id, 'preparing')}
          >
            Iniciar Preparo
          </Button>
        );
      case 'preparing':
        return (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => updateOrderStatus(order.id, 'ready')}
          >
            Marcar como Pronto
          </Button>
        );
      case 'ready':
        return (
          <div className="text-sm text-green-600 font-semibold">
            ✅ Pedido Pronto!
          </div>
        );
      case 'cancelled':
        return (
          <div className="text-sm text-red-600 font-semibold">
            ❌ Pedido Cancelado
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Pedidos da Cozinha
        </h2>
        <div className="text-sm text-gray-600">
          {orders.filter(o => o.status === 'pending').length} pedidos aguardando
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card 
            key={order.id} 
            className={`hover:shadow-lg transition-all duration-300 ${
              order.status === 'pending' ? 'ring-2 ring-yellow-200 animate-pulse' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                  <CardDescription>
                    {new Date(order.orderDate).toLocaleString('pt-BR')}
                  </CardDescription>
                </div>
                <StatusAnimation status={order.status} />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {/* Itens do pedido */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Itens:</h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {(item.unitPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Ações */}
                <div className="flex justify-end">
                  {getStatusActions(order)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Nenhum pedido no momento
          </h3>
          <p className="text-gray-500">
            Os novos pedidos aparecerão aqui automaticamente
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;