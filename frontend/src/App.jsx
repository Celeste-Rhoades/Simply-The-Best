import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignInPage from "./pages/auth/SignInPage"
import SignUpPage from "./pages/auth/SignUpPage"
import apiFetch from "./services/apiFetch"

const response = await apiFetch('GET', "/auth/me")
console.log(response.status)

const App = () => {
  return (
    <>
  
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
       
      </Routes>
    
    </>
  )
}

export default App
