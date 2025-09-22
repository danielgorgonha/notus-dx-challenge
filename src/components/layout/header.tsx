import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
      <div className="px-8 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
            {description && (
              <p className="text-slate-300">{description}</p>
            )}
          </div>
          <Button className="btn-primary">
            <Shield className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        </div>
      </div>
    </header>
  );
}
