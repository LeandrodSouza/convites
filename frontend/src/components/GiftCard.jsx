import { useState } from 'react';
import { API_URL } from '../services/api';

function GiftCard({ gift, onSelect, onUnselect, isSelected }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const imageUrl = `${API_URL}/uploads/${gift.imagePath}`;

  const handleImageClick = (e) => {
    e.stopPropagation();
    if (gift.imagePath) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const takenByCount = gift.takenBy ? gift.takenBy.length : 0;
  const isTaken = takenByCount > 0;

  return (
    <>
      <div className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
        ${isSelected ? 'bg-green-100 border-green-400' : 'bg-white border-border'}
        ${isTaken && !isSelected ? 'opacity-70' : ''}
      `}>
        {gift.imagePath && (
          <div
            className="flex-shrink-0 w-16 h-16 rounded-full bg-secondary overflow-hidden cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={imageUrl}
              alt={gift.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="flex-grow">
          <h3 className="font-semibold text-accent leading-tight">{gift.name}</h3>

          {isTaken && (
            <p className="text-xs text-gray-500 mt-1">
              {takenByCount} pessoa{takenByCount > 1 ? 's' : ''} já escolheram.
            </p>
          )}

          {gift.link && (
            <a
              href={gift.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mt-1 inline-block"
              onClick={(e) => e.stopPropagation()}
            >
              Ver sugestão
            </a>
          )}
        </div>

        <div className="flex-shrink-0">
          {isSelected ? (
            <button
              onClick={() => onUnselect(gift.id)}
              className="px-3 py-2 text-sm font-semibold text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition"
            >
              Mudar ideia
            </button>
          ) : (
            <button
              onClick={() => onSelect(gift.id)}
              className="px-3 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition"
            >
              Eu quero!
            </button>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="relative max-w-lg max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={imageUrl}
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
