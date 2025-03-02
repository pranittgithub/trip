import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../../Service/Firebase";
import { Plus } from "lucide-react";

const AddMembersModal = ({ group, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearch = async () => {
    if (!searchTerm) return;

    const q = query(collection(db, "Users"), where("userName", "==", searchTerm));

    try {
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (!group.members.some((m) => m.uid === userData.uid)) {
          users.push(userData);
        }
      });
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const addUserToGroup = async () => {
    if (selectedUsers.length === 0) return alert("Select users to add!");

    try {
      const groupRef = doc(db, "groups", group.groupId);
      await updateDoc(groupRef, {
        members: arrayUnion(...selectedUsers),
      });

      await Promise.all(
        selectedUsers.map(async (user) => {
          const userRef = doc(db, "Users", user.userEmail);
          await updateDoc(userRef, {
            groups: arrayUnion({ groupId: group.groupId, groupName: group.groupName }),
          });
        })
      );

      alert("Members added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding members:", error);
    }
  };

  return (
    <div className="modal">
      <div className="modalForm">
        <input
          type="text"
          placeholder="Search Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {searchResults.map((user) => (
        <div key={user.uid} className="userChat">
          <span>{user.userName}</span>
          <button onClick={() => setSelectedUsers([...selectedUsers, user])}>
            <Plus className="text-green-400 w-5 h-5" />
          </button>
        </div>
      ))}
      <button onClick={addUserToGroup} className="bg-green-600 p-2 rounded-md">
        Add Members
      </button>
      <button onClick={onClose} className="bg-red-600 p-2 rounded-md">
        Cancel
      </button>
    </div>
  );
};

export default AddMembersModal;
