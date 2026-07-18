"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Emperor = {
  id: string;
  order: number;
  name: string;
  reading: string;
  reign: string;
  parent?: string;
  lane: number;
  era: string;
  note: string;
};

const EMPERORS: Emperor[] = [
  { id: "1", order: 1, name: "神武", reading: "じんむ", reign: "前660 – 前585", lane: 0, era: "伝承・古代", note: "『日本書紀』『古事記』で初代とされる天皇。年代は伝統的な皇統譜によります。" },
  { id: "2", order: 2, name: "綏靖", reading: "すいぜい", reign: "前581 – 前549", parent: "1", lane: 0, era: "伝承・古代", note: "神武天皇の皇子と伝えられる第2代天皇。年代は伝統的な皇統譜によります。" },
  { id: "3", order: 3, name: "安寧", reading: "あんねい", reign: "前549 – 前511", parent: "2", lane: 0, era: "伝承・古代", note: "綏靖天皇の皇子とされる第3代天皇。欠史八代の一人に数えられます。" },
  { id: "4", order: 4, name: "懿徳", reading: "いとく", reign: "前510 – 前477", parent: "3", lane: 0, era: "伝承・古代", note: "安寧天皇の皇子とされる第4代天皇。年代は伝統的な皇統譜によります。" },
  { id: "5", order: 5, name: "孝昭", reading: "こうしょう", reign: "前475 – 前393", parent: "4", lane: 0, era: "伝承・古代", note: "懿徳天皇の皇子とされる第5代天皇。欠史八代の一人に数えられます。" },
  { id: "6", order: 6, name: "孝安", reading: "こうあん", reign: "前392 – 前291", parent: "5", lane: 0, era: "伝承・古代", note: "孝昭天皇の皇子とされる第6代天皇。年代は伝統的な皇統譜によります。" },
  { id: "7", order: 7, name: "孝霊", reading: "こうれい", reign: "前290 – 前215", parent: "6", lane: 0, era: "伝承・古代", note: "孝安天皇の皇子とされる第7代天皇。欠史八代の一人に数えられます。" },
  { id: "8", order: 8, name: "孝元", reading: "こうげん", reign: "前214 – 前158", parent: "7", lane: 0, era: "伝承・古代", note: "孝霊天皇の皇子とされる第8代天皇。年代は伝統的な皇統譜によります。" },
  { id: "9", order: 9, name: "開化", reading: "かいか", reign: "前158 – 前98", parent: "8", lane: 0, era: "伝承・古代", note: "孝元天皇の皇子とされる第9代天皇。欠史八代の最後に位置づけられます。" },
  { id: "10", order: 10, name: "崇神", reading: "すじん", reign: "前97 – 前30", parent: "9", lane: 0, era: "伝承・古代", note: "実在可能性が論じられる初期天皇の一人。伝承では国内統治を整えたとされます。" },
  { id: "11", order: 11, name: "垂仁", reading: "すいにん", reign: "前29 – 70", parent: "10", lane: 0, era: "伝承・古代", note: "崇神天皇の皇子とされる第11代天皇。多くの起源伝承と結びつきます。" },
  { id: "12", order: 12, name: "景行", reading: "けいこう", reign: "71 – 130", parent: "11", lane: 0, era: "伝承・古代", note: "日本武尊の父と伝えられる第12代天皇。東西への遠征伝承で知られます。" },
  { id: "13", order: 13, name: "成務", reading: "せいむ", reign: "131 – 190", parent: "12", lane: 2, era: "古墳時代", note: "景行天皇の皇子とされる第13代天皇。地方統治に関する伝承が残ります。" },
  { id: "14", order: 14, name: "仲哀", reading: "ちゅうあい", reign: "192 – 200", parent: "12", lane: -2, era: "古墳時代", note: "日本武尊の皇子とされる第14代天皇。系図では景行天皇から一代を省略して結びます。" },
  { id: "15", order: 15, name: "応神", reading: "おうじん", reign: "270 – 310", parent: "14", lane: -2, era: "古墳時代", note: "仲哀天皇の皇子とされる第15代天皇。八幡神と習合し、広く信仰されました。" },
  { id: "16", order: 16, name: "仁徳", reading: "にんとく", reign: "313 – 399", parent: "15", lane: 0, era: "古墳時代", note: "応神天皇の皇子とされる第16代天皇。民の暮らしを思う伝承で知られます。" },
  { id: "17", order: 17, name: "履中", reading: "りちゅう", reign: "400 – 405", parent: "16", lane: 2, era: "古墳時代", note: "仁徳天皇の皇子。兄弟へ続く皇統の起点となる第17代天皇です。" },
  { id: "18", order: 18, name: "反正", reading: "はんぜい", reign: "406 – 410", parent: "16", lane: 1, era: "古墳時代", note: "仁徳天皇の皇子で履中天皇の弟。第18代天皇に数えられます。" },
  { id: "19", order: 19, name: "允恭", reading: "いんぎょう", reign: "412 – 453", parent: "16", lane: -1, era: "古墳時代", note: "仁徳天皇の皇子。氏姓の秩序を正したという伝承が残ります。" },
  { id: "20", order: 20, name: "安康", reading: "あんこう", reign: "453 – 456", parent: "19", lane: 0, era: "古墳時代", note: "允恭天皇の皇子で雄略天皇の兄。第20代天皇です。" },
  { id: "21", order: 21, name: "雄略", reading: "ゆうりゃく", reign: "456 – 479", parent: "19", lane: -1, era: "古墳時代", note: "倭王武との関連が有力視される第21代天皇。古代国家形成を考える重要な存在です。" },
  { id: "22", order: 22, name: "清寧", reading: "せいねい", reign: "480 – 484", parent: "21", lane: -1, era: "古墳時代", note: "雄略天皇の皇子。皇子がなく、次の皇統探索へつながったと伝えられます。" },
  { id: "23", order: 23, name: "顕宗", reading: "けんぞう", reign: "485 – 487", parent: "17", lane: 2, era: "古墳時代", note: "履中天皇の孫にあたるとされる第23代天皇。系図では中間皇族を省略しています。" },
  { id: "24", order: 24, name: "仁賢", reading: "にんけん", reign: "488 – 498", parent: "17", lane: 1.5, era: "古墳時代", note: "顕宗天皇の兄で、履中天皇の孫にあたるとされる第24代天皇です。" },
  { id: "25", order: 25, name: "武烈", reading: "ぶれつ", reign: "498 – 506", parent: "24", lane: 1.5, era: "古墳時代", note: "仁賢天皇の皇子。皇子がなく、継体天皇への皇統移行につながります。" },
  { id: "26", order: 26, name: "継体", reading: "けいたい", reign: "507 – 531", parent: "15", lane: -3, era: "古墳時代", note: "応神天皇の五世孫と伝えられる第26代天皇。系図では複数代を省略しています。" },
  { id: "27", order: 27, name: "安閑", reading: "あんかん", reign: "531 – 535", parent: "26", lane: -4, era: "古墳時代", note: "継体天皇の皇子。第27代天皇に数えられます。" },
  { id: "28", order: 28, name: "宣化", reading: "せんか", reign: "535 – 539", parent: "26", lane: -3, era: "古墳時代", note: "継体天皇の皇子で安閑天皇の弟。第28代天皇です。" },
  { id: "29", order: 29, name: "欽明", reading: "きんめい", reign: "539 – 571", parent: "26", lane: -2, era: "飛鳥時代", note: "継体天皇の皇子。仏教公伝をめぐる記事の時代にあたります。" },
  { id: "30", order: 30, name: "敏達", reading: "びだつ", reign: "572 – 585", parent: "29", lane: 1, era: "飛鳥時代", note: "欽明天皇の皇子。仏教受容をめぐる政治的対立が続いた時代の天皇です。" },
  { id: "31", order: 31, name: "用明", reading: "ようめい", reign: "585 – 587", parent: "29", lane: 2, era: "飛鳥時代", note: "欽明天皇の皇子で、聖徳太子の父。第31代天皇です。" },
  { id: "32", order: 32, name: "崇峻", reading: "すしゅん", reign: "587 – 592", parent: "29", lane: 0, era: "飛鳥時代", note: "欽明天皇の皇子。臣下により殺害されたと記される第32代天皇です。" },
  { id: "33", order: 33, name: "推古", reading: "すいこ", reign: "592 – 628", parent: "29", lane: -1, era: "飛鳥時代", note: "日本で最初の女性天皇とされます。厩戸皇子（聖徳太子）が皇太子として政務を担いました。" },
  { id: "34", order: 34, name: "舒明", reading: "じょめい", reign: "629 – 641", parent: "30", lane: 1, era: "飛鳥時代", note: "敏達天皇の孫にあたる第34代天皇。系図では中間皇族を省略しています。" },
];

const SCENE_WIDTH = 2100;
const ROW_HEIGHT = 132;
const SCENE_HEIGHT = 4800;

function positionFor(emperor: Emperor) {
  return {
    x: 930 + emperor.lane * 220 + Math.sin(emperor.order * 0.72) * 34,
    y: 110 + (emperor.order - 1) * ROW_HEIGHT,
    z: 28 + Math.abs(emperor.lane) * 16,
  };
}

function edgePath(from: Emperor, to: Emperor) {
  const a = positionFor(from);
  const b = positionFor(to);
  const bend = Math.max(54, Math.abs(b.y - a.y) * 0.42);
  return `M ${a.x + 82} ${a.y + 58} C ${a.x + 82} ${a.y + 58 + bend}, ${b.x + 82} ${b.y + 58 - bend}, ${b.x + 82} ${b.y + 58}`;
}

export default function Home() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [selectedId, setSelectedId] = useState("34");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(0.72);
  const [offset, setOffset] = useState({ x: -260, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  const byId = useMemo(() => new Map(EMPERORS.map((item) => [item.id, item])), []);
  const selected = byId.get(selectedId) ?? EMPERORS[0];
  const activePath = useMemo(() => {
    const ids = new Set<string>();
    let cursor: Emperor | undefined = selected;
    while (cursor) {
      ids.add(cursor.id);
      cursor = cursor.parent ? byId.get(cursor.parent) : undefined;
    }
    return ids;
  }, [byId, selected]);

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return new Set(EMPERORS.map((item) => item.id));
    return new Set(
      EMPERORS.filter((item) =>
        `${item.order}${item.name}${item.reading}${item.era}`.toLowerCase().includes(normalized),
      ).map((item) => item.id),
    );
  }, [query]);

  useEffect(() => {
    const fit = () => {
      const width = window.innerWidth;
      setZoom(width < 700 ? 0.58 : width < 1100 ? 0.66 : 0.74);
      setOffset({ x: width / 2 - SCENE_WIDTH / 2, y: 28 });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const focusNode = (id: string) => {
    const emperor = byId.get(id);
    if (!emperor || !viewportRef.current) return;
    const pos = positionFor(emperor);
    const rect = viewportRef.current.getBoundingClientRect();
    setSelectedId(id);
    setOffset({
      x: rect.width / 2 - pos.x * zoom,
      y: Math.min(80, rect.height * 0.4 - pos.y * zoom),
    });
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="crest" aria-hidden="true"><span>十六</span></div>
          <div>
            <p className="eyebrow">IMPERIAL LINEAGE · 126</p>
            <h1>天皇皇位継承図</h1>
          </div>
        </div>
        <div className="chapter-chip" aria-label="現在の収録範囲">
          <span>第一章</span>
          <strong>神武 — 舒明</strong>
          <small>34 / 126</small>
        </div>
        <label className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="天皇名・代数から探す"
            aria-label="天皇名・代数から探す"
          />
          {query && <button onClick={() => setQuery("")} aria-label="検索をクリア">×</button>}
        </label>
      </header>

      <section
        ref={viewportRef}
        className={`lineage-viewport ${isDragging ? "is-dragging" : ""}`}
        aria-label="皇位継承の立体系譜図"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button")) return;
          dragRef.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
          setIsDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!dragRef.current) return;
          setOffset({
            x: dragRef.current.ox + event.clientX - dragRef.current.x,
            y: dragRef.current.oy + event.clientY - dragRef.current.y,
          });
        }}
        onPointerUp={(event) => {
          dragRef.current = null;
          setIsDragging(false);
          event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onWheel={(event) => {
          event.preventDefault();
          setZoom((current) => Math.min(1.25, Math.max(0.42, current - event.deltaY * 0.0008)));
        }}
      >
        <div className="cosmos" aria-hidden="true" />
        <div className="depth-labels" aria-hidden="true">
          <span style={{ top: 330 }}>伝承・古代</span>
          <span style={{ top: 1840 }}>古墳時代</span>
          <span style={{ top: 3900 }}>飛鳥時代</span>
        </div>
        <div
          className="genealogy-scene"
          style={{
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom}) rotateX(3deg) rotateZ(-0.7deg)`,
          }}
        >
          <div className="grid-plane" aria-hidden="true" />
          <svg className="edges" width={SCENE_WIDTH} height={SCENE_HEIGHT} aria-hidden="true">
            <defs>
              <linearGradient id="lineGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d7bd77" stopOpacity=".7" />
                <stop offset="1" stopColor="#786532" stopOpacity=".24" />
              </linearGradient>
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {EMPERORS.filter((item) => item.parent).map((item) => {
              const parent = byId.get(item.parent!);
              if (!parent) return null;
              const active = activePath.has(item.id) && activePath.has(parent.id);
              return (
                <g key={`${parent.id}-${item.id}`}>
                  <path className="edge-shadow" d={edgePath(parent, item)} />
                  <path className={`edge ${active ? "edge-active" : ""}`} d={edgePath(parent, item)} />
                </g>
              );
            })}
          </svg>

          {EMPERORS.map((emperor) => {
            const pos = positionFor(emperor);
            const active = activePath.has(emperor.id);
            const dimmed = !matches.has(emperor.id);
            return (
              <button
                key={emperor.id}
                className={`emperor-node ${active ? "is-active" : ""} ${selectedId === emperor.id ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
                style={{ left: pos.x, top: pos.y, transform: `translateZ(${pos.z}px)` }}
                onClick={(event) => { event.stopPropagation(); setSelectedId(emperor.id); }}
                aria-label={`第${emperor.order}代 ${emperor.name}天皇。${emperor.reign}`}
              >
                <span className="node-orbit" aria-hidden="true" />
                <span className="node-number">{String(emperor.order).padStart(3, "0")}</span>
                <span className="node-copy">
                  <strong>{emperor.name}</strong>
                  <small>{emperor.reading}</small>
                </span>
                <span className="node-dot" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <div className="viewport-caption">
          <span className="live-dot" />
          <div><strong>系譜を探索</strong><small>ドラッグで移動 · スクロールで拡大</small></div>
        </div>

        <div className="zoom-controls" aria-label="表示倍率">
          <button onClick={() => setZoom((value) => Math.min(1.25, value + 0.1))} aria-label="拡大">＋</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((value) => Math.max(0.42, value - 0.1))} aria-label="縮小">−</button>
          <button className="fit-button" onClick={() => { setZoom(0.72); setOffset({ x: window.innerWidth / 2 - SCENE_WIDTH / 2, y: 28 }); }}>全体</button>
        </div>

        {selectedId && (
          <aside className="profile-card" aria-live="polite" aria-label={`${selected.name}天皇の解説`}>
            <button className="card-close" onClick={() => setSelectedId("")} aria-label="解説を閉じる">×</button>
            <div className="card-kicker"><span>第 {selected.order} 代</span><span>{selected.era}</span></div>
            <div className="portrait-seal" aria-hidden="true">
              <span>{selected.name.slice(0, 1)}</span>
              <i />
            </div>
            <h2>{selected.name}<small>天皇</small></h2>
            <p className="reading">{selected.reading}</p>
            <dl>
              <div><dt>在位</dt><dd>{selected.reign}</dd></div>
              <div><dt>系譜</dt><dd>{activePath.size}つの皇統ノードを表示</dd></div>
            </dl>
            <p className="profile-note">{selected.note}</p>
            <div className="path-status"><span /><p><strong>祖系を照射中</strong><small>金色の光が初代までの系譜をたどります</small></p></div>
            <div className="card-nav">
              <button disabled={selected.order === 1} onClick={() => focusNode(String(selected.order - 1))}>← 前代</button>
              <button disabled={selected.order === EMPERORS.length} onClick={() => focusNode(String(selected.order + 1))}>次代 →</button>
            </div>
          </aside>
        )}
      </section>

      <footer className="source-note">
        <p>添付の皇位継承図を基礎に、宮内庁「天皇系図」を参照して再構成。古代の年代は伝統的な皇統譜によります。</p>
        <a href="https://www.kunaicho.go.jp/learn/about/kosei/keizu.html" target="_blank" rel="noreferrer">資料を見る ↗</a>
      </footer>
    </main>
  );
}
