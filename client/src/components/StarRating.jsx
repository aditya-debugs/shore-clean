import React, { useState } from "react";
import { Star } from "lucide-react";

const StarRating = ({
  rating,
  onRatingChange,
  readOnly = false,
  size = "md",
  showValue = true,
  totalRatings = 0,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  const handleStarClick = (starValue) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleStarHover = (starValue) => {
    if (!readOnly) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-2">
      <div
        className="flex items-center space-x-1"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          const isHalfFilled =
            star === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              disabled={readOnly}
              className={`
                transition-all duration-200 transform
                ${
                  readOnly
                    ? "cursor-default"
                    : "cursor-pointer hover:scale-110 active:scale-95"
                }
                ${!readOnly && hoverRating >= star ? "scale-110" : ""}
              `}
            >
              <Star
                className={`
                  ${sizeClasses[size]} transition-all duration-200
                  ${
                    isFilled
                      ? "text-yellow-400 fill-yellow-400"
                      : isHalfFilled
                      ? "text-yellow-400 fill-yellow-200"
                      : "text-gray-300 hover:text-yellow-300"
                  }
                  ${!readOnly && "hover:drop-shadow-md"}
                `}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <div className="flex items-center space-x-1 text-sm">
          <span className="font-semibold text-gray-700">
            {rating ? rating.toFixed(1) : "0.0"}
          </span>
          {totalRatings > 0 && (
            <span className="text-gray-500">
              ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StarRating;
