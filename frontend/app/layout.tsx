export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'ui-sans-serif, system-ui', margin: 0, padding: 16 }}>
        <h1>Smart Task Tracker</h1>
        {children}
      </body>
    </html>
  );
}