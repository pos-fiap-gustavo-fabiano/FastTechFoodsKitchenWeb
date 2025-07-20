# FastTech Foods - Integração com API Real

## 🚀 Visão Geral

O sistema FastTech Foods agora está totalmente integrado com a API real de autenticação. A aplicação suporta autenticação completa, gerenciamento de roles e todas as funcionalidades da API.

## 🔧 Configuração da API

### URL Base
```
http://localhost:5271/api
```

### Roles Suportadas
- **Admin**: Acesso total ao sistema
- **Manager**: Acesso gerencial (Dashboard, Usuários, Cardápio, Pedidos)
- **Employee**: Acesso básico (Cardápio, Pedidos)
- **Client**: Acesso limitado (não usado nesta aplicação)

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- **Login**: Suporte a email ou CPF
- **Registro**: Cadastro de novos funcionários
- **JWT Token**: Armazenamento seguro no localStorage
- **Auto-login**: Verificação automática de token ao carregar a página
- **Logout**: Limpeza completa de tokens

### ✅ Autorização por Roles
- **Admin**: Pode acessar todas as funcionalidades
- **Manager**: Pode gerenciar usuários, cardápio e visualizar dashboard
- **Employee**: Pode visualizar cardápio e gerenciar pedidos

### ✅ Interface Atualizada
- **AuthModal**: Modal atualizado com campos para CPF e seleção de role
- **Tratamento de Erros**: Exibição clara de erros da API
- **Loading States**: Indicadores visuais durante requisições
- **Teste da API**: Componente para testar conectividade

## 🛠️ Arquivos Modificados

### `src/hooks/useAuth.ts`
- Integração completa com API real
- Gerenciamento de tokens JWT
- Funções de autorização por role
- Tratamento de erros da API

### `src/components/AuthModal.tsx`
- Suporte a login por email ou CPF
- Seleção de role no registro
- Validação de formulários
- Feedback visual de erros

### `src/pages/Index.tsx`
- Uso do hook atualizado
- Loading state durante verificação de auth
- Controle de abas baseado em roles

### `src/lib/api.ts`
- Cliente HTTP centralizado
- Interfaces TypeScript para API
- Utilitários para health checks
- Funções específicas de autenticação

### `src/components/ApiTester.tsx`
- Teste de conectividade com API
- Verificação de health checks
- Teste de autenticação
- Interface amigável para diagnósticos

## 🚦 Como Usar

### 1. Iniciar a API
Certifique-se de que a API FastTechFoods esteja rodando em:
```
http://localhost:5271
```

### 2. Testar Conectividade
1. Faça login como Manager ou Admin
2. Acesse a aba "Teste da API"
3. Clique em "Testar API" para verificar conectividade
4. Use "Testar Autenticação" para verificar seu token

### 3. Registro de Usuários
1. Clique em "Login Funcionário"
2. Vá para a aba "Cadastrar"
3. Preencha os dados:
   - Nome completo (obrigatório)
   - Email (obrigatório) 
   - CPF (opcional)
   - Cargo (Employee/Manager/Admin)
   - Senha (obrigatório)

### 4. Login
1. Use email ou CPF no campo apropriado
2. Digite sua senha
3. O sistema determinará automaticamente suas permissões

## 🔐 Endpoints da API Utilizados

### Autenticação
- `POST /api/auth/login` - Login por email ou CPF
- `POST /api/auth/register` - Registro de usuários
- `GET /api/auth/eu` - Dados do usuário autenticado
- `GET /api/auth/token-info` - Informações do token (debug)

### Health Checks
- `GET /api/health` - Status básico
- `GET /api/health/detailed` - Status detalhado
- `GET /api/instance/info` - Informações da instância
- `GET /api/instance/pod-name` - Nome do pod

## 🎨 Melhorias na UI

### Loading States
- Indicador durante login/registro
- Loading na verificação inicial de auth
- Estados de carregamento nos testes

### Tratamento de Erros
- Mensagens claras de erro da API
- Alerts visuais para feedback
- Validação de formulários

### Responsividade
- Interface adaptável para diferentes tamanhos
- Componentes otimizados para mobile

## 🔧 Configurações Técnicas

### TypeScript
- Interfaces completas para API
- Tipagem rigorosa em todos os componentes
- Validação de tipos em runtime

### Estado Global
- Hook customizado para autenticação
- Gerenciamento de tokens seguro
- Persistência entre sessões

### HTTP Client
- Cliente centralizado com interceptors
- Headers automáticos de autorização
- Tratamento de erros padronizado

## 🐛 Troubleshooting

### API não conecta
1. Verifique se a API está rodando em `http://localhost:5271`
2. Use o componente "Teste da API" para diagnóstico
3. Verifique as configurações de CORS na API

### Problemas de Autenticação
1. Limpe o localStorage do navegador
2. Verifique se o token não expirou
3. Use "Testar Autenticação" para verificar o token

### Erros de Role
1. Verifique se o usuário tem a role necessária
2. Apenas Manager/Admin podem acessar certas funcionalidades
3. Faça logout e login novamente se necessário

## 📝 Próximos Passos

- [ ] Implementar refresh token automático
- [ ] Adicionar suporte a múltiplas roles por usuário
- [ ] Implementar logout em todos os dispositivos
- [ ] Adicionar auditoria de ações do usuário
- [ ] Implementar cache de dados do usuário
