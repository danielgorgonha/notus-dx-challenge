/**
 * Pool Action Buttons Component
 * Botões para adicionar e resgatar liquidez
 */

"use client";

interface PoolActionButtonsProps {
  poolId: string;
  hasUserPosition: boolean;
  onAddLiquidity: () => void;
  onRemoveLiquidity: () => void;
}

export function PoolActionButtons({
  poolId,
  hasUserPosition,
  onAddLiquidity,
  onRemoveLiquidity,
}: PoolActionButtonsProps) {
  return (
    <div className="px-4 lg:px-6 pb-6">
      <div className="flex gap-3">
        {/* Botão Resgatar liquidez (só aparece se tiver posição) */}
        {hasUserPosition && (
          <button
            onClick={onRemoveLiquidity}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Resgatar liquidez
          </button>
        )}

        {/* Botão Adicionar liquidez */}
        <button
          onClick={onAddLiquidity}
          className={`${hasUserPosition ? 'flex-1' : 'w-full'} bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-xl transition-colors`}
        >
          Adicionar liquidez
        </button>
      </div>
    </div>
  );
}

