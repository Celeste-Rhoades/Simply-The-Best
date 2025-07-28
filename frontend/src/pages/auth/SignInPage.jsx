import {useState} from 'react'
import {Link, useLocation} from "react-router-dom"
import AuthForm from "./AuthForm";
import FormContainer from "./FormContainer";
import * as userService from "services/user"


const SignInPage = () => {
    const [error, setError] = useState('')
    const location = useLocation()

  return <div className="flex items-center justify-center">
    <FormContainer>
       <div className='text-pink-600'>{error}</div>
       {
       location.state?.accountCreated && <div className='p-4 mb-8 mt-2 bg-lighTeal/80 border rounded-lg border-cerulean/60 text-white'>
          Account created successfully. Please sign in.
        </div>
       }
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
      onSubmit={async (values) => {
        const response = await userService.createSession({
          username:values.username, 
          password: values.password})

        if(response.status === 200){
          console.log('Sign in successful')
          setError('')
        } else {
          const data = await response.json()
          setError(data.error)
        }
      }}
    />
  <Link to="/sign-up" className="text-[#006895] underline text-sm">Create an account</Link>
    </FormContainer>
  </div>
};

export default SignInPage;