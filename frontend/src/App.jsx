import { Routes, Route } from "react-router-dom";

import routes from "@/routes"
import GuestRoutes from "./middlewares/GuestRoutes"
import ProtectedRoutes from "./middlewares/ProtectedRoutes"

import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import RecommendHome from "./pages/RecommendHome";
import MyRecommendations from "./pages/MyRecommendations";

const App = () => {
  return (
    <>
      <Routes>

        <Route element={<GuestRoutes />}>
          <Route path={routes.signIn} element={<SignInPage />} />
          <Route path={routes.signUp} element={<SignUpPage />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path={routes.recommendations} element={<RecommendHome />} />
          <Route path={routes.myRecommendations} element={<MyRecommendations />} />
        </Route>

      </Routes>
    </>
  );
};

export default App;
