import { createContext, useState } from "react";
import { Routes, Route } from "react-router-dom";

import routes from "@/routes";
import GuestRoutes from "./middlewares/GuestRoutes";
import ProtectedRoutes from "./middlewares/ProtectedRoutes";

import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import RecommendHome from "./pages/RecommendHome";
import MyRecommendations from "./pages/MyRecommendations";
import UserSearch from "Components/UserSearch";

export const AppContext = createContext({
  username: null,
  setUsername: null,
});

const App = () => {
  const [username, setUsername] = useState(null);

  return (
    <AppContext value={{ username, setUsername }}>
      <Routes>
        <Route element={<GuestRoutes />}>
          <Route path={routes.signIn} element={<SignInPage />} />
          <Route path={routes.signUp} element={<SignUpPage />} />
        </Route>
        <Route
          element={
            <ProtectedRoutes username={username} setUsername={setUsername} />
          }
        >
          <Route path={routes.recommendations} element={<RecommendHome />} />
          <Route
            path={routes.myRecommendations}
            element={<MyRecommendations />}
          />
        </Route>
        <Route path="/test-search" element={<UserSearch />} />
      </Routes>
    </AppContext>
  );
};

export default App;
