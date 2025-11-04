import { useState, useEffect } from 'react';

function EditGiftModal({ gift, onClose, onSave }) {
  const [name, setName] = useState(gift.name);
  const [link, setLink] = useState(gift.link || '');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imagePath = gift.imagePath;

      // Se uma nova imagem foi selecionada, fazer upload
      if (image) {
        const formData = new FormData();
        formData.append('image', image);

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${API_URL}/api/admin/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.imagePath) {
          imagePath = data.imagePath;
        }
      }

      const success = await onSave(gift.id, name, link, imagePath);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar presente');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-card border border-border shadow-subtle max-w-md w-full max-h-[80dvh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-medium text-accent tracking-tight">Editar Presente</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-1 hover:bg-secondary rounded-lg transition flex items-center justify-center"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Presente *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link (opcional)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem (opcional)
            </label>
            {gift.imagePath && !image && (
              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Imagem atual:</p>
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/${gift.imagePath}`}
                  alt={gift.name}
                  className="w-32 h-32 object-cover rounded-lg border border-border"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-light file:text-primary hover:file:bg-primary/10 cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              Deixe em branco para manter a imagem atual
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 min-h-[44px] bg-white border border-border hover:bg-secondary text-accent font-medium py-2.5 px-4 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="w-full sm:flex-1 min-h-[44px] bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-4 rounded-xl transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              {uploading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGiftModal;
