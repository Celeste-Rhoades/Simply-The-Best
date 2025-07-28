import apiFetch from "./apiFetch";  


export const createUser = ({username, email, password}) => 
apiFetch("POST", "/api/auth/signup", {
    username,
    email,
    password,
});

export const createSession= ({username, password}) => 
    apiFetch('POST',"/api/auth/login",
    {
    username,
    password,
})