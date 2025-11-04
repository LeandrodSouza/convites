import { useState } from 'react';
import { api } from '../services/api';
import { auth } from '../services/firebase';

function AdminGiftForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas imagens');
        return;
      }

      // Validar tamanho (10MB - sera comprimida automaticamente)
      if (file.size > 10 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 10MB');
        return;
      }

      setImageFile(file);
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('Nome do presente é obrigatório');
      return;
    }

    setLoading(true);
    try {
      let imagePath = '';

      // Upload da imagem se houver
      if (imageFile) {
        const token = await auth.currentUser?.getIdToken();
        const uploadResult = await api.uploadImage(token, imageFile);

        if (uploadResult.error) {
          alert('Erro ao fazer upload da imagem: ' + uploadResult.error);
          setLoading(false);
          return;
        }

        imagePath = uploadResult.imagePath;
      }

      // Criar presente com imagePath
      const success = await onSubmit(name, link, imagePath);
      if (success) {
        setName('');
        setLink('');
        setImageFile(null);
        setImagePreview('');
      }
    } catch (error) {
      alert('Erro ao adicionar presente');
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Nome do Presente *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
          placeholder="Ex: Panela de pressão"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Link (opcional)
        </label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Imagem (opcional)
        </label>

        {!imagePreview ? (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para enviar</span> ou arraste
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 10MB) - Sera otimizada automaticamente</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full min-h-[44px] bg-primary hover:bg-primary-hover text-white font-bold py-3 px-6 rounded-xl transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        {loading ? 'Adicionando...' : 'Adicionar Presente'}
      </button>
    </form>
  );
}

export default AdminGiftForm;
