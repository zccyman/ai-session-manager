import { MessageBubble } from './MessageBubble';

interface MessageThreadProps {
  messages: Array<{
    id: number;
    session_id: number;
    time_created: string;
    parsed: {
      role: string;
      content: string;
    };
  }>;
  loading: boolean;
}

export function MessageThread({ messages, loading }: MessageThreadProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No messages in this session</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          data={message.parsed as any}
          createdAt={message.time_created}
        />
      ))}
    </div>
  );
}