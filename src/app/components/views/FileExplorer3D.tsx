import { useMemo, useState, useRef, useEffect } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { FileNode } from "../../data/mockData";

interface GraphData {
  nodes: any[];
  links: any[];
}

function treeToGraph(node: FileNode, parentId?: string): GraphData {
  let nodes: any[] = [{
    id: node.id,
    name: node.name,
    type: node.type,
    val: node.type === "directory" ? 5 : (node.lines ? Math.max(1, Math.min(5, node.lines / 100)) : 1),
    color: node.type === "directory" ? "#a1a1aa" : (node.complexity === "high" ? "#ef4444" : "#52525b")
  }];
  
  let links: any[] = [];
  
  if (parentId) {
    links.push({ source: parentId, target: node.id });
  }

  if (node.children) {
    node.children.forEach(child => {
      const childData = treeToGraph(child, node.id);
      nodes = nodes.concat(childData.nodes);
      links = links.concat(childData.links);
    });
  }

  return { nodes, links };
}

interface FileExplorer3DProps {
  tree: FileNode[];
  onSelectNode: (node: FileNode) => void;
  selectedNodeId?: string | null;
}

export default function FileExplorer3D({ tree, onSelectNode, selectedNodeId }: FileExplorer3DProps) {
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  
  // Create a virtual root to connect multiple top-level nodes if necessary
  const graphData = useMemo(() => {
    let combinedNodes: any[] = [];
    let combinedLinks: any[] = [];
    
    // If the tree has multiple roots, we create a virtual root.
    if (tree.length > 1) {
      combinedNodes.push({ id: "root", name: "Repository Root", type: "directory", val: 8, color: "#d4d4d8" });
      tree.forEach(child => {
        const childData = treeToGraph(child, "root");
        combinedNodes = combinedNodes.concat(childData.nodes);
        combinedLinks = combinedLinks.concat(childData.links);
      });
    } else if (tree.length === 1) {
      const data = treeToGraph(tree[0]);
      combinedNodes = data.nodes;
      combinedLinks = data.links;
    }
    
    return { nodes: combinedNodes, links: combinedLinks };
  }, [tree]);

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (selectedNodeId && fgRef.current && graphData.nodes.length > 0) {
      const node = graphData.nodes.find((n: any) => n.id === selectedNodeId);
      if (node && node.x !== undefined && node.y !== undefined && node.z !== undefined) {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
        
        fgRef.current.cameraPosition(
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
          node, // lookAt ({ x, y, z })
          1500  // ms transition duration
        );
      }
    }
  }, [selectedNodeId, graphData.nodes]);

  const handleNodeClick = (node: any) => {
    if (node.id === "root") return;
    
    // Find the original FileNode recursively
    const findNode = (nodes: FileNode[], targetId: string): FileNode | null => {
      for (const n of nodes) {
        if (n.id === targetId) return n;
        if (n.children) {
          const found = findNode(n.children, targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const originalNode = findNode(tree, node.id);
    if (originalNode) {
      onSelectNode(originalNode);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-zinc-950 flex items-center justify-center">
      {graphData.nodes.length > 0 ? (
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          nodeColor="color"
          nodeVal="val"
          nodeResolution={16}
          linkColor={() => "#27272a"}
          linkOpacity={0.8}
          linkWidth={0.5}
          backgroundColor="#09090b" // bg-zinc-950
          onNodeClick={handleNodeClick}
        />
      ) : (
        <div className="text-zinc-600 text-xs">No graph data available.</div>
      )}
    </div>
  );
}
