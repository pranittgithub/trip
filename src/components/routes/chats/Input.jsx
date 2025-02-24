import React, { useContext, useState } from "react";
import Img from "../img/img.png";
import Attach from "../img/attach.png";
import { LogInContext } from "../../../Context/LogInContext/Login";
import { ChatContext } from "../../../Context/ChatContext";
import { useNavigate } from "react-router-dom";
import { Plane,Send} from "lucide-react";
import {
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db,storage } from "../../../Service/firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const Input = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const navigate = useNavigate(); 

  const { user } = useContext(LogInContext);
  const { data } = useContext(ChatContext);

  const handleSend = async () => {
    if (!text.trim() && !img) return;
    const chatCollection = data.isGroupChat ? "groups" : "chats";
    const chatRef = doc(db, chatCollection, data.chatId);
    
    if (img) {
      const storageRef = ref(storage, uuid());

      const uploadTask = uploadBytesResumable(storageRef, img);





      uploadTask.on(
        (error) => {
          //TODO:Handle Error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(chatRef, {
              messages: arrayUnion({
                id: uuid(),
                text,
                senderId: user.uid,
                date: Timestamp.now(),
                img: downloadURL,
              }),
            });
          });
        }
      );
    } else {


      await updateDoc(chatRef, {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: user.uid,
          date: Timestamp.now(),
          senderpic:user.photoURL,
        }),
      });
    }
    

    if(!data.isGroupChat){
      await updateDoc(doc(db, "userChats", user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });
  
      await updateDoc(doc(db, "userChats", data.user.uid), {
        [data.chatId + ".lastMessage"]: {
          text,
        },
        [data.chatId + ".date"]: serverTimestamp(),
      });

    }else{
      const lastMessageUpdate = {
        lastMsgTxt: text,
        sentBy: user.displayName, // Sender's name
        time: serverTimestamp(),
      };
      await updateDoc(chatRef, {
        lastMessage: lastMessageUpdate,
      });
    }

    

    setText("");
    setImg(null);
  };
  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type something..."
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        value={text}
      />
      <div className="send">
        {/* <img src={Attach} alt="" /> */}
        <input
          type="file"
          style={{ display: "none" }}
          id="file"
          onChange={(e) => setImg(e.target.files[0])}

        />
        <label htmlFor="file">
          {/* <img src={Img} alt="" /> */}
        </label>
        {data.chatId!=="null" &&(<button
          className="bg-gray-500 text-white flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-600 transition whitespace-nowrap"
          onClick={() => navigate("/all-trips")}
        >
          <Plane className="w-5 h-5"/>
          Share Trip
        </button>)}
        {data.chatId!=="null" &&(<button  className="bg-gray-500 text-white flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-600 transition  whitespace-nowrap"
        onClick={handleSend}><Send className="w-5 h-5"/>Send</button>)}
      </div>
    </div>
  );
};

export default Input;
