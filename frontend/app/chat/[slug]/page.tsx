import Chat from "../../../components/Chat";
export default function ChatPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h1>this is the chat called {params.slug}</h1>

      <Chat />
    </div>
  );
}
