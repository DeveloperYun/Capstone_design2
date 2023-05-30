import React, { createContext, useContext } from "react";
import useReducerWithSideEffects, {
  UpdateWithSideEffect,
  Update
} from "use-reducer-with-side-effects";
import { getStorageItem, setStorageItem } from "utils/useLocalStorage";

const AppContext = createContext();

const reducer = (prevState, action) => {
  const { type } = action;

  if (type === SET_TOKEN) {
    const { payload: { jwtToken, username } } = action; // Update: Extract username from the payload
    const newState = { ...prevState, jwtToken, username, isAuthenticated: true }; // Update: Add username to the state
    return UpdateWithSideEffect(newState, (state, dispatch) => {
      setStorageItem("username", username);
    });
  } else if (type === DELETE_TOKEN) {
    const newState = { ...prevState, jwtToken: "", username: "", isAuthenticated: false }; // Update: Clear username
    return UpdateWithSideEffect(newState, (state, dispatch) => {
      setStorageItem("jwtToken", "");
      setStorageItem("username", "");

    });
  }

  return prevState;
};

export const AppProvider = ({ children }) => {
  const jwtToken = getStorageItem("jwtToken", "");
  const username = getStorageItem("username", ""); // Update: Retrieve username from local storage

  const [store, dispatch] = useReducerWithSideEffects(reducer, {
    jwtToken,
    username,
    isAuthenticated: jwtToken.length > 0
  });
  return (
    <AppContext.Provider value={{ store, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

// Actions
const SET_TOKEN = "APP/SET_TOKEN";
const DELETE_TOKEN = "APP/DELETE_TOKEN";

// Action Creators
export const setToken = ({ jwtToken, username }) => ({ type: SET_TOKEN, payload: { jwtToken, username } }); // Update: Accept jwtToken and username as an object
export const deleteToken = () => ({ type: DELETE_TOKEN });