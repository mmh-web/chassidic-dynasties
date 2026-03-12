import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { figures, dynastyColors } from './data/dynasties';
import { branches } from './data/branches';

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
      {/* Horizontal connecting bar */}
      <div className="absolute top-0 left-[10%] right-[10%] h-[2px]" style={{ background: color + '40' }} />
      <div className="flex justify-center gap-4 flex-wrap">
        {children}
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
      {/* Title */}
      <h1 className="text-3xl font-bold text-white mb-1 tracking-tight text-center">
        The Chassidic Dynasty Tree
      </h1>
      <p className="text-gray-500 text-sm mb-8 text-center">
        From the Baal Shem Tov to today — click any branch to explore its full lineage
      </p>

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

  // Collect all figures in this branch's sub-tree
  function collectTree(nodeId, depth = 0) {
    const node = byId[nodeId];
    if (!node) return [];
    const result = [{ ...node, depth }];
    node.children.forEach(child => {
      result.push(...collectTree(child.id, depth + 1));
    });
    return result;
  }

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-200">
      {view === 'overview' ? (
        <OverviewView
          byId={byId}
          onSelectBranch={handleSelectBranch}
          onSelectFigure={handleSelectFigure}
        />
      ) : (
        <DetailView
          branchId={view}
          byId={byId}
          onBack={handleBack}
          onSelectFigure={handleSelectFigure}
          selectedFigure={selectedFigure}
        />
      )}
    </div>
  );
}
