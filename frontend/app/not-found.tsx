export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#7b2326' }}>
      <h1 style={{ fontSize: 44, fontWeight: 700, marginBottom: 12 }}>404 - Page Not Found</h1>
      <p style={{ fontSize: 20, marginBottom: 24 }}>Sorry, the page you are looking for does not exist.</p>
      <a href="/" style={{ color: '#7b2326', textDecoration: 'underline', fontWeight: 600 }}>Go back to dashboard</a>
    </div>
  );
}
