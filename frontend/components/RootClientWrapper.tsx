"use client";
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { JotaiProvider } from './providers/JotaiProvider';
import ClientLayoutWrapper from './ClientLayoutWrapper';

interface RootClientWrapperProps {
  children: ReactNode;
}

export default function RootClientWrapper({ children }: RootClientWrapperProps) {
  console.log('🏗️ RootClientWrapper: Component mounting/initializing');

  return (
    <JotaiProvider>
      <AuthProvider>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </AuthProvider>
    </JotaiProvider>
  );
}