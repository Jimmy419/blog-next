"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { loadMonopolyGame, saveMonopolyGame } from "@/actions/monopoly.action";
import { useMonopolyStore } from "@/stores/useMonopolyStore";
import { toast } from "react-toastify";
import {
  Building,
  Coins,
  CreditCard,
  Loader2,
  Save,
  ScrollText,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { soundEngine } from "@/lib/sound";
import {
  getMonopolyCardImagePath,
  MONOPOLY_CARD_MAP,
  type MonopolyCardName,
} from "@/lib/monopoly-cards";

const PLAYER_SIGNATURE_COLORS: Record<string, { bg: string; border: string; glow: string; text: string }> = {
  p1: { bg: "rgba(59, 130, 246, 0.34)", border: "rgba(96, 165, 250, 0.9)", glow: "rgba(59, 130, 246, 0.25)", text: "#bfdbfe" },
  p2: { bg: "rgba(236, 72, 153, 0.34)", border: "rgba(244, 114, 182, 0.9)", glow: "rgba(236, 72, 153, 0.25)", text: "#fbcfe8" },
  p3: { bg: "rgba(245, 158, 11, 0.34)", border: "rgba(251, 191, 36, 0.92)", glow: "rgba(245, 158, 11, 0.25)", text: "#fde68a" },
  p4: { bg: "rgba(168, 85, 247, 0.34)", border: "rgba(192, 132, 252, 0.9)", glow: "rgba(168, 85, 247, 0.25)", text: "#e9d5ff" },
};

export default function MonopolyGamePage() {
  const store = useMonopolyStore();
  const [isClient, setIsClient] = useState(false);
  const [isSaving, startTransition] = useTransition();
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [stockShares, setStockShares] = useState<Record<string, number>>({});

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

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

    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      try {
        const stateToSave = {
          players: store.players,
          currentPlayerIndex: store.currentPlayerIndex,
          board: store.board,
          logs: store.logs,
          diceResult: store.diceResult,
          isAnimating: store.isAnimating,
          eventModal: null,
          roadblocks: store.roadblocks,
          day: store.day,
          stocks: store.stocks,
          placingRoadblock: false,
          hasRolledThisTurn: store.hasRolledThisTurn,
          activeCard: store.activeCard,
          shopInventory: store.shopInventory,
        };
        await saveMonopolyGame(stateToSave);
        toast.success("游戏已保存");
      } catch (e: any) {
        toast.error("保存失败：" + e.message);
      }
    });
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
    if (!soundEnabled) {
      soundEngine.playCoin();
    }
  };

  const handleBankSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const action = formData.get("action") as "deposit" | "withdraw";
    const amount = Number(formData.get("amount"));
    if (amount > 0) {
      store.bankAction(action, amount);
    }
  };

  const getGridPosition = (id: number, mobile: boolean) => {
    if (mobile) {
      if (id === 0) return { row: 1, col: 1 };
      if (id >= 1 && id <= 4) return { row: 1, col: id + 1 };
      if (id === 5) return { row: 1, col: 6 };
      if (id >= 6 && id <= 13) return { row: id - 4, col: 6 };
      if (id === 14) return { row: 10, col: 6 };
      if (id >= 15 && id <= 18) return { row: 10, col: 20 - id };
      if (id === 19) return { row: 10, col: 1 };
      if (id >= 20 && id <= 27) return { row: 29 - id, col: 1 };
    } else {
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
  const canOpenActionPanel =
    isMyTurn && !store.isAnimating && !store.placingRoadblock && !store.hasRolledThisTurn && !store.activeCard;
  const selectingPropertyCard =
    !!store.activeCard && MONOPOLY_CARD_MAP[store.activeCard]?.interaction === "select_property";

  const targetedCells = useMemo(
    () =>
      store.board.filter(
        (cell) => cell.property,
      ),
    [store.board],
  );

  const targetablePlayers = useMemo(
    () => store.players.filter((player) => player.id !== currentPlayer.id && player.status !== "bankrupt"),
    [store.players, currentPlayer.id],
  );

  const handleBoardCellClick = (cellId: number) => {
    if (store.placingRoadblock) {
      store.placeRoadblock(cellId);
      return;
    }
    if (selectingPropertyCard && store.activeCard) {
      store.useCardOnTarget(store.activeCard, String(cellId));
    }
  };

  const updateShareDraft = (stockId: string, delta: number) => {
    setStockShares((prev) => ({
      ...prev,
      [stockId]: Math.max(1, (prev[stockId] ?? 1) + delta),
    }));
  };

  if (!isClient || isInitLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-100px)] bg-slate-950 p-2 text-slate-100 md:p-4">
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex-1 overflow-hidden">
          <div
            className="grid w-full max-w-full select-none gap-1 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl md:gap-2 md:p-4"
            style={{
              gridTemplateColumns: isMobile ? "repeat(6, minmax(0, 1fr))" : "repeat(10, minmax(0, 1fr))",
              gridTemplateRows: isMobile ? "repeat(10, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))",
              aspectRatio: isMobile ? "6/10" : "10/6",
              maxHeight: isMobile ? "85vh" : "calc(100vh - 120px)",
            }}
          >
            <div
              className="relative z-0 flex flex-col items-center justify-center rounded-xl border border-slate-800/50 bg-slate-950/80 p-2 text-center shadow-inner backdrop-blur-sm md:p-6"
              style={{
                gridRowStart: 2,
                gridRowEnd: isMobile ? 10 : 6,
                gridColumnStart: 2,
                gridColumnEnd: isMobile ? 6 : 10,
              }}
            >
              <div className="absolute right-4 top-4 flex gap-2">
                <button
                  onClick={toggleSound}
                  className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700"
                >
                  {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-slate-500" />}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-full bg-slate-800 p-2 transition hover:bg-slate-700"
                  title="保存游戏"
                >
                  {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
              </div>

              <h1 className="mb-2 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-2xl font-black tracking-wider text-transparent drop-shadow-md md:mb-6 md:text-4xl">
                大富翁 2026
              </h1>

              <div className="flex w-full max-w-[280px] flex-col items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/90 p-4 shadow-xl md:max-w-sm md:gap-4 md:p-6">
                <div className="flex w-full items-center gap-3 border-b border-slate-700/50 pb-3">
                  <div className={`relative flex h-12 w-12 items-center justify-center rounded-full border-4 border-white/20 text-2xl shadow-lg md:h-16 md:w-16 md:text-3xl ${currentPlayer.color}`}>
                    {currentPlayer.avatar}
                    {currentPlayer.spirit && (
                      <div className="absolute -right-2 -top-2 whitespace-nowrap rounded-full bg-purple-600 px-1.5 py-0.5 text-[10px] text-white shadow-lg md:text-xs">
                        {currentPlayer.spirit.type} ({currentPlayer.spirit.daysLeft}天)
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs text-slate-400 md:text-sm">第 {store.day} 天</div>
                    <div className="text-lg font-bold md:text-xl">{currentPlayer.name}</div>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-1 px-2 text-sm font-medium md:text-base">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Coins size={14} />
                      现金
                    </span>
                    <span className="font-bold text-yellow-400">${currentPlayer.money}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <Building size={14} />
                      存款
                    </span>
                    <span className="font-bold text-blue-400">${currentPlayer.deposit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-400">
                      <CreditCard size={14} />
                      点券
                    </span>
                    <span className="font-bold text-fuchsia-400">{currentPlayer.points} 点</span>
                  </div>
                </div>

                {store.placingRoadblock && (
                  <div className="w-full rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-300">
                    路障放置中：请直接点击棋盘上的任意格子
                  </div>
                )}

                {selectingPropertyCard && store.activeCard && (
                  <div className="w-full rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-center text-xs text-cyan-200">
                    {store.activeCard} 选地中：请直接点击地图上的目标地皮
                  </div>
                )}

                {(store.placingRoadblock || selectingPropertyCard) && (
                  <button
                    onClick={store.closeModal}
                    className="w-full rounded-lg bg-slate-800 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
                  >
                    取消当前选点
                  </button>
                )}

                <div className="grid w-full grid-cols-2 gap-2">
                  <button
                    onClick={store.openCardModal}
                    disabled={!canOpenActionPanel || currentPlayer.cards.length === 0}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2 text-sm font-medium transition hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    <CreditCard size={16} />
                    我的卡片
                  </button>
                  <button
                    onClick={store.openStockModal}
                    disabled={!canOpenActionPanel}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2 text-sm font-medium transition hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    <TrendingUp size={16} />
                    股市
                  </button>
                </div>

                <button
                  onClick={store.rollDice}
                  disabled={store.isAnimating || !!store.eventModal || !isMyTurn || store.hasRolledThisTurn || !!store.activeCard}
                  className="mt-2 w-full rounded-xl border border-blue-400/30 bg-gradient-to-b from-blue-500 to-blue-700 py-3 text-lg font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all active:scale-95 hover:from-blue-400 hover:to-blue-600 disabled:border-slate-600 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 disabled:shadow-none md:py-4 md:text-xl"
                >
                  {store.isAnimating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" />
                      {currentPlayer.isAI ? "AI 思考中..." : "掷骰子中..."}
                    </span>
                  ) : store.diceResult ? (
                    `本回合已掷出 ${store.diceResult} 点`
                  ) : !isMyTurn ? (
                    "等待 AI 操作"
                  ) : (
                    "🎲 掷骰子"
                  )}
                </button>
              </div>
            </div>

            {store.board.map((cell) => {
              const { row, col } = getGridPosition(cell.id, isMobile);
              const playersOnCell = store.players.filter((player) => player.position === cell.id);
              const ownerSignature = cell.property?.ownerId
                ? PLAYER_SIGNATURE_COLORS[cell.property.ownerId]
                : null;
              const isTargetable =
                store.placingRoadblock ||
                (selectingPropertyCard && !!cell.property);

              const renderBuilding = () => {
                if (!cell.property) return null;
                const development = cell.property.development ?? "normal";
                const isEmpty = cell.property.level === 0;
                const buildingIcon =
                  development === "park"
                    ? "🌳"
                    : development === "chain"
                      ? "🏬"
                      : cell.property.level === 1
                        ? "🏠"
                        : cell.property.level === 2
                          ? "🏢"
                          : "🏨";
                const buildingLabel =
                  development === "park"
                    ? "公园"
                    : development === "chain"
                      ? "连锁店"
                      : cell.property.level === 1
                        ? "住宅"
                        : cell.property.level === 2
                          ? "商厦"
                          : "酒店";

                if (isEmpty) {
                  return (
                    <div className="flex flex-col items-center gap-1">
                      <div className="text-[10px] text-slate-500">空地</div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((step) => (
                          <span key={step} className="h-1 w-3 rounded-full bg-slate-700 md:w-4" />
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-1">
                      <span className="text-sm md:text-lg">{buildingIcon}</span>
                      <span className="rounded-full border border-amber-400/50 bg-amber-500/15 px-1.5 py-0.5 text-[8px] font-bold text-amber-200 md:text-[10px]">
                        Lv.{cell.property.level}
                      </span>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map((step) => (
                        <span
                          key={step}
                          className={`h-1 w-3 rounded-full md:w-4 ${
                            cell.property!.level >= step ? "bg-amber-400" : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="rounded-full bg-slate-950/70 px-1.5 py-0.5 text-[8px] font-medium text-slate-200 md:text-[9px]">
                      {buildingLabel}
                    </div>
                  </div>
                );
              };

              return (
                <button
                  key={cell.id}
                  type="button"
                  onClick={() => handleBoardCellClick(cell.id)}
                  className={`relative flex flex-col items-center justify-between overflow-hidden rounded-md border p-1 text-left transition-all duration-300 md:rounded-lg md:p-2 ${
                    cell.property?.ownerId ? "bg-slate-800/90" : "bg-slate-800"
                  } ${
                    isTargetable ? "cursor-pointer border-amber-400 ring-2 ring-amber-400/30" : "border-slate-700"
                  }`}
                  style={{
                    gridArea: `${row} / ${col}`,
                    backgroundColor: ownerSignature?.bg,
                    borderColor: ownerSignature?.border,
                    boxShadow: ownerSignature ? `inset 0 0 0 1px ${ownerSignature.border}, 0 0 18px ${ownerSignature.glow}` : undefined,
                  }}
                >
                  {cell.type === "PROPERTY" && (
                    <div className={`absolute left-0 right-0 top-0 h-1.5 opacity-80 md:h-2 ${cell.property?.color}`} />
                  )}

                  <div className="mt-1.5 flex w-full flex-1 flex-col items-center justify-center md:mt-2">
                    {cell.icon && <div className="mb-0.5 text-lg md:text-2xl">{cell.icon}</div>}
                    <div className="z-10 text-center text-[9px] font-bold leading-tight text-white/90 md:text-xs">
                      {cell.name}
                    </div>
                    {cell.type === "PROPERTY" && (
                      <div className="z-10 mt-0.5 flex flex-col items-center">
                        {renderBuilding()}
                        <div className="mt-0.5 text-[8px] font-mono text-slate-300 md:text-[10px]">
                          ${cell.property?.price}
                        </div>
                        {ownerSignature && (
                          <div
                            className="mt-1 rounded-full px-1.5 py-0.5 text-[8px] font-semibold md:text-[9px]"
                            style={{ backgroundColor: ownerSignature.glow, color: ownerSignature.text }}
                          >
                            已购置
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-1 left-0 right-0 z-20 flex justify-center gap-0.5 px-1">
                    {playersOnCell.map((player) => (
                      <div
                        key={player.id}
                        title={player.name}
                        className={`relative flex h-4 w-4 items-center justify-center rounded-full border border-white/50 text-[10px] shadow-md transition-all duration-300 ease-in-out md:h-6 md:w-6 md:text-xs ${player.color} ${
                          player.id === currentPlayer.id && store.isAnimating ? "animate-bounce" : ""
                        } ${player.id === currentPlayer.id ? "z-30 scale-110 ring-2 ring-white" : "z-20"}`}
                      >
                        {player.avatar}
                        {player.spirit && (
                          <div
                            className="absolute -right-1 -top-1 h-2 w-2 rounded-full border border-white bg-purple-500 md:h-3 md:w-3"
                            title={player.spirit.type}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {store.roadblocks.includes(cell.id) && (
                    <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl">
                      🚧
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex w-full flex-col gap-4 xl:w-80">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 md:p-4">
            <h2 className="mb-2 flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-semibold md:text-base">
              <Users size={16} />
              玩家状态
            </h2>
            <div className="flex flex-col gap-2">
              {store.players.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between rounded-lg border p-2 ${
                    idx === store.currentPlayerIndex
                      ? "border-blue-500/50 bg-slate-800"
                      : "border-slate-800 bg-slate-950"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${player.color}`}>
                      {player.avatar}
                    </div>
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1 text-xs font-medium md:text-sm">
                        {player.name}
                        {player.status !== "normal" && (
                          <span className="rounded bg-red-500/20 px-1 text-[10px] text-red-400">
                            {player.status === "jail"
                              ? "坐牢"
                              : player.status === "hospital"
                                ? "住院"
                                : player.status === "sleep"
                                  ? "沉睡"
                                  : "破产"}
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-yellow-400 md:text-xs">
                        现 ${player.money} / 存 ${player.deposit} / 券 {player.points}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex min-h-[150px] flex-1 flex-col rounded-xl border border-slate-800 bg-slate-900 p-3 md:min-h-[200px] md:p-4">
            <h2 className="mb-2 flex items-center gap-2 border-b border-slate-800 pb-2 text-sm font-semibold md:text-base">
              <ScrollText size={16} />
              游戏日志
            </h2>
            <div className="custom-scrollbar flex-1 space-y-1.5 overflow-y-auto pr-2">
              {store.logs.map((log, i) => (
                <div key={`${log}-${i}`} className={`text-xs md:text-sm ${i === 0 ? "font-medium text-blue-400" : "text-slate-400"}`}>
                  <span className="mr-1 text-[10px] opacity-40">{store.logs.length - i}.</span>
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {store.eventModal && (
        <div
          className={`fixed inset-0 z-50 p-4 ${
            store.eventModal.type === "roadblock"
              ? "pointer-events-none flex items-start justify-center bg-transparent"
              : "flex items-center justify-center bg-black/60 backdrop-blur-sm"
          }`}
        >
          <div
            className={`rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-[0_0_40px_rgba(0,0,0,0.5)] ${
              store.eventModal.type === "roadblock"
                ? "pointer-events-auto mt-6 w-full max-w-md"
                : "w-full max-w-lg"
            }`}
          >
            <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
              {store.eventModal.title}
            </h3>
            {store.eventModal.description && (
              <p className="mb-6 text-sm leading-relaxed text-slate-300 md:text-base">
                {store.eventModal.description}
              </p>
            )}

            {(store.eventModal.type === "buy" || store.eventModal.type === "upgrade") && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={store.closeModal}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (store.eventModal?.type === "buy") store.buyProperty(store.eventModal.propertyId!);
                    if (store.eventModal?.type === "upgrade") store.upgradeProperty(store.eventModal.propertyId!);
                  }}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition-colors hover:bg-blue-500"
                >
                  <Coins size={16} />
                  确认
                </button>
              </div>
            )}

            {store.eventModal.type === "info" && (
              <button
                onClick={store.closeModal}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-500"
              >
                确定
              </button>
            )}

            {store.eventModal.type === "bank" && (
              <form onSubmit={handleBankSubmit} className="flex flex-col gap-3">
                <input
                  type="number"
                  name="amount"
                  placeholder="金额"
                  min={1}
                  required
                  className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button type="submit" name="action" value="deposit" className="flex-1 rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-500">
                    存款
                  </button>
                  <button type="submit" name="action" value="withdraw" className="flex-1 rounded-lg bg-yellow-600 py-2 font-medium text-white hover:bg-yellow-500">
                    取款
                  </button>
                </div>
                <button
                  type="button"
                  onClick={store.closeModal}
                  className="mt-2 w-full rounded-lg bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
                >
                  离开
                </button>
              </form>
            )}

            {store.eventModal.type === "roadblock" && (
              <div className="space-y-3">
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-3 text-sm text-amber-200">
                  已进入路障放置模式，直接点击棋盘上的任意格子即可放置。
                </div>
                <button
                  onClick={store.closeModal}
                  className="w-full rounded-lg bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
                >
                  取消放置
                </button>
              </div>
            )}

            {store.eventModal.type === "card" && store.eventModal.title === "我的卡片" && (
              <div className="space-y-3">
                <div className="grid max-h-[420px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                  {currentPlayer.cards.length === 0 && (
                    <div className="col-span-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-6 text-center text-sm text-slate-400">
                      当前没有卡片
                    </div>
                  )}
                  {currentPlayer.cards.map((card, idx) => (
                    <button
                      key={`${card}-${idx}`}
                      onClick={() => store.useCard(card as MonopolyCardName)}
                      className="flex items-center gap-3 rounded-xl border border-indigo-500/30 bg-indigo-600/20 px-3 py-3 text-left text-sm font-medium text-white transition hover:bg-indigo-600/30"
                    >
                      <Image
                        src={getMonopolyCardImagePath(card)}
                        alt={card}
                        width={80}
                        height={112}
                        unoptimized
                        className="h-28 w-20 rounded-xl object-cover shadow-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 text-lg font-semibold">{card}</div>
                        <div className="text-xs text-slate-300">
                          {MONOPOLY_CARD_MAP[card as MonopolyCardName]?.shortDescription}
                        </div>
                        <div className="mt-2 text-[11px] text-indigo-200">
                          交互方式：{MONOPOLY_CARD_MAP[card as MonopolyCardName]?.interaction}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={store.closeModal}
                  className="w-full rounded-lg bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
                >
                  关闭
                </button>
              </div>
            )}

            {store.eventModal.type === "card" &&
              store.activeCard &&
              MONOPOLY_CARD_MAP[store.activeCard]?.interaction === "select_player" && (
              <div className="space-y-3">
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {targetablePlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => store.useCardOnPlayer(store.activeCard!, player.id)}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-left transition hover:bg-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${player.color}`}>
                          {player.avatar}
                        </span>
                        <span>
                          <span className="block font-medium text-white">{player.name}</span>
                          <span className="text-xs text-slate-400">现金 ${player.money} / 卡片 {player.cards.length}</span>
                        </span>
                      </span>
                      <span className="text-xs text-slate-400">点击使用</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={store.closeModal}
                  className="w-full rounded-lg bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
                >
                  取消
                </button>
              </div>
            )}

            {store.eventModal.type === "card" &&
              store.activeCard &&
              MONOPOLY_CARD_MAP[store.activeCard]?.interaction === "select_property" && (
              <div className="space-y-3">
                <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                  {targetedCells.map((cell) => (
                    <button
                      key={cell.id}
                      onClick={() => store.useCardOnTarget(store.activeCard!, String(cell.id))}
                      className="flex w-full items-center justify-between rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-left transition hover:bg-slate-700"
                    >
                      <span className="font-medium text-white">{cell.name}</span>
                      <span className="text-xs text-slate-400">
                        等级 {cell.property?.level ?? 0} / ${cell.property?.price}
                      </span>
                    </button>
                  ))}
                  {targetedCells.length === 0 && (
                    <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-6 text-center text-sm text-slate-400">
                      当前没有可选目标
                    </div>
                  )}
                </div>
                <button
                  onClick={store.closeModal}
                  className="w-full rounded-lg bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
                >
                  取消
                </button>
              </div>
            )}

            {store.eventModal.type === "stock" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  当前银行余额：${currentPlayer.deposit}，股票买卖均使用银行存款结算。
                </div>
                <div className="max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {store.stocks.map((stock) => {
                    const draft = stockShares[stock.id] ?? 1;
                    const owned = currentPlayer.stockShares[stock.id] ?? 0;
                    return (
                      <div key={stock.id} className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                        <div className="mb-2 flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{stock.name}</div>
                            <div className={`text-xs ${stock.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              现价 ${stock.price} / 涨跌 {stock.change >= 0 ? "+" : ""}{stock.change}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">持仓 {owned} 股</div>
                        </div>
                        <div className="mb-3 flex items-center gap-2">
                          <button
                            onClick={() => updateShareDraft(stock.id, -1)}
                            className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
                          >
                            -
                          </button>
                          <div className="min-w-10 text-center text-sm text-white">{draft}</div>
                          <button
                            onClick={() => updateShareDraft(stock.id, 1)}
                            className="rounded bg-slate-700 px-3 py-1 text-white hover:bg-slate-600"
                          >
                            +
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {store.activeCard &&
                          MONOPOLY_CARD_MAP[store.activeCard]?.interaction === "select_stock" ? (
                            <>
                              <button
                                onClick={() => store.useCardOnStock(store.activeCard!, stock.id)}
                                className="col-span-2 rounded-lg bg-rose-600 py-2 text-sm font-medium text-white hover:bg-rose-500"
                              >
                                对这支股票使用 {store.activeCard}
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => store.buyStock(stock.id, draft)}
                                className="rounded-lg bg-emerald-600 py-2 text-sm font-medium text-white hover:bg-emerald-500"
                              >
                                买入
                              </button>
                              <button
                                onClick={() => store.sellStock(stock.id, draft)}
                                className="rounded-lg bg-sky-600 py-2 text-sm font-medium text-white hover:bg-sky-500"
                              >
                                卖出
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={store.closeModal}
                  className="w-full rounded-lg bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
                >
                  关闭股市
                </button>
              </div>
            )}

            {store.eventModal.type === "shop" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-3 text-sm text-fuchsia-200">
                  当前点券：{currentPlayer.points} 点。只有停在地图上的卡片店时，才会看到本次随机刷新的货架。
                </div>
                <div className="grid max-h-[420px] grid-cols-1 gap-3 overflow-y-auto pr-1 md:grid-cols-2">
                  {store.shopInventory.map((cardName) => {
                    const card = MONOPOLY_CARD_MAP[cardName];
                    return (
                    <div key={card.name} className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                      <div className="flex gap-3">
                        <Image
                          src={getMonopolyCardImagePath(card.name)}
                          alt={card.name}
                          width={92}
                          height={132}
                          unoptimized
                          className="h-32 w-24 rounded-xl object-cover shadow-xl"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-lg font-semibold text-white">{card.name}</div>
                          <div className="text-xs text-slate-400">{card.category}</div>
                          <div className="mt-2 text-xs text-slate-300">{card.shortDescription}</div>
                          <div className="mt-2 text-xs text-fuchsia-300">售价：{card.price} 点</div>
                        </div>
                      </div>
                      <button
                        onClick={() => store.buyCardFromShop(card.name)}
                        disabled={currentPlayer.points < card.price}
                        className="mt-3 w-full rounded-lg bg-fuchsia-600 py-2 text-sm font-medium text-white hover:bg-fuchsia-500 disabled:bg-slate-700 disabled:text-slate-400"
                      >
                        购买
                      </button>
                    </div>
                  );
                  })}
                  {store.shopInventory.length === 0 && (
                    <div className="md:col-span-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-8 text-center text-sm text-slate-400">
                      本次货架已经售空，关闭商店后回合结束。
                    </div>
                  )}
                </div>
                <button
                  onClick={store.closeModal}
                  className="w-full rounded-lg bg-slate-700 py-2 font-medium text-white hover:bg-slate-600"
                >
                  关闭商店
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
