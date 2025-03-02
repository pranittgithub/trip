import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../../../Context/ChatContext";
import { db } from "../../../Service/Firebase";
import Message from "./Message";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const { data } = useContext(ChatContext);

  useEffect(() => {
    if (!data.chatId || data.chatId === "null") return; 
    const chatCollection = data.isGroupChat ? "groups" : "chats";
    const chatRef = doc(db, chatCollection, data.chatId);
    const unSub = onSnapshot(chatRef, (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [data.chatId,data.isGroupChat]);

  console.log(messages)

  return (
    <div className="messages">
      {messages && messages.length > 0 ?(messages.map((m) => (
        <Message message={m} key={m.id} />
      ))): (
        <div className="flex items-center justify-center h-full text-gray-500">
          No messages yet
        </div>
      )}
    </div>
  );
};

export default Messages;
