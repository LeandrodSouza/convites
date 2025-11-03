function GiftCard({ gift, onSelect, disabled, isSelected }) {
  return (
    <div className={`border-2 rounded-lg p-4 transition ${
      gift.taken
        ? 'border-gray-300 bg-gray-100'
        : isSelected
        ? 'border-green-500 bg-green-50'
        : 'border-pink-300 bg-white hover:border-primary'
    }`}>
      <h3 className="text-lg font-bold text-gray-800 mb-2">{gift.name}</h3>

      {gift.link && (
        <a
          href={gift.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline mb-3 block"
        >
          Ver produto 🔗
        </a>
      )}

      {gift.taken ? (
        <div className="text-sm text-gray-600 font-bold">
          ✅ Já foi escolhido
          {gift.takenBy && <p className="text-xs mt-1">por {gift.takenBy}</p>}
        </div>
      ) : isSelected ? (
        <div className="text-sm text-green-600 font-bold">
          ✅ Você escolheu este presente!
        </div>
      ) : (
        <button
          onClick={() => onSelect(gift.id)}
          disabled={disabled}
          className="w-full bg-primary hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Escolher este presente
        </button>
      )}
    </div>
  );
}

export default GiftCard;
