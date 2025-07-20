
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Clock, CheckCircle, Truck, ChefHat, Package, ArrowLeft, History } from "lucide-react";
import { useCart, OrderStatus } from '@/hooks/useCart';

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus, getOrderHistory } = useCart();
  const [currentTime, setCurrentTime] = useState(new Date());

  const order = orderId ? getOrderById(orderId) : null;
  const orderHistory = getOrderHistory();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simular progressão do pedido
  useEffect(() => {
    if (!order || !orderId) return;

    const statusProgression: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready'];
    let currentIndex = statusProgression.indexOf(order.status);

    if (currentIndex < statusProgression.length - 1) {
      const timeout = setTimeout(() => {
        updateOrderStatus(orderId, statusProgression[currentIndex + 1]);
      }, Math.random() * 30000 + 10000); // 10-40 segundos

      return () => clearTimeout(timeout);
    }
  }, [order?.status, orderId, updateOrderStatus]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Pedido não encontrado</h2>
            <p className="text-gray-600 mb-6">O pedido que você está procurando não existe ou foi removido.</p>
            <Button onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: OrderStatus) => {
    const colors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-blue-500',
      preparing: 'bg-orange-500',
      ready: 'bg-green-500',
      delivered: 'bg-green-600',
      cancelled: 'bg-red-500'
    };
    return colors[status];
  };

  const getStatusText = (status: OrderStatus) => {
    const texts = {
      pending: 'Aguardando Confirmação',
      accepted: 'Pedido Aceito',
      preparing: 'Em Preparo',
      ready: 'Pronto para Retirada',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return texts[status];
  };

  const getProgressPercentage = (status: OrderStatus) => {
    const progress = {
      pending: 25,
      accepted: 50,
      preparing: 75,
      ready: 100,
      delivered: 100,
      cancelled: 0
    };
    return progress[status];
  };

  const getDeliveryMethodText = (method: string) => {
    const methods = {
      balcao: 'Retirar no Balcão',
      drive: 'Drive-thru',
      delivery: 'Delivery'
    };
    return methods[method as keyof typeof methods];
  };

  const timeSinceOrder = Math.floor((currentTime.getTime() - order.createdAt.getTime()) / 60000);
  const estimatedReady = new Date(order.createdAt.getTime() + (order.estimatedTime || 25) * 60000);
  const isReady = order.status === 'ready' || order.status === 'delivered';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Acompanhar Pedido</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status do Pedido */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Pedido #{order.id}</span>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {getStatusText(order.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progresso do Pedido</span>
                    <span>{getProgressPercentage(order.status)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(order.status)} className="h-2" />
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['pending', 'accepted', 'preparing', 'ready', 'delivered'].includes(order.status) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Pedido Recebido</p>
                      <p className="text-sm text-gray-600">
                        {order.createdAt.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['accepted', 'preparing', 'ready', 'delivered'].includes(order.status) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200'
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Confirmado pela Cozinha</p>
                      <p className="text-sm text-gray-600">
                        {['accepted', 'preparing', 'ready', 'delivered'].includes(order.status) 
                          ? 'Confirmado' 
                          : 'Aguardando confirmação'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['preparing', 'ready', 'delivered'].includes(order.status) 
                        ? 'bg-green-500 text-white' 
                        : order.status === 'preparing' 
                          ? 'bg-orange-500 text-white animate-pulse'
                          : 'bg-gray-200'
                    }`}>
                      <ChefHat className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">Em Preparo</p>
                      <p className="text-sm text-gray-600">
                        {order.status === 'preparing' 
                          ? 'Sendo preparado agora...'
                          : ['ready', 'delivered'].includes(order.status)
                            ? 'Preparado'
                            : 'Aguardando preparo'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      ['ready', 'delivered'].includes(order.status) 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200'
                    }`}>
                      {order.deliveryMethod === 'delivery' ? (
                        <Truck className="h-4 w-4" />
                      ) : (
                        <Package className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {order.deliveryMethod === 'delivery' ? 'Saiu para Entrega' : 'Pronto para Retirada'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isReady ? 'Pedido pronto!' : 'Aguardando...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tempo Estimado */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">Tempo Estimado</span>
                  </div>
                  <p className="text-blue-700">
                    {isReady 
                      ? 'Seu pedido está pronto!'
                      : `Previsão: ${estimatedReady.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} (${Math.max(0, (order.estimatedTime || 25) - timeSinceOrder)} min restantes)`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Pedido */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Itens</h4>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {(item.price * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Entrega</h4>
                  <p className="text-sm text-gray-600">{getDeliveryMethodText(order.deliveryMethod)}</p>
                </div>

                {order.observations && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Observações</h4>
                      <p className="text-sm text-gray-600">{order.observations}</p>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega</span>
                    <span>R$ {order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-green-600">R$ {order.finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico de Pedidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderHistory.slice(0, 3).map((historyOrder) => (
                    <div key={historyOrder.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-sm">#{historyOrder.id}</p>
                        <p className="text-xs text-gray-600">
                          {historyOrder.createdAt.toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="secondary" 
                          className={`${getStatusColor(historyOrder.status)} text-white text-xs`}
                        >
                          {getStatusText(historyOrder.status)}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">
                          R$ {historyOrder.finalTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {orderHistory.length > 3 && (
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Todos os Pedidos
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
