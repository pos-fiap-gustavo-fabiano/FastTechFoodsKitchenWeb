
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Package, Eye } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Order } from '@/hooks/useCart';

interface OrderHistoryProps {
  orders: Order[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-500';
    case 'accepted': return 'bg-blue-500';
    case 'preparing': return 'bg-orange-500';
    case 'ready': return 'bg-green-500';
    case 'delivered': return 'bg-gray-500';
    case 'cancelled': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'Aguardando';
    case 'accepted': return 'Aceito';
    case 'preparing': return 'Preparando';
    case 'ready': return 'Pronto';
    case 'delivered': return 'Entregue';
    case 'cancelled': return 'Cancelado';
    default: return status;
  }
};

const getDeliveryMethodLabel = (method: string) => {
  switch (method) {
    case 'balcao': return 'Balcão';
    case 'drive': return 'Drive-thru';
    case 'delivery': return 'Delivery';
    default: return method;
  }
};

const OrderHistory = ({ orders }: OrderHistoryProps) => {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Nenhum pedido encontrado
        </h3>
        <p className="text-gray-500">
          Você ainda não fez nenhum pedido. Que tal começar agora?
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Meus Pedidos</h2>
      
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>{order.createdAt.toLocaleDateString('pt-BR')} às {order.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  {getStatusLabel(order.status)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {getDeliveryMethodLabel(order.deliveryMethod)}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Itens do Pedido:</h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.name}</span>
                      <span>R$ {(item.price * (item.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {order.totalPrice.toFixed(2)}</span>
                  </div>
                  {order.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span>R$ {order.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {order.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => navigate(`/order/${order.id}`)}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Acompanhar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderHistory;
