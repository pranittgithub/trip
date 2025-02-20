import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { LogInContext } from '../../../context/LogInContext/Login';
import { ChatContext } from "../../../Context/ChatContext";
import { db } from "../../../Service/firebase";

const Chats = () => {
  const [chats, setChats] = useState([]);

  const {user, isAuthenticated, handleSignOut,handleSignIn } = useContext(LogInContext);
  const { dispatch } = useContext(ChatContext);

  useEffect(() => {
    console.log("hello"+user.uid);
    const getChats = () => {
      if(user?.uid){
        const unsub = onSnapshot(doc(db, "userChats", user.uid), (doc) => {
          setChats(doc.data());
        });
        return () => {
          unsub();
        };
        
      }
      

      
    };
    if(user){
      getChats();
    }
  }, [user.uid,user?.uid]);

  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });    
  };

  return (
    <div className="chats">
      {chats && Object.entries(chats)?.sort((a,b)=>b[1].date - a[1].date).map((chat) => (
        <div
          className="userChat"
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
        >
          <img src={chat[1].userInfo.photoURL} className="userimg h-full w-full object-cover overflow-hidden rounded-full" alt="" />
          <div className="userChatInfo">
            <span>{chat[1].userInfo.displayName}</span>
            <p>{chat[1].lastMessage?.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
