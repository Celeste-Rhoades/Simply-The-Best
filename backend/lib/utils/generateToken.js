import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  const options = {
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
    secure: process.env.NODE_ENV !== "development",
  }

  res.cookie("jwt", token, {
    ...options,
    httpOnly: true,
  });
  res.cookie("isLoggedIn", true, {
    ...options,
  });
};