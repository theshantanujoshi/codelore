import { useState, useEffect, useRef } from "react";
import { Send, RotateCcw, ThumbsUp, ThumbsDown, Copy, Check, Terminal } from "lucide-react";
import { aiQAPairs } from "../../data/mockData";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  confidence?: number;
  sources?: string[];
  liked?: boolean | null;
}

const suggestions = [
  "What is the overall architecture of this project?",
  "How does cart state work across the app?",
  "Where should I add a new product filter?",
  "Are there any security issues I should know about?",
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 border border-zinc-800">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-900">
        <span className="text-xs text-zinc-700">typescript</span>
        <button
          onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="text-xs text-zinc-700 hover:text-zinc-400 transition-colors flex items-center gap-1"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs text-zinc-400 leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  // Handle inline bold **text**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="text-zinc-100" style={{ fontWeight: 600 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);
  return (
    <div className="space-y-1">
      {parts.map((part, i) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          return <CodeBlock key={i} code={part.replace(/^```\w*\n?/, "").replace(/```$/, "")} />;
        }
        const lines = part.split("\n");
        return (
          <div key={i} className="text-[11px] text-zinc-400 leading-relaxed space-y-1">
            {lines.map((line, j) => {
              const trimmed = line.trim();
              
              // Headers
              if (trimmed.startsWith("### ")) {
                return (
                  <h3 key={j} className="text-zinc-200 mt-6 mb-2 flex items-center gap-2 first:mt-0 uppercase tracking-wider" style={{ fontWeight: 700, fontSize: '10px' }}>
                    <span className="w-1 h-3 bg-zinc-700 inline-block" />
                    {trimmed.slice(4)}
                  </h3>
                );
              }

              // List items (supports - and *)
              if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                return (
                  <div key={j} className="flex items-start gap-2.5 ml-1 mt-1">
                    <span className="text-zinc-700 flex-shrink-0 mt-1">·</span>
                    <span><InlineMarkdown text={trimmed.slice(2)} /></span>
                  </div>
                );
              }

              if (trimmed === "") return <div key={j} className="h-2" />;

              // Regular text with inline markdown
              return (
                <p key={j} className="leading-relaxed">
                  <InlineMarkdown text={line} />
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

import { RepoData, chatWithAI } from "../../services/api";

interface AIChatProps {
  repoData: RepoData | null;
}

export default function AIChat({ repoData }: AIChatProps) {
  const repoName = repoData?.fullName || "this repository";
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `ready. i've analyzed **${repoName}**. ask me anything about the architecture, how to add features, security, or what any specific part of the code does.`,
      confidence: 95,
      sources: ["README.md"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const streamResponse = (text: string, id: string) => {
    let i = 0;
    const iv = setInterval(() => {
      if (i >= text.length) {
        clearInterval(iv);
        setIsStreaming(false);
        setMessages((prev) => prev.map((m) => m.id === id ? { ...m, isStreaming: false, confidence: 88, sources: [] } : m));
        return;
      }
      const chunk = text.slice(0, i + 10);
      i += 10;
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: chunk } : m)));
    }, 25);
  };

  const handleSend = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || isStreaming) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: q };
    const aiId = (Date.now() + 1).toString();
    const aiMsg: Message = { id: aiId, role: "assistant", content: "", isStreaming: true };
    
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      // Use real AI if available
      const response = await chatWithAI(q, {
        repoName,
        description: repoData?.description,
        files: repoData?.files,
        lines: repoData?.lines,
        language: repoData?.primaryLanguage,
        languages: repoData?.languages,
        insights: repoData?.insights,
        dependencies: repoData?.dependencies?.map(d => `${d.name}@${d.version}`),
        architecture: repoData?.architecture,
        executionFlow: repoData?.executionFlow,
        fileTree: repoData?.fileTree,
      });
      streamResponse(response, aiId);
    } catch (error: any) {
      console.error("Chat Error:", error);
      streamResponse(`error: ${error.message}`, aiId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Terminal className="w-3.5 h-3.5 text-zinc-700" />
          <span>ask ai</span>
          <span className="text-zinc-800">·</span>
          <span className="text-zinc-700">codebase-aware · {repoName}</span>
        </div>
        <button
          onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-400 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          new chat
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className="flex-shrink-0 text-xs text-zinc-700 mt-0.5 w-8 text-right">
              {msg.role === "user" ? "you" : "ai"}
            </div>
            <div className={`flex-1 max-w-xl ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
              {msg.role === "user" ? (
                <div className="border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs text-zinc-300 max-w-sm leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <div>
                  {msg.isStreaming && msg.content === "" ? (
                    <div className="text-xs text-zinc-700 py-2">
                      thinking<span style={{ animation: "pulse 1.2s infinite" }}>...</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-1.5 border-b border-zinc-800 bg-zinc-900/50">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">ai-orchestrator response</span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">grounded in codebase</span>
                          </div>
                        </div>
                        <div className="px-4 py-4">
                          <MessageContent content={msg.content} />
                          {msg.isStreaming && (
                            <span className="inline-block w-0.5 h-3.5 bg-zinc-400 ml-0.5" style={{ animation: "pulse 1s infinite" }} />
                          )}
                        </div>
                      </div>
                      {!msg.isStreaming && msg.confidence && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-zinc-700">
                            <div className="w-10 h-px bg-zinc-800">
                              <div className="h-full bg-zinc-500" style={{ width: `${msg.confidence}%` }} />
                            </div>
                            <span>{msg.confidence}% confidence</span>
                          </div>
                          {msg.sources && (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {msg.sources.map((src) => (
                                <span key={src} className="text-xs text-zinc-700 border border-zinc-800 px-1.5 py-0.5">{src}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                            <button onClick={() => setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, liked: true } : m))} className={`p-1 transition-colors ${msg.liked === true ? "text-zinc-200" : "text-zinc-700 hover:text-zinc-500"}`}><ThumbsUp className="w-3 h-3" /></button>
                            <button onClick={() => setMessages((p) => p.map((m) => m.id === msg.id ? { ...m, liked: false } : m))} className={`p-1 transition-colors ${msg.liked === false ? "text-zinc-200" : "text-zinc-700 hover:text-zinc-500"}`}><ThumbsDown className="w-3 h-3" /></button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs text-zinc-600 border border-zinc-800 px-3 py-1.5 hover:border-zinc-600 hover:text-zinc-400 transition-colors text-left"
            >
              › {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6">
        <div className="flex items-end gap-2 border border-zinc-700 bg-zinc-900 p-3 focus-within:border-zinc-500 transition-colors">
          <span className="text-xs text-zinc-700 flex-shrink-0 mb-0.5">$</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ask anything about this codebase..."
            rows={1}
            className="flex-1 bg-transparent text-xs text-zinc-300 placeholder-zinc-700 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: 120, minHeight: 24 }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className={`flex-shrink-0 transition-colors text-xs ${input.trim() && !isStreaming ? "text-zinc-300 hover:text-zinc-100" : "text-zinc-700 cursor-not-allowed"}`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-xs text-zinc-800 mt-1.5">
          enter to send · shift+enter for newline · answers grounded in analyzed codebase
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }`}</style>
    </div>
  );
}
