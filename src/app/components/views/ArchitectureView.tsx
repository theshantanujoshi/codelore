import { useState } from "react";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { archNodes, archEdges, ArchNode } from "../../data/mockData";

const typeLabel: Record<string, string> = {
  page:     "page",
  component:"component",
  api:      "api",
  util:     "lib",
  external: "external",
};

function getNodeCenter(node: ArchNode) {
  return { x: node.x + node.width / 2, y: node.y + node.height / 2 };
}

function buildPath(from: ArchNode, to: ArchNode): string {
  const f = getNodeCenter(from);
  const t = getNodeCenter(to);
  const dx = t.x - f.x;
  const cx1 = f.x + dx * 0.5;
  const cx2 = t.x - dx * 0.5;
  return `M ${f.x} ${f.y} C ${cx1} ${f.y}, ${cx2} ${t.y}, ${t.x} ${t.y}`;
}

const layerLabels = [
  { y: 70,  label: "pages / routes" },
  { y: 210, label: "ui components" },
  { y: 350, label: "api / server actions" },
  { y: 490, label: "libraries / external" },
];

export default function ArchitectureView() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const selectedNodeData = selectedNode ? archNodes.find((n) => n.id === selectedNode) : null;
  const connectedEdges = selectedNode
    ? archEdges.filter((e) => e.from === selectedNode || e.to === selectedNode)
    : [];
  const connectedIds = new Set(connectedEdges.flatMap((e) => [e.from, e.to]));

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-zinc-800">
        <div className="text-xs text-zinc-600">
          click a node to explore connections · {archNodes.length} modules · {archEdges.length} edges
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-3 mr-4 text-xs text-zinc-700">
            {Object.entries(typeLabel).map(([type, label]) => (
              <span key={type}>{label}</span>
            ))}
          </div>
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1.5 border border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 transition-colors"><ZoomOut className="w-3.5 h-3.5" /></button>
          <span className="text-xs text-zinc-700 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="p-1.5 border border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 transition-colors"><ZoomIn className="w-3.5 h-3.5" /></button>
          <button onClick={() => setZoom(1)} className="p-1.5 border border-zinc-800 text-zinc-600 hover:text-zinc-300 hover:border-zinc-600 transition-colors"><Maximize2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* SVG canvas */}
        <div className="flex-1 overflow-auto bg-zinc-950">
          <div
            className="relative"
            style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: 680, height: 530, minWidth: 680 }}
          >
            <svg width={680} height={530} viewBox="0 0 680 530" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <defs>
                <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#3f3f46" />
                </marker>
                <marker id="arrow-active" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#a1a1aa" />
                </marker>
              </defs>

              {/* Layer strips */}
              {layerLabels.map((layer, i) => (
                <g key={i}>
                  <rect x={4} y={layer.y - 38} width={672} height={72} rx={0} fill="rgba(255,255,255,0.01)" stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                  <text x={12} y={layer.y - 22} fill="#3f3f46" fontSize={8} fontFamily="'JetBrains Mono', monospace" letterSpacing={1}>
                    {layer.label.toUpperCase()}
                  </text>
                </g>
              ))}

              {/* Edges */}
              {archEdges.map((edge, i) => {
                const fromNode = archNodes.find((n) => n.id === edge.from);
                const toNode = archNodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;
                const isHighlighted = selectedNode && (edge.from === selectedNode || edge.to === selectedNode);
                const isDeemphasized = selectedNode && !isHighlighted;
                return (
                  <path
                    key={i}
                    d={buildPath(fromNode, toNode)}
                    fill="none"
                    stroke={isHighlighted ? "#a1a1aa" : "#27272a"}
                    strokeWidth={isHighlighted ? 1.5 : 1}
                    strokeDasharray={isDeemphasized ? "3 3" : undefined}
                    opacity={isDeemphasized ? 0.15 : 1}
                    markerEnd={`url(#${isHighlighted ? "arrow-active" : "arrow"})`}
                    style={{ transition: "all 0.15s" }}
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {archNodes.map((node) => {
              const isSelected = selectedNode === node.id;
              const isConnected = connectedIds.has(node.id);
              const isDeemphasized = selectedNode && !isSelected && !isConnected;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  style={{
                    position: "absolute",
                    left: node.x, top: node.y,
                    width: node.width, height: node.height,
                    opacity: isDeemphasized ? 0.18 : 1,
                    transition: "opacity 0.15s",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      background: isSelected ? "#18181b" : "#09090b",
                      border: `1px solid ${isSelected || isConnected ? "#52525b" : "#27272a"}`,
                      borderRadius: 0,
                      padding: "5px 10px",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      fontSize: 9.5,
                      fontWeight: 500,
                      color: isSelected ? "#e4e4e7" : isConnected ? "#a1a1aa" : "#71717a",
                      fontFamily: "'JetBrains Mono', monospace",
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      lineHeight: 1.3,
                    }}>
                      {node.label}
                    </div>
                    {node.sublabel && (
                      <div style={{
                        fontSize: 8,
                        color: isSelected ? "#52525b" : "#3f3f46",
                        marginTop: 2,
                        fontFamily: "'JetBrains Mono', monospace",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {node.sublabel}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selectedNodeData && (
          <div
            className="w-60 flex-shrink-0 border-l border-zinc-800 bg-zinc-950 p-5 overflow-y-auto"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <div className="mb-4">
              <div className="text-xs text-zinc-700 mb-1">{typeLabel[selectedNodeData.type] || "module"}</div>
              <h3 className="text-xs text-zinc-200" style={{ fontWeight: 600 }}>{selectedNodeData.label}</h3>
              {selectedNodeData.sublabel && (
                <p className="text-xs text-zinc-700 mt-0.5">{selectedNodeData.sublabel}</p>
              )}
            </div>

            <div className="border-t border-zinc-800 pt-4 mb-4">
              <div className="text-xs text-zinc-700 mb-2">connections ({connectedEdges.length})</div>
              <div className="space-y-1">
                {connectedEdges.map((edge, i) => {
                  const isOut = edge.from === selectedNode;
                  const otherId = isOut ? edge.to : edge.from;
                  const otherNode = archNodes.find((n) => n.id === otherId);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedNode(otherId)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 transition-colors text-left"
                    >
                      <span className="text-xs text-zinc-600">{isOut ? "→" : "←"}</span>
                      <span className="text-xs text-zinc-400 truncate">{otherNode?.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-zinc-800 pt-4">
              <div className="text-xs text-zinc-700 leading-relaxed">
                {selectedNodeData.type === "page"     && "// next.js app router page · server component by default"}
                {selectedNodeData.type === "component" && "// shared ui component · server or client depending on interactivity"}
                {selectedNodeData.type === "api"       && "// server-side only · api route or server action · never in browser"}
                {selectedNodeData.type === "util"      && "// utility library · shared logic across multiple layers"}
                {selectedNodeData.type === "external"  && "// third-party api · all calls originate from server layer"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
