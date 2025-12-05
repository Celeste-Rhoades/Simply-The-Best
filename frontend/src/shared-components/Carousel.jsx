import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { useTheme } from "../contexts/ThemeContext";

const Carousel = ({
  items,
  sectionTitle,
  sectionId,
  currentIndex = 0,
  onIndexChange,
  renderCard,
  ariaLabel,
}) => {
  const { isDarkMode } = useTheme();
  const maxIndex = items.length - 1;
  const [cardWidth, setCardWidth] = useState(
    window.innerWidth >= 640 ? 272 : 184,
  );

  useEffect(() => {
    const handleResize = () => {
      setCardWidth(window.innerWidth >= 640 ? 272 : 184);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < maxIndex) {
        onIndexChange(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        onIndexChange(currentIndex - 1);
      }
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  return (
    <section className="mb-8" aria-labelledby={sectionId}>
      <h2
        id={sectionId}
        className={`font-header mb-4 pb-4 text-2xl ${isDarkMode ? "text-white" : "text-darkBlue"}`}
      >
        {sectionTitle}
      </h2>

      <div className="relative flex items-center">
        {/* Previous button */}
        <button
          className="z-10 hidden p-2 sm:mr-4 sm:block"
          onClick={() => onIndexChange(Math.max(currentIndex - 1, 0))}
          disabled={currentIndex === 0}
          aria-label={`Previous ${ariaLabel || "recommendation"}`}
        >
          <i
            className="fa-solid fa-circle-chevron-left text-coral hover:text-lightOrange text-5xl"
            aria-hidden="true"
          ></i>
        </button>

        {/* Carousel container */}
        <div
          {...handlers}
          className="flex h-[260px] flex-grow items-center justify-start overflow-hidden rounded-xl px-4 py-4 shadow-xl sm:h-[340px] sm:px-4 sm:py-6"
          style={{
            background: "linear-gradient(135deg, #ff8a95, #fbbfa2, #23dee5)",
          }}
          role="region"
          aria-label={ariaLabel || `${sectionTitle} carousel`}
        >
          <div
            className="flex gap-2 transition-transform duration-300 sm:gap-4"
            style={{
              transform: `translateX(-${currentIndex * cardWidth}px)`,
            }}
          >
            {items.map((item, index) => (
              <article
                key={item._id}
                className="w-44 flex-shrink-0 sm:w-64"
                aria-label={`Recommendation ${index + 1} of ${items.length}`}
              >
                {renderCard(item, index)}
              </article>
            ))}
          </div>
        </div>

        {/* Next button */}
        <button
          className="z-10 hidden p-2 sm:ml-4 sm:block"
          onClick={() => onIndexChange(Math.min(currentIndex + 1, maxIndex))}
          disabled={currentIndex >= maxIndex}
          aria-label={`Next ${ariaLabel || "recommendation"}`}
        >
          <i
            className="fa-solid fa-circle-chevron-right text-coral hover:text-lightOrange text-5xl"
            aria-hidden="true"
          ></i>
        </button>
      </div>
    </section>
  );
};

export default Carousel;
