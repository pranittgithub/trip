import React, { useState, useContext } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../Service/Firebase";
import { LogInContext } from "../../../Context/LogInContext/Login";
import { Plus, Minus } from "lucide-react";

const CreateGroupModal = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { user } = useContext(LogInContext);
  const [err, setErr] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) return;
    const q = query(
      collection(db, "Users"),
      where("userName", "==", searchTerm)
    );

    try {
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => users.push(doc.data()));
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const addUserToGroup = (user) => {
    if (!selectedUsers.find((u) => u.uid === user.uid)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  const removeUserFromGroup = (user) => {
    setSelectedUsers(selectedUsers.filter((u) => u.uid !== user.uid));
  };
  const handleKey = (e) => {
    e.code === "Enter" && handleSearch();
  };

  const handleCreateGroup = async () => {
    if (!groupName) return alert("Enter group name!");
    if (selectedUsers.length === 0) return alert("Add members!");

    const groupId = Date.now().toString(); // Unique ID
    const adminData = {
      uid: user.uid,
      userName: user.displayName,
      userEmail: user.email,
      userPicture: user.photoURL,
    };
    const groupData = {
      groupId,
      groupName,
      admin: adminData,
      members: [...selectedUsers, adminData],
      createdBy: user.uid,
      timestamp: serverTimestamp(),
    };
    try {
      await setDoc(doc(db, "groups", groupId), groupData);
      const allUsers = [...selectedUsers, adminData];
      await Promise.all(
        allUsers.map(async (member) => {
          const userRef = doc(db, "Users", member.userEmail); // Using email as document ID
          await updateDoc(userRef, {
            groups: arrayUnion({ groupId, groupName }),
          });
        })
      );
      alert("Group Created!");
      onClose();
      onGroupCreated();
      // window.location.reload();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div>
      <div className="modal">
        <div className="modalForm">
          <input
            type="text"
            placeholder="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <div className="modalForm">
          <input
            type="text"
            placeholder="Search Users"
            onKeyDown={handleKey}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {err && <span>User not found!</span>}
        {searchResults.map((user) => {
          const isSelected = selectedUsers.some((u) => u.uid === user.uid);
          return (
            <div>
              <div
                className={`userChat  ${
                  isSelected ? "bg-gray-800 text-white" : ""
                }`}
                key={user.uid}
                onClick={() =>
                  isSelected ? removeUserFromGroup(user) : addUserToGroup(user)
                }
              >
                <img
                  src={user.userPicture}
                  className="h-10 w-10 object-cover"
                  alt=""
                />
                <span>{user.userName}</span>
                <div className="text-white p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition duration-200">
                  {isSelected ? (
                    <Minus className="text-red-400 w-5 h-5" />
                  ) : (
                    <Plus className="text-green-400 w-5 h-5" />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="m-3">
          {selectedUsers.map((user) => (
            <span key={user.uid}>{user.userName + ", "} </span>
          ))}
        </div>
      </div>
      {/* <button onClick={handleSearch}>Search</button> */}

      <div className="flex flex-col items-center gap-4 mt-4">
        <button
          onClick={handleCreateGroup}
          className="w-4/5 p-3 text-white text-center bg-green-600 rounded-2xl hover:bg-green-500 transition duration-200 shadow-md"
        >
          Create Group
        </button>

        <button
          onClick={onClose}
          className="w-4/5 p-3 text-white text-center bg-red-600 rounded-2xl hover:bg-red-500 transition duration-200 shadow-md"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateGroupModal;
