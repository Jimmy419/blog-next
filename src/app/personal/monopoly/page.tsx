"use client";

import { useEffect, useState, useTransition } from "react";
import { BOARD_CELLS, useMonopolyStore, Player } from "@/stores/useMonopolyStore";
import { loadMonopolyGame, saveMonopolyGame } from "@/actions/monopoly.action";
import { toast } from "react-toastify";
import { Loader2, Save, Users, Building, Coins, Volume2, VolumeX } from "lucide-react";
import { soundEngine } from "@/lib/sound";

export default function MonopolyGamePage() {
  const store = useMonopolyStore();
  const [isClient, setIsClient] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Load from server
    loadMonopolyGame()
      .then((state) => {
        if (state && typeof state === "object") {
          store.loadState(state as any);
        }
      })
      .catch((e) => {
        toast.error("加载存档失败: " + e.message);
      })
      .finally(() => {
        setIsInitLoading(false);
      });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const { players, currentPlayerIndex, board, logs, diceResult, isAnimating, eventModal } = store;
        const stateToSave = { players, currentPlayerIndex, board, logs, diceResult, isAnimating, eventModal };
        await saveMonopolyGame(stateToSave);
        toast.success("游戏已保存！");
      } catch (e: any) {
        toast.error("保存失败：" + e.message);
      }
    });
  };

  if (!isClient || isInitLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      soundEngine.playCoin(); // test sound
    }
  };

  const handleBankSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const action = formData.get('action') as 'deposit' | 'withdraw';
    const amount = Number(formData.get('amount'));
    if (amount > 0) {
      store.bankAction(action, amount);
    }
  };

  const getGridPosition = (id: number, mobile: boolean) => {
    if (mobile) {
      // 6x10 grid (28 cells)
      if (id === 0) return { row: 1, col: 1 };
      if (id >= 1 && id <= 4) return { row: 1, col: id + 1 };
      if (id === 5) return { row: 1, col: 6 };
      if (id >= 6 && id <= 13) return { row: id - 4, col: 6 };
      if (id === 14) return { row: 10, col: 6 };
      if (id >= 15 && id <= 18) return { row: 10, col: 20 - id };
      if (id === 19) return { row: 10, col: 1 };
      if (id >= 20 && id <= 27) return { row: 29 - id, col: 1 };
    } else {
      // 10x6 grid (28 cells)
      if (id === 0) return { row: 1, col: 1 };
      if (id >= 1 && id <= 8) return { row: 1, col: id + 1 };
      if (id === 9) return { row: 1, col: 10 };
      if (id >= 10 && id <= 13) return { row: id - 8, col: 10 };
      if (id === 14) return { row: 6, col: 10 };
      if (id >= 15 && id <= 22) return { row: 6, col: 24 - id };
      if (id === 23) return { row: 6, col: 1 };
      if (id >= 24 && id <= 27) return { row: 29 - id, col: 1 };
    }
    return { row: 1, col: 1 };
  };

  const currentPlayer = store.players[store.currentPlayerIndex];
  const isMyTurn = !currentPlayer.isAI;

  return (
    <main className="min-h-[calc(100vh-100px)] bg-slate-950 p-2 md:p-4 text-slate-100 flex flex-col xl:flex-row gap-4">
      
      {/* 棋盘区域 */}
      <div className="flex-1 flex justify-center items-start overflow-hidden">
        <div 
          className={`grid gap-1 md:gap-2 p-2 md:p-4 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 relative select-none w-full max-w-full`}
          style={{ 
            gridTemplateColumns: isMobile ? 'repeat(6, minmax(0, 1fr))' : 'repeat(10, minmax(0, 1fr))',
            gridTemplateRows: isMobile ? 'repeat(10, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))',
            aspectRatio: isMobile ? '6/10' : '10/6',
            maxHeight: isMobile ? '85vh' : 'calc(100vh - 120px)'
          }}
        >
          
          {/* 中间信息区 */}
          <div 
            className="flex flex-col items-center justify-center text-center p-2 md:p-6 bg-slate-950/80 rounded-xl border border-slate-800/50 shadow-inner backdrop-blur-sm z-0"
            style={{
              gridRowStart: 2, gridRowEnd: isMobile ? 10 : 6,
              gridColumnStart: 2, gridColumnEnd: isMobile ? 6 : 10,
            }}
          >
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={toggleSound} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition">
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-slate-500" />}
              </button>
              <button onClick={handleSave} disabled={isSaving} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition" title="保存游戏">
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              </button>
            </div>

            <h1 className="text-2xl md:text-4xl font-black bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2 md:mb-6 tracking-wider drop-shadow-md">
              大富翁 2026
            </h1>
            
            <div className="bg-slate-900/90 p-4 md:p-6 rounded-2xl border border-slate-700 w-full max-w-[280px] md:max-w-sm flex flex-col items-center gap-3 md:gap-4 shadow-xl">
              <div className="flex items-center gap-3 w-full border-b border-slate-700/50 pb-3">
                <div className={`relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-2xl md:text-3xl border-4 shadow-lg ${currentPlayer.color} border-white/20`}>
                  {currentPlayer.avatar}
                  {currentPlayer.spirit && (
                    <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] md:text-xs px-1.5 py-0.5 rounded-full shadow-lg whitespace-nowrap animate-pulse">
                      {currentPlayer.spirit.type} ({currentPlayer.spirit.daysLeft}天)
                    </div>
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="text-xs md:text-sm text-slate-400">第 {store.day} 天</div>
                  <div className="text-lg md:text-xl font-bold">{currentPlayer.name}</div>
                </div>
              </div>
              
              <div className="text-sm md:text-base font-medium w-full flex flex-col gap-1 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Coins size={14}/> 现金</span> 
                  <span className="text-yellow-400 font-bold">${currentPlayer.money}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 flex items-center gap-1"><Building size={14}/> 存款</span> 
                  <span className="text-blue-400 font-bold">${currentPlayer.deposit}</span>
                </div>
              </div>
              
              {/* 卡片区域 */}
              {isMyTurn && currentPlayer.cards.length > 0 && !store.isAnimating && !store.eventModal && !store.diceResult && (
                <div className="w-full flex gap-2 overflow-x-auto py-1 custom-scrollbar">
                  {currentPlayer.cards.map((card, idx) => (
                    <button
                      key={idx}
                      onClick={() => store.useCard(card)}
                      className="whitespace-nowrap px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-md shadow transition active:scale-95"
                    >
                      使用 {card}
                    </button>
                  ))}
                </div>
              )}
              
              <button 
                onClick={store.rollDice} 
                disabled={store.isAnimating || !!store.eventModal || !isMyTurn}
                className="w-full py-3 md:py-4 mt-2 rounded-xl bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 text-white font-bold text-lg md:text-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.4)] disabled:shadow-none border border-blue-400/30 disabled:border-slate-600"
              >
                {store.isAnimating ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" /> {currentPlayer.isAI ? 'AI 思考中...' : '掷骰子中...'}</span>
                ) : store.diceResult ? (
                  `掷出 ${store.diceResult} 点`
                ) : !isMyTurn ? (
                  "等待 AI 操作"
                ) : (
                  "🎲 掷骰子"
                )}
              </button>
            </div>
          </div>

          {/* 渲染格子 */}
          {BOARD_CELLS.map((cell) => {
            const { row, col } = getGridPosition(cell.id, isMobile);
            const playersOnCell = store.players.filter(p => p.position === cell.id);
            
            // Generate Building UI based on level
            const renderBuilding = () => {
              if (!cell.property) return null;
              const lvl = cell.property.level;
              if (lvl === 0) return <div className="text-[10px] text-slate-500">空地</div>;
              if (lvl === 1) return <div className="text-xs">🏠</div>;
              if (lvl === 2) return <div className="text-sm">🏢</div>;
              if (lvl === 3) return <div className="text-base">🏨</div>;
            };

            return (
              <div 
                key={cell.id}
                className={`relative flex flex-col items-center justify-between p-1 md:p-2 rounded-md md:rounded-lg border transition-all duration-300 ${
                  cell.property?.ownerId ? 'bg-slate-800/80' : 'bg-slate-800'
                } border-slate-700 overflow-hidden`}
                style={{ gridArea: `${row} / ${col}` }}
              >
                {/* 顶部颜色条 (房产) */}
                {cell.type === 'PROPERTY' && (
                  <div className={`absolute top-0 left-0 right-0 h-1.5 md:h-2 ${cell.property?.color} opacity-80`} />
                )}
                
                {/* 占领者背景色 / 标识 */}
                {cell.property?.ownerId && (
                  <div className={`absolute inset-0 opacity-20 pointer-events-none ${store.players.find(p=>p.id===cell.property!.ownerId)?.color}`} />
                )}

                <div className="flex-1 flex flex-col items-center justify-center w-full mt-1.5 md:mt-2">
                  {cell.icon && <div className="text-lg md:text-2xl mb-0.5">{cell.icon}</div>}
                  <div className="text-[9px] md:text-xs font-bold text-center leading-tight z-10 text-white/90">
                    {cell.name}
                  </div>
                  {cell.type === 'PROPERTY' && (
                    <div className="mt-0.5 z-10 flex flex-col items-center">
                      {renderBuilding()}
                      <div className="text-[8px] md:text-[10px] font-mono text-slate-300 mt-0.5">${cell.property?.price}</div>
                    </div>
                  )}
                </div>

                {/* 玩家棋子 */}
                <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 px-1 z-20">
                  {playersOnCell.map((p, i) => (
                    <div 
                      key={p.id} 
                      className={`relative w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center text-[10px] md:text-xs shadow-md border border-white/50 transition-all duration-300 ease-in-out ${p.color} ${p.id === currentPlayer.id && store.isAnimating ? 'animate-bounce' : ''} ${p.id === currentPlayer.id ? 'scale-110 ring-2 ring-white z-30' : 'z-20'}`}
                      style={{ transform: `translateY(${p.id === currentPlayer.id && store.isAnimating ? '-5px' : '0'})` }}
                      title={p.name}
                    >
                      {p.avatar}
                      {p.spirit && <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full border border-white" title={p.spirit.type} />}
                    </div>
                  ))}
                </div>
                
                {/* 路障 */}
                {store.roadblocks.includes(cell.id) && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl z-20">
                    🚧
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 右侧面板 (PC) / 下方面板 (Mobile) */}
      <div className="w-full xl:w-80 flex flex-col gap-4">
        
        {/* 玩家列表 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4">
          <h2 className="text-sm md:text-base font-semibold border-b border-slate-800 pb-2 mb-2 flex items-center gap-2">
            <Users size={16} /> 玩家状态
          </h2>
          <div className="flex flex-col gap-2">
            {store.players.map((p, idx) => (
              <div key={p.id} className={`flex items-center justify-between p-2 rounded-lg border ${idx === store.currentPlayerIndex ? 'bg-slate-800 border-blue-500/50' : 'bg-slate-950 border-slate-800'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${p.color}`}>
                    {p.avatar}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-medium flex items-center gap-1">
                      {p.name} {p.status !== 'normal' && <span className="text-[10px] bg-red-500/20 text-red-400 px-1 rounded">{p.status === 'jail' ? '坐牢' : '住院'}</span>}
                    </span>
                    <span className="text-[10px] md:text-xs text-yellow-400 font-mono">${p.money}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 游戏日志 */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4 flex-1 min-h-[150px] md:min-h-[200px] flex flex-col">
          <h2 className="text-sm md:text-base font-semibold border-b border-slate-800 pb-2 mb-2">游戏日志</h2>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
            {store.logs.map((log, i) => (
              <div key={i} className={`text-xs md:text-sm ${i === 0 ? 'text-blue-400 font-medium' : 'text-slate-400'}`}>
                <span className="opacity-40 mr-1 text-[10px]">{store.logs.length - i}.</span> {log}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 事件弹窗 Modal */}
      {store.eventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] max-w-sm w-full animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
              {store.eventModal.title}
            </h3>
            <p className="text-slate-300 mb-6 text-sm md:text-base leading-relaxed">{store.eventModal.description}</p>
            
            <div className="flex justify-end gap-3">
              {(store.eventModal.type === 'buy' || store.eventModal.type === 'upgrade') && (
                <>
                  <button 
                    onClick={store.closeModal}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors text-sm font-medium"
                  >
                    取消
                  </button>
                  <button 
                    onClick={() => {
                      if (store.eventModal?.type === 'buy') store.buyProperty(store.eventModal!.propertyId!);
                      if (store.eventModal?.type === 'upgrade') store.upgradeProperty(store.eventModal!.propertyId!);
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors shadow-lg shadow-blue-500/20 text-sm flex items-center gap-1"
                  >
                    <Coins size={16} /> 确认
                  </button>
                </>
              )}
              {store.eventModal.type === 'info' && (
                <button 
                  onClick={store.closeModal}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors w-full shadow-lg shadow-blue-500/20"
                >
                  确定
                </button>
              )}
              {store.eventModal.type === 'bank' && (
                <form onSubmit={handleBankSubmit} className="flex flex-col gap-3 w-full">
                  <input type="number" name="amount" placeholder="金额" min={1} required className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500" />
                  <div className="flex gap-2">
                    <button type="submit" name="action" value="deposit" className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white font-medium">存款</button>
                    <button type="submit" name="action" value="withdraw" className="flex-1 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-medium">取款</button>
                  </div>
                  <button type="button" onClick={store.closeModal} className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium mt-2">离开</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
