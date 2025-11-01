"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SlippageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlippage: number;
  onAccept: (slippage: number) => void;
}

export function SlippageModal({
  isOpen,
  onClose,
  currentSlippage,
  onAccept,
}: SlippageModalProps) {
  const [tempSlippage, setTempSlippage] = useState(currentSlippage);
  const [customSlippage, setCustomSlippage] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Atualizar tempSlippage quando o modal abrir ou currentSlippage mudar
  useEffect(() => {
    if (isOpen) {
      setTempSlippage(currentSlippage);
      setShowCustomInput(false);
      setCustomSlippage("");
    }
  }, [isOpen, currentSlippage]);

  const handleAccept = () => {
    if (showCustomInput && customSlippage) {
      const customValue = parseFloat(customSlippage);
      if (isNaN(customValue) || customValue < 0.1 || customValue > 50) {
        return; // Validação deve ser feita pelo componente pai
      }
      onAccept(customValue);
    } else {
      onAccept(tempSlippage);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end lg:items-center lg:justify-center">
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-slate-800 rounded-t-2xl border-t border-slate-700 max-h-[80vh] overflow-y-auto pb-safe-area-inset-bottom lg:relative lg:bottom-auto lg:rounded-xl lg:w-full lg:max-w-md lg:mx-4">
        <div className="p-6 space-y-6">
          {/* Handle para drag no mobile */}
          <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto lg:hidden" />
          
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Tolerância a Slippage</h3>
            <p className="text-slate-400 text-sm">
              Sua transação será revertida se o preço mudar mais do que a porcentagem (%) de slippage selecionada.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => {
                setTempSlippage(0.1);
                setShowCustomInput(false);
              }}
              className={`w-full ${tempSlippage === 0.1 ? 'bg-slate-700 text-white' : 'bg-slate-800/50 border border-slate-700 text-slate-300'}`}
            >
              0.1%
            </Button>
            <Button
              onClick={() => {
                setTempSlippage(0.5);
                setShowCustomInput(false);
              }}
              className={`w-full ${tempSlippage === 0.5 ? 'bg-slate-700 text-white' : 'bg-slate-800/50 border border-slate-700 text-slate-300'}`}
            >
              0.5%
            </Button>
            {!showCustomInput ? (
              <Button
                onClick={() => setShowCustomInput(true)}
                className="w-full bg-slate-800/50 border border-slate-700 text-slate-300"
              >
                Definir %
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  type="number"
                  value={customSlippage}
                  onChange={(e) => setCustomSlippage(e.target.value)}
                  placeholder="Ex: 2.5"
                  className="bg-slate-700 border-slate-600 text-white"
                  min="0.1"
                  max="50"
                  step="0.1"
                  autoFocus
                />
                <p className="text-slate-400 text-xs">
                  Valor entre 0.1% e 50%
                </p>
              </div>
            )}
          </div>
          
          <div className="pb-20 lg:pb-6">
            <Button
              onClick={handleAccept}
              disabled={showCustomInput && customSlippage && (parseFloat(customSlippage) < 0.1 || parseFloat(customSlippage) > 50)}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Aceitar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

