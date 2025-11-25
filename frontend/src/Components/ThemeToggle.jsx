import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = ({ isMobile = false }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  if (isMobile) {
    // Mobile version - full width button with text
    return (
      <button
        onClick={toggleTheme}
        className="hover:text-cerulean mb-2 flex w-full items-center justify-between py-1 text-left"
      >
        <div className="flex items-center">
          <i
            className={`fa-solid ${isDarkMode ? "fa-sun" : "fa-moon"} mr-2 w-5`}
          ></i>
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </div>
        {/* Mobile Switch */}
        <div
          className={`relative h-6 w-11 rounded-full transition-colors ${
            isDarkMode ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
              isDarkMode ? "translate-x-5" : "translate-x-0.5"
            }`}
          ></div>
        </div>
      </button>
    );
  }

  // Desktop version - compact switch with icon
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center space-x-2 text-white"
      aria-label="Toggle theme"
    >
      <i
        className={`fa-solid ${isDarkMode ? "fa-sun" : "fa-moon"} text-lg`}
      ></i>
      <div
        className={`relative h-6 w-11 rounded-full transition-colors ${
          isDarkMode ? "bg-electricPink" : "bg-gray-600"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            isDarkMode ? "translate-x-5" : "translate-x-0.5"
          }`}
        ></div>
      </div>
    </button>
  );
};

export default ThemeToggle;
