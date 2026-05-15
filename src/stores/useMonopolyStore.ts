import { create } from 'zustand';
import { soundEngine } from '@/lib/sound';

export type CellType = 'START' | 'PROPERTY' | 'CHANCE' | 'FATE' | 'TAX' | 'JAIL' | 'FREE_PARKING' | 'HOSPITAL' | 'BANK' | 'MAGIC';

export interface PropertyCell {
  id: number;
  name: string;
  price: number;
  rent: number;
  color: string;
  ownerId: string | null;
  level: number; // 0: Land, 1: House, 2: Building, 3: Hotel
}

export interface BoardCell {
  id: number;
  type: CellType;
  name: string;
  property?: PropertyCell;
  icon?: string;
}

// 28 cells board
export const BOARD_CELLS: BoardCell[] = [
  { id: 0, type: 'START', name: '起点', icon: '🏁' },
  { id: 1, type: 'PROPERTY', name: '台北', property: { id: 1, name: '台北', price: 100, rent: 10, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 2, type: 'PROPERTY', name: '台中', property: { id: 2, name: '台中', price: 100, rent: 10, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 3, type: 'CHANCE', name: '机会', icon: '❓' },
  { id: 4, type: 'PROPERTY', name: '高雄', property: { id: 4, name: '高雄', price: 120, rent: 12, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 5, type: 'PROPERTY', name: '花莲', property: { id: 5, name: '花莲', price: 120, rent: 12, color: 'bg-red-500', ownerId: null, level: 0 } },
  { id: 6, type: 'TAX', name: '所得税', icon: '💰' },
  { id: 7, type: 'JAIL', name: '监狱', icon: '🚓' }, // Corner 1
  { id: 8, type: 'PROPERTY', name: '东京', property: { id: 8, name: '东京', price: 150, rent: 15, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 9, type: 'PROPERTY', name: '大阪', property: { id: 9, name: '大阪', price: 150, rent: 15, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 10, type: 'FATE', name: '命运', icon: '📜' },
  { id: 11, type: 'PROPERTY', name: '首尔', property: { id: 11, name: '首尔', price: 180, rent: 18, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 12, type: 'PROPERTY', name: '北海道', property: { id: 12, name: '北海道', price: 180, rent: 18, color: 'bg-yellow-500', ownerId: null, level: 0 } },
  { id: 13, type: 'FREE_PARKING', name: '公园', icon: '⛲' },
  { id: 14, type: 'BANK', name: '银行', icon: '🏦' }, // Corner 2
  { id: 15, type: 'PROPERTY', name: '北京', property: { id: 15, name: '北京', price: 200, rent: 20, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 16, type: 'PROPERTY', name: '上海', property: { id: 16, name: '上海', price: 200, rent: 20, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 17, type: 'MAGIC', name: '魔法屋', icon: '🔮' },
  { id: 18, type: 'PROPERTY', name: '广州', property: { id: 18, name: '广州', price: 220, rent: 22, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 19, type: 'PROPERTY', name: '深圳', property: { id: 19, name: '深圳', price: 220, rent: 22, color: 'bg-green-500', ownerId: null, level: 0 } },
  { id: 20, type: 'TAX', name: '奢侈税', icon: '💎' },
  { id: 21, type: 'HOSPITAL', name: '医院', icon: '🏥' }, // Corner 3
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
  position: number;
  direction: 1 | -1;
  cards: string[];
  spirit: Spirit | null;
  isAI: boolean;
  status: 'normal' | 'jail' | 'hospital' | 'bankrupt';
  statusDays: number;
}

export const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: '玩家(你)', avatar: '👦', color: 'bg-blue-500', money: 2000, deposit: 0, position: 0, direction: 1, cards: ['均富卡', '路障卡'], spirit: null, isAI: false, status: 'normal', statusDays: 0 },
  { id: 'p2', name: '孙小美', avatar: '👧', color: 'bg-pink-500', money: 2000, deposit: 0, position: 0, direction: 1, cards: [], spirit: null, isAI: true, status: 'normal', statusDays: 0 },
  { id: 'p3', name: '阿土伯', avatar: '👴', color: 'bg-yellow-600', money: 2000, deposit: 0, position: 0, direction: 1, cards: [], spirit: null, isAI: true, status: 'normal', statusDays: 0 },
  { id: 'p4', name: '钱夫人', avatar: '👩‍🦰', color: 'bg-purple-500', money: 2000, deposit: 0, position: 0, direction: 1, cards: [], spirit: null, isAI: true, status: 'normal', statusDays: 0 },
];

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  board: BoardCell[];
  logs: string[];
  diceResult: number | null;
  isAnimating: boolean;
  eventModal: { title: string; description: string; type: 'info' | 'buy' | 'upgrade' | 'bank' | 'magic'; propertyId?: number; callback?: () => void } | null;
  roadblocks: number[]; // Cell IDs with roadblocks
  day: number;
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
  useCard: (cardName: string) => void;
}

const INITIAL_STATE: GameState = {
  players: INITIAL_PLAYERS,
  currentPlayerIndex: 0,
  board: JSON.parse(JSON.stringify(BOARD_CELLS)), // deep copy to avoid reference issues
  logs: ['游戏开始！'],
  diceResult: null,
  isAnimating: false,
  eventModal: null,
  roadblocks: [],
  day: 1,
};

export const useMonopolyStore = create<MonopolyStore>((set, get) => ({
  ...INITIAL_STATE,

  loadState: (state) => set(state),

  addLog: (log) => set((state) => ({ logs: [log, ...state.logs].slice(0, 100) })),

  closeModal: () => {
    const cb = get().eventModal?.callback;
    set({ eventModal: null });
    if (cb) cb();
  },

  payRent: (fromId, toId, amount) => {
    set((state) => {
      const players = [...state.players];
      const fromIdx = players.findIndex(p => p.id === fromId);
      const toIdx = players.findIndex(p => p.id === toId);
      if (fromIdx !== -1 && toIdx !== -1) {
        // Spirit effect: 小财神
        const fromPlayer = players[fromIdx];
        if (fromPlayer.spirit?.type === '小财神') {
          amount = Math.floor(amount / 2);
          get().addLog(`${fromPlayer.name} 有小财神附体，租金减半！只需支付 $${amount}`);
        } else if (fromPlayer.spirit?.type === '穷神') {
          amount = amount * 2;
          get().addLog(`${fromPlayer.name} 有穷神附体，租金加倍！需支付 $${amount}`);
        } else if (fromPlayer.spirit?.type === '大财神') {
          amount = 0;
          get().addLog(`${fromPlayer.name} 有大财神附体，免交租金！`);
        }
        
        // 天使/恶魔 - wait, those affect buildings.
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
    
    if (player.money >= cell.property.price) {
      if (player.spirit?.type === '小福神') {
        get().addLog(`${player.name} 有小福神附体，买地半价！`);
        cell.property.price = Math.floor(cell.property.price / 2);
      } else if (player.spirit?.type === '大福神') {
        get().addLog(`${player.name} 有大福神附体，买地免费！`);
        cell.property.price = 0;
      }
      set((s) => {
        const p = [...s.players];
        p[s.currentPlayerIndex].money -= cell.property!.price;
        cell.property!.ownerId = player.id;
        return { players: p, board, eventModal: null };
      });
      get().addLog(`${player.name} 花费 $${cell.property.price} 购买了 ${cell.property.name}。`);
      soundEngine.playCoin();
      soundEngine.playTada();
    } else {
      get().addLog(`${player.name} 资金不足，无法购买！`);
      set({ eventModal: null });
      soundEngine.playError();
    }
    
    // If AI, next turn immediately
    if (player.isAI) {
      get().nextTurn();
    } else {
      // User turn ends after buying
      get().nextTurn();
    }
  },

  upgradeProperty: (propertyId) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    const board = [...state.board];
    const cell = board.find(c => c.id === propertyId);
    
    if (!cell || !cell.property) return;
    
    let upgradeCost = cell.property.price * 0.5; // 升级花费一半的基础价格
    if (player.spirit?.type === '大福神' || player.spirit?.type === '天使') {
      get().addLog(`${player.name} 有神明保佑，免费升级！`);
      upgradeCost = 0;
    }
    
    if (player.money >= upgradeCost && cell.property.level < 3) {
      set((s) => {
        const p = [...s.players];
        p[s.currentPlayerIndex].money -= upgradeCost;
        cell.property!.level += 1;
        cell.property!.rent = Math.floor(cell.property!.rent * 1.5); // 租金增加 50%
        return { players: p, board, eventModal: null };
      });
      get().addLog(`${player.name} 花费 $${upgradeCost} 升级了 ${cell.property.name}。`);
      soundEngine.playCoin();
      soundEngine.playTada();
    }
    
    if (player.isAI) {
      get().nextTurn();
    } else {
      get().nextTurn();
    }
  },

  nextTurn: () => {
    setTimeout(() => {
      set((state) => {
        let nextIdx = (state.currentPlayerIndex + 1) % state.players.length;
        let day = state.day;
        if (nextIdx === 0) day += 1; // New round

        // Skip bankrupt players
        while (state.players[nextIdx].status === 'bankrupt') {
          nextIdx = (nextIdx + 1) % state.players.length;
          if (nextIdx === 0) day += 1;
        }

        // Handle spirit duration
        const players = [...state.players];
        const nextPlayer = players[nextIdx];
        if (nextPlayer.spirit) {
          nextPlayer.spirit.daysLeft -= 1;
          if (nextPlayer.spirit.daysLeft <= 0) {
            // Expire logic
            const spType = nextPlayer.spirit.type;
            if (spType === '小财神') nextPlayer.spirit = { type: '大财神', daysLeft: 7 };
            else if (spType === '小福神') nextPlayer.spirit = { type: '大福神', daysLeft: 7 };
            else nextPlayer.spirit = null;
          }
        }

        return { currentPlayerIndex: nextIdx, diceResult: null, day, players };
      });
      
      const player = get().players[get().currentPlayerIndex];
      get().addLog(`=== 第 ${get().day} 天，轮到 ${player.name} ===`);

      
      // Handle status days (Jail/Hospital)
      if (player.status !== 'normal') {
        if (player.statusDays > 1) {
          set(s => {
            const p = [...s.players];
            p[s.currentPlayerIndex].statusDays -= 1;
            return { players: p };
          });
          get().addLog(`${player.name} 还在${player.status === 'jail' ? '坐牢' : '住院'}中，休息一回合。`);
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
    }, 1000);
  },

  triggerAITurn: () => {
    setTimeout(() => {
      get().rollDice();
    }, 1500);
  },

  bankAction: (action, amount) => {
    set((state) => {
      const players = [...state.players];
      const player = players[state.currentPlayerIndex];
      if (action === 'deposit' && player.money >= amount) {
        player.money -= amount;
        player.deposit += amount;
        get().addLog(`${player.name} 存入了 $${amount}。`);
        soundEngine.playCoin();
      } else if (action === 'withdraw' && player.deposit >= amount) {
        player.deposit -= amount;
        player.money += amount;
        get().addLog(`${player.name} 取出了 $${amount}。`);
        soundEngine.playCoin();
      }
      return { players, eventModal: null };
    });
  },

  useCard: (cardName) => {
    const state = get();
    const player = state.players[state.currentPlayerIndex];
    if (!player.cards.includes(cardName)) return;

    set((s) => {
      const p = [...s.players];
      const cardIdx = p[s.currentPlayerIndex].cards.indexOf(cardName);
      if (cardIdx !== -1) p[s.currentPlayerIndex].cards.splice(cardIdx, 1);
      return { players: p };
    });

    if (cardName === '均富卡') {
      get().addLog(`${player.name} 使用了均富卡！所有人的现金将平分。`);
      set((s) => {
        const p = [...s.players];
        const totalMoney = p.reduce((sum, pl) => sum + pl.money, 0);
        const avg = Math.floor(totalMoney / p.length);
        p.forEach(pl => pl.money = avg);
        return { players: p };
      });
      soundEngine.playTada();
    } else if (cardName === '转向卡') {
      get().addLog(`${player.name} 使用了转向卡！移动方向翻转。`);
      set((s) => {
        const p = [...s.players];
        p[s.currentPlayerIndex].direction *= -1;
        return { players: p };
      });
      soundEngine.playStep();
    } else if (cardName === '路障卡') {
      // Prompt for distance? For simplicity, put it 3 steps ahead.
      const pos = (player.position + 3 * player.direction + 28) % 28;
      get().addLog(`${player.name} 使用了路障卡！放置在前面 3 格。`);
      set((s) => ({ roadblocks: [...s.roadblocks, pos] }));
      soundEngine.playStep();
    }
  },

  handleCellEvent: (playerId, cellId) => {
    const state = get();
    const player = state.players.find(p => p.id === playerId);
    const cell = state.board[cellId];
    if (!player || !cell) return;

    const isCurrentPlayer = state.players[state.currentPlayerIndex].id === playerId;

    setTimeout(() => {
      if (cell.type === 'PROPERTY' && cell.property) {
        if (cell.property.ownerId === null) {
          // Empty property
          if (player.spirit?.type === '土地公') {
            get().addLog(`${player.name} 被土地公附身，强占了 ${cell.name}！`);
            set(s => {
              const p = [...s.players];
              cell.property!.ownerId = player.id;
              return { players: p };
            });
            if (isCurrentPlayer) get().nextTurn();
          } else if (player.isAI) {
            // AI logic: buy if money > price * 1.5
            if (player.money >= cell.property.price * 1.5) {
              get().buyProperty(cell.id);
            } else {
              get().addLog(`${player.name} 放弃购买 ${cell.name}。`);
              get().nextTurn();
            }
          } else if (isCurrentPlayer) {
            set({
              eventModal: {
                title: `到达 ${cell.name}`,
                description: `售价 $${cell.property.price}，初始租金 $${cell.property.rent}。是否购买？`,
                type: 'buy',
                propertyId: cell.id,
                callback: () => get().nextTurn() // If modal closed without buying
              }
            });
          }
        } else if (cell.property.ownerId === player.id) {
          // Own property
          if (cell.property.level < 3) {
            const upgradeCost = cell.property.price * 0.5;
            if (player.isAI) {
              if (player.money >= upgradeCost * 2) {
                get().upgradeProperty(cell.id);
              } else {
                get().nextTurn();
              }
            } else if (isCurrentPlayer) {
              set({
                eventModal: {
                  title: `回到 ${cell.name}`,
                  description: `花费 $${upgradeCost} 升级建筑？租金将提升至 $${Math.floor(cell.property.rent * 1.5)}。`,
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
          // Others property -> pay rent
          if (player.spirit?.type === '土地公') {
            get().addLog(`${player.name} 被土地公附身，强占了 ${cell.name}！不用交租金。`);
            set(s => {
              const p = [...s.players];
              cell.property!.ownerId = player.id;
              return { players: p };
            });
            if (isCurrentPlayer) get().nextTurn();
          } else if (player.spirit?.type === '天使') {
            get().addLog(`${player.name} 被天使附身，免除租金，并且帮对手免费盖了一层楼！`);
            if (cell.property.level < 3) {
              cell.property.level += 1;
              cell.property.rent = Math.floor(cell.property.rent * 1.5);
            }
            if (isCurrentPlayer) get().nextTurn();
          } else if (player.spirit?.type === '恶魔') {
            get().addLog(`${player.name} 被恶魔附身，免除租金，并拆除了对手一层楼！`);
            if (cell.property.level > 0) {
              cell.property.level -= 1;
              cell.property.rent = Math.floor(cell.property.rent / 1.5);
            }
            if (isCurrentPlayer) get().nextTurn();
          } else {
            const owner = state.players.find(p => p.id === cell.property!.ownerId);
            if (owner) {
              get().addLog(`${player.name} 踩到了 ${owner.name} 的 ${cell.name}，支付租金 $${cell.property.rent}！`);
              get().payRent(player.id, owner.id, cell.property.rent);
              if (player.money - cell.property.rent < 0) {
                 // Bankruptcy logic could be added here
                 get().addLog(`${player.name} 破产警告！`);
              }
            }
            if (isCurrentPlayer) get().nextTurn();
          }
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
        if (isCurrentPlayer && !player.isAI) {
          set({ eventModal: { title: cell.name, description: `被征收了 $${tax} 税款。`, type: 'info', callback: () => get().nextTurn() } });
        } else {
          if (isCurrentPlayer) get().nextTurn();
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
        if (ev.sfx === 'coin') soundEngine.playCoin(); else soundEngine.playError();
        
        if (isCurrentPlayer && !player.isAI) {
          set({ eventModal: { title: cell.name, description: ev.text, type: 'info', callback: () => get().nextTurn() } });
        } else {
          if (isCurrentPlayer) get().nextTurn();
        }
      } else if (cell.type === 'JAIL' || cell.type === 'HOSPITAL') {
        let jailDays = 2;
        if (player.spirit?.type === '天使') {
          get().addLog(`${player.name} 有天使保佑，免除了牢狱/医院之灾！`);
          if (isCurrentPlayer) get().nextTurn();
          return;
        } else if (player.spirit?.type === '恶魔' || player.spirit?.type === '衰神') {
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
        if (isCurrentPlayer && !player.isAI) {
          set({ eventModal: { title: `进入${cell.name}`, description: `你需要休息 ${jailDays} 回合。`, type: 'info', callback: () => get().nextTurn() } });
        } else {
          if (isCurrentPlayer) get().nextTurn();
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
        if (isCurrentPlayer && !player.isAI) {
          set({ eventModal: { title: cell.name, description: `被【${sp}】附身 7 天！`, type: 'info', callback: () => get().nextTurn() } });
        } else {
          if (isCurrentPlayer) get().nextTurn();
        }
      } else if (cell.type === 'BANK') {
        if (isCurrentPlayer && !player.isAI) {
          set({ eventModal: { title: cell.name, description: `欢迎来到银行！`, type: 'bank', callback: () => get().nextTurn() } });
        } else {
          // AI randomly deposit or withdraw if needed
          if (player.money > 2000) {
            get().bankAction('deposit', 1000);
          } else if (player.money < 500 && player.deposit >= 500) {
            get().bankAction('withdraw', 500);
          }
          if (isCurrentPlayer) get().nextTurn();
        }
      } else {
        // Start, Free parking
        if (cell.type === 'FREE_PARKING') get().addLog(`${player.name} 在${cell.name}休息，什么也没发生。`);
        if (isCurrentPlayer) get().nextTurn();
      }
    }, 300);
  },

  rollDice: () => {
    if (get().isAnimating) return;
    
    set({ isAnimating: true, diceResult: null });
    const player = get().players[get().currentPlayerIndex];
    get().addLog(`${player.name} 正在掷骰子...`);
    soundEngine.playDice();

    setTimeout(() => {
      const dice = Math.floor(Math.random() * 6) + 1;
      set({ diceResult: dice });
      get().addLog(`${player.name} 掷出了 ${dice} 点！`);

      let stepsTaken = 0;
      const moveInterval = setInterval(() => {
        stepsTaken++;
        set(state => {
          const players = [...state.players];
          const pIdx = state.currentPlayerIndex;
          let newPos = players[pIdx].position + players[pIdx].direction;
          
          if (newPos >= 28) {
            newPos = 0;
            players[pIdx].money += 500; // Passed start reward
            get().addLog(`${player.name} 经过起点，获得 $500 奖励！`);
            soundEngine.playCoin();
          } else if (newPos < 0) {
            newPos = 27;
          }
          players[pIdx].position = newPos;
          return { players };
        });
        soundEngine.playStep();

        const currentPos = get().players[get().currentPlayerIndex].position;
        // Check roadblock
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
          const finalPos = get().players[get().currentPlayerIndex].position;
          get().handleCellEvent(player.id, finalPos);
        }
      }, 300); // 300ms per step animation

    }, 800); // Wait for dice rolling animation
  },
}));
