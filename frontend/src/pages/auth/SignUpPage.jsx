import { useState} from 'react'
import {Link} from 'react-router-dom'
import AuthForm from "./AuthForm";
import FormContainer from "./FormContainer";
import { createUser } from "../../services/user"

const SignUpPage = () => {
  const [error, setError] = useState('')
  return <div className="flex items-center justify-center">
    <FormContainer>
    <div className='text-pink-600'>{error}</div>
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
     if(values.username.length < 4) {
      setError('Username too short')
      return 
     }
     if(values.password !== values['confirm password']){
      setError('Passwords do not match')
      return
     }

    const response = await createUser({
      username: values.username,
      email: values.email,
      password: values.password
    })
    if( response.status === 201) {
      setError('')
      console.log('User created')
    } else {
      const data = await response.json()
      setError(data.error)
    }
   
      }}
    />
     <Link to="/" className="text-[#006895] underline text-sm">Sign in</Link>
    </FormContainer>
 
  </div>
};

export default SignUpPage;
