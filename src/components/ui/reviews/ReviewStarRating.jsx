const ReviewStarRating = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFullStar = rating >= star;
        const isHalfStar = rating >= star - 0.5 && rating < star;
        
        return (
          <svg
            key={star}
            className={`w-4 h-4 ${
              isFullStar ? 'text-green-500 fill-current' : 
              isHalfStar ? 'text-green-500 fill-current' : 'text-gray-600'
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            style={{
              clipPath: isHalfStar ? 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' : 'none'
            }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
};

export default ReviewStarRating;
