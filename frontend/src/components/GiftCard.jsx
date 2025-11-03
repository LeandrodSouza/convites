function GiftCard({ gift, onSelect, onUnselect, disabled, isSelected }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className={`bg-white border border-border rounded-card p-4 transition-all duration-300 shadow-subtle ${
      isSelected
        ? 'ring-2 ring-primary'
        : gift.taken
        ? 'opacity-60'
        : 'hover:shadow-lg hover:-translate-y-0.5'
    }`}>
      {gift.imagePath && (
        <div className="w-full aspect-video bg-secondary rounded-xl mb-3 flex items-center justify-center overflow-hidden">
          <img
            src={`${API_URL}/uploads/${gift.imagePath}`}
            alt={gift.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      <h3 className="text-base font-medium text-accent mb-2 line-clamp-2 tracking-tight">{gift.name}</h3>

      {gift.link && (
        <a
          href={gift.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover hover:underline mb-3 transition-colors"
        >
          <span>Ver na loja</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      )}

      {isSelected ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-primary bg-brand-light px-3 py-2 rounded-full">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Sua escolha</span>
          </div>
          <button
            onClick={() => onUnselect(gift.id)}
            className="w-full bg-white border border-border text-accent font-medium py-2.5 px-4 rounded-xl transition-all hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Desfazer
          </button>
        </div>
      ) : gift.taken ? (
        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Já escolhido</span>
        </div>
      ) : (
        <button
          onClick={() => onSelect(gift.id)}
          disabled={disabled}
          className="w-full bg-primary hover:bg-primary-hover text-white font-medium py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label={`Escolher presente ${gift.name}`}
        >
          Escolher
        </button>
      )}
    </div>
  );
}

export default GiftCard;
