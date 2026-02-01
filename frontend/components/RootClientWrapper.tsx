"use client";
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { JotaiProvider } from './providers/JotaiProvider';
import ClientLayoutWrapper from './ClientLayoutWrapper';
import { logger } from '@/utils/logger';

interface RootClientWrapperProps {
  children: ReactNode;
}

export default function RootClientWrapper({ children }: RootClientWrapperProps) {
  logger.log('🏗️ RootClientWrapper: Component mounting/initializing');

  return (
    <JotaiProvider>
      <AuthProvider>
        <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
      </AuthProvider>
    </JotaiProvider>
  );
}