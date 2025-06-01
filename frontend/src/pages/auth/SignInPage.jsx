import {Link} from "react-router-dom"
import AuthForm from "./AuthForm";
import FormContainer from "./FormContainer";


const SignInPage = () => {
  return <div className="flex items-center justify-center">
    <FormContainer>
    <AuthForm 
      fields={[
        {
          label: "username",
          type: "text",
        },
        {
          label: "password",
          type: "password",
        },
      ]}
      submitButtonLabel="sign in"
    />
  <Link to="/sign-up" className="text-[#006895] underline text-sm">Create an account</Link>
    </FormContainer>
  </div>
};

export default SignInPage;