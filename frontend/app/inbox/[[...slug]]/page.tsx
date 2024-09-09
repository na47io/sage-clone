import Chat from "../../../components/Chat";

function InboxChatCard() {
  // i need a card with a user avatar img, name on right, centered vertically
  // underneath i need the description

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <img
          src="https://via.placeholder.com/150"
          alt="User profile"
          className="w-24 h-24"
        />
        <div className="ml-4 gap-4">
          <p className="font-semibold">Username</p>
        </div>
      </div>
      <p className="text-sm">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci vitae
        molestias excepturi inventore necessitatibus! Obcaecati praesentium vel,
        eos at velit fuga hic, commodi, aliquid quia quas temporibus quos in
        vitae?
      </p>
    </div>
  );
}

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <InboxChatCard />
      </div>
      <div className="flex-grow overflow-y-auto flex flex-col h-full">
        <p>Chatting to {params.slug}</p>
        <div className="flex-1 overflow-hidden">
          <Chat />
        </div>
      </div>
    </div>
  );
}
