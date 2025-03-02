import React, { useContext, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../Service/Firebase";
import { LogInContext } from "../../../Context/LogInContext/Login";
const Search = ({chatType}) => {
  const [username, setUsername] = useState("");
  const [user1, setUser1] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [err, setErr] = useState(false);

   const {user } = useContext(LogInContext);

  const handleSearch = async () => {
    
    let q;
    if (chatType === "user") {
      q = query(
        collection(db, "Users"),
        where("userName", "==", username)
      );
    }else{
      q = query(
        collection(db, "groups"),
        where("groupName", "==", username)
      );
    }
    

    try {
      const querySnapshot = await getDocs(q);
      let results = []
      querySnapshot.forEach((doc) => {
        if(chatType === "user"){
          setUser1(doc.data());
        }else{
        results.push({ id: doc.id, ...doc.data() });
        }
        
      });
      if (chatType === "group" &&results.length === 0) {
        setErr(true);
      } else {
        if(chatType === "group"){
          setSearchResults(results);
        }

       
      }
      // setUsername("");
      
    } catch (err) {
      console.log("helllo ji issue aa rah hai");
      setErr(true);
    }
  };

  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleSelect = async () => { 
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      user1.uid > user.uid
        ? user1.uid + user.uid
        : user.uid + user1.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        //create user chats
        console.log("putting userchat");
        console.log(user1.uid+"==="+user.uid);
        await setDoc(doc(db, "userChats", user1.uid), {
          [combinedId]: {
            userInfo: {
              uid: user.uid,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            date:serverTimestamp(),
          }, 
        },{merge:true},);
        console.log("done userchat");


        await setDoc(doc(db, "userChats", user.uid), {
          [combinedId]: {
            userInfo: {
              uid: user1.uid,
              displayName: user1.userName,
              photoURL: user1.userPicture,
            },
            date:serverTimestamp(),
          }, 
        },{merge:true},);
        console.log("done dana done");
    console.log(user1.userPicture+"hello brother")


      }
    } catch (err) {}

    setUser1(null);
    setUsername("")
  };
  return (
    <div>
    <div className="search">
      <div className="searchForm">
        <input
          type="text"
          placeholder={chatType === "user" ? "Find a user" : "Find a group"}
          onKeyDown={handleKey}
          onChange={(e) => setUsername(e.target.value)}
          value={username}
        />
      </div>
      {err&& chatType === "group" && <span>Group not found!</span>}
      {err&& chatType === "user" && <span>User not found!</span>}
      
      {user1 && chatType === "user" && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user1.userPicture} className="h-full w-full object-cover" alt="" />
          <div className="userChatInfo">
            <span>{user1.userName}</span>
          </div>
        </div>
      )}
      {searchResults && chatType === "group" &&
        searchResults.map((item) => (
          <div className="userChat" key={item.id}>
            <img src={item.groupImage} className="h-full w-full object-cover" alt="" />
            <div className="userChatInfo">
              <span>{item.groupName}</span>
            </div>
          </div>
        ))}
      {/* {searchResults && chatType === "group" && (
        <div className="userChat" onClick={handleSelect}>
          <img src={user1.userPicture} className="h-full w-full object-cover" alt="" />
          <div className="userChatInfo">
            <span>{user1.userName}</span>
          </div>
        </div>
      )} */}
     
    </div>
    </div>
  );
};

export default Search;
