// components/Card.tsx
import React from 'react';

interface CardProps {
  card: string; // The card is in the format like '2H', '10D', 'KH', etc.
}

const Card: React.FC<CardProps> = ({ card }) => {
  const suit = card.slice(-1); // Get the suit from the last character (H, D, C, S)
  const rank = card.slice(0, -1) || ""; // Get the rank from the rest (2, 3, J, A, etc.)

  // Determine color based on suit
  const isRed = suit === 'H' || suit === 'D';
  const textColor = isRed ? 'text-red-500' : 'text-black';

  // Card suit icons
  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case 'H':
        return '♥'; // Heart
      case 'D':
        return '♦'; // Diamond
      case 'C':
        return '♣'; // Clubs
      case 'S':
        return '♠'; // Spades
      default:
        return '';
    }
  };

  // Card design with conditional color
  return (
    <div className="relative w-20 h-28 bg-white border-2 rounded-lg shadow-lg flex flex-col justify-between p-2">
      {/* Top rank and suit */}
      <div className={`absolute top-2 left-2 text-xs font-bold ${textColor}`}>
        {rank}
      </div>
      {/* Center suit icon */}
      <div className={`flex-1 flex justify-center items-center ${textColor}`}>
        <span className="text-3xl">{getSuitIcon(suit)}</span>
      </div>
      {/* Bottom rank and suit */}
      <div className={`absolute bottom-2 right-2 text-xs font-bold ${textColor}`}>
        {rank}
      </div>
    </div>
  );
};

export default Card;
