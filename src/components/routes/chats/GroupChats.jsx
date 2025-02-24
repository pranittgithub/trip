import React, { useState, useEffect, useContext } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../../../Service/firebase";
import { LogInContext } from "../../../Context/LogInContext/Login";
import { ChatContext } from "../../../Context/ChatContext";


const GroupChats = () => {
  const { user } = useContext(LogInContext);
  const { dispatch } = useContext(ChatContext);
  const [groups, setGroups] = useState([]);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState({});
  const [groupAdmins, setGroupAdmins] = useState({});
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  useEffect(() => {
    if (!user) return;
    const fetchGroups = async () => {
      try {
        const userDocRef = doc(db, "Users", user.email); // Reference to user's document
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const userGroups = userData.groups || []; // Extract groups array or default to empty array

          const groupDataPromises = userGroups.map(async (group) => {
            const groupDocRef = doc(db, "groups", group.groupId);
            const groupDocSnap = await getDoc(groupDocRef);
            if (groupDocSnap.exists()) {
              const groupData = groupDocSnap.data();
              return {
                ...group,
                lastMessage: groupData.lastMessage || null,
                createdBy: groupData.createdBy || "",
              };
            }
            return { ...group, lastMessage: null, createdBy: "" };
          });
          const groupsWithMessages = await Promise.all(groupDataPromises);
          groupsWithMessages.sort((a, b) => {
            const timeA = a.lastMessage?.time?.seconds || 0;
            const timeB = b.lastMessage?.time?.seconds || 0;
            return timeB - timeA;
          });

          setGroups(groupsWithMessages);
          const adminMap = {};
          groupsWithMessages.forEach((group) => {
            adminMap[group.groupId] = group.createdBy;
          });
          console.log(groupsWithMessages);
          console.log(adminMap);
          setGroupAdmins(adminMap);
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
  const toggleMembers = async (groupId) => {
    if (expandedGroup === groupId) {
      setExpandedGroup(null);
      return;
    }
    try {
      const groupDocRef = doc(db, "groups", groupId);
      const groupDocSnap = await getDoc(groupDocRef);

      if (groupDocSnap.exists()) {
        const groupData = groupDocSnap.data();
        setGroupMembers((prev) => ({
          ...prev,
          [groupId]: groupData.members || [],
        }));
        setExpandedGroup(groupId);
      } else {
        console.log("Group document not found!");
      }
    } catch (error) {
      console.error("Error fetching group members:", error);
    }
  };
  return (
    <div className="group-chats p-2">
      {groups.length > 0 ? (
        groups.map((group) => (
          <div
            key={group.groupId}
            className="group-chat-item p-3 bg-gray-800 rounded-lg my-2 cursor-pointer hover:bg-gray-700 transition"
          >
            <div onClick={() => handleSelectGroup(group)}>
              <span className="text-white font-medium">{group.groupName}</span>
              {group.lastMessage ? (
                <div>
                  <span className="text-gray-400 text-sm mt-1">
                    {group.lastMessage.sentBy}: {group.lastMessage.lastMsgTxt}
                  </span>
                </div>
              ) : (
                <span className="text-gray-500 text-sm mt-1">
                  
                </span>
              )}
              {/* {groupAdmins[group.groupId] === user.uid && (
                <button
                  onClick={() => setSelectedGroup(group)}
                  className="bg-blue-600 text-white p-2 rounded-md mt-2 hover:bg-blue-500"
                >
                  Add Members
                </button>
              )} */}
            </div>
            <button
              onClick={() => toggleMembers(group.groupId)}
              className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              {expandedGroup === group.groupId
                ? "Hide Members"
                : "View Members"}
            </button>
            {expandedGroup === group.groupId && groupMembers[group.groupId] && (
              <div className="mt-2 p-2 bg-gray-700 rounded-lg">
                {groupMembers[group.groupId].length > 0 ? (
                  groupMembers[group.groupId].map((member) => (
                    <div
                      key={member.uid}
                      className="flex items-center space-x-2 p-1"
                    >
                      <img
                        src={
                          member.userPicture || "https://via.placeholder.com/40"
                        }
                        alt={member.userName}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-gray-200">
                        {member.userName} ({member.userEmail})
                      </span>
                      {member.uid === groupAdmins[group.groupId] && (
                        <span className="text-yellow-400 font-bold">ADMIN</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No members found</p>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-400 text-center mt-4">No Groups Found</p>
      )}
    </div>
  );
};

export default GroupChats;
