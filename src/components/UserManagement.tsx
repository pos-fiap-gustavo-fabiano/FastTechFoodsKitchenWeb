
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Edit, Trash2 } from "lucide-react";
import { User } from '@/hooks/useAuth';

interface UserData {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  role: string;
  createdAt: Date;
}

interface UserManagementProps {
  user: User;
}

const UserManagement = ({ user }: UserManagementProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    password: '',
    role: 'employee'
  });

  // Mock data - em produção viria de uma API
  const [users, setUsers] = useState<UserData[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@fasttechfoods.com',
      cpf: '123.456.789-00',
      role: 'employee',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@fasttechfoods.com',
      cpf: '987.654.321-00',
      role: 'employee',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: '3',
      name: 'Carlos Gerente',
      email: 'gerente@fasttechfoods.com',
      cpf: '555.666.777-88',
      role: 'manager',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular criação do usuário - em produção seria uma chamada à API
    const newUser: UserData = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      cpf: formData.cpf || undefined,
      role: formData.role,
      createdAt: new Date()
    };

    console.log('Creating user:', { ...formData });
    
    // Adicionar à lista
    setUsers(prev => [newUser, ...prev]);
    
    // Resetar form
    setFormData({
      name: '',
      email: '',
      cpf: '',
      password: '',
      role: 'employee'
    });
    
    setShowAddForm(false);
  };

  const handleDelete = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    console.log('Deleting user:', userId);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h2>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      {/* Formulário de Adicionar Usuário */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Cadastrar Novo Funcionário
            </CardTitle>
            <CardDescription>
              Preencha os dados do novo funcionário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Ex: João Silva"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail Corporativo *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="funcionario@fasttechfoods.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    placeholder="000.000.000-00"
                    value={formData.cpf}
                    onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Senha temporária"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Funcionário</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Cadastrar Funcionário
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funcionários Cadastrados
          </CardTitle>
          <CardDescription>
            {users.length} funcionários no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((userData) => (
              <div key={userData.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{userData.name}</h4>
                      <Badge variant={userData.role === 'manager' ? 'default' : 'secondary'}>
                        {userData.role === 'manager' ? 'Gerente' : 'Funcionário'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">E-mail:</span> {userData.email}
                      </div>
                      {userData.cpf && (
                        <div>
                          <span className="font-medium">CPF:</span> {formatCPF(userData.cpf)}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Cadastrado:</span> {userData.createdAt.toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button size="sm" variant="outline" className="flex items-center gap-1">
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(userData.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Nenhum funcionário cadastrado
                </h3>
                <p className="text-gray-500">
                  Adicione funcionários para começar a gerenciar a equipe
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
