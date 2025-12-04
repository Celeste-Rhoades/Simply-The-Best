const StarRating = ({
  rating = 0,
  onChange,
  size = "large",
  idPrefix = "star",
  label,
  required = false,
}) => {
  // Determine if component is interactive based on onChange prop
  const isInteractive = typeof onChange === "function";

  // Size classes for different contexts
  const sizeClasses = {
    small: "text-[11px] sm:text-[15px]",
    large: "text-3xl",
  };

  // Gap classes for spacing between stars
  const gapClasses = {
    small: "gap-0.5 sm:gap-1",
    large: "gap-1",
  };

  const handleStarClick = (star) => {
    if (isInteractive) {
      onChange(star);
    }
  };

  const handleStarKeyDown = (e, star) => {
    if (!isInteractive) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      onChange(star);
    } else if (e.key === "ArrowRight" && star < 5) {
      e.preventDefault();
      document.getElementById(`${idPrefix}-${star + 1}`)?.focus();
    } else if (e.key === "ArrowLeft" && star > 1) {
      e.preventDefault();
      document.getElementById(`${idPrefix}-${star - 1}`)?.focus();
    }
  };

  // Display-only mode (for cards)
  if (!isInteractive) {
    return (
      <div
        className={`flex justify-center ${gapClasses[size]}`}
        role="img"
        aria-label={`Rating: ${rating} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={
              star <= rating
                ? `text-cerulean ${sizeClasses[size]}`
                : `${sizeClasses[size]} text-gray-300`
            }
            aria-hidden="true"
          >
            ★
          </span>
        ))}
      </div>
    );
  }

  // Interactive mode (for modals)
  return (
    <div
      className={`flex ${gapClasses[size]}`}
      role="radiogroup"
      aria-labelledby={label}
      aria-required={required}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          id={`${idPrefix}-${star}`}
          type="button"
          onClick={() => handleStarClick(star)}
          onKeyDown={(e) => handleStarKeyDown(e, star)}
          className="focus:ring-cerulean focus:ring-2 focus:ring-offset-1 focus:outline-none"
          role="radio"
          aria-checked={rating === star}
          aria-label={`Rate ${star} out of 5 stars`}
          tabIndex={rating === star || (!rating && star === 1) ? 0 : -1}
        >
          <span
            className={`${sizeClasses[size]} transition-colors ${
              star <= rating
                ? "text-cerulean hover:text-[#0a8aa3]"
                : "text-gray-300 hover:text-gray-400"
            }`}
            aria-hidden="true"
          >
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
