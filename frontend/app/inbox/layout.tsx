import Link from "next/link";

interface Chat {
  id: string;
  name: string;
  unreadCount: number;
  lastMessage: Date;
  isSelected: boolean;
}

function InboxMenuCard({ chat }: { chat: Chat }) {
  return (
    <Link href={`/inbox/${chat.id}`}>
      <div
        className={`cursor-pointer hover:bg-gray-100 flex items-center p-4 rounded-lg ${
          chat.isSelected ? "bg-gray-100" : ""
        }`}
      >
        <img
          src="https://via.placeholder.com/150"
          alt="User profile"
          className="w-12 h-12"
        />
        <div className="ml-4 gap-4">
          <p className="font-semibold">{chat.name}</p>
          <p className="text-sm">{chat.lastMessage.toTimeString()}</p>
        </div>
      </div>
    </Link>
  );
}

function InboxMenu({ chats }: { chats: Chat[] }) {
  const totalUnreadCount = chats.reduce(
    (acc, chat) => acc + chat.unreadCount,
    0
  );
  return (
    <div className="flex flex-col">
      <p>inbox</p>

      <p> You have {totalUnreadCount} new messages</p>

      <div className="flex flex-col m-4 gap-4">
        {chats.map((chat) => (
          <InboxMenuCard key={chat.id} chat={chat}></InboxMenuCard>
        ))}
      </div>
    </div>
  );
}

const chats: Chat[] = [
  {
    id: "1",
    name: "Alice",
    unreadCount: 2,
    lastMessage: new Date(),
    isSelected: false,
  },
  {
    id: "2",
    name: "Bob",
    unreadCount: 0,
    lastMessage: new Date(),
    isSelected: false,
  },
];

export default function Inbox({ children }: { children: React.ReactNode }) {
  // i need 2 columns, each taking up half the screen width

  return (
    <div className="flex">
      <div className="w-5/12 p-4">
        <InboxMenu chats={chats}></InboxMenu>
      </div>
      <div className="w-7/12 p-4">{children}</div>
    </div>
  );
}
