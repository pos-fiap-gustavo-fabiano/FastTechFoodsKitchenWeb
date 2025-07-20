
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, TrendingUp, Clock, DollarSign, Package, ChefHat, Loader2 } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";
import StatusAnimation from './StatusAnimation';
import { User } from '@/hooks/useAuth';
import { AnalyticsApi, OrdersApi, DashboardData, OrdersByStatus, TopProduct, ApiOrder } from '@/lib/api';

interface DashboardProps {
  user: User;
}

const Dashboard = ({ user }: DashboardProps) => {
  // Estados
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  // Carregamento de dados
  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Calcular intervalo de datas
      const today = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;

      switch (dateFilter) {
        case 'today': {
          startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
          endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
          break;
        }
        case 'week': {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          startDate = weekStart.toISOString();
          endDate = today.toISOString();
          break;
        }
        case 'month': {
          startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
          endDate = today.toISOString();
          break;
        }
        default:
          // all - sem filtro de data
          break;
      }
      
      const [dashboardResponse, ordersResponse, ordersByStatusResponse, topProductsResponse] = await Promise.all([
        AnalyticsApi.getDashboard(startDate, endDate),
        OrdersApi.getOrders(),
        AnalyticsApi.getOrdersByStatus(startDate, endDate),
        AnalyticsApi.getTopProducts(5, startDate, endDate)
      ]);
      
      setDashboardData(dashboardResponse);
      setOrders(ordersResponse);
      setOrdersByStatus(ordersByStatusResponse);
      setTopProducts(topProductsResponse);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getDateRange = () => {
    const today = new Date();
    let startDate: string | undefined;
    let endDate: string | undefined;

    switch (dateFilter) {
      case 'today': {
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59).toISOString();
        break;
      }
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString();
        endDate = today.toISOString();
        break;
      }
      case 'month': {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        endDate = today.toISOString();
        break;
      }
      default:
        // all - sem filtro de data
        break;
    }

    return { startDate, endDate };
  };

  // Filtrar pedidos localmente
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === statusFilter);
  }, [orders, statusFilter]);

  // Dados para gráficos
  const statusChartData = ordersByStatus.map(item => ({
    status: item.status === 'pending' ? 'Aguardando' : 
            item.status === 'accepted' ? 'Aceito' :
            item.status === 'preparing' ? 'Preparando' :
            item.status === 'ready' ? 'Pronto' : 'Cancelado',
    count: item.count
  }));

  const pieColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6b7280'];

  if (isLoading || !dashboardData) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard da Cozinha</h2>
        <div className="text-sm text-gray-600">
          {filteredOrders.length} pedidos encontrados
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Aguardando</SelectItem>
                  <SelectItem value="accepted">Aceito</SelectItem>
                  <SelectItem value="preparing">Preparando</SelectItem>
                  <SelectItem value="ready">Pronto</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
                <p className="text-2xl font-bold">{dashboardData.totalOrders || 0}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold">R$ {(dashboardData.totalRevenue || 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ {(dashboardData.avgOrderValue || 0).toFixed(2)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Preparo</p>
                <p className="text-2xl font-bold">{dashboardData.preparingOrders || 0}</p>
              </div>
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Status */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos por Status</CardTitle>
            <CardDescription>Distribuição dos pedidos por status atual</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: {
                  label: "Quantidade",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
            <CardDescription>Top 5 produtos por quantidade vendida</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                quantity: {
                  label: "Quantidade",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-[300px]"
            >
              <BarChart data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="productName" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos Filtrados */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Filtrados</CardTitle>
          <CardDescription>Lista detalhada dos pedidos baseada nos filtros aplicados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold">Pedido #{order.id}</h4>
                    <p className="text-sm text-gray-600">
                      Status: {order.status}
                    </p>
                  </div>
                  <StatusAnimation status={order.status} />
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-3">
                  <h5 className="font-medium text-sm mb-2">Itens:</h5>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span>R$ {item.unitPrice ? (item.unitPrice * item.quantity).toFixed(2) : '0.00'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">R$ {order.total ? order.total.toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum pedido encontrado
                </h3>
                <p className="text-gray-500">
                  Tente ajustar os filtros para ver mais resultados
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
