"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EMPERORS, ERA_JUMPS, type Emperor } from "./emperors";

const SCENE_WIDTH = 2700;
const ROW_HEIGHT = 124;
const SCENE_HEIGHT = 16080;
const BASE_X = 760;
const LANE_WIDTH = 180;

function positionFor(emperor: Emperor) {
  const row = emperor.row ?? emperor.order;
  return {
    x: BASE_X + emperor.lane * LANE_WIDTH + Math.sin(row * 0.72) * 30,
    y: 80 + (row - 1) * ROW_HEIGHT,
    z: 30 + Math.abs(emperor.lane) * 10,
  };
}

function edgePath(from: Emperor, to: Emperor) {
  const a = positionFor(from);
  const b = positionFor(to);
  const bend = Math.max(50, Math.abs(b.y - a.y) * 0.42);
  return `M ${a.x + 82} ${a.y + 58} C ${a.x + 82} ${a.y + 58 + bend}, ${b.x + 82} ${b.y + 58 - bend}, ${b.x + 82} ${b.y + 58}`;
}

function displayOrder(emperor: Emperor) {
  return emperor.badge ?? `第 ${emperor.order} 代`;
}

export default function Home() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [selectedId, setSelectedId] = useState("126");
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(0.62);
  const [offset, setOffset] = useState({ x: -450, y: -9000 });
  const [isDragging, setIsDragging] = useState(false);

  const byId = useMemo(() => new Map(EMPERORS.map((item) => [item.id, item])), []);
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const selectedIndex = selected ? EMPERORS.findIndex((item) => item.id === selected.id) : -1;

  const activePath = useMemo(() => {
    const ids = new Set<string>();
    let cursor = selected;
    while (cursor) {
      ids.add(cursor.id);
      cursor = cursor.parent ? byId.get(cursor.parent) : undefined;
    }
    return ids;
  }, [byId, selected]);

  const searchResults = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return EMPERORS;
    return EMPERORS.filter((item) =>
      `${item.order}${item.badge ?? ""}${item.name}${item.reading}${item.era}${item.aliases ?? ""}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);
  const matches = useMemo(() => new Set(searchResults.map((item) => item.id)), [searchResults]);

  const centerOn = (emperor: Emperor, nextZoom = zoom) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = positionFor(emperor);
    const targetX = rect.width < 900 ? rect.width / 2 : rect.width * 0.43;
    setOffset({
      x: targetX - (pos.x + 82) * nextZoom,
      y: rect.height * 0.46 - (pos.y + 58) * nextZoom,
    });
  };

  const focusNode = (id: string, nextZoom?: number) => {
    const emperor = byId.get(id);
    if (!emperor) return;
    if (nextZoom) setZoom(nextZoom);
    setSelectedId(id);
    centerOn(emperor, nextZoom ?? zoom);
  };

  useEffect(() => {
    const placeAtPresent = () => {
      const width = window.innerWidth;
      const nextZoom = width < 700 ? 0.52 : width < 1100 ? 0.57 : 0.62;
      const present = byId.get("126");
      setZoom(nextZoom);
      if (present) centerOn(present, nextZoom);
    };
    const frame = requestAnimationFrame(placeAtPresent);
    window.addEventListener("resize", placeAtPresent);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", placeAtPresent);
    };
    // The immutable graph map is intentionally the only dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const profileText = selected
    ? selected.note ?? `${selected.name}天皇は${displayOrder(selected)}。在位は${selected.reign}で、${selected.era}の皇統に位置します。系図では${selected.parent ? `${byId.get(selected.parent)?.name ?? "先代皇統"}からつながる系譜` : "皇統の起点"}として表示しています。`
    : "";

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
        <div className="chapter-chip" aria-label="収録範囲">
          <span>全系譜</span>
          <strong>神武 — 今上</strong>
          <small>126代 ＋ 北朝</small>
        </div>
        <form
          className="search-box"
          onSubmit={(event) => {
            event.preventDefault();
            if (searchResults[0]) focusNode(searchResults[0].id, Math.max(zoom, 0.62));
          }}
        >
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              const term = event.currentTarget.value.trim().toLowerCase();
              const hit = EMPERORS.find((item) =>
                `${item.order}${item.badge ?? ""}${item.name}${item.reading}${item.era}${item.aliases ?? ""}`
                  .toLowerCase()
                  .includes(term),
              );
              if (hit) focusNode(hit.id, Math.max(zoom, 0.62));
            }}
            placeholder="天皇名・代数・時代から探す"
            aria-label="天皇名・代数・時代から探す"
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="検索をクリア">×</button>}
          {query && <em>{searchResults.length}</em>}
          {query && (
            <div className="search-results" role="listbox" aria-label="検索候補">
              {searchResults.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { focusNode(item.id, Math.max(zoom, 0.62)); setQuery(""); }}
                  aria-label={`${item.name}天皇へ移動`}
                >
                  <span>{item.badge ?? `第${item.order}代`}</span>
                  <strong>{item.name}</strong>
                  <small>{item.reign}</small>
                </button>
              ))}
              {searchResults.length === 0 && <p>該当する天皇が見つかりません</p>}
            </div>
          )}
        </form>
      </header>

      <section
        ref={viewportRef}
        className={`lineage-viewport ${isDragging ? "is-dragging" : ""}`}
        aria-label="皇位継承の立体系譜図"
        onPointerDown={(event) => {
          if ((event.target as HTMLElement).closest("button, input, a")) return;
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
          if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        }}
        onWheel={(event) => {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const pointerX = event.clientX - rect.left;
          const pointerY = event.clientY - rect.top;
          setZoom((current) => {
            const next = Math.min(1.25, Math.max(0.28, current - event.deltaY * 0.0008));
            setOffset((present) => ({
              x: pointerX - (pointerX - present.x) * (next / current),
              y: pointerY - (pointerY - present.y) * (next / current),
            }));
            return next;
          });
        }}
      >
        <div className="cosmos" aria-hidden="true" />
        <div
          className="genealogy-scene"
          style={{
            width: SCENE_WIDTH,
            height: SCENE_HEIGHT,
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom}) rotateX(3deg) rotateZ(-0.45deg)`,
          }}
        >
          <div className="grid-plane" aria-hidden="true" />
          <div className="era-bands" aria-hidden="true">
            {ERA_JUMPS.map((jump) => {
              const emperor = byId.get(jump.id)!;
              return <div key={jump.id} style={{ top: positionFor(emperor).y - 46 }}><span>{jump.label}</span><i /></div>;
            })}
          </div>
          <svg className="edges" width={SCENE_WIDTH} height={SCENE_HEIGHT} aria-hidden="true">
            <defs>
              <linearGradient id="lineGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d7bd77" stopOpacity=".68" />
                <stop offset="1" stopColor="#786532" stopOpacity=".22" />
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
            const dimmed = query.trim() !== "" && !matches.has(emperor.id);
            const spokenOrder = emperor.badge ?? `第${emperor.order}代`;
            return (
              <button
                key={emperor.id}
                className={`emperor-node ${active ? "is-active" : ""} ${selectedId === emperor.id ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""} ${emperor.badge ? "is-northern" : ""}`}
                style={{ left: pos.x, top: pos.y, transform: `translateZ(${pos.z}px)` }}
                onClick={(event) => { event.stopPropagation(); setSelectedId(emperor.id); }}
                aria-label={`${spokenOrder} ${emperor.name}天皇。${emperor.reign}`}
              >
                <span className="node-orbit" aria-hidden="true" />
                <span className="node-number">{emperor.badge ?? String(emperor.order).padStart(3, "0")}</span>
                <span className="node-copy">
                  <strong className={emperor.name.length > 4 ? "node-long" : ""}>{emperor.name}</strong>
                  <small>{emperor.reading}</small>
                </span>
                <span className="node-dot" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <nav className="era-nav" aria-label="時代から移動">
          {ERA_JUMPS.map((jump) => <button key={jump.id} onClick={() => focusNode(jump.id, 0.58)}>{jump.label}</button>)}
        </nav>

        <div className="viewport-caption">
          <span className="live-dot" />
          <div><strong>系譜を探索</strong><small>ドラッグで移動 · スクロールで拡大</small></div>
        </div>

        <div className="zoom-controls" aria-label="表示倍率">
          <button onClick={() => setZoom((value) => Math.min(1.25, value + 0.1))} aria-label="拡大">＋</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((value) => Math.max(0.28, value - 0.1))} aria-label="縮小">−</button>
          <button className="fit-button" onClick={() => focusNode("126", 0.62)}>今上</button>
        </div>

        {selected && (
          <aside className="profile-card" aria-live="polite" aria-label={`${selected.name}天皇の解説`}>
            <button className="card-close" onClick={() => setSelectedId("")} aria-label="解説を閉じる">×</button>
            <div className="card-kicker"><span>{displayOrder(selected)}</span><span>{selected.era}</span></div>
            <div className="portrait-seal" aria-hidden="true">
              <span>{selected.name.replace(/[（(].*/, "").slice(0, 1)}</span>
              <i />
            </div>
            <h2 className={selected.name.length > 4 ? "card-title-long" : ""}>{selected.name}<small>天皇</small></h2>
            <p className="reading">{selected.reading}</p>
            {selected.tag && <p className="profile-tag">{selected.tag}</p>}
            <dl>
              <div><dt>在位</dt><dd>{selected.reign}</dd></div>
              <div><dt>系譜</dt><dd>{activePath.size}つの祖系ノードを表示</dd></div>
            </dl>
            <p className="profile-note">{profileText}</p>
            <div className="path-status"><span /><p><strong>祖系を照射中</strong><small>金色の光が系譜の起点までをたどります</small></p></div>
            <div className="card-nav">
              <button disabled={selectedIndex <= 0} onClick={() => focusNode(EMPERORS[selectedIndex - 1].id)}>← 前へ</button>
              <button disabled={selectedIndex < 0 || selectedIndex >= EMPERORS.length - 1} onClick={() => focusNode(EMPERORS[selectedIndex + 1].id)}>次へ →</button>
            </div>
          </aside>
        )}
      </section>

      <footer className="source-note">
        <p>添付の皇位継承図を基礎に、宮内庁「天皇系図」を参照して再構成。系譜線は中間皇族を一部省略しています。</p>
        <a href="https://www.kunaicho.go.jp/learn/about/kosei/keizu.html" target="_blank" rel="noreferrer">宮内庁資料 ↗</a>
      </footer>
    </main>
  );
}
