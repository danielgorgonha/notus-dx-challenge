import { AppLayout } from "@/components/layout/app-layout";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Clock, TrendingUp } from "lucide-react";

export default function IncomePage() {
  return (
    <ProtectedRoute>
      <AppLayout 
        title="Renda"
        description="Gerencie seus rendimentos e investimentos"
      >
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-yellow-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Em Desenvolvimento
              </h1>
              <p className="text-slate-400 text-base">
                Esta funcionalidade está em desenvolvimento e estará disponível em breve.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-sm pt-4">
              <Clock className="h-4 w-4" />
              <span>Em breve teremos novidades!</span>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

