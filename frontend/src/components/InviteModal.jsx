import { useState } from 'react';

function InviteModal({ invite, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(invite.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold text-primary mb-4">
          ✅ Convite Gerado!
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">Token:</label>
          <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm break-all">
            {invite.token}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">Link completo:</label>
          <div className="bg-gray-100 p-3 rounded-lg text-sm break-all mb-2">
            {invite.link}
          </div>
          <button
            onClick={handleCopy}
            className={`w-full py-2 px-4 rounded-lg font-bold transition ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-primary hover:bg-pink-700 text-white'
            }`}
          >
            {copied ? '✅ Copiado!' : '📋 Copiar Link'}
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          Compartilhe este link com o convidado. O convite é de uso único.
        </p>

        <button
          onClick={onClose}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default InviteModal;
