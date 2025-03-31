"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Sparkles,
  RefreshCw,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/chat/sidebar";
import { Message, ChatHistory } from "@/types/chat";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [histories, setHistories] = useState<ChatHistory[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // ローカルストレージからチャット履歴を読み込む
    const savedHistories = localStorage.getItem("chatHistories");
    if (savedHistories) {
      const parsedHistories = JSON.parse(savedHistories).map(
        (h: ChatHistory) => ({
          ...h,
          messages: h.messages.map((m: Message) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })),
        })
      );
      setHistories(parsedHistories);
    }
  }, []);

  useEffect(() => {
    // チャット履歴をローカルストレージに保存
    localStorage.setItem("chatHistories", JSON.stringify(histories));
  }, [histories]);

  const createNewChat = () => {
    const newHistory: ChatHistory = {
      id: uuidv4(),
      title: "新規チャット",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setHistories((prev) => [newHistory, ...prev]);
    setCurrentHistoryId(newHistory.id);
    setMessages([]);
  };

  const selectHistory = (id: string) => {
    const history = histories.find((h) => h.id === id);
    if (history) {
      setCurrentHistoryId(id);
      setMessages(history.messages);
    }
  };

  const deleteHistory = (id: string) => {
    setHistories((prev) => prev.filter((h) => h.id !== id));
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
      setMessages([]);
    }
  };

  const updateHistoryTitle = (id: string, messages: Message[]) => {
    const firstMessage = messages[0]?.content || "新規チャット";
    const title =
      firstMessage.length > 30
        ? firstMessage.substring(0, 30) + "..."
        : firstMessage;

    setHistories((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              title,
              messages,
              updatedAt: new Date(),
            }
          : h
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      if (currentHistoryId) {
        updateHistoryTitle(currentHistoryId, updatedMessages);
      } else {
        createNewChat();
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to get response from OpenAI");
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        histories={histories}
        currentHistoryId={currentHistoryId}
        onSelectHistory={selectHistory}
        onNewChat={createNewChat}
        onDeleteHistory={deleteHistory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 min-h-screen bg-[#fafafa] dark:bg-gray-950">
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden absolute left-4 top-4"
              >
                <Menu className="w-6 h-6" />
              </Button>
              <Sparkles className="w-8 h-8 text-blue-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                AI Chat Assistant
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400"></p>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 shadow-xl border-0 overflow-hidden">
            <div className="p-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  アシスタント
                </span>
                {isTyping && (
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full animate-pulse">
                    入力中...
                  </span>
                )}
              </div>
            </div>

            <ScrollArea className="h-[600px] p-6" ref={scrollAreaRef}>
              <AnimatePresence>
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full space-y-4 text-gray-400"
                  >
                    <MessageCircle className="w-12 h-12" />
                    <p className="text-lg">AIと会話を始めましょう...</p>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-start gap-4 ${
                          message.role === "assistant"
                            ? "bg-blue-50/50 dark:bg-blue-950/30"
                            : "bg-gray-50/50 dark:bg-gray-900/30"
                        } p-4 rounded-xl backdrop-blur-sm`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            message.role === "assistant"
                              ? "bg-blue-100 dark:bg-blue-900"
                              : "bg-gray-200 dark:bg-gray-800"
                          }`}
                        >
                          {message.role === "assistant" ? (
                            <Bot className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                          ) : (
                            <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-sm font-medium ${
                                message.role === "assistant"
                                  ? "text-blue-700 dark:text-blue-300"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {message.role === "assistant"
                                ? "アシスタント"
                                : "あなた"}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>

            <div className="p-4 bg-gray-50/50 dark:bg-gray-900/50 border-t dark:border-gray-800">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6"
                >
                  {isLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
