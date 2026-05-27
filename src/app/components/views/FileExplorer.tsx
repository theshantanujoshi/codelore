import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Cuboid, ListTree } from "lucide-react";
import FileExplorer3D from "./FileExplorer3D";
import { mockFileTree, FileNode } from "../../data/mockData";

const complexityLabel = { low: "low", medium: "med", high: "high" };

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  selectedId: string | null;
  onSelect: (node: FileNode) => void;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}

function TreeNode({ node, depth, selectedId, onSelect, expandedIds, onToggle }: TreeNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;
  const isDir = node.type === "directory";

  return (
    <div>
      <button
        onClick={() => { if (isDir) onToggle(node.id); onSelect(node); }}
        className={`w-full flex items-center gap-1.5 py-1.5 text-left text-xs transition-colors group ${
          isSelected
            ? "bg-zinc-800 text-zinc-100"
            : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50"
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px`, paddingRight: 8 }}
      >
        <span className="flex-shrink-0 w-3 flex items-center">
          {isDir ? (
            isExpanded
              ? <ChevronDown className="w-3 h-3 text-zinc-600" />
              : <ChevronRight className="w-3 h-3 text-zinc-600" />
          ) : null}
        </span>
        <span
          className="flex-1 truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: isDir ? 500 : 400 }}
        >
          {isDir ? node.name + "/" : node.name}
        </span>
        {node.type === "file" && node.lines && (
          <span className="text-zinc-800 group-hover:text-zinc-600 flex-shrink-0">{node.lines}L</span>
        )}
        {node.type === "file" && node.complexity && (
          <span className={`flex-shrink-0 text-xs ${
            node.complexity === "high" ? "text-zinc-500" : "text-zinc-800"
          }`}>
            {node.complexity === "high" ? "!" : ""}
          </span>
        )}
      </button>
      {isDir && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getAllIds(nodes: FileNode[]): string[] {
  return nodes.flatMap((n) => [n.id, ...(n.children ? getAllIds(n.children) : [])]);
}

function filterTree(nodes: FileNode[], searchTerm: string): FileNode[] {
  if (!searchTerm) return nodes;
  const term = searchTerm.toLowerCase();
  
  return nodes.map(node => {
    if (node.type === "file") {
      if (node.name.toLowerCase().includes(term)) return node;
      return null;
    }
    
    if (node.type === "directory") {
      const isMatch = node.name.toLowerCase().includes(term);
      const filteredChildren = node.children ? filterTree(node.children, searchTerm) : [];
      
      if (isMatch || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren.length > 0 ? filteredChildren : node.children };
      }
      return null;
    }
    return null;
  }).filter(Boolean) as FileNode[];
}

import { RepoData } from "../../services/api";

interface FileExplorerProps {
  repoData: RepoData | null;
}

export default function FileExplorer({ repoData }: FileExplorerProps) {
  const tree = repoData?.fileTree || mockFileTree;
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(tree.slice(0, 3).map(n => n.id))
  );
  const [search, setSearch] = useState("");
  const filteredTree = useMemo(() => filterTree(tree, search), [tree, search]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="flex-1 flex overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Tree View */}
      <div className={`${viewMode === "3d" ? "flex-1 border-r border-zinc-800 flex flex-col min-w-0" : "w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col"}`}>
        <div className="p-2.5 border-b border-zinc-800 flex flex-col gap-2">
          <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-sm border border-zinc-800">
            <button
              onClick={() => setViewMode("2d")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs transition-colors rounded-sm ${viewMode === "2d" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <ListTree className="w-3.5 h-3.5" /> 2D
            </button>
            <button
              onClick={() => setViewMode("3d")}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs transition-colors rounded-sm ${viewMode === "3d" ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              <Cuboid className="w-3.5 h-3.5" /> 3D
            </button>
          </div>
          {viewMode === "2d" && (
            <>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="filter files..."
            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <div className="flex gap-3 mt-2 px-0.5 text-xs text-zinc-800">
            <button onClick={() => setExpandedIds(new Set(getAllIds(tree)))} className="hover:text-zinc-500 transition-colors">expand all</button>
            <span>·</span>
            <button onClick={() => setExpandedIds(new Set())} className="hover:text-zinc-500 transition-colors">collapse</button>
          </div>
            </>
          )}
        </div>
        
        {viewMode === "2d" ? (
          <div className="flex-1 overflow-y-auto py-1">
            {filteredTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedNode?.id || null}
              onSelect={setSelectedNode}
              expandedIds={expandedIds}
              onToggle={toggleExpand}
            />
          ))}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden relative">
            <FileExplorer3D tree={filteredTree} onSelectNode={setSelectedNode} />
          </div>
        )}
        
        <div className="px-3 py-2 border-t border-zinc-800 text-xs text-zinc-800">
          {repoData?.files || 247} files · ! = high complexity
        </div>
      </div>

      {/* Detail */}
      <div className={`${viewMode === "3d" ? "w-80 flex-shrink-0 bg-zinc-950 overflow-y-auto border-l border-zinc-800" : "flex-1 overflow-y-auto"}`}>
        {selectedNode ? (
          <div className="p-8 max-w-2xl">
            {/* File header */}
            <div className="mb-6">
              <div className="text-xs text-zinc-700 mb-1">
                {selectedNode.type === "directory" ? "directory" : selectedNode.language?.toLowerCase() || "file"}
              </div>
              <h2 className="text-sm text-zinc-100 mb-1" style={{ fontWeight: 600 }}>
                {selectedNode.name}
                {selectedNode.type === "directory" && "/"}
              </h2>
              <div className="text-xs text-zinc-700 mb-4">{selectedNode.path}</div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                {selectedNode.lines && <span>{selectedNode.lines} lines</span>}
                {selectedNode.complexity && (
                  <span className={selectedNode.complexity === "high" ? "text-zinc-400" : ""}>
                    complexity: {complexityLabel[selectedNode.complexity]}
                  </span>
                )}
              </div>
            </div>

            {/* AI Description */}
            {selectedNode.description && (
              <div className="mb-6 border border-zinc-800 p-4">
                <div className="text-xs text-zinc-700 mb-2">{`// ai summary`}</div>
                <p className="text-xs text-zinc-400 leading-relaxed">{selectedNode.description}</p>
              </div>
            )}

            {/* Imports & Exports */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedNode.imports && selectedNode.imports.length > 0 && (
                <div className="border border-zinc-800 p-4">
                  <div className="text-xs text-zinc-700 mb-2">imports ({selectedNode.imports.length})</div>
                  <div className="space-y-1">
                    {selectedNode.imports.map((imp) => (
                      <div key={imp} className="text-xs text-zinc-500 py-1 border-b border-zinc-900 last:border-b-0">
                        ← {imp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedNode.exports && selectedNode.exports.length > 0 && (
                <div className="border border-zinc-800 p-4">
                  <div className="text-xs text-zinc-700 mb-2">exports ({selectedNode.exports.length})</div>
                  <div className="space-y-1">
                    {selectedNode.exports.map((exp) => (
                      <div key={exp} className="text-xs text-zinc-400 py-1 border-b border-zinc-900 last:border-b-0">
                        → {exp}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Children */}
            {selectedNode.type === "directory" && selectedNode.children && (
              <div className="border border-zinc-800 divide-y divide-zinc-800">
                {selectedNode.children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedNode(child)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-900 transition-colors text-left group"
                  >
                    <span className="text-xs text-zinc-600">
                      {child.type === "directory" ? "dir" : "file"}
                    </span>
                    <span className="text-xs text-zinc-300 flex-1">
                      {child.name}{child.type === "directory" ? "/" : ""}
                    </span>
                    {child.lines && <span className="text-xs text-zinc-700">{child.lines}L</span>}
                    <span className="text-zinc-700 group-hover:text-zinc-500 transition-colors text-xs">→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-xs text-zinc-700 mb-2">{`// select a file`}</div>
              <div className="text-xs text-zinc-800">click any item in the tree to see ai-generated explanations</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
