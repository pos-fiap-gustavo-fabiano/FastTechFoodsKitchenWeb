
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
}

const ImageUpload = ({ onImageSelect, selectedImage }: ImageUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }

      onImageSelect(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageSelect(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Imagem do Produto</Label>
      
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-32 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Clique para selecionar uma imagem
          </p>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Imagem
          </Button>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB
      </p>
    </div>
  );
};

export default ImageUpload;
