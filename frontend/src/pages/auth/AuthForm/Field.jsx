import { useState } from "react";

const Field = (props) => {
  const { label, type, value, onChange } = props;
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";
  const isConfirmPassword = label.toLowerCase().includes("confirm");

  // Determine the input type (toggle between password and text for password fields)
  const inputType = isPasswordField && showPassword ? "text" : type;

  // Determine autocomplete attribute
  const getAutocomplete = () => {
    if (type === "password") {
      // For sign-in: "current-password" (lets browser remember)
      // For sign-up/confirm: "new-password"
      return isConfirmPassword ? "new-password" : "current-password";
    }
    if (label.toLowerCase() === "username") return "username";
    if (label.toLowerCase() === "email") return "email";
    return undefined;
  };

  return (
    <div className="my-4 flex flex-col">
      <label htmlFor={label} className="pl-1 text-slate-500">
        {label}
      </label>
      <div className="relative">
        <input
          id={label}
          type={inputType}
          value={value}
          onChange={onChange}
          className="focus:outline-lightTeal w-64 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 pr-10"
          autoComplete={getAutocomplete()}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i
              className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
            ></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default Field;
