export interface Message {
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
