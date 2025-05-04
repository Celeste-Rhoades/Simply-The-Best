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

    </FormContainer>
  </div>
};

export default SignInPage;