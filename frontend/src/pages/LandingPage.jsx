import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import routes from "../routes";
import logo from "../images/logo.png";

// ExamplesCarousel component
const ExamplesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(
    window.innerWidth >= 640 ? 272 : 184,
  );

  const examples = [
    {
      id: 1,
      title: "Dune (2021)",
      rating: 5,
      description:
        "Epic sci-fi masterpiece. The visuals are stunning and the soundtrack is incredible. A must-watch!",
      category: "Movies",
      author: "Alex",
    },
    {
      id: 2,
      title: "Red Cliffs Lodge",
      rating: 5,
      description:
        "Best sunset views in Moab. The outdoor patio overlooking the Colorado River is unmatched!",
      category: "Restaurants",
      author: "Sarah",
    },
    {
      id: 3,
      title: "Atomic Habits",
      rating: 5,
      description:
        "Life-changing book about building better habits. Easy to read and actually practical!",
      category: "Books",
      author: "Taylor",
    },
    {
      id: 4,
      title: "The Last of Us",
      rating: 5,
      description:
        "Incredible storytelling and emotional gameplay. One of the best video games ever made!",
      category: "Video Games",
      author: "Jordan",
    },
  ];

  const maxIndex = examples.length - 1;

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
        setCurrentIndex(currentIndex + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    },
    trackMouse: false,
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  return (
    <div className="relative flex items-center">
      {/* Left arrow - Hidden on mobile, visible on tablet+ */}
      <button
        className="z-10 hidden p-2 sm:mr-4 sm:block"
        onClick={() => setCurrentIndex(Math.max(currentIndex - 1, 0))}
        disabled={currentIndex === 0}
        aria-label="Previous"
      >
        <i className="fa-solid fa-circle-chevron-left text-coral hover:text-lightOrange text-5xl"></i>
      </button>

      {/* Carousel container with swipe handlers */}
      <div
        {...handlers}
        className="flex h-[260px] flex-grow items-center justify-start overflow-hidden rounded-xl px-4 py-4 shadow-xl sm:h-[340px] sm:px-4 sm:py-6"
        style={{
          background: "linear-gradient(135deg, #ff8a95, #fbbfa2, #23dee5)",
        }}
      >
        <div
          className="flex gap-2 transition-transform duration-300 sm:gap-4"
          style={{
            transform: `translateX(-${currentIndex * cardWidth}px)`,
          }}
        >
          {examples.map((example) => (
            <div key={example.id} className="w-44 flex-shrink-0 sm:w-64">
              <div className="flex h-[232px] w-44 flex-col overflow-hidden rounded-lg bg-[#f8ede6] shadow-lg sm:h-[314px] sm:w-64">
                {/* Header section */}
                <div className="relative h-[76px] flex-shrink-0 bg-[#f8ede6] px-1.5 pt-5 text-center sm:h-[84px] sm:px-2 sm:pt-5">
                  <h3 className="font-header text-darkBlue mb-2 line-clamp-2 text-[10.5px] leading-[1.35] break-words sm:mb-2.5 sm:text-[15px] sm:leading-[1.3]">
                    {example.title}
                  </h3>
                  <div className="flex justify-center gap-0.5 sm:gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={
                          star <= example.rating
                            ? "text-cerulean text-[11px] sm:text-[15px]"
                            : "text-[11px] text-gray-300 sm:text-[15px]"
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Description section */}
                <div className="relative m-1 flex flex-grow items-center justify-center bg-[#4a6a7d] p-1.5 text-white sm:m-2 sm:p-3">
                  <p className="font-body text-center text-[10px] leading-tight break-words sm:text-sm">
                    {example.description}
                  </p>
                </div>

                {/* Footer section */}
                <div className="flex h-12 flex-shrink-0 items-center justify-center bg-[#f8ede6] px-2 sm:h-14 sm:px-3">
                  <p className="font-body text-center text-[9px] text-gray-600 sm:text-xs">
                    {example.category} · By {example.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right arrow - Hidden on mobile, visible on tablet+ */}
      <button
        className="z-10 hidden p-2 sm:ml-4 sm:block"
        onClick={() => setCurrentIndex(Math.min(currentIndex + 1, maxIndex))}
        disabled={currentIndex >= maxIndex}
        aria-label="Next"
      >
        <i className="fa-solid fa-circle-chevron-right text-coral hover:text-lightOrange text-5xl"></i>
      </button>
    </div>
  );
};

const LandingPage = () => {
  // Helper function to render text with clickable links in laguna color
  const renderTextWithLinks = (text) => {
    if (!text) return text;

    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      if (part.match(urlRegex)) {
        const href = part.startsWith("http") ? part : `https://${part}`;
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all underline transition-opacity hover:opacity-80"
            style={{ color: "#00b8c4" }}
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-laguna border-b border-gray-200 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo Section */}
          <div className="flex items-center gap-3">
            <Link to={routes.recommendations}>
              <img
                className="h-16 w-16 object-contain sm:h-20 sm:w-20 md:h-24 md:w-24 lg:h-28 lg:w-28"
                alt="starfish"
                src={logo}
              />
            </Link>

            {/* Title - Hidden on mobile, shown on medium+ screens in navbar */}
            <div className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
              <Link to={routes.recommendations}>
                <h1 className="font-header text-center whitespace-nowrap text-white select-none md:text-3xl lg:text-4xl xl:text-5xl">
                  Simply The Best
                </h1>
              </Link>
            </div>
          </div>

          {/* Nav Buttons */}
          <div className="font-body flex items-center gap-2 sm:gap-3 lg:gap-4">
            <Link
              to={routes.signIn}
              className="bg-coral rounded-lg px-2 py-1.5 text-xs text-white shadow-xl transition-colors hover:bg-[#ff7086] sm:px-3 sm:py-2 sm:text-sm lg:px-4 lg:text-base"
            >
              Sign In
            </Link>
            <Link
              to={routes.signUp}
              className="bg-coral rounded-lg px-2 py-1.5 text-xs text-white shadow-xl transition-colors hover:bg-[#ff7086] sm:px-3 sm:py-2 sm:text-sm lg:px-6 lg:text-base"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Geometric Background */}
      <section className="relative mx-auto max-w-4xl overflow-hidden px-4 pt-8 pb-12 text-center sm:px-6 sm:pt-12 sm:pb-16 md:pt-32 lg:pt-40 lg:pb-20">
        {/* Geometric Line Pattern Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30"></div>

        {/* Content - positioned above geometric shapes */}
        <div className="relative z-10">
          {/* Title - Shown on mobile, hidden on medium+ screens */}
          <h1 className="font-header text-darkBlue mb-6 text-3xl leading-tight sm:text-4xl md:hidden">
            Simply The Best
          </h1>

          <h2 className="font-header text-darkBlue mb-4 text-xl leading-tight sm:mb-6 sm:text-2xl lg:text-3xl">
            All Your Recommendations, One Place{" "}
          </h2>
          <p className="font-body mb-8 text-base text-gray-600 sm:mb-10 sm:text-lg">
            Organized by category. Shared with friends. Ready when you need
            them.
          </p>
          <Link
            to={routes.signUp}
            className="font-header bg-coral mb-12 inline-block rounded-xl px-8 py-3 text-base text-white shadow-xl transition-colors hover:bg-[#ff7086] sm:mb-16 sm:px-10 sm:py-4 sm:text-lg"
          >
            Sign Up For Free
          </Link>

          {/* Preview Card */}
          <div className="mx-auto max-w-sm overflow-hidden rounded-xl bg-[#f8ede6] shadow-xl sm:max-w-md">
            <div className="px-4 pt-6 pb-2 text-center sm:px-6 sm:pt-8 sm:pb-3">
              <h3 className="font-header text-darkBlue mb-2 text-base sm:text-lg">
                Desert Edge Design
              </h3>
              <div className="text-cerulean text-lg sm:text-xl">★★★★★</div>
            </div>
            <div className="font-body mx-3 mb-3 rounded-lg bg-[#4a6a7d] px-4 py-6 text-center text-sm leading-relaxed text-white sm:mx-4 sm:mb-4 sm:px-6 sm:py-8 sm:text-base">
              {renderTextWithLinks(
                "You know how sometimes you find jewelry that just elevates everything? Desert Edge Design does that. She makes hand-woven geometric pieces in these saturated desert colors. Small batches, Moab-based. They're statement-making but wearable. Eye-catching but effortless. The kind of pieces that make your look. https://desertedgedesign.com",
              )}
            </div>
            <div className="font-body px-4 pt-2 pb-4 text-center text-xs text-gray-600 sm:pb-5 sm:text-sm">
              Fashion · By Celeste
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-lightTanGray px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-header text-darkBlue mb-12 text-center text-3xl sm:mb-16 sm:text-4xl">
            How It Works
          </h2>

          {/* Steps Container - Horizontal Layout */}
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center sm:gap-4 lg:gap-8">
            {/* Step 1 */}
            <div className="flex-1 text-center sm:max-w-[280px]">
              <div className="bg-coral mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white shadow-xl sm:mb-6">
                1
              </div>
              <h3 className="font-header text-darkBlue mb-3 text-xl sm:text-2xl">
                Save
              </h3>
              <p className="font-body text-gray-600 sm:text-lg">
                Add anything you love. Rate it and tell your friends why it's
                worth their time.
              </p>
            </div>

            {/* Divider Line 1 */}
            <div className="hidden h-48 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent sm:block lg:h-56"></div>

            {/* Step 2 */}
            <div className="flex-1 text-center sm:max-w-[280px]">
              <div className="bg-laguna mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white shadow-xl sm:mb-6">
                2
              </div>
              <h3 className="font-header text-darkBlue mb-3 text-xl sm:text-2xl">
                Organize
              </h3>
              <p className="font-body text-gray-600 sm:text-lg">
                Keep it all organized by category. The taco place you swear by.
                That secret bookstore you stumbled on.
              </p>
            </div>

            {/* Divider Line 2 */}
            <div className="hidden h-48 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent sm:block lg:h-56"></div>

            {/* Step 3 */}
            <div className="flex-1 text-center sm:max-w-[280px]">
              <div className="bg-lightOrange mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-bold text-white shadow-xl sm:mb-6">
                3
              </div>
              <h3 className="font-header text-darkBlue mb-3 text-xl sm:text-2xl">
                Share
              </h3>
              <p className="font-body text-gray-600 sm:text-lg">
                Send recommendations to your friends. No more 'what was that
                place you told me about?' texts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="bg-white px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-header text-darkBlue mb-8 text-center text-2xl sm:mb-12 sm:text-3xl">
            That restaurant everyone needs to try, the book that changed your
            perspective, the show you can't stop talking about. Save it all
            here.
          </h2>

          <ExamplesCarousel />
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-laguna/40 px-4 py-12 text-center sm:px-6 sm:py-16">
        <h2 className="font-header text-darkBlue mb-6 text-2xl sm:mb-8 sm:text-3xl">
          Start saving your favorites{" "}
        </h2>
        <Link
          to={routes.signUp}
          className="font-header bg-coral hover:bg-tangerine inline-block rounded-xl px-8 py-3 text-lg text-white shadow-xl transition-colors sm:px-10 sm:py-4 sm:text-xl"
        >
          Sign Up Free
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
