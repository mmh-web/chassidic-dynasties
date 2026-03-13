import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { figures, dynastyColors } from './data/dynasties';
import { branches } from './data/branches';
import { connections } from './data/connections';
import { activeToday, geographicClusters } from './data/today';

// Build a lookup and tree from figures
function buildLookup() {
  const byId = {};
  figures.forEach(f => byId[f.id] = { ...f, children: [] });
  figures.forEach(f => {
    if (f.parentId && byId[f.parentId]) {
      byId[f.parentId].children.push(byId[f.id]);
    }
  });
  // Sort children by birth year
  Object.values(byId).forEach(node => {
    node.children.sort((a, b) => a.years[0] - b.years[0]);
  });
  return byId;
}

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

  // Close on outside click
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
            // Find which branch this figure belongs to
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
function FigureCard({ figure, onClick, isSelected, size = 'normal', showArrow = false }) {
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

      {/* Arrow indicator for branches */}
      {showArrow && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
          ›
        </div>
      )}
    </div>
  );
}

// ============================================================
// VERTICAL CONNECTOR — draws the org-chart lines
// ============================================================
function VerticalConnector({ color = '#374151' }) {
  return (
    <div className="flex justify-center" style={{ height: 24 }}>
      <div className="w-[2px] h-full" style={{ background: color + '50' }} />
    </div>
  );
}

function HorizontalBranch({ children, color = '#374151' }) {
  const count = Array.isArray(children) ? children.length : 0;
  if (count <= 1) return <>{children}</>;

  return (
    <div className="relative">
      <div className="absolute top-0 left-[10%] right-[10%] h-[2px]" style={{ background: color + '40' }} />
      <div className="flex justify-center gap-4 flex-wrap">
        {children}
      </div>
    </div>
  );
}

// ============================================================
// NAV TABS — top navigation
// ============================================================
function NavTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'overview', label: 'Dynasty Tree' },
    { id: 'connections', label: 'Connections' },
    { id: 'today', label: 'Today' },
  ];

  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
            activeTab === tab.id
              ? 'bg-white/10 text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// CONNECTIONS VIEW
// ============================================================
function ConnectionsView({ byId, onSelectBranch }) {
  const [activeType, setActiveType] = useState(null);

  const filtered = activeType
    ? connections.filter(c => c.type === activeType)
    : connections;

  const types = Object.entries(connectionTypeConfig);

  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-1 tracking-tight text-center">
        Connections & Stories
      </h1>
      <p className="text-gray-500 text-sm mb-6 text-center">
        Rivalries, family ties, tragedies, and the threads that link dynasties together
      </p>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        <button
          onClick={() => setActiveType(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeType === null
              ? 'bg-white/15 text-white'
              : 'bg-white/5 text-gray-500 hover:text-gray-300'
          }`}
        >
          All
        </button>
        {types.map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveType(activeType === key ? null : key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeType === key
                ? 'text-white'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            style={{
              background: activeType === key ? config.color + '25' : 'rgba(255,255,255,0.05)',
              borderColor: activeType === key ? config.color + '40' : 'transparent',
            }}
          >
            <span>{config.icon}</span>
            {config.label}
          </button>
        ))}
      </div>

      {/* Connection cards */}
      <div className="space-y-4">
        {filtered.map(conn => {
          const config = connectionTypeConfig[conn.type];
          const involvedFigures = conn.figureIds.map(id => byId[id]).filter(Boolean);
          const relatedBranchData = conn.relatedBranches
            .map(bId => branches.find(b => b.id === bId))
            .filter(Boolean);

          return (
            <div
              key={conn.id}
              className="rounded-xl border p-5 transition-all hover:border-opacity-60"
              style={{
                borderColor: config.color + '30',
                background: config.color + '06',
              }}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xl">{config.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white">{conn.title}</h3>
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ color: config.color, background: config.color + '15' }}
                    >
                      {config.label}
                    </span>
                  </div>

                  {/* Involved figures */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {involvedFigures.map(f => {
                      const fColor = dynastyColors[f.dynasty] || '#9ca3af';
                      return (
                        <span
                          key={f.id}
                          className="text-xs px-2 py-0.5 rounded-full border"
                          style={{ color: fColor, borderColor: fColor + '40', background: fColor + '10' }}
                        >
                          {f.title || f.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-300 text-sm leading-relaxed mb-3">
                {conn.description}
              </p>

              {/* Related branches */}
              <div className="flex flex-wrap gap-2">
                {relatedBranchData.map(b => (
                  <button
                    key={b.id}
                    onClick={() => onSelectBranch(b.id)}
                    className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
                    style={{ color: b.color }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ background: b.color }} />
                    {b.name} →
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// TODAY VIEW
// ============================================================
function TodayView({ byId, onSelectBranch, onSelectFigure }) {
  return (
    <div className="py-8 px-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-1 tracking-tight text-center">
        Chassidus Today
      </h1>
      <p className="text-gray-500 text-sm mb-8 text-center">
        Active dynasties, where they live, and what makes each one unique
      </p>

      {/* Geographic clusters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {geographicClusters.map(cluster => (
          <div
            key={cluster.region}
            className="rounded-lg border border-white/10 bg-white/3 p-3"
          >
            <div className="text-xs font-bold text-white mb-1">📍 {cluster.region}</div>
            <div className="text-[11px] text-gray-400 leading-relaxed">
              {cluster.groups.join(', ')}
            </div>
            <div className="text-[10px] text-gray-600 mt-1 italic">{cluster.note}</div>
          </div>
        ))}
      </div>

      {/* Dynasty cards */}
      <div className="space-y-3">
        {activeToday.map(dynasty => {
          const figure = byId[dynasty.figureId];
          return (
            <div
              key={dynasty.id}
              className="rounded-xl border p-4 transition-all hover:border-opacity-60"
              style={{
                borderColor: dynasty.color + '25',
                background: dynasty.color + '05',
              }}
            >
              <div className="flex items-start gap-4 flex-wrap lg:flex-nowrap">
                {/* Left: Identity */}
                <div className="flex-shrink-0 w-full lg:w-56">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: dynasty.color }} />
                    <h3 className="text-lg font-bold" style={{ color: dynasty.color }}>
                      {dynasty.name}
                    </h3>
                  </div>

                  {dynasty.currentRebbe ? (
                    <div className="text-xs text-gray-300 mb-1">
                      <strong className="text-gray-200">Rebbe:</strong> {dynasty.currentRebbe}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 italic mb-1">{dynasty.rebbeNote}</div>
                  )}

                  <div className="text-xs text-gray-500">
                    <strong className="text-gray-400">Est. followers:</strong> {dynasty.estimatedFollowers}
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-2">
                    <strong className="text-gray-300">HQ:</strong> {dynasty.headquarters}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {dynasty.majorCenters.map(center => (
                      <span
                        key={center}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400"
                      >
                        {center}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    <strong className="text-gray-200">Known for:</strong> {dynasty.knownFor}
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="flex-shrink-0 flex gap-2 items-start">
                  {figure && (
                    <button
                      onClick={() => {
                        onSelectBranch(dynasty.branchId);
                        onSelectFigure(figure);
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg border transition-all hover:bg-white/5"
                      style={{ color: dynasty.color, borderColor: dynasty.color + '30' }}
                    >
                      View lineage →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="mt-8 text-center text-xs text-gray-600 max-w-2xl mx-auto">
        <strong className="text-gray-500">Note:</strong> Community sizes are approximate and debated.
        Many smaller dynasties (Spinka, Zhidachov, Nadvorna, Dinov, etc.) are active but not listed here.
        The Chassidic world includes hundreds of courts — this shows the major ones.
      </div>
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

      {/* Nachman — special: great-grandson of Besht, not through Maggid */}
      <div className="w-full mb-6">
        <p className="text-center text-gray-600 text-xs mb-3 uppercase tracking-widest">
          The Maggid's students spread Chassidus across Eastern Europe
        </p>
      </div>

      {/* BRANCH CARDS — the gateway into each dynasty */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {branches.map(branch => {
          const gateway = byId[branch.gatewayId];
          if (!gateway) return null;

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
              {/* Branch color bar */}
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
              <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-3">
                {branch.description}
              </p>

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

  // Auto-center the tree horizontally on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [branchId]);

  if (!branch) return null;

  // Related connections for this branch
  const branchConnections = connections.filter(c =>
    c.relatedBranches.includes(branchId)
  );

  // Build the visual tree recursively
  function TreeNode({ nodeId, depth = 0 }) {
    const node = byId[nodeId];
    if (!node) return null;
    const color = dynastyColors[node.dynasty] || branch.color;
    const children = node.children || [];
    const isSelected = selectedFigure?.id === node.id;

    return (
      <div className="flex flex-col items-center">
        <FigureCard
          figure={node}
          onClick={onSelectFigure}
          isSelected={isSelected}
          size={depth === 0 ? 'large' : children.length > 0 ? 'normal' : 'small'}
        />

        {children.length > 0 && (
          <>
            <VerticalConnector color={color} />
            {children.length === 1 ? (
              <TreeNode nodeId={children[0].id} depth={depth + 1} />
            ) : (
              <div className="relative">
                {/* Horizontal bar connecting siblings */}
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
      </div>

      {/* Tree */}
      <div ref={scrollRef} className="overflow-x-auto pb-8">
        <div className="flex flex-col items-center min-w-fit px-8">
          {branch.rootIds.map(rootId => (
            <TreeNode key={rootId} nodeId={rootId} depth={0} />
          ))}
        </div>
      </div>

      {/* Related connections */}
      {branchConnections.length > 0 && (
        <div className="max-w-4xl mx-auto mt-4 mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Stories & Connections
          </h2>
          <div className="space-y-3">
            {branchConnections.map(conn => {
              const config = connectionTypeConfig[conn.type];
              return (
                <div
                  key={conn.id}
                  className="rounded-lg border p-4"
                  style={{
                    borderColor: config.color + '20',
                    background: config.color + '05',
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span>{config.icon}</span>
                    <h3 className="text-sm font-bold text-white">{conn.title}</h3>
                    <span
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full"
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

      {/* Detail panel */}
      {selectedFigure && (
        <DetailPanel figure={selectedFigure} color={branch.color} onClose={() => onSelectFigure(null)} />
      )}
    </div>
  );
}

// ============================================================
// DETAIL PANEL — shows bio when a figure is clicked
// ============================================================
function DetailPanel({ figure, color, onClose }) {
  const figColor = dynastyColors[figure.dynasty] || color;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-5 border-t backdrop-blur-md"
      style={{
        background: '#0f0f17ee',
        borderColor: figColor + '40',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: figColor }} />
              <h2 className="text-xl font-bold" style={{ color: figColor }}>
                {figure.title || figure.name}
              </h2>
              <span className="text-lg opacity-60" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                {figure.hebrew}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-400 mb-3">
              <span><strong className="text-gray-300">Name:</strong> {figure.name}</span>
              <span><strong className="text-gray-300">Court:</strong> {figure.court}</span>
              <span><strong className="text-gray-300">Dynasty:</strong> {figure.dynasty}</span>
              <span><strong className="text-gray-300">Years:</strong> {figure.years[0]}–{figure.years[1] || 'present'}</span>
              {figure.relation && (
                <span><strong className="text-gray-300">Relation:</strong> {figure.relation}</span>
              )}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-3xl">
              {figure.notes}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-2xl leading-none px-2 flex-shrink-0"
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
  const [view, setView] = useState('overview'); // 'overview' | branch id
  const [tab, setTab] = useState('overview'); // 'overview' | 'connections' | 'today'
  const [selectedFigure, setSelectedFigure] = useState(null);

  const byId = useMemo(() => buildLookup(), []);

  const handleSelectBranch = useCallback((branchId) => {
    setView(branchId);
    setTab('overview');
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

  const handleTabChange = useCallback((newTab) => {
    setTab(newTab);
    setView('overview');
    setSelectedFigure(null);
  }, []);

  // Are we viewing a specific branch detail?
  const isDetailView = view !== 'overview';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4 flex-wrap">
          {/* Title */}
          <h1
            className="text-lg font-bold text-white tracking-tight cursor-pointer hover:text-amber-400 transition-colors flex-shrink-0"
            onClick={() => { setView('overview'); setTab('overview'); setSelectedFigure(null); }}
          >
            Chassidic Dynasties
          </h1>

          {/* Nav tabs — only on main views */}
          {!isDetailView && (
            <NavTabs activeTab={tab} onTabChange={handleTabChange} />
          )}

          {/* Search */}
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
      ) : tab === 'connections' ? (
        <ConnectionsView byId={byId} onSelectBranch={handleSelectBranch} />
      ) : tab === 'today' ? (
        <TodayView
          byId={byId}
          onSelectBranch={handleSelectBranch}
          onSelectFigure={handleSelectFigure}
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
