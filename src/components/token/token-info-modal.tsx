/**
 * Token Info Modal Component
 * Modal informativo sobre token digital (BRZ/USDC)
 */

"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface TokenInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenSymbol: string;
}

export function TokenInfoModal({ isOpen, onClose, tokenSymbol }: TokenInfoModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const isBRZ = tokenSymbol === 'BRZ';
  const currencySymbol = isBRZ ? 'R$' : '$';
  const currencyName = isBRZ ? 'Reais' : 'Dólares';
  const issuer = isBRZ ? 'Transfero' : 'Circle';
  const tokenName = isBRZ ? 'BRZ' : 'USDC';

  const handleClose = () => {
    if (dontShowAgain) {
      // Salvar preferência no localStorage
      localStorage.setItem(`token-info-modal-${tokenSymbol}`, 'true');
    }
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-slate-800 rounded-t-3xl border-t border-slate-700/50 max-h-[80vh] overflow-y-auto">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-white/30 rounded-full" />
        </div>

        <div className="px-6 pb-6 pt-2">
          {/* Ícones */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-500/30">
              <span className="text-green-400 font-bold text-xl">{currencySymbol}</span>
            </div>
            <span className="text-white text-2xl">=</span>
            <div className={`
              w-12 h-12 rounded-full flex items-center justify-center border-2
              ${isBRZ 
                ? 'bg-gradient-to-br from-green-500/20 to-yellow-500/20 border-green-500/30' 
                : 'bg-blue-500/20 border-blue-500/30'
              }
            `}>
              {isBRZ ? (
                <span className="text-green-400 font-bold text-xl">R$</span>
              ) : (
                <span className="text-blue-400 font-bold text-xl">$</span>
              )}
            </div>
          </div>

          {/* Título */}
          <h2 className="text-xl font-bold text-white text-center mb-4">
            Seu Saldo em {currencyName} é um Token Digital!
          </h2>

          {/* Texto */}
          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            O saldo em {currencyName} ({currencySymbol === 'R$' ? 'BRL' : 'USD'}) na Chainless é na verdade o {tokenName}, um token digital na blockchain, emitido pela {issuer}. Não somos um banco e não mantemos {isBRZ ? 'reais' : 'dólares'} em custódia. A paridade do {tokenName} com o {isBRZ ? 'Real' : 'Dólar'} é assegurada pela {issuer}, garantindo a confiança e segurança na conversão.
          </p>

          {/* Checkbox */}
          <label className="flex items-center gap-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-yellow-400 bg-transparent checked:bg-yellow-400 text-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            />
            <span className="text-white text-sm">Não mostrar novamente</span>
          </label>

          {/* Botão */}
          <button
            onClick={handleClose}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl transition-colors"
          >
            Ok, entendi
          </button>
        </div>
      </div>
    </>
  );
}

