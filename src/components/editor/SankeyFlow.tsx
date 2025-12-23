import { useEffect, useRef, useState } from 'react';

export interface SankeyNode {
  id: string;
  label: string;
  layer: number;
  value: number;
  y?: number;
  type?: 'default' | 'solution' | 'loss' | 'new' | 'revenue';
}

export interface SankeyLink {
  from: string;
  to: string;
  value: number;
  type?: 'default' | 'loss' | 'new' | 'revenue';
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyMetric {
  id: string;
  value: string;
  label: string;
  position: { top?: number; bottom?: number; left?: number; right?: number };
  type?: 'default' | 'negative' | 'positive';
  visible?: boolean;
}

interface SankeyFlowProps {
  data: SankeyData;
  metrics?: SankeyMetric[];
  stageLabel?: string;
  stageLabelHighlight?: boolean;
  height?: number;
  onNodeClick?: (nodeId: string) => void;
  animated?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}


const PADDING = { top: 80, bottom: 60 };

interface LayoutNode extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutLink extends SankeyLink {
  source: LayoutNode;
  target: LayoutNode;
  thickness: number;
  path: string;
}

interface Particle {
  link: LayoutLink;
  t: number;
  speed: number;
  size: number;
  offset: number;
  brightness: number;
}

export const SankeyFlow = ({
  data,
  metrics = [],
  stageLabel,
  stageLabelHighlight = false,
  height = 480,
  onNodeClick,
  animated = true,
  primaryColor = '#00D4E5',
  secondaryColor = '#FF6B6B',
  logoUrl,
}: SankeyFlowProps) => {
  const colors = {
    primary: primaryColor,
    secondary: '#00BFA6',
    accent: secondaryColor,
    loss: '#994444',
    surface: '#1E1E1E',
    border: '#2A2A2A',
    text: '#F5F5F5',
    textMuted: 'rgba(255, 255, 255, 0.5)',
  };
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [layout, setLayout] = useState<{ nodes: LayoutNode[]; links: LayoutLink[] } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({ width: containerRef.current.offsetWidth, height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [height]);

  useEffect(() => {
    if (!data.nodes.length) return;

    const nodes: LayoutNode[] = [];
    const nodeMap = new Map<string, LayoutNode>();

    const layerPositions: { [key: number]: number } = {
      0: 0.02,
      1: 0.20,
      2: 0.50,
      3: 0.98,
    };

    const nodesByLayer = new Map<number, SankeyNode[]>();
    data.nodes.forEach(n => {
      const arr = nodesByLayer.get(n.layer) || [];
      arr.push(n);
      nodesByLayer.set(n.layer, arr);
    });

    data.nodes.forEach(node => {
      const layerNodes = nodesByLayer.get(node.layer) || [];
      const idx = layerNodes.indexOf(node);
      const yPos = node.y ?? (idx + 1) / (layerNodes.length + 1);

      const xPercent = layerPositions[node.layer] ?? node.layer * 0.25;
      const xPos = dimensions.width * xPercent;

      const availableHeight = dimensions.height - PADDING.top - PADDING.bottom;
      const flowHeight = availableHeight * 0.8;
      const verticalOffset = (availableHeight - flowHeight) / 2;

      const layoutNode: LayoutNode = {
        ...node,
        x: xPos,
        y: PADDING.top + verticalOffset + yPos * flowHeight,
        width: 14,
        height: Math.max(30, node.value * 0.4),
      };
      nodes.push(layoutNode);
      nodeMap.set(node.id, layoutNode);
    });

    const links: LayoutLink[] = data.links.map(link => {
      const source = nodeMap.get(link.from)!;
      const target = nodeMap.get(link.to)!;
      const x0 = source.x + source.width;
      const y0 = source.y;
      const x1 = target.x;
      const y1 = target.y;
      const mx = (x0 + x1) / 2;

      return {
        ...link,
        source,
        target,
        thickness: Math.max(3, link.value * 0.25),
        path: `M${x0},${y0} C${mx},${y0} ${mx},${y1} ${x1},${y1}`,
      };
    });

    setLayout({ nodes, links });
  }, [data, dimensions]);

  useEffect(() => {
    if (!layout || !animated) return;

    particlesRef.current = [];
    layout.links.forEach(link => {
      if (link.type === 'loss') return;
      const count = Math.ceil(link.value / 12);
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          link,
          t: Math.random(),
          speed: 0.0015 + Math.random() * 0.001,
          size: 2 + Math.random() * 2,
          offset: (Math.random() - 0.5) * link.thickness * 0.5,
          brightness: 0.5 + Math.random() * 0.5,
        });
      }
    });

    isRunningRef.current = true;

    const animate = () => {
      if (!isRunningRef.current || !canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, dimensions.width * dpr, dimensions.height * dpr);
      ctx.save();
      ctx.scale(dpr, dpr);

      particlesRef.current.forEach(p => {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;

        const pos = getBezierPoint(p.link, p.t);
        if (!pos) return;

        const color = p.link.type === 'revenue' || p.link.type === 'new' ? colors.secondary : colors.primary;

        const glow = ctx.createRadialGradient(pos.x, pos.y + p.offset, 0, pos.x, pos.y + p.offset, p.size * 3);
        glow.addColorStop(0, color + Math.floor(p.brightness * 99).toString(16).padStart(2, '0'));
        glow.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(pos.x, pos.y + p.offset, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y + p.offset, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      ctx.restore();
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      isRunningRef.current = false;
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [layout, animated, dimensions]);

  const getBezierPoint = (link: LayoutLink, t: number) => {
    const x0 = link.source.x + link.source.width;
    const y0 = link.source.y;
    const x1 = link.target.x;
    const y1 = link.target.y;
    const mx = (x0 + x1) / 2;
    const mt = 1 - t;
    return {
      x: mt*mt*mt*x0 + 3*mt*mt*t*mx + 3*mt*t*t*mx + t*t*t*x1,
      y: mt*mt*mt*y0 + 3*mt*mt*t*y0 + 3*mt*t*t*y1 + t*t*t*y1,
    };
  };

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  const getNodeFill = (type?: string) => {
    switch (type) {
      case 'solution': return colors.primary;
      case 'loss': return colors.accent;
      case 'new': case 'revenue': return colors.secondary;
      default: return colors.border;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl"
      style={{
        height,
        background: `linear-gradient(180deg, ${colors.surface} 0%, #0D0D0D 100%)`,
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(0, 212, 229, 0.03) 0%, transparent 70%),
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 60px 60px, 60px 60px',
        }}
      />

      <canvas
        ref={canvasRef}
        width={dimensions.width * dpr}
        height={dimensions.height * dpr}
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      <svg width={dimensions.width} height={dimensions.height} className="absolute top-0 left-0">
        <defs>
          <linearGradient id="grad-primary" x1="0%" x2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor={colors.secondary} />
          </linearGradient>
          <linearGradient id="grad-loss" x1="0%" x2="100%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.loss} />
          </linearGradient>
          <linearGradient id="grad-secondary" x1="0%" x2="100%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor="#00896B" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {layout?.links.map((link, i) => (
          <path
            key={i}
            d={link.path}
            fill="none"
            stroke={`url(#grad-${link.type === 'loss' ? 'loss' : link.type === 'revenue' || link.type === 'new' ? 'secondary' : 'primary'})`}
            strokeWidth={link.thickness}
            strokeLinecap="round"
            strokeOpacity={link.type === 'loss' ? 0.3 : 0.4}
          />
        ))}

        {layout?.nodes.map(node => (
          <g
            key={node.id}
            transform={`translate(${node.x}, ${node.y - node.height / 2})`}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
            onClick={() => onNodeClick?.(node.id)}
            style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
          >
            <rect
              width={node.width}
              height={node.height}
              rx={4}
              fill={getNodeFill(node.type)}
              stroke={node.type === 'default' || !node.type ? colors.border : 'none'}
              filter={node.type === 'solution' ? 'url(#glow)' : undefined}
              opacity={hoveredNode && hoveredNode !== node.id ? 0.5 : 1}
              style={{ transition: 'opacity 0.2s' }}
            />
            <text
              x={node.layer < 2 ? node.width + 12 : -12}
              y={node.height / 2}
              dy="0.35em"
              textAnchor={node.layer < 2 ? 'start' : 'end'}
              fill={node.type === 'loss' ? colors.accent : colors.text}
              fontSize={13}
              fontWeight={node.type === 'solution' ? 600 : 400}
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              {node.label}
            </text>
          </g>
        ))}
      </svg>

      {stageLabel && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-sm font-medium backdrop-blur-md"
          style={{
            background: 'rgba(0, 0, 0, 0.5)',
            border: `1px solid ${stageLabelHighlight ? 'rgba(0, 212, 229, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: stageLabelHighlight ? colors.primary : 'rgba(255, 255, 255, 0.8)',
          }}
        >
          {stageLabel}
        </div>
      )}

      {metrics.map(m => (
        <div
          key={m.id}
          className="absolute p-4 rounded-xl backdrop-blur-md pointer-events-none"
          style={{
            ...m.position,
            background: 'rgba(0, 0, 0, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            opacity: m.visible !== false ? 1 : 0,
            transform: m.visible !== false ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            className="text-2xl font-bold"
            style={{
              background: m.type === 'negative'
                ? `linear-gradient(135deg, ${colors.accent}, ${colors.loss})`
                : `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {m.value}
          </div>
          <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{m.label}</div>
        </div>
      ))}

      {logoUrl && (
        <div className="absolute top-5 left-5">
          <img src={logoUrl} alt="Logo" style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }} />
        </div>
      )}

      <div className="absolute bottom-5 right-6 flex flex-col gap-2 text-xs" style={{ color: colors.textMuted }}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})` }} />
          <span>Active Flow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ background: `linear-gradient(90deg, ${colors.accent}, ${colors.loss})` }} />
          <span>Lost/Blocked</span>
        </div>
      </div>
    </div>
  );
};

export default SankeyFlow;
