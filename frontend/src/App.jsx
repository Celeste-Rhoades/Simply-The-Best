import { Routes, Route } from "react-router-dom";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import RecommendHome from "./pages/RecommendHome";
import MyProfile from "./pages/MyProfile";
import GuestRoutes from "./middlewares/GuestRoutes"
import ProtectedRoutes from "./middlewares/ProtectedRoutes"

const App = () => {
  return (
    <>
      <Routes>

        <Route element={<GuestRoutes />}>
          <Route path="/" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/recommendation" element={<RecommendHome />} />
          <Route path="/my-profile" element={<MyProfile />} />
        </Route>

      </Routes>
    </>
  );
};

export default App;
