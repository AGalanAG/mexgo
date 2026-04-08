"use client";

import React from 'react';
import { useLogin } from '@/context/LoginContext';
import LoginModal from './LoginModal';

export default function GlobalLoginModal() {
  const { isLoginOpen, closeLogin } = useLogin();

  return (
    <LoginModal 
      isOpen={isLoginOpen} 
      onClose={closeLogin} 
    />
  );
}
