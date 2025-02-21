import React, { useState, useEffect, useContext } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../Service/firebase";
import { LogInContext } from "../../../Context/LogInContext/Login";
import { ChatContext } from "../../../Context/ChatContext";

const GroupChats = () => {
  const { user } = useContext(LogInContext);
  const { dispatch } = useContext(ChatContext);
  const [groups, setGroups] = useState([]);
  useEffect(() => {
    if (!user) return;
    const fetchGroups = async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, "Users", user.email); // Reference to user's document
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userGroups = userData.groups || []; // Extract groups array or default to empty array
          setGroups(userGroups);
        } else {
          console.log("No such user document!");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    fetchGroups();
  }, [user]);

  const handleSelectGroup = (group) => {
    dispatch({
      type: "CHANGE_GROUP",
      payload: group, // Dispatch group data
    });
  };
  return (
    <div className="group-chats p-2">
      {groups.length > 0 ? (
        groups.map((group) => (
          <div
            key={group.groupId}
            className="group-chat-item flex items-center p-3 bg-gray-800 rounded-lg my-2 cursor-pointer hover:bg-gray-700 transition"
            onClick={() => handleSelectGroup(group)}
          >
            <span className="text-white font-medium">{group.groupName}</span>
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center mt-4">No Groups Found</p>
      )}
    </div>
  );
};

export default GroupChats;
