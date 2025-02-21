import React,{useState} from "react";
import Navbar from "./Navbar"
import Search from "./Search"
import Chats from "./Chats"
import CreateGroupModal from "./CreateGroupModal";
import GroupChats from "./GroupChats";

const Sidebar = () => {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [activeChatType, setActiveChatType] = useState("user");
  return (
    <div className="sidebar flex flex-col ">
      <Navbar />
      <div className="flex flex-col flex-grow overflow-y-auto">
      <div className="flex justify-center gap-2 my-2">
        <button
          className={`p-1 w-1/3 rounded-lg ${activeChatType === "user" ? "bg-gray-500 text-white" : "bg-gray-700"}`}
          onClick={() => setActiveChatType("user")}
        >
          User Chats
        </button>
        <button
          className={`p-1 w-1/3 rounded-lg ${activeChatType === "group" ? "bg-gray-500 text-white" : "bg-gray-700"}`}
          onClick={() => setActiveChatType("group")}
        >
          Group Chats
        </button>
      </div>
      {activeChatType === "group" && <div className="flex justify-center">
      <button className="w-4/5 p-2 text-white text-center bg-gray-600 rounded-2xl hover:bg-gray-400 transition duration-200 m-2 shadow-md"
        onClick={() => setShowGroupModal(!showGroupModal)}
      >
        Create Group
      </button>
      </div>}
      {showGroupModal&& activeChatType === "group" && <CreateGroupModal onClose={() => setShowGroupModal(false)} />}
      
      {activeChatType === "user" && <Search chatType="user" />}
      {activeChatType === "user" ? <Chats /> : <GroupChats />}
      </div>
    </div>
  );
};

export default Sidebar;
