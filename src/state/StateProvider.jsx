import { createContext, useReducer, useEffect } from 'react';

export const StateContext = createContext();

const initialState = {
  userInfo: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'USER_SIGNIN':
      return { ...state, userInfo: action.payload };
    case 'USER_SIGNOUT':
      return {
        ...state,
        userInfo: null,
      };
    default:
      return state;
  }
}

export default function StateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      dispatch({ type: 'USER_SIGNIN', payload: JSON.parse(userInfo) });
    }
  }, []);

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
}
