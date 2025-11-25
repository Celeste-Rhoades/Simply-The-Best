import { createContext, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

import routes from "@/routes";
import GuestRoutes from "./middlewares/GuestRoutes";
import ProtectedRoutes from "./middlewares/ProtectedRoutes";

import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import RecommendHome from "./pages/RecommendHome";
import MyRecommendations from "./pages/MyRecommendations";
import UserSearch from "Components/UserSearch";
import FriendRequests from "Components/FriendRequests";
import PendingRecommendations from "Components/PendingRecommendations";
import Friends from "./pages/Friends";

export const AppContext = createContext({
  username: null,
  setUsername: null,
});

const App = () => {
  const [username, setUsername] = useState(null);

  return (
    <ThemeProvider>
      <AppContext.Provider value={{ username, setUsername }}>
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
            <Route path={routes.userSearch} element={<UserSearch />} />
            <Route path={routes.friendRequests} element={<FriendRequests />} />
            <Route
              path={routes.pendingRecommendations}
              element={<PendingRecommendations />}
            />
            <Route path={routes.friends} element={<Friends />} />
          </Route>
        </Routes>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
