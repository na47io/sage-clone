import Chat from "../../../components/Chat";

export default function ChatPage({ params }: { params: { slug: string } }) {
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-xl font-bold p-4 bg-gray-100">
        This is the chat called {params.slug}
      </h1>
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </div>
  );
}
