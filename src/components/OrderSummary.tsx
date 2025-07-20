
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'lanche' | 'bebida' | 'sobremesa';
  available: boolean;
  quantity?: number;
}

interface OrderSummaryProps {
  items: MenuItem[];
  onRemoveItem: (id: number) => void;
  totalPrice: number;
  onCreateOrder: (deliveryMethod: 'balcao' | 'drive' | 'delivery', observations: string) => string;
}

const OrderSummary = ({ items, onRemoveItem, totalPrice, onCreateOrder }: OrderSummaryProps) => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState('balcao');
  const [observations, setObservations] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de finalizar o pedido.",
        variant: "destructive"
      });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const handleConfirmOrder = () => {
    const orderId = onCreateOrder(deliveryMethod as 'balcao' | 'drive' | 'delivery', observations);
    
    toast({
      title: "Pedido realizado com sucesso!",
      description: `Seu pedido foi enviado para a cozinha. Método: ${deliveryMethod === 'balcao' ? 'Balcão' : deliveryMethod === 'drive' ? 'Drive-thru' : 'Delivery'}`,
    });
    
    setIsCheckoutOpen(false);
    setObservations('');
    setDeliveryMethod('balcao');
    
    // Redirecionar para a página de acompanhamento
    navigate(`/order/${orderId}`);
  };

  const deliveryFee = deliveryMethod === 'delivery' ? 5.90 : 0;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <>
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Resumo do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Seu carrinho está vazio
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-green-600 font-bold">
                          R$ {item.price.toFixed(2)}
                        </span>
                        {item.quantity && item.quantity > 1 && (
                          <Badge variant="secondary">
                            {item.quantity}x
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">R$ {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white font-bold py-3"
                size="lg"
              >
                Finalizar Pedido
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Pedido</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="space-y-2">
              <h3 className="font-semibold">Resumo do Pedido</h3>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>R$ {(item.price * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Method */}
            <div className="space-y-3">
              <h3 className="font-semibold">Forma de Entrega</h3>
              <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balcao" id="balcao" />
                  <Label htmlFor="balcao">Retirar no Balcão (Grátis)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="drive" id="drive" />
                  <Label htmlFor="drive">Drive-thru (Grátis)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery">Delivery (+R$ 5,90)</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observações (opcional)</Label>
              <Textarea
                id="observations"
                placeholder="Alguma observação especial para seu pedido?"
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                rows={3}
              />
            </div>

            {/* Total */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Total a Pagar:</span>
                <span className="font-bold text-xl text-green-600">
                  R$ {finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={handleConfirmOrder}
                className="flex-1 bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600"
              >
                Confirmar Pedido
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrderSummary;
