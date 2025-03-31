import { ChatHistory } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, MessageSquare, ChevronLeft } from "lucide-react";

interface SidebarProps {
  histories: ChatHistory[];
  currentHistoryId: string | null;
  onSelectHistory: (id: string) => void;
  onNewChat: () => void;
  onDeleteHistory: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  histories,
  currentHistoryId,
  onSelectHistory,
  onNewChat,
  onDeleteHistory,
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <div
      className={`fixed md:relative h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      } z-50`}
    >
      <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
        <Button
          onClick={onNewChat}
          className="flex-1 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white mr-2"
        >
          <Plus className="w-4 h-4 mr-2" />
          新規チャット
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="md:hidden"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {histories.map((history) => (
            <div
              key={history.id}
              className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                currentHistoryId === history.id
                  ? "bg-blue-50 dark:bg-blue-950/30"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              onClick={() => onSelectHistory(history.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm truncate">{history.title}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteHistory(history.id);
                }}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {histories.length} 件のチャット
        </div>
      </div>
    </div>
  );
}
