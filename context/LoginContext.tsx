// context/LoginContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Definimos qué controles tendrá nuestro "control remoto"
interface LoginContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

// 2. Creamos el contexto
const LoginContext = createContext<LoginContextType | undefined>(undefined);

// 3. Creamos el "Provider" que envolverá nuestra aplicación
export function LoginProvider({ children }: { children: ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <LoginContext.Provider value={{ isLoginOpen, openLogin, closeLogin }}>
      {children}
    </LoginContext.Provider>
  );
}

// 4. Un hook personalizado para usar el control remoto fácilmente
export function useLogin() {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
}