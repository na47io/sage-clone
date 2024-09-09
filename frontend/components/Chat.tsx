"use client";
import React, { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

interface Message {
  type: "date" | "sent" | "received";
  content: string;
  sender?: string;
  time?: string;
  hashtag?: string;
}

const testMessages = [
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
] as Message[];

const MessageBubble = ({ message }) => {
  const renderTextWithLinks = (text) => {
    const urlRegex =
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          // add scheme if missing
          href={part.startsWith("http") ? part : `https://${part}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

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
            <p className="text-sm">{renderTextWithLinks(message.content)}</p>
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
            <p className="text-sm whitespace-pre-wrap">
              {renderTextWithLinks(message.content)}
            </p>
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
  const [messages, setMessages] = useState<Message[]>(testMessages);
  const [input, setInput] = useState("");
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Delay scroll to ensure DOM has updated
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 10);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  const handleSendMessage = (message: string) => {
    setMessages([
      ...messages,
      {
        type: "sent",
        content: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    // useEffect handles the scroll

    // clear the input
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.code === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = e.target.value.trim();
      handleSendMessage(message);
    }
  };

  return (
    <div id="chat-window" className="flex flex-col h-full bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}
        <div ref={messageEndRef}></div>
      </div>
      <div className="p-4 bg-gray-200 border-t border-gray-300">
        <div className="flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            onKeyUp={handleKeyPress}
            className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-black placeholder-gray-500"
          />
          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white rounded-r px-4 py-2 h-[42px] flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
