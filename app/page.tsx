"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { EMPERORS, ERA_JUMPS, type Emperor } from "./emperors";
import { ROYAL_PEOPLE, type RoyalPerson } from "./royal-lineage";
import {
  FORMER_HOUSES,
  FORMER_HOUSES_FOCUS,
  FORMER_LINEAGE_NODES,
  type FormerHouse,
  type FormerLineageNode,
} from "./former-houses";

const SCENE_WIDTH = 4400;
const ROW_HEIGHT = 124;
const SCENE_HEIGHT = 16080;
const BASE_X = 760;
const LANE_WIDTH = 180;
const FORMER_NODE_WIDTH = 164;
const FORMER_NODE_HEIGHT = 90;
const FORMER_HOUSE_WIDTH = 340;
const EMPEROR_NODE_WIDTH = 164;
const EMPEROR_NODE_HEIGHT = 116;
const ROYAL_NODE_WIDTH = 176;
const ROYAL_NODE_HEIGHT = 92;

type LineageEntity = Emperor | RoyalPerson;

function isRoyalPerson(entity: LineageEntity): entity is RoyalPerson {
  return "kind" in entity && entity.kind === "royal";
}

function positionFor(emperor: Emperor) {
  const row = emperor.row ?? emperor.order;
  return {
    x: BASE_X + emperor.lane * LANE_WIDTH + Math.sin(row * 0.72) * 30,
    y: 80 + (row - 1) * ROW_HEIGHT,
    z: 30 + Math.abs(emperor.lane) * 10,
  };
}

function positionForRoyal(person: RoyalPerson) {
  return {
    x: BASE_X + person.lane * LANE_WIDTH + Math.sin(person.row * 0.72) * 30,
    y: 80 + (person.row - 1) * ROW_HEIGHT,
    z: 42 + Math.abs(person.lane) * 10,
  };
}

function positionForEntity(entity: LineageEntity) {
  return isRoyalPerson(entity) ? positionForRoyal(entity) : positionFor(entity);
}

function entityCenter(entity: LineageEntity) {
  const position = positionForEntity(entity);
  return {
    x: position.x + (isRoyalPerson(entity) ? ROYAL_NODE_WIDTH : EMPEROR_NODE_WIDTH) / 2,
    y: position.y + (isRoyalPerson(entity) ? ROYAL_NODE_HEIGHT : EMPEROR_NODE_HEIGHT) / 2,
  };
}

function edgePath(from: LineageEntity, to: LineageEntity) {
  const a = entityCenter(from);
  const b = entityCenter(to);
  const bend = Math.max(50, Math.abs(b.y - a.y) * 0.42);
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + bend}, ${b.x} ${b.y - bend}, ${b.x} ${b.y}`;
}

function branchEdgePath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const bend = Math.max(64, Math.abs(to.y - from.y) * 0.46);
  return `M ${from.x} ${from.y} C ${from.x} ${from.y + bend}, ${to.x} ${to.y - bend}, ${to.x} ${to.y}`;
}

function displayOrder(emperor: Emperor) {
  return emperor.badge ?? `第 ${emperor.order} 代`;
}

function isFemaleEmperor(emperor: Emperor) {
  return emperor.tag?.includes("女性天皇") ?? false;
}

type SearchResult =
  | { kind: "emperor"; emperor: Emperor }
  | { kind: "royal"; person: RoyalPerson }
  | { kind: "former"; house: FormerHouse };

export default function Home() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const viewportWidthRef = useRef(0);
  const lastEmperorRef = useRef("126");
  const [selectedId, setSelectedId] = useState("126");
  const [selectedRoyalId, setSelectedRoyalId] = useState("");
  const [selectedFormerId, setSelectedFormerId] = useState("");
  const [showFormerHouses, setShowFormerHouses] = useState(false);
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(0.62);
  const [offset, setOffset] = useState({ x: -450, y: -9000 });
  const [isDragging, setIsDragging] = useState(false);

  const byId = useMemo(() => new Map(EMPERORS.map((item) => [item.id, item])), []);
  const royalById = useMemo(() => new Map(ROYAL_PEOPLE.map((item) => [item.id, item])), []);
  const lineageById = useMemo(() => new Map<string, LineageEntity>([
    ...EMPERORS.map((item) => [item.id, item] as const),
    ...ROYAL_PEOPLE.map((item) => [item.id, item] as const),
  ]), []);
  const formerLineageById = useMemo(() => new Map(FORMER_LINEAGE_NODES.map((item) => [item.id, item])), []);
  const formerHouseById = useMemo(() => new Map(FORMER_HOUSES.map((item) => [item.id, item])), []);
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const selectedRoyal = selectedRoyalId ? royalById.get(selectedRoyalId) : undefined;
  const selectedFormer = selectedFormerId ? formerHouseById.get(selectedFormerId) : undefined;
  const selectedIndex = selected ? EMPERORS.findIndex((item) => item.id === selected.id) : -1;

  const activePath = useMemo(() => {
    const ids = new Set<string>();
    let cursor: LineageEntity | undefined = selected ?? selectedRoyal;
    while (cursor) {
      ids.add(cursor.id);
      cursor = cursor.parent ? lineageById.get(cursor.parent) : undefined;
    }
    return ids;
  }, [lineageById, selected, selectedRoyal]);

  const activeFormerPath = useMemo(() => {
    const ids = new Set<string>();
    let cursor: FormerHouse | FormerLineageNode | RoyalPerson | Emperor | undefined = selectedFormer;
    while (cursor) {
      ids.add(cursor.id);
      cursor = formerHouseById.get(cursor.parent)
        ?? formerLineageById.get(cursor.parent)
        ?? royalById.get(cursor.parent)
        ?? byId.get(cursor.parent);
    }
    return ids;
  }, [byId, formerHouseById, formerLineageById, royalById, selectedFormer]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const normalized = query.trim().toLowerCase();
    const emperorResults = EMPERORS
      .filter((item) => !normalized || `${item.order}${item.badge ?? ""}${item.name}${item.reading}${item.era}${item.aliases ?? ""}`.toLowerCase().includes(normalized))
      .map((emperor) => ({ kind: "emperor" as const, emperor }));
    const royalResults = ROYAL_PEOPLE
      .filter((item) => !normalized || `${item.name}${item.reading}${item.title}${item.connection}`.toLowerCase().includes(normalized))
      .map((person) => ({ kind: "royal" as const, person }));
    const formerResults = showFormerHouses
      ? FORMER_HOUSES
          .filter((item) => !normalized || `${item.house}${item.reading}${item.founderLine}${item.members.map((member) => `${member.rank}${member.name}${member.reading}`).join("")}`.toLowerCase().includes(normalized))
          .map((house) => ({ kind: "former" as const, house }))
      : [];
    return [...emperorResults, ...royalResults, ...formerResults];
  }, [query, showFormerHouses]);
  const emperorMatches = useMemo(() => new Set(searchResults.filter((item) => item.kind === "emperor").map((item) => item.emperor.id)), [searchResults]);
  const royalMatches = useMemo(() => new Set(searchResults.filter((item) => item.kind === "royal").map((item) => item.person.id)), [searchResults]);
  const formerMatches = useMemo(() => new Set(searchResults.filter((item) => item.kind === "former").map((item) => item.house.id)), [searchResults]);

  const centerAt = (x: number, y: number, nextZoom: number, horizontalRatio = 0.43) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;
    const targetX = rect.width < 900 ? rect.width / 2 : rect.width * horizontalRatio;
    setOffset({
      x: targetX - x * nextZoom,
      y: rect.height * 0.46 - y * nextZoom,
    });
  };

  const centerOn = (emperor: Emperor, nextZoom = zoom) => {
    const pos = positionFor(emperor);
    centerAt(pos.x + 82, pos.y + 58, nextZoom);
  };

  const centerOnRoyal = (person: RoyalPerson, nextZoom = zoom) => {
    const pos = positionForRoyal(person);
    centerAt(pos.x + ROYAL_NODE_WIDTH / 2, pos.y + ROYAL_NODE_HEIGHT / 2, nextZoom);
  };

  const focusNode = (id: string, nextZoom?: number) => {
    const emperor = byId.get(id);
    if (!emperor) return;
    if (nextZoom) setZoom(nextZoom);
    lastEmperorRef.current = id;
    setSelectedId(id);
    setSelectedRoyalId("");
    setSelectedFormerId("");
    centerOn(emperor, nextZoom ?? zoom);
  };

  const focusRoyalPerson = (id: string, nextZoom?: number) => {
    const person = royalById.get(id);
    if (!person) return;
    const targetZoom = nextZoom ?? Math.max(zoom, 0.66);
    setZoom(targetZoom);
    setSelectedId("");
    setSelectedRoyalId(id);
    setSelectedFormerId("");
    centerOnRoyal(person, targetZoom);
  };

  const focusFormerOverview = () => {
    const width = viewportRef.current?.clientWidth ?? window.innerWidth;
    const nextZoom = width < 700 ? 0.3 : width < 1100 ? 0.38 : 0.43;
    setZoom(nextZoom);
    centerAt(FORMER_HOUSES_FOCUS.x, FORMER_HOUSES_FOCUS.y, nextZoom, 0.5);
  };

  const focusFormerHouse = (id: string, nextZoom?: number) => {
    const house = formerHouseById.get(id);
    if (!house) return;
    const targetZoom = nextZoom ?? Math.max(zoom, 0.54);
    setShowFormerHouses(true);
    setZoom(targetZoom);
    setSelectedId("");
    setSelectedRoyalId("");
    setSelectedFormerId(id);
    centerAt(house.x + FORMER_HOUSE_WIDTH / 2, house.y + 105, targetZoom, 0.43);
  };

  const toggleFormerHouses = () => {
    if (showFormerHouses) {
      setShowFormerHouses(false);
      setSelectedFormerId("");
      setSelectedRoyalId("");
      focusNode(lastEmperorRef.current || "126", window.innerWidth < 700 ? 0.52 : 0.62);
      return;
    }
    setShowFormerHouses(true);
    setSelectedId("");
    setSelectedRoyalId("");
    setSelectedFormerId("");
    requestAnimationFrame(focusFormerOverview);
  };

  useEffect(() => {
    const placeAtPresent = () => {
      const width = window.innerWidth;
      const nextZoom = width < 700 ? 0.52 : width < 1100 ? 0.57 : 0.62;
      const present = byId.get("126");
      setZoom(nextZoom);
      if (present) centerOn(present, nextZoom);
    };

    const frame = requestAnimationFrame(() => {
      viewportWidthRef.current = window.innerWidth;
      placeAtPresent();
    });
    const handleResize = () => {
      const width = window.innerWidth;
      // Mobile Safari changes only the viewport height when its browser chrome
      // appears or disappears. Re-centering in that case looks like a reload.
      if (Math.abs(width - viewportWidthRef.current) < 2) return;
      viewportWidthRef.current = width;
      placeAtPresent();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
    // The immutable graph map is intentionally the only dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [byId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedId("");
        setSelectedRoyalId("");
        setSelectedFormerId("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const profileText = selected
    ? selected.note ?? `${selected.name}天皇は${displayOrder(selected)}。在位は${selected.reign}で、${selected.era}の皇統に位置します。系図では${selected.parent ? `${lineageById.get(selected.parent)?.name ?? "先代皇統"}からつながる系譜` : "皇統の起点"}として表示しています。`
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
          <small>126代 ＋ 北朝 ＋ 皇子等{ROYAL_PEOPLE.length}人{showFormerHouses ? " ＋ 旧11宮家" : ""}</small>
        </div>
        <button
          type="button"
          className={`former-toggle ${showFormerHouses ? "is-on" : ""}`}
          aria-pressed={showFormerHouses}
          aria-label={showFormerHouses ? "旧11宮家を非表示にする" : "旧11宮家を表示する"}
          onClick={toggleFormerHouses}
        >
          <span className="toggle-lamp" aria-hidden="true" />
          <span><small>1947年離脱</small><strong>{showFormerHouses ? "旧宮家を非表示" : "旧宮家を表示"}</strong></span>
        </button>
        <form
          className="search-box"
          onSubmit={(event) => {
            event.preventDefault();
            const hit = searchResults[0];
            if (!hit) return;
            if (hit.kind === "emperor") focusNode(hit.emperor.id, Math.max(zoom, 0.62));
            else if (hit.kind === "royal") focusRoyalPerson(hit.person.id, Math.max(zoom, 0.66));
            else focusFormerHouse(hit.house.id, Math.max(zoom, 0.54));
          }}
        >
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              const hit = searchResults[0];
              if (hit?.kind === "emperor") focusNode(hit.emperor.id, Math.max(zoom, 0.62));
              if (hit?.kind === "royal") focusRoyalPerson(hit.person.id, Math.max(zoom, 0.66));
              if (hit?.kind === "former") focusFormerHouse(hit.house.id, Math.max(zoom, 0.54));
            }}
            placeholder={showFormerHouses ? "天皇名・皇子・親王・旧宮家から探す" : "天皇名・皇子・親王・王から探す"}
            aria-label={showFormerHouses ? "天皇名・皇子・親王・旧宮家から探す" : "天皇名・皇子・親王・王から探す"}
          />
          {query && <button type="button" onClick={() => setQuery("")} aria-label="検索をクリア">×</button>}
          {query && <em>{searchResults.length}</em>}
          {query && (
            <div className="search-results" role="listbox" aria-label="検索候補">
              {searchResults.slice(0, 6).map((item) => (
                <button
                  key={item.kind === "emperor" ? `emperor-${item.emperor.id}` : item.kind === "royal" ? `royal-${item.person.id}` : `former-${item.house.id}`}
                  type="button"
                  className={item.kind === "emperor" && isFemaleEmperor(item.emperor) ? "is-female" : item.kind === "royal" ? "is-royal" : undefined}
                  onClick={() => {
                    if (item.kind === "emperor") focusNode(item.emperor.id, Math.max(zoom, 0.62));
                    else if (item.kind === "royal") focusRoyalPerson(item.person.id, Math.max(zoom, 0.66));
                    else focusFormerHouse(item.house.id, Math.max(zoom, 0.54));
                    setQuery("");
                  }}
                  aria-label={item.kind === "emperor" ? `${item.emperor.name}天皇へ移動` : item.kind === "royal" ? `${item.person.name}へ移動` : `${item.house.house}へ移動`}
                >
                  {item.kind === "emperor" ? (
                    <>
                      <span>{item.emperor.badge ?? `第${item.emperor.order}代`}</span>
                      <strong>{item.emperor.name}</strong>
                      <small>{item.emperor.reign}</small>
                    </>
                  ) : item.kind === "royal" ? (
                    <>
                      <span>{item.person.title} · 系図接続</span>
                      <strong>{item.person.name}</strong>
                      <small>{item.person.reading}</small>
                    </>
                  ) : (
                    <>
                      <span>旧宮家</span>
                      <strong>{item.house.house}</strong>
                      <small>{item.house.members.length ? `第${item.house.members[0].rank}位〜` : "男子順位なし"}</small>
                    </>
                  )}
                </button>
              ))}
              {searchResults.length === 0 && <p>該当する系譜が見つかりません</p>}
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
            const next = Math.min(1.25, Math.max(0.24, current - event.deltaY * 0.0008));
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
              <linearGradient id="lineFormer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#8fc4c0" stopOpacity=".78" />
                <stop offset="1" stopColor="#365f62" stopOpacity=".3" />
              </linearGradient>
              <linearGradient id="lineRoyal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#b7a1df" stopOpacity=".82" />
                <stop offset="1" stopColor="#584875" stopOpacity=".32" />
              </linearGradient>
              <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="formerGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="royalGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {[...EMPERORS, ...ROYAL_PEOPLE].filter((item) => item.parent).map((item) => {
              const parent = lineageById.get(item.parent!);
              if (!parent) return null;
              const active = activePath.has(item.id) && activePath.has(parent.id);
              const royalSegment = isRoyalPerson(item) || isRoyalPerson(parent);
              return (
                <g key={`${parent.id}-${item.id}`}>
                  <path className="edge-shadow" d={edgePath(parent, item)} />
                  <path className={`edge ${royalSegment ? "royal-edge" : ""} ${active ? "edge-active" : ""}`} d={edgePath(parent, item)} />
                </g>
              );
            })}
            {showFormerHouses && [...FORMER_LINEAGE_NODES, ...FORMER_HOUSES].map((item) => {
              const emperorParent = byId.get(item.parent);
              const royalParent = royalById.get(item.parent);
              const lineageParent = formerLineageById.get(item.parent);
              const houseParent = formerHouseById.get(item.parent);
              const from = emperorParent
                ? (() => { const pos = positionFor(emperorParent); return { x: pos.x + 82, y: pos.y + 116 }; })()
                : royalParent
                  ? (() => { const pos = positionForRoyal(royalParent); return { x: pos.x + ROYAL_NODE_WIDTH / 2, y: pos.y + ROYAL_NODE_HEIGHT }; })()
                  : lineageParent
                  ? { x: lineageParent.x + FORMER_NODE_WIDTH / 2, y: lineageParent.y + (lineageParent.kind === "gap" ? 54 : FORMER_NODE_HEIGHT) }
                  : houseParent
                    ? { x: houseParent.x + FORMER_HOUSE_WIDTH / 2, y: houseParent.y + 190 }
                    : undefined;
              if (!from) return null;
              const to = {
                x: item.x + ("house" in item ? FORMER_HOUSE_WIDTH / 2 : FORMER_NODE_WIDTH / 2),
                y: item.y,
              };
              const active = activeFormerPath.has(item.id) && activeFormerPath.has(item.parent);
              return (
                <g key={`former-edge-${item.id}`}>
                  <path className="former-edge-shadow" d={branchEdgePath(from, to)} />
                  <path className={`former-edge ${active ? "former-edge-active" : ""}`} d={branchEdgePath(from, to)} />
                </g>
              );
            })}
          </svg>

          {EMPERORS.map((emperor) => {
            const pos = positionFor(emperor);
            const active = activePath.has(emperor.id);
            const dimmed = query.trim() !== "" && !emperorMatches.has(emperor.id);
            const spokenOrder = emperor.badge ?? `第${emperor.order}代`;
            return (
              <button
                key={emperor.id}
                className={`emperor-node ${active ? "is-active" : ""} ${selectedId === emperor.id ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""} ${emperor.badge ? "is-northern" : ""} ${isFemaleEmperor(emperor) ? "is-female" : ""}`}
                style={{ left: pos.x, top: pos.y, transform: `translateZ(${pos.z}px)` }}
                onClick={(event) => {
                  event.stopPropagation();
                  lastEmperorRef.current = emperor.id;
                  setSelectedId(emperor.id);
                  setSelectedRoyalId("");
                  setSelectedFormerId("");
                }}
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

          {ROYAL_PEOPLE.map((person) => {
            const pos = positionForRoyal(person);
            const active = activePath.has(person.id) || activeFormerPath.has(person.id);
            const dimmed = query.trim() !== "" && !royalMatches.has(person.id);
            return (
              <button
                key={person.id}
                type="button"
                className={`royal-node ${active ? "is-active" : ""} ${selectedRoyalId === person.id ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
                style={{ left: pos.x, top: pos.y, transform: `translateZ(${pos.z}px)` }}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId("");
                  setSelectedRoyalId(person.id);
                  setSelectedFormerId("");
                }}
                aria-label={`${person.name}。${person.title}。${person.connection}`}
              >
                <span>{person.title} · 宮内庁系図</span>
                <strong className={person.name.length > 7 ? "is-long" : ""}>{person.name}</strong>
                <small>{person.reading}</small>
                <i aria-hidden="true" />
              </button>
            );
          })}

          {showFormerHouses && (
            <div className="former-house-layer">
              <div className="former-zone-title" style={{ left: 2150, top: 14100 }}>
                <span>COLLATERAL BRANCH · 1947</span>
                <strong>旧11宮家</strong>
                <small>崇光天皇 — 伏見宮系統</small>
              </div>

              {FORMER_LINEAGE_NODES.map((node) => (
                <div
                  key={node.id}
                  className={`former-ancestor-node ${node.kind === "gap" ? "is-gap" : ""} ${activeFormerPath.has(node.id) ? "is-active" : ""}`}
                  style={{ left: node.x, top: node.y }}
                  role="group"
                  aria-label={`${node.label} ${node.name}${node.reading ? `（${node.reading}）` : ""}`}
                  title={node.note}
                >
                  <span>{node.label}</span>
                  <strong>{node.name}</strong>
                  {node.reading && <small>{node.reading}</small>}
                  <i aria-hidden="true" />
                </div>
              ))}

              {FORMER_HOUSES.map((house) => {
                const dimmed = query.trim() !== "" && !formerMatches.has(house.id);
                return (
                  <button
                    key={house.id}
                    type="button"
                    className={`former-house-card ${selectedFormerId === house.id ? "is-selected" : ""} ${activeFormerPath.has(house.id) ? "is-active" : ""} ${dimmed ? "is-dimmed" : ""}`}
                    style={{ left: house.x, top: house.y }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedId("");
                      setSelectedRoyalId("");
                      setSelectedFormerId(house.id);
                    }}
                    aria-label={`${house.house}。${house.members.length ? `1947年の男子皇位継承順位は${house.members.map((member) => `第${member.rank}位${member.name}`).join("、")}` : house.status}`}
                  >
                    <span className="former-card-kicker">旧宮家 · 1947年皇籍離脱</span>
                    <span className="former-card-title"><strong>{house.house}</strong><small>{house.reading}</small></span>
                    <span className="former-card-lineage">{house.founderLine}</span>
                    {house.members.length > 0 ? (
                      <span className="former-member-grid">
                        {house.members.map((member) => (
                          <span key={`${house.id}-${member.rank}`} className="former-member">
                            <em>第{member.rank}位</em><strong>{member.name}</strong>
                          </span>
                        ))}
                      </span>
                    ) : (
                      <span className="former-empty-status">男子の順位なし</span>
                    )}
                    <span className="former-card-foot">1947年10月14日離脱時</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <nav className="era-nav" aria-label="時代から移動">
          {ERA_JUMPS.map((jump) => <button key={jump.id} onClick={() => focusNode(jump.id, 0.58)}>{jump.label}</button>)}
          {showFormerHouses && <button className="former-jump" onClick={focusFormerOverview}>旧宮家</button>}
        </nav>

        <div className="viewport-caption">
          <span className={`live-dot ${showFormerHouses ? "is-former" : ""}`} />
          <div>
            <strong>{showFormerHouses ? "旧11宮家を探索" : "系譜を探索"}</strong>
            <small>ドラッグで移動 · スクロールで拡大</small>
          </div>
        </div>

        <div className="lineage-legend" aria-label="色分けの凡例">
          <span><i className="legend-emperor" />歴代天皇</span>
          <span><i className="legend-female" />女性天皇名（8人・10代）</span>
          <span><i className="legend-royal" />皇子・親王・王など（{ROYAL_PEOPLE.length}人）</span>
          {showFormerHouses && <span><i className="legend-former" />旧宮家</span>}
          {showFormerHouses && <small>順位は1947年の皇籍離脱直前</small>}
        </div>

        <div className="zoom-controls" aria-label="表示倍率">
          <button onClick={() => setZoom((value) => Math.min(1.25, value + 0.1))} aria-label="拡大">＋</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((value) => Math.max(0.24, value - 0.1))} aria-label="縮小">−</button>
          <button className="fit-button" onClick={() => focusNode("126", 0.62)}>今上</button>
        </div>

        {selected && (
          <aside className={`profile-card ${isFemaleEmperor(selected) ? "is-female" : ""}`} aria-live="polite" aria-label={`${selected.name}天皇の解説`}>
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

        {selectedRoyal && (
          <aside className="profile-card royal-profile" aria-live="polite" aria-label={`${selectedRoyal.name}の解説`}>
            <button className="card-close" onClick={() => setSelectedRoyalId("")} aria-label="解説を閉じる">×</button>
            <div className="card-kicker"><span>宮内庁「天皇系図」</span><span>第{selectedRoyal.sourcePage}頁</span></div>
            <div className="portrait-seal royal-seal" aria-hidden="true">
              <span>{selectedRoyal.name.slice(0, 1)}</span>
              <i />
            </div>
            <h2 className={selectedRoyal.name.length > 7 ? "card-title-long" : ""}>{selectedRoyal.name}</h2>
            <p className="reading">{selectedRoyal.reading}</p>
            <p className="profile-tag royal-tag">{selectedRoyal.title} · 系図接続人物</p>
            <dl>
              <div><dt>区分</dt><dd>{selectedRoyal.title}</dd></div>
              <div><dt>接続</dt><dd>{selectedRoyal.connection}</dd></div>
            </dl>
            <p className="profile-note">{selectedRoyal.note}</p>
            <div className="royal-source-note"><span>出典</span><p>宮内庁「天皇系図」掲載の表記と接続関係に基づきます。</p></div>
          </aside>
        )}

        {selectedFormer && (
          <aside className="profile-card former-profile" aria-live="polite" aria-label={`${selectedFormer.house}の解説`}>
            <button className="card-close" onClick={() => setSelectedFormerId("")} aria-label="解説を閉じる">×</button>
            <div className="card-kicker"><span>旧11宮家</span><span>1947.10.14</span></div>
            <div className="portrait-seal former-seal" aria-hidden="true">
              <span>{selectedFormer.house.slice(0, 1)}</span>
              <i />
            </div>
            <h2 className={selectedFormer.house.length > 4 ? "card-title-long" : ""}>{selectedFormer.house}</h2>
            <p className="reading">{selectedFormer.reading}</p>
            <p className="profile-tag former-tag">伏見宮系統 · 旧宮家</p>
            <dl>
              <div><dt>分岐</dt><dd>{selectedFormer.founderLine}</dd></div>
              <div><dt>離脱</dt><dd>1947年10月14日</dd></div>
            </dl>
            <p className="profile-note">{selectedFormer.note}</p>
            {selectedFormer.members.length > 0 ? (
              <div className="former-profile-members">
                <strong>当時の男子皇位継承順位</strong>
                <div>
                  {selectedFormer.members.map((member) => (
                    <span key={`profile-${selectedFormer.id}-${member.rank}`}><em>第{member.rank}位</em>{member.name}<small>{member.reading}</small></span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="former-profile-members is-empty"><strong>当時の状況</strong><p>{selectedFormer.status}</p></div>
            )}
            <div className="historical-notice"><span>史料表示</span><p>順位は内閣官房の2021年資料に基づく歴史上の表示です。</p></div>
          </aside>
        )}
      </section>

      <footer className="source-note">
        <p>宮内庁「天皇系図」を基礎に、系図上の皇子・親王・王なども収録。旧宮家の中間当主は一部省略。</p>
        <nav aria-label="出典">
          <a href="https://www.kunaicho.go.jp/learn/about/kosei/keizu.html" target="_blank" rel="noreferrer">宮内庁 ↗</a>
          <a href="https://www.cas.go.jp/jp/seisaku/taii_tokurei/dai11/siryou2.pdf" target="_blank" rel="noreferrer">内閣官房 ↗</a>
        </nav>
      </footer>
    </main>
  );
}
