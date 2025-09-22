import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { ProtectedRoute } from "../auth/protected-route";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function DashboardLayout({ 
  children, 
  title, 
  description 
}: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-72">
          <Header title={title} description={description} />
          <main className="flex-1 p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
