import AuthForm from "./AuthForm";
import FormContainer from "./FormContainer";

const SignUpPage = () => {
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
        {
          label: "confirm password",
          type: "password",
        },
      ]}
      submitButtonLabel="create account"
    />
    </FormContainer>
 
  </div>
};

export default SignUpPage;
