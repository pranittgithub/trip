import React, { useContext, useEffect, useRef } from "react";
import { LogInContext } from "../../../Context/LogInContext/Login";
import { ChatContext } from "../../../Context/ChatContext";
import { useNavigate } from "react-router-dom";


const Message = ({ message }) => {
  const { user } = useContext(LogInContext);
  const { data } = useContext(ChatContext);
  const navigate = useNavigate();
  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const isTripMessage = message.tripDetails !== undefined;

  const handleTripClick = () => {
    navigate(`/my-trips/${message.tripDetails.tripId}`); // Navigate to trip details page
  };

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === user.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === user.uid
              ? user.photoURL
              : data.user.photoURL
          }
          alt=""
        />
        <span>{new Date(message.date?.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>

      {/* <div className="messageContent">
        <p>{message.text}</p>
        {message.img && <img src={message.img} alt="" />}
      </div> */}
      <div className="messageContent">
        {isTripMessage ? (
          // 🎯 Display the trip card if the message contains trip data
          <div className="trip-card bg-gray-100 p-5 rounded-md shadow-md cursor-pointer flex flex-col items-center text-center" onClick={handleTripClick}>
            <img
              src={message.tripDetails.photo || "/default-trip.png"}
              alt="Trip Image"
              className="object-cover mb-2"
              // className="h-40 w-full object-cover rounded-md mb-2"
            />
            <p className="font-bold text-lg ">📍 {message.tripDetails.location}</p>
            <div className="flex flex-col items-center text-center gap-1 mt-2">
            <p className="text-sm">{message.tripDetails.noOfDays} {message.tripDetails.noOfDays > 1 ? "Days" : "Day"}</p>
            <p className="text-sm">💰 {message.tripDetails.budget} Budget</p>
            </div>
          </div>
        ) : (
          // 📝 Show normal message text
          <p>{message.text}</p>
        )}

        {message.img && <img src={message.img} alt="" />}
      </div>
    </div>
  );
};

export default Message;
