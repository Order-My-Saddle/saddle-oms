// This layout disables the default app layout (TopNav/Sidebar) for /login only
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
