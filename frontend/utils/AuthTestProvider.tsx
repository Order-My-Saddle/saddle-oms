// Re-export AuthTestProvider from __tests__/utils for test imports using @/ path alias
export {
  AuthTestProvider,
  createAuthTestWrapper,
  mockAuthContext,
  mockUseAuth,
  mockUseUserRole
} from '../__tests__/utils/AuthTestProvider';
