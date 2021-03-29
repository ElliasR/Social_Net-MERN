import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null, //initially null, set in App.js
  token: null,
  login: () => {},
  logout: () => {},
});
