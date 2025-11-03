import { useState } from 'react';

function AdminGiftForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      alert('Nome do presente é obrigatório');
      return;
    }

    setLoading(true);
    const success = await onSubmit(name, link);
    if (success) {
      setName('');
      setLink('');
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:opacity-50"
      >
        {loading ? 'Adicionando...' : 'Adicionar Presente'}
      </button>
    </form>
  );
}

export default AdminGiftForm;
