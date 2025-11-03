import { useState } from 'react';

function ConfirmationButton({ onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Você foi convidado para nosso Chá de Panela! 🎉
      </h2>
      <p className="text-gray-600 mb-6">
        Confirme sua presença para visualizar o endereço e escolher um presente.
      </p>
      <button
        onClick={handleClick}
        disabled={loading}
        className="bg-primary hover:bg-pink-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition disabled:opacity-50"
      >
        {loading ? 'Confirmando...' : 'Vou sim! Confirmar presença'}
      </button>
    </div>
  );
}

export default ConfirmationButton;
