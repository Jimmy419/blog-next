import { create } from 'zustand';
import { soundEngine } from '@/lib/sound';
import {
  MONOPOLY_CARD_DEFINITIONS,
  MONOPOLY_CARD_MAP,
  type MonopolyCardName,
} from '@/lib/monopoly-cards';

export type CellType = 'START' | 'PROPERTY' | 'CHANCE' | 'FATE' | 'TAX' | 'JAIL' | 'FREE_PARKING' | 'HOSPITAL' | 'BANK' | 'MAGIC' | 'SHOP';

export interface PropertyCell {
  id: number;
  name: string;
  price: number;
  rent: number;
  color: string;
  ownerId: string | null;
  level: number;
  sealedDays?: number;
  development?: 'normal' | 'chain' | 'park';
}

export interface BoardCell {
  id: number;
  type: CellType;
  name: string;
  property?: PropertyCell;
  icon?: string;
}

export const BOARD_CELLS: BoardCell[] = [
  { id: 0, type: 'START', name: '起点', icon: '🏁' },
  { id: 1, type: 'PROPERTY', name: '台北', property: { id: 1, name: '台北', price: 100, rent: 10, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 2, type: 'PROPERTY', name: '台中', property: { id: 2, name: '台中', price: 100, rent: 10, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 3, type: 'CHANCE', name: '机会', icon: '❓' },
  { id: 4, type: 'PROPERTY', name: '高雄', property: { id: 4, name: '高雄', price: 120, rent: 12, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 5, type: 'PROPERTY', name: '花莲', property: { id: 5, name: '花莲', price: 120, rent: 12, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 6, type: 'TAX', name: '所得税', icon: '💰' },
  { id: 7, type: 'JAIL', name: '监狱', icon: '🚓' },
  { id: 8, type: 'PROPERTY', name: '东京', property: { id: 8, name: '东京', price: 150, rent: 15, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 9, type: 'PROPERTY', name: '大阪', property: { id: 9, name: '大阪', price: 150, rent: 15, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 10, type: 'FATE', name: '命运', icon: '📜' },
  { id: 11, type: 'PROPERTY', name: '首尔', property: { id: 11, name: '首尔', price: 180, rent: 18, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 12, type: 'PROPERTY', name: '北海道', property: { id: 12, name: '北海道', price: 180, rent: 18, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 13, type: 'SHOP', name: '卡片店', icon: '🛍️' },
  { id: 14, type: 'BANK', name: '银行', icon: '🏦' },
  { id: 15, type: 'PROPERTY', name: '北京', property: { id: 15, name: '北京', price: 200, rent: 20, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 16, type: 'PROPERTY', name: '上海', property: { id: 16, name: '上海', price: 200, rent: 20, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 17, type: 'MAGIC', name: '魔法屋', icon: '🔮' },
  { id: 18, type: 'PROPERTY', name: '广州', property: { id: 18, name: '广州', price: 220, rent: 22, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 19, type: 'PROPERTY', name: '深圳', property: { id: 19, name: '深圳', price: 220, rent: 22, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 20, type: 'TAX', name: '奢侈税', icon: '💎' },
  { id: 21, type: 'HOSPITAL', name: '医院', icon: '🏥' },
  { id: 22, type: 'PROPERTY', name: '纽约', property: { id: 22, name: '纽约', price: 250, rent: 25, color: 'bg-blue-500', ownerId: null, level: 0 } },
  { id: 23, type: 'PROPERTY', name: '洛杉矶', property: { id: 23, name: '洛杉矶', price: 250, rent: 25, color: 'bg-blue-500', ownerId: null, level: 0 } },
  { id: 24, type: 'FATE', name: '命运', icon: '📜' },
  { id: 25, type: 'PROPERTY', name: '芝加哥', property: { id: 25, name: '芝加哥', price: 280, rent: 28, color: 'bg-blue-500', ownerId: null, level: 0 } },
  { id: 26, type: 'PROPERTY', name: '休斯顿', property: { id: 26, name: '休斯顿', price: 280, rent: 28, color: 'bg-blue-500', ownerId: null, level: 0 } },
  { id: 27, type: 'TAX', name: '印花税', icon: '📜' },
];

export interface Spirit {
  type: '大财神' | '小财神' | '大福神' | '小福神' | '天使' | '土地公' | '穷神' | '衰神' | '恶魔' | '死神';
  daysLeft: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  money: number;
  deposit: number;
  points: number;
  position: number;
  direction: 1 | -1;
  cards: MonopolyCardName[];
  spirit: Spirit | null;
  isAI: boolean;
  status: 'normal' | 'jail' | 'hospital' | 'bankrupt' | 'sleep';
  statusDays: number;
  stockShares: Record<string, number>;
  frozenTurns: number;
  allyWith: string | null;
  allyDays: number;
  turtleMoves: number;
}

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: '玩家(你)', avatar: '👦', color: 'bg-blue-500', money: 2000, deposit: 0, points: 160, position: 0, direction: 1, cards: ['均富卡', '路障卡', '换屋卡', '购地卡', '怪兽卡', '陷害卡', '停留卡', '查税卡', '拍卖卡', '复仇卡'], spirit: null, isAI: false, status: 'normal', statusDays: 0, stockShares: {}, frozenTurns: 0, allyWith: null, allyDays: 0, turtleMoves: 0 },
  { id: 'p2', name: '孙小美', avatar: '👧', color: 'bg-pink-500', money: 2000, deposit: 0, points: 120, position: 0, direction: 1, cards: ['均贫卡', '转向卡', '拆除卡', '冬眠卡'], spirit: null, isAI: true, status: 'normal', statusDays: 0, stockShares: {}, frozenTurns: 0, allyWith: null, allyDays: 0, turtleMoves: 0 },
  { id: 'p3', name: '阿土伯', avatar: '👴', color: 'bg-yellow-600', money: 2000, deposit: 0, points: 120, position: 0, direction: 1, cards: ['改建卡', '涨价卡', '梦游卡'], spirit: null, isAI: true, status: 'normal', statusDays: 0, stockShares: {}, frozenTurns: 0, allyWith: null, allyDays: 0, turtleMoves: 0 },
  { id: 'p4', name: '钱夫人', avatar: '👩‍🦰', color: 'bg-purple-500', money: 2000, deposit: 0, points: 120, position: 0, direction: 1, cards: ['请神符', '送神符', '嫁祸卡', '抢夺卡'], spirit: null, isAI: true, status: 'normal', statusDays: 0, stockShares: {}, frozenTurns: 0, allyWith: null, allyDays: 0, turtleMoves: 0 },
];

export interface Stock {
  id: string;
  name: string;
  price: number;
  change: number;
}

export const INITIAL_STOCKS: Stock[] = [
  { id: 's1', name: '科技股', price: 100, change: 0 },
  { id: 's2', name: '金融股', price: 80, change: 0 },
  { id: 's3', name: '地产股', price: 120, change: 0 },
  { id: 's4', name: '能源股', price: 90, change: 0 },
];

export type ModalType = 'info' | 'buy' | 'upgrade' | 'bank' | 'magic' | 'card' | 'stock' | 'roadblock' | 'shop';

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  board: BoardCell[];
  logs: string[];
  diceResult: number | null;
  isAnimating: boolean;
  eventModal: { title: string; description: string; type: ModalType; propertyId?: number; callback?: () => void } | null;
  roadblocks: number[];
  day: number;
  stocks: Stock[];
  placingRoadblock: boolean;
  hasRolledThisTurn: boolean;
  activeCard: MonopolyCardName | null;
  shopInventory: MonopolyCardName[];
}

export interface MonopolyStore extends GameState {
  rollDice: () => void;
  buyProperty: (propertyId: number) => void;
  upgradeProperty: (propertyId: number) => void;
  closeModal: () => void;
  addLog: (log: string) => void;
  loadState: (state: GameState) => void;
  nextTurn: () => void;
  handleCellEvent: (playerId: string, cellId: number) => void;
  payRent: (fromPlayerId: string, toPlayerId: string, amount: number) => void;
  triggerAITurn: () => void;
  bankAction: (action: 'deposit' | 'withdraw', amount: number) => void;
  useCard: (cardName: MonopolyCardName) => void;
  placeRoadblock: (cellId: number) => void;
  openCardModal: () => void;
  openStockModal: () => void;
  buyStock: (stockId: string, shares: number) => void;
  sellStock: (stockId: string, shares: number) => void;
  updateStocks: () => void;
  useCardOnTarget: (cardName: MonopolyCardName, targetId: string) => void;
  useCardOnPlayer: (cardName: MonopolyCardName, targetPlayerId: string) => void;
  useCardOnStock: (cardName: MonopolyCardName, stockId: string) => void;
  buyCardFromShop: (cardName: MonopolyCardName) => void;
  getAlly: (playerId: string) => Player | undefined;
  canCollectRent: (fromId: string, toId: string) => boolean;
}

const INITIAL_STATE: GameState = {
  players: INITIAL_PLAYERS,
  currentPlayerIndex: 0,
  board: JSON.parse(JSON.stringify(BOARD_CELLS)),
  logs: ['游戏开始！'],
  diceResult: null,
  isAnimating: false,
  eventModal: null,
  roadblocks: [],
  day: 1,
  stocks: INITIAL_STOCKS.map(s => ({ ...s })),
  placingRoadblock: false,
  hasRolledThisTurn: false,
  activeCard: null,
  shopInventory: [],
};

function createShopInventory(size = 5): MonopolyCardName[] {
  const pool = [...MONOPOLY_CARD_DEFINITIONS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size).map((item) => item.name);
}

export const useMonopolyStore = create<MonopolyStore>((set, get) => ({
  ...INITIAL_STATE,

  loadState: (state) => set(state),

  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 100) })),

  closeModal: () => {
    const cb = get().eventModal?.callback;
    set({ eventModal: null, placingRoadblock: false, activeCard: null });
    if (cb) cb();
  },

  getAlly: (playerId) => {
    const state = get();
    const player = state.players.find(p => p.id === playerId);
    if (!player?.allyWith) return undefined;
    return state.players.find(p => p.id === player.allyWith);
  },

  canCollectRent: (fromId, toId) => {
    const state = get();
    const from = state.players.find(p => p.id === fromId);
    const to = state.players.find(p => p.id === toId);
    if (!from || !to) return true;
    if (from.allyWith === toId) return false;
    if (to.allyWith === fromId) return false;
    return true;
  },

  updateStocks: () => {
    set(state => ({
      stocks: state.stocks.map(s => {
        const changePct = (Math.random() - 0.5) * 0.3;
        const newPrice = Math.max(10, Math.floor(s.price * (1 + changePct)));
        return { ...s, price: newPrice, change: newPrice - s.price };
      })
    }));
  },

  buyStock: (stockId, shares) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const stock = state.stocks.find(s => s.id === stockId);
    if (!stock || shares <= 0) return;
    const totalCost = stock.price * shares;
    if (player.deposit < totalCost) {
      get().addLog(`${player.name} 银行存款不足，无法购买股票！`);
      soundEngine.playError();
      return;
    }
    set(s => {
      const p = [...s.players];
      p[s.currentPlayerIndex].deposit -= totalCost;
      p[s.currentPlayerIndex].stockShares[stockId] = (p[s.currentPlayerIndex].stockShares[stockId] || 0) + shares;
      return { players: p };
    });
    get().addLog(`${player.name} 以每股 $${stock.price} 购买了 ${stock.name} ×${shares} 股，花费 $${totalCost}。`);
    soundEngine.playCoin();
  },

  sellStock: (stockId, shares) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const stock = state.stocks.find(s => s.id === stockId);
    const owned = player.stockShares[stockId] || 0;
    if (!stock || shares <= 0 || owned < shares) return;
    const totalGain = stock.price * shares;
    set(s => {
      const p = [...s.players];
      p[s.currentPlayerIndex].deposit += totalGain;
      p[s.currentPlayerIndex].stockShares[stockId] = owned - shares;
      return { players: p };
    });
    get().addLog(`${player.name} 卖出了 ${stock.name} ×${shares} 股，获得 $${totalGain}。`);
    soundEngine.playCoin();
  },

  placeRoadblock: (cellId) => {
    const state = get();
    if (!state.placingRoadblock) return;
    set((s) => {
      const players = [...s.players];
      if (s.activeCard) {
        const idx = players[s.currentPlayerIndex].cards.indexOf(s.activeCard);
        if (idx !== -1) players[s.currentPlayerIndex].cards.splice(idx, 1);
      }
      return {
        players,
        roadblocks: [...s.roadblocks, cellId],
        placingRoadblock: false,
        eventModal: null,
        activeCard: null,
      };
    });
    get().addLog(`${state.players[state.currentPlayerIndex].name} 在 ${state.board[cellId].name} 放置了路障！`);
    soundEngine.playStep();
  },

  openCardModal: () => {
    set({ eventModal: { title: '我的卡片', description: '', type: 'card' }, activeCard: null });
  },

  openStockModal: () => {
    set({ eventModal: { title: '股市投资', description: '', type: 'stock' }, activeCard: null });
  },

  buyCardFromShop: (cardName) => {
    const definition = MONOPOLY_CARD_MAP[cardName];
    if (!definition) return;
    set((state) => {
      const players = [...state.players];
      const player = players[state.currentPlayerIndex];
      if (!state.shopInventory.includes(cardName)) {
        get().addLog(`${cardName} 当前不在本次商店货架中。`);
        soundEngine.playError();
        return state;
      }
      if (player.points < definition.price) {
        get().addLog(`${player.name} 点券不足，无法购买 ${cardName}。`);
        soundEngine.playError();
        return state;
      }
      player.points -= definition.price;
      player.cards.push(cardName);
      get().addLog(`${player.name} 在卡片商店购买了 ${cardName}，花费 ${definition.price} 点。`);
      soundEngine.playCoin();
      return { players, shopInventory: state.shopInventory.filter((item) => item !== cardName) };
    });
  },

  useCard: (cardName) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    if (!player.cards.includes(cardName)) return;

    const definition = MONOPOLY_CARD_MAP[cardName];
    if (!definition) return;

    const removeCard = (players: Player[], playerIndex: number, name: MonopolyCardName) => {
      const idx = players[playerIndex].cards.indexOf(name);
      if (idx !== -1) players[playerIndex].cards.splice(idx, 1);
    };

    if (definition.interaction === 'place_roadblock') {
      set({
        activeCard: cardName,
        placingRoadblock: true,
        eventModal: null,
      });
      return;
    }

    if (definition.interaction === 'select_player') {
      set({
        activeCard: cardName,
        eventModal: { title: cardName, description: '请选择一名目标角色。', type: 'card' },
      });
      return;
    }

    if (definition.interaction === 'select_property') {
      set({
        activeCard: cardName,
        eventModal: null,
      });
      return;
    }

    if (definition.interaction === 'select_stock') {
      set({
        activeCard: cardName,
        eventModal: { title: cardName, description: '请选择一支股票使用该卡。', type: 'stock' },
      });
      return;
    }

    if (definition.interaction === 'passive') {
      get().addLog(`${cardName} 为被动卡，持有时会在符合条件时自动触发。`);
      set({ eventModal: null, activeCard: null });
      return;
    }

    if (cardName === '均富卡') {
      set((s) => {
        const players = [...s.players];
        const totalMoney = players.reduce((sum, item) => sum + item.money, 0);
        const avg = Math.floor(totalMoney / players.length);
        players.forEach((item) => {
          item.money = avg;
        });
        removeCard(players, s.currentPlayerIndex, cardName);
        return { players, eventModal: null, activeCard: null };
      });
      get().addLog(`${player.name} 使用了均富卡，所有人的现金重新平均。`);
      soundEngine.playTada();
      return;
    }

    if (cardName === '冬眠卡') {
      set((s) => {
        const players = [...s.players];
        players.forEach((item, index) => {
          if (index !== s.currentPlayerIndex && item.status !== 'bankrupt') {
            item.frozenTurns = Math.max(item.frozenTurns, 5);
            item.status = 'sleep';
            item.statusDays = Math.max(item.statusDays, 5);
          }
        });
        removeCard(players, s.currentPlayerIndex, cardName);
        return { players, eventModal: null, activeCard: null };
      });
      get().addLog(`${player.name} 使用了冬眠卡，所有对手进入沉睡状态。`);
      soundEngine.playTada();
      return;
    }

    if (cardName === '乌龟卡') {
      set((s) => {
        const players = [...s.players];
        players[s.currentPlayerIndex].turtleMoves = 3;
        removeCard(players, s.currentPlayerIndex, cardName);
        return { players, eventModal: null, activeCard: null };
      });
      get().addLog(`${player.name} 使用了乌龟卡，接下来 3 次行动只走 1 步。`);
      soundEngine.playStep();
      return;
    }

    if (cardName === '请神符') {
      const goodSp: Spirit['type'][] = ['大财神', '小财神', '大福神', '小福神', '天使'];
      const sp = goodSp[Math.floor(Math.random() * goodSp.length)];
      set((s) => {
        const players = [...s.players];
        players[s.currentPlayerIndex].spirit = { type: sp, daysLeft: 7 };
        removeCard(players, s.currentPlayerIndex, cardName);
        return { players, eventModal: null, activeCard: null };
      });
      get().addLog(`${player.name} 使用请神符，请来了【${sp}】。`);
      soundEngine.playTada();
      return;
    }

    if (cardName === '送神符') {
      const badSp: Spirit['type'][] = ['穷神', '衰神', '恶魔', '死神'];
      set((s) => {
        const players = [...s.players];
        const spirit = players[s.currentPlayerIndex].spirit;
        if (spirit && badSp.includes(spirit.type)) {
          players[s.currentPlayerIndex].spirit = null;
          get().addLog(`${player.name} 使用送神符，送走了【${spirit.type}】。`);
        } else {
          get().addLog(`${player.name} 当前没有需要送走的坏神仙。`);
        }
        removeCard(players, s.currentPlayerIndex, cardName);
        return { players, eventModal: null, activeCard: null };
      });
      soundEngine.playStep();
      return;
    }
  },

  useCardOnPlayer: (cardName, targetPlayerId) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const target = state.players.find((item) => item.id === targetPlayerId);
    if (!target || target.id === player.id || !player.cards.includes(cardName)) return;

    const withDefenseHandled = (
      players: Player[],
      attackerIndex: number,
      targetIndex: number,
      action: () => void,
    ) => {
      const targetCards = players[targetIndex].cards;
      const immunityIndex = targetCards.indexOf('免罪卡');
      if (immunityIndex !== -1 && ['陷害卡', '梦游卡'].includes(cardName)) {
        targetCards.splice(immunityIndex, 1);
        get().addLog(`${target.name} 自动使用免罪卡，免除了 ${cardName} 的效果。`);
        return false;
      }
      const revengeIndex = targetCards.indexOf('复仇卡');
      if (revengeIndex !== -1 && ['陷害卡', '梦游卡'].includes(cardName)) {
        targetCards.splice(revengeIndex, 1);
        players[attackerIndex].status = cardName === '陷害卡' ? 'jail' : 'sleep';
        players[attackerIndex].statusDays = 3;
        get().addLog(`${target.name} 自动使用复仇卡，反弹了 ${cardName}。`);
        return false;
      }
      action();
      return true;
    };

    set((s) => {
      const players = [...s.players];
      const attackerIndex = s.currentPlayerIndex;
      const targetIndex = players.findIndex((item) => item.id === targetPlayerId);
      const removeIdx = players[attackerIndex].cards.indexOf(cardName);
      const takeCard = () => {
        if (removeIdx !== -1) players[attackerIndex].cards.splice(removeIdx, 1);
      };

      switch (cardName) {
        case '均贫卡': {
          const avg = Math.floor((players[attackerIndex].money + players[targetIndex].money) / 2);
          players[attackerIndex].money = avg;
          players[targetIndex].money = avg;
          get().addLog(`${player.name} 对 ${target.name} 使用了均贫卡。`);
          break;
        }
        case '同盟卡': {
          players[attackerIndex].allyWith = target.id;
          players[attackerIndex].allyDays = 7;
          players[targetIndex].allyWith = player.id;
          players[targetIndex].allyDays = 7;
          get().addLog(`${player.name} 与 ${target.name} 结成了 7 天同盟。`);
          break;
        }
        case '停留卡': {
          players[targetIndex].frozenTurns = Math.max(players[targetIndex].frozenTurns, 1);
          get().addLog(`${player.name} 使用停留卡，让 ${target.name} 停留 1 回合。`);
          break;
        }
        case '转向卡': {
          players[targetIndex].direction *= -1;
          get().addLog(`${player.name} 使用转向卡，${target.name} 的方向被反转。`);
          break;
        }
        case '查税卡': {
          const tax = Math.max(100, Math.floor(players[targetIndex].money * 0.12));
          players[targetIndex].money = Math.max(0, players[targetIndex].money - tax);
          players[attackerIndex].money += tax;
          get().addLog(`${player.name} 对 ${target.name} 征收了 $${tax} 税金。`);
          break;
        }
        case '抢夺卡': {
          const stolenCard = players[targetIndex].cards[0];
          if (stolenCard) {
            players[targetIndex].cards.splice(0, 1);
            players[attackerIndex].cards.push(stolenCard);
            get().addLog(`${player.name} 使用抢夺卡，从 ${target.name} 夺走了 ${stolenCard}。`);
          } else {
            get().addLog(`${target.name} 没有卡片可供抢夺。`);
            return s;
          }
          break;
        }
        case '陷害卡': {
          const applied = withDefenseHandled(players, attackerIndex, targetIndex, () => {
            players[targetIndex].status = Math.random() > 0.5 ? 'jail' : 'hospital';
            players[targetIndex].statusDays = 3;
            get().addLog(`${player.name} 使用陷害卡，${target.name} 被迫接受惩罚。`);
          });
          if (!applied) {
            takeCard();
            return { players, eventModal: null, activeCard: null };
          }
          break;
        }
        case '梦游卡': {
          const applied = withDefenseHandled(players, attackerIndex, targetIndex, () => {
            players[targetIndex].status = 'sleep';
            players[targetIndex].statusDays = 3;
            players[targetIndex].frozenTurns = Math.max(players[targetIndex].frozenTurns, 3);
            get().addLog(`${player.name} 使用梦游卡，${target.name} 进入梦游状态。`);
          });
          if (!applied) {
            takeCard();
            return { players, eventModal: null, activeCard: null };
          }
          break;
        }
        default:
          return s;
      }

      takeCard();
      soundEngine.playTada();
      return { players, eventModal: null, activeCard: null };
    });
  },

  useCardOnStock: (cardName, stockId) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const stock = state.stocks.find((item) => item.id === stockId);
    if (!stock || !player.cards.includes(cardName)) return;

    set((s) => {
      const stocks = [...s.stocks];
      const players = [...s.players];
      const stockIndex = stocks.findIndex((item) => item.id === stockId);
      if (stockIndex === -1) return s;

      if (cardName === '红卡') {
        if ((players[s.currentPlayerIndex].stockShares[stockId] || 0) <= 0) {
          get().addLog(`${player.name} 没有持有这支股票，无法使用红卡。`);
          return s;
        }
        const nextPrice = Math.floor(stocks[stockIndex].price * 1.35);
        stocks[stockIndex].change = nextPrice - stocks[stockIndex].price;
        stocks[stockIndex].price = nextPrice;
      }

      if (cardName === '黑卡') {
        const nextPrice = Math.max(10, Math.floor(stocks[stockIndex].price * 0.7));
        stocks[stockIndex].change = nextPrice - stocks[stockIndex].price;
        stocks[stockIndex].price = nextPrice;
      }

      const removeIdx = players[s.currentPlayerIndex].cards.indexOf(cardName);
      if (removeIdx !== -1) players[s.currentPlayerIndex].cards.splice(removeIdx, 1);
      get().addLog(`${player.name} 对 ${stocks[stockIndex].name} 使用了 ${cardName}。`);
      soundEngine.playTada();
      return { players, stocks, eventModal: null, activeCard: null };
    });
  },

  useCardOnTarget: (cardName, targetId) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    if (!player.cards.includes(cardName)) return;

    const laneFor = (cellId: number) => {
      if (cellId >= 1 && cellId <= 8) return 'top';
      if (cellId >= 9 && cellId <= 14) return 'right';
      if (cellId >= 15 && cellId <= 22) return 'bottom';
      return 'left';
    };

    set((s) => {
      const players = [...s.players];
      const board = [...s.board];
      const currentIndex = s.currentPlayerIndex;
      const targetCell = board.find((cell) => cell.id === Number(targetId));
      if (!targetCell?.property) return s;
      const removeIdx = players[currentIndex].cards.indexOf(cardName);
      const removeCard = () => {
        if (removeIdx !== -1) players[currentIndex].cards.splice(removeIdx, 1);
      };
      const myProperties = board.filter((cell) => cell.property?.ownerId === player.id);
      const lane = laneFor(targetCell.id);
      const laneProperties = board.filter(
        (cell) => cell.property && laneFor(cell.id) === lane,
      );

      switch (cardName) {
        case '换屋卡': {
          const myBest = [...myProperties].sort((a, b) => (b.property?.level ?? 0) - (a.property?.level ?? 0))[0];
          if (!myBest?.property) return s;
          const tempLevel = myBest.property.level;
          myBest.property.level = targetCell.property.level;
          targetCell.property.level = tempLevel;
          get().addLog(`${player.name} 使用换屋卡，将 ${targetCell.name} 的建筑换到了自己的地盘。`);
          break;
        }
        case '换地卡': {
          const myBest = myProperties[0];
          if (!myBest?.property) return s;
          const targetOwner = targetCell.property.ownerId;
          targetCell.property.ownerId = player.id;
          myBest.property.ownerId = targetOwner ?? null;
          get().addLog(`${player.name} 使用换地卡，与 ${targetCell.name} 完成了地权交换。`);
          break;
        }
        case '购地卡': {
          const ownerId = targetCell.property.ownerId;
          const ownerIndex = players.findIndex((item) => item.id === ownerId);
          const takeoverPrice = targetCell.property.price;
          if (players[currentIndex].money < takeoverPrice) {
            get().addLog(`${player.name} 现金不足，无法强购 ${targetCell.name}。`);
            return s;
          }
          players[currentIndex].money -= takeoverPrice;
          if (ownerIndex !== -1) players[ownerIndex].money += takeoverPrice;
          targetCell.property.ownerId = player.id;
          get().addLog(`${player.name} 使用购地卡，买下了 ${targetCell.name}。`);
          break;
        }
        case '拆除卡': {
          if (targetCell.property.level > 0) {
            targetCell.property.level -= 1;
            targetCell.property.rent = Math.max(10, Math.floor(targetCell.property.rent * 0.7));
            get().addLog(`${player.name} 使用拆除卡，拆掉了 ${targetCell.name} 一层建筑。`);
          } else if (s.roadblocks.includes(targetCell.id)) {
            return {
              players,
              board,
              roadblocks: s.roadblocks.filter((item) => item !== targetCell.id),
              eventModal: null,
              activeCard: null,
            };
          } else {
            return s;
          }
          break;
        }
        case '改建卡': {
          const currentType = targetCell.property.development ?? 'normal';
          const nextType =
            currentType === 'normal' ? 'chain' : currentType === 'chain' ? 'park' : 'normal';
          targetCell.property.development = nextType;
          if (nextType === 'chain') targetCell.property.rent = Math.floor(targetCell.property.rent * 1.25);
          if (nextType === 'park') targetCell.property.rent = Math.floor(targetCell.property.rent * 0.6);
          if (nextType === 'normal') targetCell.property.rent = Math.max(10, Math.floor(targetCell.property.price * 0.12));
          get().addLog(`${player.name} 使用改建卡，将 ${targetCell.name} 改建为 ${nextType === 'chain' ? '连锁店' : nextType === 'park' ? '公益公园' : '普通建筑'}。`);
          break;
        }
        case '怪兽卡': {
          targetCell.property.level = 0;
          targetCell.property.sealedDays = 0;
          targetCell.property.development = 'normal';
          get().addLog(`${player.name} 使用怪兽卡，彻底摧毁了 ${targetCell.name} 的建筑。`);
          break;
        }
        case '恶魔卡': {
          laneProperties.forEach((item) => {
            if (item.property && item.property.ownerId && item.property.ownerId !== player.id) {
              item.property.level = 0;
              item.property.sealedDays = 0;
              item.property.development = 'normal';
            }
          });
          get().addLog(`${player.name} 使用恶魔卡，清空了 ${lane} 路段的建筑。`);
          break;
        }
        case '天使卡': {
          laneProperties.forEach((item) => {
            if (item.property) {
              item.property.level = Math.min(3, item.property.level + 1);
              item.property.rent = Math.floor(item.property.rent * 1.2);
            }
          });
          get().addLog(`${player.name} 使用天使卡，提升了 ${lane} 路段的建筑等级。`);
          break;
        }
        case '查封卡': {
          laneProperties.forEach((item) => {
            if (item.property && item.property.ownerId && item.property.ownerId !== player.id) {
              item.property.sealedDays = 3;
            }
          });
          get().addLog(`${player.name} 使用查封卡，封锁了 ${lane} 路段。`);
          break;
        }
        case '涨价卡': {
          targetCell.property.price = Math.floor(targetCell.property.price * 1.4);
          targetCell.property.rent = Math.floor(targetCell.property.rent * 1.35);
          get().addLog(`${player.name} 使用涨价卡，抬高了 ${targetCell.name} 的价值。`);
          break;
        }
        case '拍卖卡': {
          const ownerId = targetCell.property.ownerId;
          const ownerIndex = players.findIndex((item) => item.id === ownerId);
          const auctionIncome = Math.floor(targetCell.property.price * (1 + targetCell.property.level * 0.3));
          players[currentIndex].money += auctionIncome;
          if (ownerIndex !== -1) players[ownerIndex].money = Math.max(0, players[ownerIndex].money - Math.floor(auctionIncome * 0.5));
          targetCell.property.ownerId = null;
          targetCell.property.level = 0;
          targetCell.property.development = 'normal';
          get().addLog(`${player.name} 使用拍卖卡拍卖了 ${targetCell.name}，获得 $${auctionIncome}。`);
          break;
        }
        default:
          return s;
      }

      removeCard();
      soundEngine.playTada();
      return { players, board, eventModal: null, activeCard: null };
    });
  },

  payRent: (fromId, toId, amount) => {
    const state = get();
    const from = state.players.find(p => p.id === fromId);
    const to = state.players.find(p => p.id === toId);
    if (!from) return;

    if (!get().canCollectRent(fromId, toId)) {
      get().addLog(`${from.name} 与 ${state.players.find(p => p.id === toId)?.name} 是同盟，不收租金！`);
      return;
    }

    const ownerProperty = state.board.find((cell) => cell.property?.ownerId === toId && cell.property?.sealedDays && cell.id === from.position);
    if (ownerProperty?.property?.sealedDays) {
      get().addLog(`${to?.name ?? '对手'} 的地产当前被查封，暂时无法收租。`);
      return;
    }

    const freeCardIndex = from.cards.indexOf('免费卡');
    if (freeCardIndex !== -1 && (amount >= 2000 || amount >= from.money)) {
      set((s) => {
        const players = [...s.players];
        const payerIdx = players.findIndex((p) => p.id === fromId);
        players[payerIdx].cards.splice(freeCardIndex, 1);
        return { players };
      });
      get().addLog(`${from.name} 自动使用免费卡，免除了本次 $${amount} 的费用。`);
      return;
    }

    if (from.cards.includes('嫁祸卡') && amount >= 800) {
      const substitute = state.players.find((p) => p.id !== fromId && p.id !== toId && p.status !== 'bankrupt');
      if (substitute) {
        set((s) => {
          const players = [...s.players];
          const payerIdx = players.findIndex((p) => p.id === substitute.id);
          const ownerIdx = players.findIndex((p) => p.id === toId);
          const cardIdx = players[s.currentPlayerIndex].cards.indexOf('嫁祸卡');
          if (cardIdx !== -1) players[s.currentPlayerIndex].cards.splice(cardIdx, 1);
          players[payerIdx].money = Math.max(0, players[payerIdx].money - amount);
          if (ownerIdx !== -1) players[ownerIdx].money += amount;
          return { players };
        });
        get().addLog(`${from.name} 自动使用嫁祸卡，让 ${substitute.name} 替自己支付了 $${amount}。`);
        return;
      }
    }

    set(state => {
      const players = [...state.players];
      const fromIdx = players.findIndex(p => p.id === fromId);
      const toIdx = players.findIndex(p => p.id === toId);
      if (fromIdx !== -1 && toIdx !== -1) {
        if (from.spirit?.type === '小财神') amount = Math.floor(amount / 2);
        else if (from.spirit?.type === '穷神') amount = amount * 2;
        else if (from.spirit?.type === '大财神') amount = 0;
        players[fromIdx].money -= amount;
        players[toIdx].money += amount;
      }
      return { players };
    });
    soundEngine.playCoin();
  },

  buyProperty: (propertyId) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const board = [...state.board];
    const cell = board.find(c => c.id === propertyId);
    if (!cell || !cell.property) return;
    let price = cell.property.price;
    if (player.spirit?.type === '小福神') price = Math.floor(price / 2);
    else if (player.spirit?.type === '大福神') price = 0;
    if (player.money >= price) {
      set(s => {
        const p = [...s.players];
        p[s.currentPlayerIndex].money -= price;
        cell.property!.ownerId = player.id;
        return { players: p, board, eventModal: null };
      });
      get().addLog(`${player.name} 花费 $${price} 购买了 ${cell.property.name}。`);
      soundEngine.playCoin();
      soundEngine.playTada();
    } else {
      get().addLog(`${player.name} 资金不足，无法购买！`);
      soundEngine.playError();
      set({ eventModal: null });
    }
    get().nextTurn();
  },

  upgradeProperty: (propertyId) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const board = [...state.board];
    const cell = board.find(c => c.id === propertyId);
    if (!cell || !cell.property) return;
    let upgradeCost = cell.property.price * 0.5;
    if (player.spirit?.type === '大福神' || player.spirit?.type === '天使') upgradeCost = 0;
    if (player.money >= upgradeCost && cell.property.level < 3) {
      set(s => {
        const p = [...s.players];
        p[s.currentPlayerIndex].money -= upgradeCost;
        cell.property!.level += 1;
        cell.property!.rent = Math.floor(cell.property!.rent * 1.5);
        return { players: p, board, eventModal: null };
      });
      get().addLog(`${player.name} 花费 $${upgradeCost} 升级了 ${cell.property.name}。`);
      soundEngine.playCoin();
      soundEngine.playTada();
    }
    get().nextTurn();
  },

  nextTurn: () => {
    setTimeout(() => {
      set(state => {
        let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
        let day = state.day;
        if (nextIdx === 0) {
          day += 1;
          get().updateStocks();
        }
        let attempts = 0;
        while (state.players[nextIdx].status === 'bankrupt' && attempts < 10) {
          nextIdx = (nextIdx + 1) % state.players.length;
          if (nextIdx === 0) day += 1;
          attempts++;
        }
        const players = [...state.players];
        const nextPlayer = players[nextIdx];

        if (nextPlayer.frozenTurns > 0) {
          nextPlayer.frozenTurns -= 1;
          if (nextPlayer.frozenTurns === 0 && nextPlayer.status === 'sleep') {
            nextPlayer.status = 'normal';
          }
          get().addLog(`${nextPlayer.name} 被冻结，跳过一回合。`);
        }

        if (nextPlayer.spirit) {
          nextPlayer.spirit.daysLeft -= 1;
          if (nextPlayer.spirit.daysLeft <= 0) {
            const spType = nextPlayer.spirit.type;
            if (spType === '小财神') nextPlayer.spirit = { type: '大财神', daysLeft: 7 };
            else if (spType === '小福神') nextPlayer.spirit = { type: '大福神', daysLeft: 7 };
            else nextPlayer.spirit = null;
          }
        }
        if (nextPlayer.allyDays > 0) {
          nextPlayer.allyDays -= 1;
          if (nextPlayer.allyDays === 0) {
            const allyId = nextPlayer.allyWith;
            nextPlayer.allyWith = null;
            if (allyId) {
              const allyIdx = players.findIndex(p => p.id === allyId);
              if (allyIdx !== -1) players[allyIdx].allyWith = null;
            }
            get().addLog(`${nextPlayer.name} 与盟友解除了同盟。`);
          }
        }

        state.board.forEach((cell) => {
          if (cell.property?.sealedDays && cell.property.sealedDays > 0) {
            cell.property.sealedDays -= 1;
          }
        });

        nextPlayer.points += 10;

        return { currentPlayerIndex: nextIdx, diceResult: null, day, players, hasRolledThisTurn: false };
      });

      const player = get().players[get().currentPlayerIndex];
      get().addLog(`=== 第 ${get().day} 天，轮到 ${player.name} ===`);

      if (player.status !== 'normal') {
        if (player.statusDays > 1) {
          set(s => {
            const p = [...s.players];
            p[s.currentPlayerIndex].statusDays -= 1;
            return { players: p };
          });
          get().addLog(`${player.name} 还在${player.status === 'jail' ? '坐牢' : player.status === 'sleep' ? '沉睡' : '住院'}中。`);
          get().nextTurn();
          return;
        } else {
          set(s => {
            const p = [...s.players];
            p[s.currentPlayerIndex].status = 'normal';
            p[s.currentPlayerIndex].statusDays = 0;
            return { players: p };
          });
          get().addLog(`${player.name} 恢复自由！`);
        }
      }

      if (player.isAI) {
        get().triggerAITurn();
      }
    }, 800);
  },

  triggerAITurn: () => {
    setTimeout(() => {
      const state = get();
      const player = state.players[state.currentPlayerIndex];
      if (player.cards.length > 0 && Math.random() > 0.5) {
        const cardToUse = player.cards[Math.floor(Math.random() * player.cards.length)];
        if (['均富卡', '天使卡', '同盟卡', '请神符'].includes(cardToUse)) {
          get().useCard(cardToUse);
          setTimeout(() => get().rollDice(), 1000);
          return;
        }
      }
      get().rollDice();
    }, 1500);
  },

  bankAction: (action, amount) => {
    const callback = get().eventModal?.callback;
    let didChange = false;
    set(state => {
      const players = [...state.players];
      const player = players[state.currentPlayerIndex];
      if (action === 'deposit' && player.money >= amount) {
        player.money -= amount;
        player.deposit += amount;
        didChange = true;
        get().addLog(`${player.name} 存入了 $${amount}。`);
        soundEngine.playCoin();
      } else if (action === 'withdraw' && player.deposit >= amount) {
        player.deposit -= amount;
        player.money += amount;
        didChange = true;
        get().addLog(`${player.name} 取出了 $${amount}。`);
        soundEngine.playCoin();
      } else {
        get().addLog(`${player.name} 银行操作失败，金额超出可用范围。`);
        soundEngine.playError();
      }
      return { players, eventModal: didChange ? null : state.eventModal };
    });
    if (didChange && callback) {
      callback();
    }
  },

  handleCellEvent: (playerId, cellId) => {
    const state = get();
    const player = state.players.find(p => p.id === playerId);
    const cell = state.board[cellId];
    if (!player || !cell) return;
    const isCurrentPlayer = state.players[state.currentPlayerIndex].id === playerId;
    const shouldOpenPlayerModal = isCurrentPlayer && !player.isAI;

    setTimeout(() => {
      if (cell.type === 'PROPERTY' && cell.property) {
        if (cell.property.ownerId === null) {
          if (player.spirit?.type === '土地公') {
            get().addLog(`${player.name} 被土地公附身，强占了 ${cell.name}！`);
            set(s => {
              const p = [...s.players];
              cell.property!.ownerId = player.id;
              return { players: p };
            });
            if (isCurrentPlayer) get().nextTurn();
          } else if (player.isAI) {
            if (player.money >= cell.property.price * 1.5) {
              get().buyProperty(cell.id);
            } else {
              get().addLog(`${player.name} 放弃购买 ${cell.name}。`);
              get().nextTurn();
            }
          } else if (shouldOpenPlayerModal) {
            set({
              eventModal: {
                title: `到达 ${cell.name}`,
                description: `售价 $${cell.property.price}，租金 $${cell.property.rent}。是否购买？`,
                type: 'buy',
                propertyId: cell.id,
                callback: () => get().nextTurn()
              }
            });
          }
        } else if (cell.property.ownerId === player.id) {
          if (cell.property.level < 3) {
            const upgradeCost = Math.floor(cell.property.price * 0.5);
            if (player.isAI) {
              if (player.money >= upgradeCost * 2) get().upgradeProperty(cell.id);
              else get().nextTurn();
            } else if (shouldOpenPlayerModal) {
              set({
                eventModal: {
                  title: `自己的 ${cell.name}`,
                  description: `升级费用 $${upgradeCost}，升级后租金 $${Math.floor(cell.property.rent * 1.5)}。是否升级？`,
                  type: 'upgrade',
                  propertyId: cell.id,
                  callback: () => get().nextTurn()
                }
              });
            }
          } else {
            get().addLog(`${player.name} 回到了满级的 ${cell.name}。`);
            if (isCurrentPlayer) get().nextTurn();
          }
        } else {
          if (player.spirit?.type === '土地公') {
            get().addLog(`${player.name} 被土地公附身，强占了 ${cell.name}！`);
            set(s => {
              const p = [...s.players];
              cell.property!.ownerId = player.id;
              return { players: p };
            });
          } else if (player.spirit?.type === '天使') {
            get().addLog(`${player.name} 被天使附身，免租并为对手加盖了一层！`);
            if (cell.property.level < 3) {
              cell.property.level += 1;
              cell.property.rent = Math.floor(cell.property.rent * 1.5);
            }
          } else if (player.spirit?.type === '恶魔') {
            get().addLog(`${player.name} 被恶魔附身，免租并拆除了对手一层！`);
            if (cell.property.level > 0) {
              cell.property.level -= 1;
              cell.property.rent = Math.floor(cell.property.rent / 1.5);
            }
          } else {
            const owner = state.players.find(p => p.id === cell.property!.ownerId);
            if (owner) {
              get().addLog(`${player.name} 踩到了 ${owner.name} 的 ${cell.name}，支付租金 $${cell.property.rent}！`);
              get().payRent(player.id, owner.id, cell.property.rent);
            }
          }
          if (isCurrentPlayer) get().nextTurn();
        }
      } else if (cell.type === 'TAX') {
        const tax = 150;
        set(s => {
          const p = [...s.players];
          const idx = p.findIndex(pl => pl.id === player.id);
          p[idx].money -= tax;
          return { players: p };
        });
        get().addLog(`${player.name} 缴纳了税款 $${tax}。`);
        soundEngine.playError();
        if (shouldOpenPlayerModal) {
          set({ eventModal: { title: cell.name, description: `被征收了 $${tax} 税款。`, type: 'info', callback: () => get().nextTurn() } });
        } else {
          get().nextTurn();
        }
      } else if (cell.type === 'CHANCE' || cell.type === 'FATE') {
        const events = [
          { text: '捡到钱包，获得 $200！', change: 200, sfx: 'coin' },
          { text: '乱扔垃圾，罚款 $50！', change: -50, sfx: 'error' },
          { text: '银行结息，获得 $300！', change: 300, sfx: 'coin' },
          { text: '被狗咬了，支付医药费 $100！', change: -100, sfx: 'error' },
        ];
        const ev = events[Math.floor(Math.random() * events.length)];
        set(s => {
          const p = [...s.players];
          const idx = p.findIndex(pl => pl.id === player.id);
          p[idx].money += ev.change;
          return { players: p };
        });
        get().addLog(`${player.name} ${cell.name}: ${ev.text}`);
        ev.sfx === 'coin' ? soundEngine.playCoin() : soundEngine.playError();
        if (shouldOpenPlayerModal) {
          set({ eventModal: { title: cell.name, description: ev.text, type: 'info', callback: () => get().nextTurn() } });
        } else {
          get().nextTurn();
        }
      } else if (cell.type === 'JAIL' || cell.type === 'HOSPITAL') {
        const immunityIndex = player.cards.indexOf('免罪卡');
        if (immunityIndex !== -1) {
          set((s) => {
            const players = [...s.players];
            const idx = players.findIndex((item) => item.id === player.id);
            players[idx].cards.splice(immunityIndex, 1);
            return { players };
          });
          get().addLog(`${player.name} 自动使用免罪卡，免除了 ${cell.name} 惩罚。`);
          if (isCurrentPlayer) get().nextTurn();
          return;
        }
        if (player.spirit?.type === '天使') {
          get().addLog(`${player.name} 有天使保佑，免除了牢狱/医院之灾！`);
          if (isCurrentPlayer) get().nextTurn();
          return;
        }
        let jailDays = 2;
        if (player.spirit?.type === '恶魔' || player.spirit?.type === '衰神') {
          get().addLog(`${player.name} 被恶魔/衰神附体，刑期加倍！`);
          jailDays = 4;
        }
        set(s => {
          const p = [...s.players];
          const idx = p.findIndex(pl => pl.id === player.id);
          p[idx].status = cell.type === 'JAIL' ? 'jail' : 'hospital';
          p[idx].statusDays = jailDays;
          return { players: p };
        });
        get().addLog(`${player.name} 被送入${cell.name}，休息 ${jailDays} 回合！`);
        soundEngine.playError();
        if (shouldOpenPlayerModal) {
          set({ eventModal: { title: `进入${cell.name}`, description: `休息 ${jailDays} 回合。`, type: 'info', callback: () => get().nextTurn() } });
        } else {
          get().nextTurn();
        }
      } else if (cell.type === 'MAGIC') {
        const spirits: Spirit['type'][] = ['大财神', '小财神', '大福神', '小福神', '天使', '土地公', '穷神', '衰神', '恶魔'];
        const sp = spirits[Math.floor(Math.random() * spirits.length)];
        set(s => {
          const p = [...s.players];
          const idx = p.findIndex(pl => pl.id === player.id);
          p[idx].spirit = { type: sp, daysLeft: 7 };
          return { players: p };
        });
        get().addLog(`${player.name} 遇到了魔法屋！被【${sp}】附身 7 天！`);
        soundEngine.playTada();
        if (shouldOpenPlayerModal) {
          set({ eventModal: { title: cell.name, description: `被【${sp}】附身 7 天！`, type: 'info', callback: () => get().nextTurn() } });
        } else {
          get().nextTurn();
        }
      } else if (cell.type === 'BANK') {
        if (shouldOpenPlayerModal) {
          set({ eventModal: { title: cell.name, description: `存款: $${player.deposit}，现金: $${player.money}`, type: 'bank', callback: () => get().nextTurn() } });
        } else {
          if (player.money > 2000) get().bankAction('deposit', 1000);
          else if (player.money < 500 && player.deposit >= 500) get().bankAction('withdraw', 500);
          get().nextTurn();
        }
      } else if (cell.type === 'SHOP') {
        const inventory = createShopInventory();
        if (shouldOpenPlayerModal) {
          set({
            shopInventory: inventory,
            eventModal: {
              title: cell.name,
              description: '你刚好停在卡片店，可以购买本次随机刷新的卡片。',
              type: 'shop',
              callback: () => get().nextTurn(),
            },
          });
        } else {
          set({ shopInventory: inventory });
          const affordable = inventory
            .map((name) => MONOPOLY_CARD_MAP[name])
            .filter((item) => item.price <= player.points);
          if (affordable.length > 0) {
            const chosen = affordable[Math.floor(Math.random() * affordable.length)];
            get().buyCardFromShop(chosen.name);
          } else {
            get().addLog(`${player.name} 来到卡片店，但没有足够点券购买卡片。`);
          }
          get().nextTurn();
        }
      } else {
        if (cell.type === 'FREE_PARKING') get().addLog(`${player.name} 在${cell.name}休息，什么也没发生。`);
        if (isCurrentPlayer) get().nextTurn();
      }
    }, 300);
  },

  rollDice: () => {
    if (get().isAnimating) return;
    const player = get().players[get().currentPlayerIndex];
    if (player.status !== 'normal' || player.frozenTurns > 0) {
      get().nextTurn();
      return;
    }
    set({ isAnimating: true, diceResult: null, hasRolledThisTurn: true });
    get().addLog(`${player.name} 正在掷骰子...`);
    soundEngine.playDice();

    setTimeout(() => {
      const dice = player.turtleMoves > 0 ? 1 : Math.floor(Math.random() * 6) + 1;
      set({ diceResult: dice });
      get().addLog(`${player.name} 掷出了 ${dice} 点！`);

      if (player.turtleMoves > 0) {
        set((s) => {
          const players = [...s.players];
          players[s.currentPlayerIndex].turtleMoves -= 1;
          return { players };
        });
      }

      let stepsTaken = 0;
      const moveInterval = setInterval(() => {
        stepsTaken++;
        set(state => {
          const players = [...state.players];
          const pIdx = state.currentPlayerIndex;
          let newPos = players[pIdx].position + players[pIdx].direction;
          if (newPos >= 28) { newPos = 0; players[pIdx].money += 500; players[pIdx].points += 20; get().addLog(`${player.name} 经过起点，获得 $500 和 20 点券奖励！`); soundEngine.playCoin(); }
          else if (newPos < 0) { newPos = 27; }
          players[pIdx].position = newPos;
          return { players };
        });
        soundEngine.playStep();

        const currentPos = get().players[get().currentPlayerIndex].position;
        if (get().roadblocks.includes(currentPos)) {
          clearInterval(moveInterval);
          get().addLog(`${player.name} 遇到了路障，被迫停下！`);
          set(s => ({ roadblocks: s.roadblocks.filter(r => r !== currentPos), isAnimating: false }));
          soundEngine.playError();
          get().handleCellEvent(player.id, currentPos);
          return;
        }

        if (stepsTaken >= dice) {
          clearInterval(moveInterval);
          set({ isAnimating: false });
          get().handleCellEvent(player.id, get().players[get().currentPlayerIndex].position);
        }
      }, 300);
    }, 800);
  },
}));
