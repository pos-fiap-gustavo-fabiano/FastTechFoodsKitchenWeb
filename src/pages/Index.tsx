import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, ChefHat, UserCog, Loader2, Settings } from "lucide-react";
import AuthModal from '@/components/AuthModal';
import MenuSection from '@/components/MenuSection';
import OrderManagement from '@/components/OrderManagement';
import UserManagement from '@/components/UserManagement';
import ApiTester from '@/components/ApiTester';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'dashboard' | 'users' | 'api-test'>('menu');
  
  const { user, isAuthenticated, isLoading, logout, isManager, isAdmin } = useAuth();

  const handleAuth = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // O estado já foi atualizado pelo hook useAuth, apenas fechamos o modal
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
    setActiveTab('menu');
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
        <header className="bg-gradient-to-r from-red-600 to-yellow-500 text-white p-4 shadow-lg">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">FastTech Foods</h1>
              <Badge className="bg-yellow-400 text-black font-semibold">
                {user.roles.includes('Admin') ? 'Administrador' : 
                 user.roles.includes('Manager') ? 'Gerente' : 'Funcionário'}
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Olá, {user.name}!</span>
              <Button onClick={handleLogout} variant="secondary">
                Sair
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6">
          {/* Navigation Tabs */}
          <div className="flex gap-4 mb-6">
            <Button
              variant={activeTab === 'menu' ? 'default' : 'outline'}
              onClick={() => setActiveTab('menu')}
              className="flex items-center gap-2"
            >
              <ChefHat className="h-4 w-4" />
              {isManager() ? 'Gerenciar Cardápio' : 'Cardápio'}
            </Button>
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Pedidos da Cozinha
            </Button>
            {isManager() && (
              <>
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('dashboard')}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Dashboard
                </Button>
                
              </>
            )}
          </div>

          {/* Content */}
          {activeTab === 'menu' && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5" />
                  {isManager() ? 'Gerenciar Cardápio' : 'Visualizar Cardápio'}
                </CardTitle>
                <CardDescription>
                  {isManager() 
                    ? 'Adicione, edite ou remova itens do cardápio'
                    : 'Visualize os itens disponíveis no cardápio'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MenuSection user={user} />
              </CardContent>
            </Card>
          )}

          {activeTab === 'orders' && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pedidos da Cozinha
                </CardTitle>
                <CardDescription>
                  Gerencie e acompanhe o status dos pedidos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderManagement user={user} />
              </CardContent>
            </Card>
          )}

          {activeTab === 'dashboard' && isManager() && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Dashboard da Cozinha
                </CardTitle>
                <CardDescription>
                  Análise completa dos pedidos e estatísticas do restaurante
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dashboard user={user} />
              </CardContent>
            </Card>
          )}

          {activeTab === 'users' && isManager() && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  Gerenciar Usuários
                </CardTitle>
                <CardDescription>
                  Cadastre e gerencie funcionários do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement user={user} />
              </CardContent>
            </Card>
          )}

          {activeTab === 'api-test' && isManager() && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Teste da API
                </CardTitle>
                <CardDescription>
                  Teste a conectividade e funcionalidade da API de autenticação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiTester />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-yellow-500 text-white shadow-xl">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold">FastTech Foods</h1>
              <Badge className="bg-yellow-400 text-black font-semibold">
                Sistema Funcionário
              </Badge>
            </div>
            <Button 
              onClick={handleAuth}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Login Funcionário
            </Button>
          </div>
        </div>
      </header>

      {/* Login Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Painel do Funcionário
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Sistema interno para gerenciamento do cardápio e pedidos da FastTech Foods
          </p>
          
          <Button 
            onClick={handleAuth}
            size="lg"
            className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600 text-white font-bold py-4 px-8 text-lg"
          >
            Acessar Sistema
          </Button>
        </div>
      </section>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        type="employee"
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
