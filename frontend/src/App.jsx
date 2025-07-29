import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignInPage from "./pages/auth/SignInPage"
import SignUpPage from "./pages/auth/SignUpPage"
import RecommendHome from "pages/RecommendHome"



const App = () => {
  return (
    <>
  
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
       <Route path="/myProfile" element={<RecommendHome />}/>
      </Routes>
    
    </>
  )
}

export default App
