import { useState, useEffect, useRef } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { useGameStore } from "../store/gameStore";

export function MemberChatModal() {
  const { isChattingWith, members, endChat, sendChatMessage, isGenerating } = useGameStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const member = members.find((m) => m.name === isChattingWith);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [member?.chatHistory]);

  if (!member) return null;

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;
    await sendChatMessage(member.name, input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={endChat} />
      <div className="relative w-full max-w-md mx-4 bg-[#1a1614] border border-[#2a2523] rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-[#151210] border-b border-[#2a2523]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-amber-400 font-semibold text-sm">{member.name}</div>
              <div className="text-gray-500 text-xs">{member.role}</div>
            </div>
          </div>
          <button
            onClick={endChat}
            className="p-2 text-gray-500 hover:text-gray-300 hover:bg-[#2a2523] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {member.personality && (
          <div className="px-5 py-3 bg-[#151210]/50 border-b border-[#2a2523]">
            <div className="text-gray-500 text-xs mb-1">人设</div>
            <div className="text-gray-300 text-sm">{member.personality}</div>
          </div>
        )}

        <div className="h-[400px] overflow-y-auto px-5 py-4 space-y-4">
          {member.chatHistory && member.chatHistory.length > 0 ? (
            member.chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "player" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-lg ${
                    msg.sender === "player"
                      ? "bg-amber-500 text-black rounded-br-none"
                      : "bg-[#2a2523] text-gray-300 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.sender === "player" ? "text-black/60" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString("zh-CN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <div className="text-sm">开始和 {member.name} 聊天吧</div>
              <div className="text-xs text-gray-600 mt-1">私聊不推进游戏时间</div>
            </div>
          )}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-[#2a2523] text-gray-300 px-4 py-2 rounded-lg rounded-bl-none">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="px-5 py-4 bg-[#151210] border-t border-[#2a2523]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`给 ${member.name} 发消息...`}
              className="flex-1 px-4 py-2 bg-[#2a2523] border border-[#3a3533] rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
              disabled={isGenerating}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className={`p-2 rounded-lg transition-all ${
                input.trim() && !isGenerating
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-[#2a2523] text-gray-500 cursor-not-allowed"
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
