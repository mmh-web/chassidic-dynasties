import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { figures, dynastyColors } from './data/dynasties';
import { branches } from './data/branches';
import { connections } from './data/connections';
import { activeToday } from './data/today';

// Build a lookup and tree from figures
function buildLookup() {
  const byId = {};
  figures.forEach(f => byId[f.id] = { ...f, children: [] });
  figures.forEach(f => {
    if (f.parentId && byId[f.parentId]) {
      byId[f.parentId].children.push(byId[f.id]);
    }
  });
  Object.values(byId).forEach(node => {
    node.children.sort((a, b) => a.years[0] - b.years[0]);
  });
  return byId;
}

// Build lookup: figure ID → connections involving that figure
function buildConnectionIndex() {
  const index = {};
  connections.forEach(conn => {
    conn.figureIds.forEach(fId => {
      if (!index[fId]) index[fId] = [];
      index[fId].push(conn);
    });
  });
  return index;
}

// Build lookup: branch ID → today data
function buildTodayIndex() {
  const index = {};
  activeToday.forEach(d => {
    index[d.branchId] = d;
  });
  return index;
}

const connectionIndex = buildConnectionIndex();
const todayIndex = buildTodayIndex();

// ============================================================
// CONNECTION TYPE CONFIG
// ============================================================
const connectionTypeConfig = {
  rivalry: { label: 'Rivalry', icon: '⚔️', color: '#ef4444' },
  marriage: { label: 'Family Tie', icon: '💍', color: '#a78bfa' },
  split: { label: 'Succession Crisis', icon: '🔱', color: '#f59e0b' },
  holocaust: { label: 'Holocaust & Rebuilding', icon: '🕯️', color: '#9ca3af' },
  influence: { label: 'Influence', icon: '✦', color: '#34d399' },
};

// ============================================================
// SEARCH BAR
// ============================================================
function SearchBar({ byId, onSelectFigure, onSelectBranch, setView }) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const figureResults = Object.values(byId)
      .filter(f => {
        return f.name.toLowerCase().includes(q) ||
          f.title?.toLowerCase().includes(q) ||
          f.hebrew?.includes(query) ||
          f.court?.toLowerCase().includes(q) ||
          f.dynasty?.toLowerCase().includes(q);
      })
      .slice(0, 8)
      .map(f => ({ type: 'figure', item: f }));

    const branchResults = branches
      .filter(b => b.name.toLowerCase().includes(q) || b.subtitle.toLowerCase().includes(q))
      .slice(0, 3)
      .map(b => ({ type: 'branch', item: b }));

    return [...branchResults, ...figureResults];
  }, [query, byId]);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search rebbes, courts, dynasties..."
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-white/30 focus:bg-white/8 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-[#151520] border border-white/10 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
          {results.map((r, i) => {
            if (r.type === 'branch') {
              return (
                <button
                  key={`b-${r.item.id}`}
                  onClick={() => {
                    onSelectBranch(r.item.id);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 border-b border-white/5"
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.item.color }} />
                  <div>
                    <div className="text-sm font-medium text-white">{r.item.name}</div>
                    <div className="text-xs text-gray-500">{r.item.subtitle}</div>
                  </div>
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-gray-600">Branch</span>
                </button>
              );
            }
            const f = r.item;
            const color = dynastyColors[f.dynasty] || '#9ca3af';
            const parentBranch = branches.find(b =>
              b.rootIds.some(rootId => {
                function isDescendant(nodeId) {
                  if (nodeId === f.id) return true;
                  const node = byId[nodeId];
                  return node?.children?.some(c => isDescendant(c.id));
                }
                return isDescendant(rootId);
              })
            );
            return (
              <button
                key={`f-${f.id}`}
                onClick={() => {
                  if (parentBranch) {
                    setView(parentBranch.id);
                  }
                  onSelectFigure(f);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                <div className="min-w-0">
                  <div className="text-sm font-medium" style={{ color }}>{f.title || f.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {f.court} · {f.years[0]}–{f.years[1] || 'present'}
                    {f.dynasty && ` · ${f.dynasty}`}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-[#151520] border border-white/10 rounded-lg shadow-2xl z-50 p-4 text-center text-gray-500 text-sm">
          No results for "{query}"
        </div>
      )}
    </div>
  );
}

// ============================================================
// FIGURE CARD — used in both overview and detail views
// ============================================================
function FigureCard({ figure, onClick, isSelected, size = 'normal', showArrow = false, hasStories = false }) {
  const color = dynastyColors[figure.dynasty] || '#9ca3af';
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  return (
    <div
      onClick={() => onClick?.(figure)}
      className={`
        relative rounded-lg border-2 cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0f]' : ''}
        ${isLarge ? 'px-5 py-4' : isSmall ? 'px-3 py-2' : 'px-4 py-3'}
        hover:scale-[1.02] hover:brightness-125
      `}
      style={{
        borderColor: color + '60',
        background: color + '12',
        ringColor: color,
      }}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-lg"
        style={{ background: color }}
      />

      {/* Story indicator dot */}
      {hasStories && !isSmall && (
        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400/70" title="Has stories" />
      )}

      {/* Title */}
      <div
        className={`font-bold leading-tight ${isLarge ? 'text-lg' : isSmall ? 'text-xs' : 'text-sm'}`}
        style={{ color }}
      >
        {figure.title || figure.name}
      </div>

      {/* Hebrew */}
      <div
        className={`opacity-60 ${isLarge ? 'text-base' : isSmall ? 'text-[10px]' : 'text-xs'}`}
        style={{ fontFamily: "'Frank Ruhl Libre', serif", color }}
      >
        {figure.hebrew}
      </div>

      {/* Years + Court */}
      <div className={`text-gray-400 mt-1 ${isLarge ? 'text-sm' : 'text-[10px]'}`}>
        {figure.years[0]}–{figure.years[1] || 'present'} · {figure.court}
      </div>

      {showArrow && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
          ›
        </div>
      )}
    </div>
  );
}

// ============================================================
// VERTICAL CONNECTOR
// ============================================================
function VerticalConnector({ color = '#374151' }) {
  return (
    <div className="flex justify-center" style={{ height: 24 }}>
      <div className="w-[2px] h-full" style={{ background: color + '50' }} />
    </div>
  );
}

// ============================================================
// OVERVIEW VIEW — The Big Picture
// ============================================================
function OverviewView({ byId, onSelectBranch, onSelectFigure }) {
  const besht = byId['besht'];
  const maggid = byId['maggid'];

  return (
    <div className="flex flex-col items-center py-8 px-4 max-w-6xl mx-auto">
      {/* BESHT */}
      <FigureCard figure={besht} onClick={onSelectFigure} size="large" />

      <VerticalConnector color="#f59e0b" />

      {/* MAGGID */}
      <FigureCard figure={maggid} onClick={onSelectFigure} size="large" />

      <VerticalConnector color="#f59e0b" />

      <div className="w-full mb-6">
        <p className="text-center text-gray-600 text-xs mb-3 uppercase tracking-widest">
          The Maggid's students spread Chassidus across Eastern Europe
        </p>
      </div>

      {/* BRANCH CARDS with Today info integrated */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {branches.map(branch => {
          const gateway = byId[branch.gatewayId];
          if (!gateway) return null;
          const today = todayIndex[branch.id];

          return (
            <button
              key={branch.id}
              onClick={() => onSelectBranch(branch.id)}
              className="text-left rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02] hover:brightness-110 group"
              style={{
                borderColor: branch.color + '40',
                background: branch.color + '08',
              }}
            >
              {/* Branch header */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ background: branch.color }} />
                <span className="font-bold text-white text-sm">{branch.name}</span>
              </div>

              {/* Subtitle */}
              <div className="text-xs mb-2" style={{ color: branch.color }}>
                {branch.subtitle}
              </div>

              {/* Gateway figure */}
              <div className="text-xs text-gray-400 mb-2">
                <span className="text-gray-300 font-medium">{gateway.title}</span>
                {' '}
                <span style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                  {gateway.hebrew}
                </span>
                <br />
                {gateway.years[0]}–{gateway.years[1] || 'present'}
              </div>

              {/* Description */}
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2 mb-2">
                {branch.description}
              </p>

              {/* TODAY STATUS — integrated into branch card */}
              {today && (
                <div className="border-t pt-2 mt-1" style={{ borderColor: branch.color + '15' }}>
                  <div className="text-[10px] text-gray-400 leading-relaxed">
                    <span className="text-gray-300 font-medium">Today:</span>{' '}
                    {today.headquarters}
                    {today.estimatedFollowers && (
                      <span className="text-gray-500"> · {today.estimatedFollowers}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Explore arrow */}
              <div
                className="text-xs mt-2 font-medium group-hover:translate-x-1 transition-transform"
                style={{ color: branch.color }}
              >
                Explore lineage →
              </div>
            </button>
          );
        })}
      </div>

      {/* Breslov note */}
      <div className="mt-6 text-center text-xs text-gray-600 max-w-xl">
        <strong className="text-gray-400">Note:</strong> Rebbe Nachman of Breslov was the Besht's great-grandson (not through the Maggid).
        He is the only dynasty founder who declared no successor — Breslov Chassidim have no living rebbe.
      </div>
    </div>
  );
}

// ============================================================
// DETAIL VIEW — Full lineage of one branch
// ============================================================
function DetailView({ branchId, byId, onBack, onSelectFigure, selectedFigure }) {
  const branch = branches.find(b => b.id === branchId);
  const scrollRef = useRef(null);
  const today = todayIndex[branchId];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [branchId]);

  if (!branch) return null;

  // Build the visual tree recursively
  function TreeNode({ nodeId, depth = 0 }) {
    const node = byId[nodeId];
    if (!node) return null;
    const color = dynastyColors[node.dynasty] || branch.color;
    const children = node.children || [];
    const isSelected = selectedFigure?.id === node.id;
    const figureConnections = connectionIndex[node.id];
    const hasStories = figureConnections && figureConnections.length > 0;

    return (
      <div className="flex flex-col items-center">
        <FigureCard
          figure={node}
          onClick={onSelectFigure}
          isSelected={isSelected}
          size={depth === 0 ? 'large' : children.length > 0 ? 'normal' : 'small'}
          hasStories={hasStories}
        />

        {children.length > 0 && (
          <>
            <VerticalConnector color={color} />
            {children.length === 1 ? (
              <TreeNode nodeId={children[0].id} depth={depth + 1} />
            ) : (
              <div className="relative">
                <div
                  className="h-[2px] mx-8"
                  style={{ background: color + '35' }}
                />
                <div className="flex gap-6 items-start justify-center">
                  {children.map(child => (
                    <div key={child.id} className="flex flex-col items-center">
                      <VerticalConnector color={dynastyColors[child.dynasty] || color} />
                      <TreeNode nodeId={child.id} depth={depth + 1} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className="py-6 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-300 text-sm mb-3 flex items-center gap-1 transition-colors"
        >
          ← Back to overview
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-4 h-4 rounded-full" style={{ background: branch.color }} />
          <h1 className="text-2xl font-bold text-white">{branch.name}</h1>
          <span className="text-sm" style={{ color: branch.color }}>{branch.subtitle}</span>
        </div>

        <p className="text-gray-400 text-sm max-w-3xl">{branch.description}</p>

        {/* Today status bar — right in the branch header */}
        {today && (
          <div
            className="mt-3 inline-flex items-center gap-4 flex-wrap px-4 py-2 rounded-lg"
            style={{ background: branch.color + '0a', border: `1px solid ${branch.color}18` }}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: branch.color }}>
              Today
            </span>
            <span className="text-xs text-gray-300">
              📍 {today.headquarters}
            </span>
            {today.currentRebbe && (
              <span className="text-xs text-gray-400">
                Rebbe: <span className="text-gray-300">{today.currentRebbe}</span>
              </span>
            )}
            {!today.currentRebbe && today.rebbeNote && (
              <span className="text-xs text-gray-500 italic">{today.rebbeNote}</span>
            )}
            <span className="text-xs text-gray-500">
              {today.estimatedFollowers}
            </span>
            {today.knownFor && (
              <span className="text-xs text-gray-500 hidden lg:inline">
                · {today.knownFor}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tree */}
      <div ref={scrollRef} className="overflow-x-auto pb-8">
        <div className="flex flex-col items-center min-w-fit px-8">
          {branch.rootIds.map(rootId => (
            <TreeNode key={rootId} nodeId={rootId} depth={0} />
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selectedFigure && (
        <DetailPanel
          figure={selectedFigure}
          color={branch.color}
          onClose={() => onSelectFigure(null)}
          byId={byId}
        />
      )}
    </div>
  );
}

// ============================================================
// DETAIL PANEL — bio + stories + today info for clicked figure
// ============================================================
function DetailPanel({ figure, color, onClose, byId }) {
  const figColor = dynastyColors[figure.dynasty] || color;
  const figureConnections = connectionIndex[figure.id] || [];

  // Find today data if this figure is referenced
  const todayData = activeToday.find(d => d.figureId === figure.id);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t backdrop-blur-md overflow-y-auto"
      style={{
        background: '#0f0f17ee',
        borderColor: figColor + '40',
        maxHeight: '55vh',
      }}
    >
      <div className="max-w-4xl mx-auto p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: figColor }} />
              <h2 className="text-xl font-bold" style={{ color: figColor }}>
                {figure.title || figure.name}
              </h2>
              <span className="text-lg opacity-60" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                {figure.hebrew}
              </span>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400 mb-3">
              <span><strong className="text-gray-300">Name:</strong> {figure.name}</span>
              <span><strong className="text-gray-300">Court:</strong> {figure.court}</span>
              <span><strong className="text-gray-300">Dynasty:</strong> {figure.dynasty}</span>
              <span><strong className="text-gray-300">Years:</strong> {figure.years[0]}–{figure.years[1] || 'present'}</span>
              {figure.relation && (
                <span><strong className="text-gray-300">Relation:</strong> {figure.relation}</span>
              )}
            </div>

            {/* Bio */}
            <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">
              {figure.notes}
            </p>

            {/* TODAY section — for current/recent rebbes */}
            {todayData && (
              <div
                className="mt-4 rounded-lg px-4 py-3"
                style={{ background: figColor + '0a', border: `1px solid ${figColor}18` }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: figColor }}>
                  This Dynasty Today
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                  <div className="text-gray-400">
                    <strong className="text-gray-300">HQ:</strong> {todayData.headquarters}
                  </div>
                  <div className="text-gray-400">
                    <strong className="text-gray-300">Followers:</strong> {todayData.estimatedFollowers}
                  </div>
                  <div className="text-gray-400 sm:col-span-2">
                    <strong className="text-gray-300">Known for:</strong> {todayData.knownFor}
                  </div>
                  {todayData.majorCenters.length > 0 && (
                    <div className="sm:col-span-2 flex flex-wrap gap-1.5 mt-1">
                      {todayData.majorCenters.map(c => (
                        <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CONNECTIONS — stories involving this figure */}
            {figureConnections.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Stories & Connections
                </div>
                <div className="space-y-2">
                  {figureConnections.map(conn => {
                    const config = connectionTypeConfig[conn.type];
                    return (
                      <div
                        key={conn.id}
                        className="rounded-lg px-3 py-2.5"
                        style={{
                          background: config.color + '08',
                          border: `1px solid ${config.color}15`,
                        }}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{config.icon}</span>
                          <h4 className="text-xs font-bold text-white">{conn.title}</h4>
                          <span
                            className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                            style={{ color: config.color, background: config.color + '15' }}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{conn.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none px-2 flex-shrink-0 sticky top-0"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP — State management and routing
// ============================================================
export default function App() {
  const [view, setView] = useState('overview');
  const [selectedFigure, setSelectedFigure] = useState(null);

  const byId = useMemo(() => buildLookup(), []);

  const handleSelectBranch = useCallback((branchId) => {
    setView(branchId);
    setSelectedFigure(null);
  }, []);

  const handleBack = useCallback(() => {
    setView('overview');
    setSelectedFigure(null);
  }, []);

  const handleSelectFigure = useCallback((figure) => {
    if (figure === null || selectedFigure?.id === figure.id) {
      setSelectedFigure(null);
    } else {
      setSelectedFigure(figure);
    }
  }, [selectedFigure]);

  const isDetailView = view !== 'overview';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          <h1
            className="text-lg font-bold text-white tracking-tight cursor-pointer hover:text-amber-400 transition-colors flex-shrink-0"
            onClick={() => { setView('overview'); setSelectedFigure(null); }}
          >
            Chassidic Dynasties
          </h1>

          <div className="ml-auto flex-shrink-0 w-64 lg:w-80">
            <SearchBar
              byId={byId}
              onSelectFigure={handleSelectFigure}
              onSelectBranch={handleSelectBranch}
              setView={setView}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      {isDetailView ? (
        <DetailView
          branchId={view}
          byId={byId}
          onBack={handleBack}
          onSelectFigure={handleSelectFigure}
          selectedFigure={selectedFigure}
        />
      ) : (
        <OverviewView
          byId={byId}
          onSelectBranch={handleSelectBranch}
          onSelectFigure={handleSelectFigure}
        />
      )}
    </div>
  );
}
