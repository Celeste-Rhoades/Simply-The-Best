import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import routes from "@/routes";
import * as userService from "services/user";

import AuthForm from "./AuthForm";
import FormContainer from "./FormContainer";
import GoogleSignInButton from "../../shared-components/GoogleSignInButton";

const SignUpPage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  return (
    <div className="font-raleway flex items-center justify-center">
      <FormContainer>
        <div className="text-pink-600">{error}</div>

        <AuthForm
          fields={[
            {
              label: "username",
              type: "text",
            },
            {
              label: "email",
              type: "text",
            },
            {
              label: "password",
              type: "password",
            },
            {
              label: "confirm password",
              type: "password",
            },
          ]}
          submitButtonLabel="create account"
          onSubmit={async (values) => {
            if (values.username.length < 4) {
              setError("Username too short");
              return;
            }

            if (values.password !== values["confirm password"]) {
              setError("Passwords do not match");
              return;
            }

            const response = await userService.createUser({
              username: values.username,
              email: values.email,
              password: values.password,
            });

            if (response.status === 201) {
              setError("");
              navigate(routes.signIn, {
                state: {
                  accountCreated: true,
                },
              });
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
        <div className="mb-4">
          <GoogleSignInButton />
        </div>

        <Link to={routes.signIn} className="text-sm text-[#006895] underline">
          Sign in
        </Link>
      </FormContainer>
    </div>
  );
};

export default SignUpPage;
