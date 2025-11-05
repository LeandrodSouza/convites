import { useState } from 'react';

function GiftCard({ gift, onSelect, onUnselect, disabled, isSelected }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleImageClick = (e) => {
    e.stopPropagation(); // Prevent card click logic from interfering
    if (gift.imagePath) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
        ${isSelected ? 'bg-brand-light border-primary' : 'bg-white border-border'}
        ${gift.taken && !isSelected ? 'opacity-60' : ''}
      `}>
        {/* Clickable Round Image */}
        {gift.imagePath && (
          <div
            className="flex-shrink-0 w-16 h-16 rounded-full bg-secondary overflow-hidden cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={`${API_URL}/uploads/${gift.imagePath}`}
              alt={gift.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Gift Info and Actions */}
        <div className="flex-grow">
          <h3 className="font-semibold text-accent leading-tight">{gift.name}</h3>

          {gift.link && (
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mt-1 inline-block"
              onClick={(e) => e.stopPropagation()} // Prevent card click logic
            >
              Ver sugestão
            </a>
          )}
        </div>

        {/* Action Button Area */}
        <div className="flex-shrink-0">
          {isSelected ? (
            <button
              onClick={() => onUnselect(gift.id)}
              className="px-3 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary/10 transition"
            >
              Mudar
            </button>
          ) : gift.taken ? (
            <span className="px-3 py-2 text-sm font-semibold text-gray-500">Escolhido</span>
          ) : (
            <button
              onClick={() => onSelect(gift.id)}
              disabled={disabled}
              className="px-3 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 transition"
            >
              Escolher
            </button>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-lg max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={`${API_URL}/uploads/${gift.imagePath}`}
              alt={gift.name}
              className="rounded-lg object-contain max-h-[80vh]"
            />
            <button
              onClick={handleCloseModal}
              className="absolute -top-2 -right-2 bg-white rounded-full p-1.5 text-gray-800 hover:bg-gray-200 transition"
              aria-label="Fechar imagem"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default GiftCard;
