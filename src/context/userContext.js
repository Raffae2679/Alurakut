import { createContext } from 'react';

export const UserContext = createContext({})

export function UserProvider({ children }) {
  const user = 'Raffae2679';

  return (
    <UserContext.Provider value={{user}}>
      {children}
    </UserContext.Provider>
  )
}

// Pegar o valor do us