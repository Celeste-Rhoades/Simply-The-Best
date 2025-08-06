import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import RecommendHome from "pages/RecommendHome";
import MyProfile from "pages/MyProfile";

const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/recommendation" element={<RecommendHome />} />
        <Route path="/my-profile" element={<MyProfile />} />
      </Routes>
    </>
  );
};

export default App;
