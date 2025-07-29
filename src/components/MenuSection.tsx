import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Search, Loader2, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { User } from '@/hooks/useAuth';
import { CatalogApi, Category, Product, CreateCategoryRequest, CreateProductRequest, UpdateProductRequest } from '@/lib/api';

interface MenuSectionProps {
  user: User;
}

const MenuSection = ({ user }: MenuSectionProps) => {
  const isManager = user.roles.includes('Manager') || user.roles.includes('Admin');
  
  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    isActive: true
  });
  
  const [productForm, setProductForm] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    availability: true,
    categoryId: ''
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Load data
  useEffect(() => {
    loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setIsLoading(true);
      
      // Carregar categorias e produtos separadamente
      const [categoriesData, productsData] = await Promise.all([
        CatalogApi.getCategories(),
        CatalogApi.getMenu() // Retorna array de ProductDto
      ]);
      
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar dados do menu:', error);
      toast.error('Erro ao carregar dados do menu');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await CatalogApi.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const loadProducts = useCallback(async () => {
    try {
      const productsData = await CatalogApi.getAllProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    }
  }, []);

  // Reload products when category changes
  useEffect(() => {
    if (products.length > 0) {
      // Se já temos produtos carregados, não precisa recarregar
      return;
    }
    loadProducts();
  }, [loadProducts, products.length]);

  // Category handlers
  const handleCreateCategory = async () => {
    try {
      if (editingCategory) {
        await CatalogApi.updateCategory(editingCategory.id, categoryForm);
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await CatalogApi.createCategory(categoryForm);
        toast.success('Categoria criada com sucesso!');
      }
      
      setShowCategoryModal(false);
      resetCategoryForm();
      await loadCategories(); // Recarrega apenas categorias
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) {
      return;
    }

    try {
      await CatalogApi.deleteCategory(categoryId);
      toast.success('Categoria excluída com sucesso!');
      // Remove categoria do estado local + recarrega produtos
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      await loadProducts();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      isActive: true
    });
    setEditingCategory(null);
  };

  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description,
        isActive: category.isActive
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  // Product handlers
  const handleCreateProduct = async () => {
    try {
      if (editingProduct) {
        const updateData: UpdateProductRequest = {
          name: productForm.name,
          description: productForm.description,
          price: productForm.price,
          availability: productForm.availability,
          categoryId: productForm.categoryId
        };
        
        // Usar método com FormData se há imagem, senão usar método normal
        const updatedProduct = selectedImage 
          ? await CatalogApi.updateProductWithImage(editingProduct.id, updateData, selectedImage)
          : await CatalogApi.updateProduct(editingProduct.id, updateData);
          
        toast.success('Produto atualizado com sucesso!');
        // Atualiza produto no estado local
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updatedProduct : p));
      } else {
        const newProduct = await CatalogApi.createProduct(productForm, selectedImage || undefined);
        toast.success('Produto criado com sucesso!');
        // Adiciona produto no estado local
        setProducts(prev => [...prev, newProduct]);
      }
      
      setShowProductModal(false);
      resetProductForm();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await CatalogApi.deleteProduct(productId);
      toast.success('Produto excluído com sucesso!');
      // Remove produto do estado local
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };

  const handleToggleProductAvailability = async (productId: string, availability: boolean) => {
    try {
      const updatedProduct = await CatalogApi.updateProductAvailability(productId, { availability });
      toast.success(`Produto ${availability ? 'ativado' : 'desativado'} com sucesso!`);
      // Atualiza produto no estado local
      setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
    } catch (error) {
      console.error('Erro ao alterar disponibilidade:', error);
      toast.error('Erro ao alterar disponibilidade');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      availability: true,
      categoryId: ''
    });
    setSelectedImage(null);
    setEditingProduct(null);
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        availability: product.availability,
        categoryId: product.categoryId
      });
    } else {
      resetProductForm();
    }
    setShowProductModal(true);
  };

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  const getProductsByCategory = (categoryId: string) => {
    return filteredProducts.filter(product => product.categoryId === categoryId);
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('lanche') || name.includes('burger') || name.includes('hambúrguer')) return '🍔';
    if (name.includes('bebida') || name.includes('drink')) return '🥤';
    if (name.includes('sobremesa') || name.includes('doce')) return '🍰';
    if (name.includes('pizza')) return '🍕';
    if (name.includes('salada')) return '🥗';
    return '🍽️';
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-orange-500 to-red-600',
      'from-blue-500 to-purple-600',
      'from-pink-500 to-purple-600',
      'from-green-500 to-blue-600',
      'from-purple-500 to-indigo-600',
      'from-yellow-500 to-orange-600'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando cardápio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {isManager ? 'Gerenciar Cardápio' : 'Cardápio'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Logado como: <span className="font-semibold">{user.name}</span> ({user.roles.includes('Manager') ? 'Gerente' : 'Funcionário'})
          </p>
        </div>
        {isManager && (
          <Button 
            onClick={() => openProductModal()}
            className="bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-700 hover:to-yellow-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        )}
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            size="sm"
          >
            Todos
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              size="sm"
            >
              {getCategoryIcon(category.name)} {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts
          .filter(product => selectedCategory === 'all' || product.categoryId === selectedCategory)
          .map((product) => (
            <Card key={product.id} className={`hover:shadow-lg transition-shadow overflow-hidden ${!product.availability ? 'opacity-60' : ''}`}>
              {/* Product Image */}
              {product.imageUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {getCategoryIcon(getCategoryName(product.categoryId))}
                      {product.name}
                      {!product.availability && <Badge variant="destructive">Indisponível</Badge>}
                    </CardTitle>
                    <div className="mt-2 text-gray-600 text-sm">
                      {product.description}
                    </div>
                  </div>
                  {isManager && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openProductModal(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={product.availability ? "destructive" : "default"}
                        onClick={() => handleToggleProductAvailability(product.id, !product.availability)}
                      >
                        {product.availability ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-green-600">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>

      {filteredProducts.filter(product => selectedCategory === 'all' || product.categoryId === selectedCategory).length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">📦</div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum produto encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Tente ajustar os filtros de busca.' : 'Comece criando um novo produto.'}
          </p>
        </div>
      )}

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-name">Nome</Label>
                <Input
                  id="product-name"
                  value={productForm.name}
                  onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do produto"
                />
              </div>
              <div>
                <Label htmlFor="product-price">Preço</Label>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea
                id="product-description"
                value={productForm.description}
                onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do produto"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="product-category">Categoria</Label>
                <Select
                  value={productForm.categoryId}
                  onValueChange={(value) => setProductForm(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="product-image">Imagem do Produto</Label>
                <Input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                />
                {selectedImage && (
                  <p className="text-sm text-gray-600 mt-2">
                    Arquivo selecionado: {selectedImage.name}
                  </p>
                )}
                {editingProduct && editingProduct.imageUrl && !selectedImage && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">Imagem atual:</p>
                    <img 
                      src={editingProduct.imageUrl} 
                      alt={editingProduct.name}
                      className="w-20 h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="product-available"
                checked={productForm.availability}
                onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, availability: checked }))}
              />
              <Label htmlFor="product-available">Produto disponível</Label>
            </div>
            <Button onClick={handleCreateProduct} className="w-full">
              {editingProduct ? 'Atualizar' : 'Criar'} Produto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuSection;
