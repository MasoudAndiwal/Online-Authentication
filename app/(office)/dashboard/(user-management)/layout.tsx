'use client'

export default function UserManagementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth is handled by individual pages using useAuth hook
  return (
    <div className="min-h-screen">      
      {children}
    </div>
  )
}