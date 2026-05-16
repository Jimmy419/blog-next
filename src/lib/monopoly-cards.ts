export type MonopolyCardName =
  | "换屋卡"
  | "换地卡"
  | "购地卡"
  | "乌龟卡"
  | "拆除卡"
  | "改建卡"
  | "怪兽卡"
  | "恶魔卡"
  | "天使卡"
  | "查封卡"
  | "涨价卡"
  | "红卡"
  | "黑卡"
  | "均贫卡"
  | "均富卡"
  | "同盟卡"
  | "免罪卡"
  | "请神符"
  | "送神符"
  | "免费卡"
  | "停留卡"
  | "转向卡"
  | "查税卡"
  | "抢夺卡"
  | "拍卖卡"
  | "复仇卡"
  | "陷害卡"
  | "嫁祸卡"
  | "梦游卡"
  | "冬眠卡"
  | "路障卡";

export type CardInteractionKind =
  | "instant"
  | "select_player"
  | "select_property"
  | "select_stock"
  | "place_roadblock"
  | "passive";

export interface MonopolyCardDefinition {
  name: MonopolyCardName;
  slug: string;
  category: "建设类" | "股市类" | "策略类" | "防御类" | "神仙类" | "控制类";
  price: number;
  interaction: CardInteractionKind;
  accentFrom: string;
  accentTo: string;
  icon: string;
  shortDescription: string;
}

export const MONOPOLY_CARD_DEFINITIONS: MonopolyCardDefinition[] = [
  { name: "换屋卡", slug: "swap-building", category: "建设类", price: 20, interaction: "select_property", accentFrom: "#fb7185", accentTo: "#be123c", icon: "🏠", shortDescription: "将指定高楼换到自己地盘。" },
  { name: "换地卡", slug: "swap-land", category: "建设类", price: 25, interaction: "select_property", accentFrom: "#f97316", accentTo: "#c2410c", icon: "🗺️", shortDescription: "与自己的地产交换经营权。" },
  { name: "购地卡", slug: "buy-land", category: "建设类", price: 35, interaction: "select_property", accentFrom: "#f59e0b", accentTo: "#b45309", icon: "🧾", shortDescription: "强制买下对手的房产。" },
  { name: "乌龟卡", slug: "turtle", category: "控制类", price: 70, interaction: "instant", accentFrom: "#22c55e", accentTo: "#166534", icon: "🐢", shortDescription: "接下来 3 次掷骰固定只走 1 步。" },
  { name: "拆除卡", slug: "demolish", category: "建设类", price: 15, interaction: "select_property", accentFrom: "#f87171", accentTo: "#991b1b", icon: "🛠️", shortDescription: "拆掉一层建筑或清除路障。" },
  { name: "改建卡", slug: "rebuild", category: "建设类", price: 15, interaction: "select_property", accentFrom: "#2dd4bf", accentTo: "#0f766e", icon: "🏗️", shortDescription: "切换建筑形态并调整收益。" },
  { name: "怪兽卡", slug: "monster", category: "建设类", price: 60, interaction: "select_property", accentFrom: "#a78bfa", accentTo: "#6d28d9", icon: "👾", shortDescription: "彻底拆除一座目标建筑。" },
  { name: "恶魔卡", slug: "devil", category: "建设类", price: 180, interaction: "select_property", accentFrom: "#ef4444", accentTo: "#7f1d1d", icon: "😈", shortDescription: "清空目标路段的一排房屋。" },
  { name: "天使卡", slug: "angel", category: "建设类", price: 160, interaction: "select_property", accentFrom: "#38bdf8", accentTo: "#1d4ed8", icon: "👼", shortDescription: "让目标路段建筑全体加盖一层。" },
  { name: "查封卡", slug: "seal", category: "建设类", price: 35, interaction: "select_property", accentFrom: "#94a3b8", accentTo: "#334155", icon: "⛔", shortDescription: "让目标路段停业数回合。" },
  { name: "涨价卡", slug: "markup", category: "建设类", price: 35, interaction: "select_property", accentFrom: "#fde047", accentTo: "#ca8a04", icon: "📈", shortDescription: "提升房价、租金与建筑价值。" },
  { name: "红卡", slug: "red-stock", category: "股市类", price: 50, interaction: "select_stock", accentFrom: "#fb7185", accentTo: "#e11d48", icon: "🟥", shortDescription: "把下跌股票拉升反弹。" },
  { name: "黑卡", slug: "black-stock", category: "股市类", price: 50, interaction: "select_stock", accentFrom: "#64748b", accentTo: "#111827", icon: "⬛", shortDescription: "把上涨股票瞬间打压。" },
  { name: "均贫卡", slug: "split-poor", category: "策略类", price: 200, interaction: "select_player", accentFrom: "#fda4af", accentTo: "#9d174d", icon: "⚖️", shortDescription: "与指定对手平分现金。" },
  { name: "均富卡", slug: "split-rich", category: "策略类", price: 200, interaction: "instant", accentFrom: "#facc15", accentTo: "#ca8a04", icon: "💰", shortDescription: "将全场现金重新平均。" },
  { name: "同盟卡", slug: "alliance", category: "策略类", price: 40, interaction: "select_player", accentFrom: "#60a5fa", accentTo: "#1d4ed8", icon: "🤝", shortDescription: "与指定对手结盟 7 天。" },
  { name: "免罪卡", slug: "pardon", category: "防御类", price: 25, interaction: "passive", accentFrom: "#e2e8f0", accentTo: "#64748b", icon: "🛡️", shortDescription: "自动抵消一次坐牢或陷害。" },
  { name: "请神符", slug: "summon-god", category: "神仙类", price: 15, interaction: "instant", accentFrom: "#c084fc", accentTo: "#7e22ce", icon: "🔮", shortDescription: "随机请来一位神仙附体。" },
  { name: "送神符", slug: "send-god", category: "神仙类", price: 10, interaction: "instant", accentFrom: "#d8b4fe", accentTo: "#6b21a8", icon: "📿", shortDescription: "立刻送走附身的坏神仙。" },
  { name: "免费卡", slug: "free-pass", category: "防御类", price: 25, interaction: "passive", accentFrom: "#93c5fd", accentTo: "#1e40af", icon: "🎫", shortDescription: "自动免除一次高额罚款或租金。" },
  { name: "停留卡", slug: "stop", category: "控制类", price: 20, interaction: "select_player", accentFrom: "#f97316", accentTo: "#9a3412", icon: "🧱", shortDescription: "让指定角色原地停走一回合。" },
  { name: "转向卡", slug: "reverse", category: "控制类", price: 20, interaction: "select_player", accentFrom: "#818cf8", accentTo: "#3730a3", icon: "🔁", shortDescription: "让指定角色立即反向前进。" },
  { name: "查税卡", slug: "tax", category: "策略类", price: 35, interaction: "select_player", accentFrom: "#22c55e", accentTo: "#166534", icon: "🧮", shortDescription: "向指定对手征收一笔税金。" },
  { name: "抢夺卡", slug: "steal", category: "策略类", price: 25, interaction: "select_player", accentFrom: "#f43f5e", accentTo: "#881337", icon: "🥷", shortDescription: "夺走指定对手的一张卡。" },
  { name: "拍卖卡", slug: "auction", category: "策略类", price: 20, interaction: "select_property", accentFrom: "#f59e0b", accentTo: "#92400e", icon: "🔨", shortDescription: "拍卖对手的优质房产获利。" },
  { name: "复仇卡", slug: "revenge", category: "防御类", price: 20, interaction: "passive", accentFrom: "#fb7185", accentTo: "#881337", icon: "⚔️", shortDescription: "自动反弹一次陷害效果。" },
  { name: "陷害卡", slug: "frame", category: "控制类", price: 20, interaction: "select_player", accentFrom: "#ef4444", accentTo: "#7f1d1d", icon: "🚨", shortDescription: "送指定对手去监狱或医院。" },
  { name: "嫁祸卡", slug: "shift-blame", category: "防御类", price: 40, interaction: "passive", accentFrom: "#f97316", accentTo: "#7c2d12", icon: "🎭", shortDescription: "自动把一次高额费用转嫁出去。" },
  { name: "梦游卡", slug: "sleepwalk", category: "控制类", price: 60, interaction: "select_player", accentFrom: "#38bdf8", accentTo: "#0f172a", icon: "😴", shortDescription: "让指定对手沉睡数回合。" },
  { name: "冬眠卡", slug: "hibernate", category: "控制类", price: 100, interaction: "instant", accentFrom: "#60a5fa", accentTo: "#1e3a8a", icon: "❄️", shortDescription: "让所有对手停留沉睡 5 天。" },
  { name: "路障卡", slug: "roadblock", category: "控制类", price: 30, interaction: "place_roadblock", accentFrom: "#f97316", accentTo: "#ea580c", icon: "🚧", shortDescription: "在棋盘上放置一个路障。" },
];

export const MONOPOLY_CARD_MAP: Record<MonopolyCardName, MonopolyCardDefinition> =
  MONOPOLY_CARD_DEFINITIONS.reduce((acc, card) => {
    acc[card.name] = card;
    return acc;
  }, {} as Record<MonopolyCardName, MonopolyCardDefinition>);

export function getMonopolyCardImagePath(cardName: string) {
  const definition = MONOPOLY_CARD_MAP[cardName as MonopolyCardName];
  return definition
    ? `/images/monopoly-cards/${definition.slug}.svg`
    : "/images/monopoly-cards/default.svg";
}
