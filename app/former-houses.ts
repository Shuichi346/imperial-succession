export type FormerHouseMember = {
  name: string;
  reading: string;
  rank: number;
};

export type FormerLineageNode = {
  id: string;
  name: string;
  reading?: string;
  label: string;
  parent: string;
  x: number;
  y: number;
  kind?: "person" | "gap";
  note?: string;
};

export type FormerHouse = {
  id: string;
  house: string;
  reading: string;
  founderLine: string;
  parent: string;
  x: number;
  y: number;
  members: FormerHouseMember[];
  note: string;
  status?: string;
};

// Positions are deliberately independent from the chronological emperor rows.
// They form a compact, explorable branch east of the main line while preserving
// the parent-child structure in the Cabinet Secretariat's 2021 genealogy.
export const FORMER_LINEAGE_NODES: FormerLineageNode[] = [
  {
    id: "former-yoshihito",
    name: "栄仁親王",
    reading: "よしひと",
    label: "伏見宮 初代",
    parent: "n3",
    x: 2200,
    y: 12120,
    note: "北朝第3代・崇光天皇の皇子。伏見宮の祖。",
  },
  {
    id: "former-sadafusa",
    name: "貞成親王",
    reading: "さだふさ",
    label: "伏見宮 第3代",
    parent: "former-yoshihito",
    x: 2410,
    y: 12400,
    note: "第102代・後花園天皇と旧11宮家に共通する祖先。",
  },
  {
    id: "former-sadatsune",
    name: "貞常親王",
    reading: "さだつね",
    label: "伏見宮 第4代",
    parent: "former-sadafusa",
    x: 2570,
    y: 12710,
  },
  {
    id: "former-fushimi-gap",
    name: "伏見宮系",
    label: "代々継承",
    parent: "former-sadatsune",
    x: 2585,
    y: 13280,
    kind: "gap",
    note: "中間の当主を省略。",
  },
  {
    id: "former-sadayoshi",
    name: "貞敬親王",
    reading: "さだよし",
    label: "伏見宮 第19代",
    parent: "former-fushimi-gap",
    x: 2570,
    y: 13620,
  },
  {
    id: "former-kuniie",
    name: "邦家親王",
    reading: "くにいえ",
    label: "伏見宮 第20代",
    parent: "former-sadayoshi",
    x: 2950,
    y: 13920,
    note: "山階・久邇・北白川・伏見・閑院・東伏見の各系統がここから分岐。",
  },
  {
    id: "former-asahiko",
    name: "朝彦親王",
    reading: "あさひこ",
    label: "久邇宮 初代",
    parent: "former-kuniie",
    x: 3230,
    y: 14220,
    note: "邦家親王の第4王子。賀陽・久邇・朝香・東久邇の各系統へ分岐。",
  },
  {
    id: "former-yoshihisa",
    name: "能久親王",
    reading: "よしひさ",
    label: "北白川宮",
    parent: "former-kuniie",
    x: 3880,
    y: 14220,
    note: "邦家親王の第9王子。竹田宮と北白川宮の系統へ分岐。",
  },
];

export const FORMER_HOUSES: FormerHouse[] = [
  {
    id: "house-yamashina",
    house: "山階宮",
    reading: "やましなのみや",
    founderLine: "邦家親王 → 晃親王 → 菊麿王",
    parent: "former-kuniie",
    x: 2200,
    y: 14540,
    members: [{ name: "武彦王", reading: "たけひこ", rank: 7 }],
    note: "晃親王は邦家親王の第1王子。1947年の皇籍離脱時、武彦王は旧11宮家の男子で最上位とされた。",
  },
  {
    id: "house-nashimoto",
    house: "梨本宮",
    reading: "なしもとのみや",
    founderLine: "貞敬親王 → 守脩親王（初代）",
    parent: "former-sadayoshi",
    x: 2570,
    y: 14540,
    members: [{ name: "守正王", reading: "もりまさ", rank: 19 }],
    note: "守脩親王は貞敬親王の第10王子。後継の守正王は久邇宮朝彦親王の第4王子から養子となった。",
  },
  {
    id: "house-fushimi",
    house: "伏見宮",
    reading: "ふしみのみや",
    founderLine: "邦家親王 → 貞愛親王 → 博恭王 → 博義王",
    parent: "former-kuniie",
    x: 2940,
    y: 14540,
    members: [{ name: "博明王", reading: "ひろあき", rank: 31 }],
    note: "貞愛親王は邦家親王の第14王子で伏見宮を継承。博明王は博義王の第1王子。",
  },
  {
    id: "house-kanin",
    house: "閑院宮",
    reading: "かんいんのみや",
    founderLine: "邦家親王 → 載仁親王",
    parent: "former-kuniie",
    x: 3310,
    y: 14540,
    members: [{ name: "春仁王", reading: "はるひと", rank: 32 }],
    note: "載仁親王は邦家親王の第16王子で、1872年に閑院宮を継承。",
  },
  {
    id: "house-higashifushimi",
    house: "東伏見宮",
    reading: "ひがしふしみのみや",
    founderLine: "邦家親王 → 依仁親王",
    parent: "former-kuniie",
    x: 3680,
    y: 14540,
    members: [],
    status: "依仁親王は1922年に薨去し、1947年は親王妃周子のみが皇籍離脱。",
    note: "依仁親王は邦家親王の第17王子。子女はなく、当時の男子皇位継承順位には含まれない。",
  },
  {
    id: "house-kaya",
    house: "賀陽宮",
    reading: "かやのみや",
    founderLine: "朝彦親王 → 邦憲王 → 恒憲王",
    parent: "former-asahiko",
    x: 2200,
    y: 14940,
    members: [
      { name: "恒憲王", reading: "つねのり", rank: 8 },
      { name: "邦寿王", reading: "くになが", rank: 9 },
      { name: "治憲王", reading: "はるのり", rank: 10 },
      { name: "章憲王", reading: "あきのり", rank: 11 },
      { name: "文憲王", reading: "ふみのり", rank: 12 },
      { name: "宗憲王", reading: "むねのり", rank: 13 },
      { name: "健憲王", reading: "たけのり", rank: 14 },
    ],
    note: "邦憲王は朝彦親王の第2王子。恒憲王と6人の王子が1947年に皇籍を離脱した。",
  },
  {
    id: "house-kuni",
    house: "久邇宮",
    reading: "くにのみや",
    founderLine: "朝彦親王 → 邦彦王 → 朝融王",
    parent: "former-asahiko",
    x: 2570,
    y: 14940,
    members: [
      { name: "朝融王", reading: "あさあきら", rank: 15 },
      { name: "邦昭王", reading: "くにあき", rank: 16 },
      { name: "朝建王", reading: "あさたけ", rank: 17 },
      { name: "朝宏王", reading: "あさひろ", rank: 18 },
    ],
    note: "邦彦王は朝彦親王の第3王子。朝融王と3人の王子が1947年に皇籍を離脱した。",
  },
  {
    id: "house-asaka",
    house: "朝香宮",
    reading: "あさかのみや",
    founderLine: "朝彦親王 → 鳩彦王",
    parent: "former-asahiko",
    x: 2940,
    y: 14940,
    members: [
      { name: "鳩彦王", reading: "やすひこ", rank: 20 },
      { name: "孚彦王", reading: "たかひこ", rank: 21 },
      { name: "誠彦王", reading: "ともひこ", rank: 22 },
    ],
    note: "鳩彦王は朝彦親王の第8王子。鳩彦王と2人の王子が1947年に皇籍を離脱した。",
  },
  {
    id: "house-higashikuni",
    house: "東久邇宮",
    reading: "ひがしくにのみや",
    founderLine: "朝彦親王 → 稔彦王",
    parent: "former-asahiko",
    x: 3310,
    y: 14940,
    members: [
      { name: "稔彦王", reading: "なるひこ", rank: 23 },
      { name: "盛厚王", reading: "もりひろ", rank: 24 },
      { name: "信彦王", reading: "のぶひこ", rank: 25 },
      { name: "俊彦王", reading: "としひこ", rank: 26 },
    ],
    note: "稔彦王は朝彦親王の第9王子。信彦王は盛厚王と昭和天皇第1皇女子・成子内親王の第1王子。",
  },
  {
    id: "house-kitashirakawa",
    house: "北白川宮",
    reading: "きたしらかわのみや",
    founderLine: "能久親王 → 成久王 → 永久王",
    parent: "former-yoshihisa",
    x: 3680,
    y: 14940,
    members: [{ name: "道久王", reading: "みちひさ", rank: 30 }],
    note: "能久親王の第3王子・成久王が北白川宮を継ぎ、永久王を経て道久王へ続く。",
  },
  {
    id: "house-takeda",
    house: "竹田宮",
    reading: "たけだのみや",
    founderLine: "能久親王 → 恒久王 → 恒徳王",
    parent: "former-yoshihisa",
    x: 3680,
    y: 15350,
    members: [
      { name: "恒徳王", reading: "つねよし", rank: 27 },
      { name: "恒正王", reading: "つねただ", rank: 28 },
      { name: "恒治王", reading: "つねはる", rank: 29 },
    ],
    note: "恒久王は能久親王の第1王子。恒徳王と2人の王子が1947年に皇籍を離脱した。",
  },
];

export const FORMER_HOUSES_FOCUS = { x: 3050, y: 14680 } as const;

