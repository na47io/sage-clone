import React from "react";
import { Send } from "lucide-react";

const MessageBubble = ({ message }) => {
  switch (message.type) {
    case "date":
      return (
        <div className="text-center">
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
            {message.content}
          </span>
        </div>
      );
    case "sent":
      return (
        <div className="flex justify-end">
          <div className="bg-blue-100 rounded p-2 max-w-xs">
            <p className="text-sm">{message.content}</p>
            <p className="text-xs text-gray-500 text-right mt-1">
              {message.time}
            </p>
          </div>
        </div>
      );
    case "received":
      return (
        <div>
          <span className="text-sm font-semibold">{message.sender}</span>
          <div className="bg-white rounded p-2 max-w-xs mt-1">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-blue-500">#{message.hashtag}</span>
              <span className="text-xs text-gray-500">{message.time}</span>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default function Chat() {
  const messages = [
    {
      type: "date",
      content: "July 29",
    },
    {
      type: "sent",
      content:
        "https://www.kalzumeus.com/2011/10/28/dont-call-yourself-a-programmer/",
      time: "12:15",
    },
    {
      type: "date",
      content: "August 2",
    },
    {
      type: "received",
      sender: "Nikkyhammer40k",
      content: `Integrated g hub today. Feels good to be done w the bs (almost)! Left to work out some more postgres. Really interested in offloading work to it thru triggers. Prolly a ton of other useful features there too.

Still dealing w some bs like typescripts giga chad type system (hello LOOKUP TYPES). altho I gotta say it feels quite helpful most of the time.

Had a joe biden moment with an onclick handler in one of the islands. Had to remember that half the code runs in the browser...I think the fact that I forgot speaks to fresh's strengths.

Ended up factoring the GitHub api stuff as a sort of class + interface but all in JSON. Code nicely colocated that way and fun to write.

Gotta check that todolist again. I am probably forgetting stuff.`,
      time: "Aug 2, 22:58",
      hashtag: "gli",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex">
          <input
            type="text"
            placeholder="Type a message"
            className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button className="bg-blue-500 text-white rounded-r px-4 py-2">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
