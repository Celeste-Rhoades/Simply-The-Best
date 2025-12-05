import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthForm from "./AuthForm";
import FormContainer from "./FormContainer";
import GoogleSignInButton from "../../shared-components/GoogleSignInButton";
import * as userService from "services/user";
import routes from "@/routes";

const SignInPage = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const location = useLocation();

  return (
    <div className="font-raleway flex items-center justify-center">
      <FormContainer>
        <div className="text-pink-600">{error}</div>
        {location.state?.accountCreated && (
          <div className="bg-lighTeal/80 border-cerulean/60 mt-2 mb-8 rounded-lg border p-4 text-white">
            Account created successfully. Please sign in.
          </div>
        )}

        <AuthForm
          fields={[
            { label: "username", type: "text" },
            { label: "password", type: "password" },
          ]}
          submitButtonLabel="sign in"
          onSubmit={async (values) => {
            const response = await userService.createSession({
              username: values.username,
              password: values.password,
            });

            if (response.status === 200) {
              setError("");
              navigate(routes.recommendations);
            } else {
              const data = await response.json();
              setError(data.error);
            }
          }}
        />

        {/* Divider */}
        <div className="relative mt-1 mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-lightTanGray text-darkBlue px-2">OR</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-6">
          <GoogleSignInButton />
        </div>

        <Link to="/sign-up" className="text-sm text-[#006895] underline">
          Create an account
        </Link>
      </FormContainer>
    </div>
  );
};

export default SignInPage;
