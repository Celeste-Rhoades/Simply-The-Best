import apiFetch from "./apiFetch";  


export const createUser = ({username, email, password}) => 
apiFetch("POST", "/api/auth/signup", {
    username,
    email,
    password,
});

