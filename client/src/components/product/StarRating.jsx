import { Star } from 'lucide-react';

export default function StarRating({ rating, onRate, size = 'sm' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} ${onRate ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={() => onRate && onRate(star)}
        />
      ))}
    </div>
  );
}

