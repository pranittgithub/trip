import { getCityDetails, PHOTO_URL } from "@/Service/GlobalApi";
import React, { useEffect, useState, useContext } from "react";
import { ChatContext } from "../../../Context/ChatContext"; // Import Chat Context
import { LogInContext } from "../../../Context/LogInContext/Login"; // Import User Context
import { v4 as uuid } from "uuid";
import { arrayUnion, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/Service/firebase";
import { useNavigate } from "react-router-dom";

const AlltripsCard = ({ trip }) => {
  const [cityDets, setCityDets] = useState([]);
  const [photos, setPhotos] = useState("");
  const [Url, setUrl] = useState("");
  const navigate = useNavigate();

  const city = trip?.tripData?.location;

  const { data } = useContext(ChatContext); // Get active chat ID
  const { user } = useContext(LogInContext);

  const getCityInfo = async () => {
    const data = {
      textQuery: city,
    };
    const result = await getCityDetails(data)
      .then((res) => {
        setCityDets(res.data.places[0]);
        setPhotos(res.data.places[0].photos[0].name);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    console.log(data.chatId);
    trip && getCityInfo();
  }, [trip]);

  useEffect(() => {
    const url = PHOTO_URL.replace("{replace}", photos);
    setUrl(url);
    console.log(data.chatId);
  }, [photos]);

  const shareTrip = async () => {
    console.log(data.chatId + "Hello ");

    if (!trip || !data.chatId) {
      console.log("No active chat selected!");
      return;
    }
    const tripMessage = {
      id: uuid(),
      senderId: user.uid,
      date: Timestamp.now(),
      tripDetails: {
        tripId: trip.tripId,
        location: trip.tripData.location,
        noOfDays: trip.userSelection.noOfDays,
        budget: trip.userSelection.Budget,
        photo: Url || "/default-trip.jpg",
      },
    };
    try {
      // Save trip to Firestore chat messages
      console.log(data.chatId + "Hello");
      let chatCollection = data.isGroupChat ? "groups" : "chats";
      await updateDoc(doc(db, chatCollection, data.chatId), {
        messages: arrayUnion(tripMessage),
      });
      console.log("Trip shared successfully!");
      navigate(`/chat`);
    } catch (error) {
      console.error("Error sharing trip:", error);
    }
  };

  return (
    <>
      <div className="card-card border-foreground/20 p-1 h-full flex flex-col gap-3">
        <div className="img relative h-full rounded-lg overflow-hidden duration-500 group">
          <img
            src={Url || "/logo.png"}
            className="h-56 w-full object-cover group-hover:scale-110 duration-500 transition-all"
            alt={Url || "/logo.png"}
          />
          <div className="absolute inset-0 bg-background/90 flex flex-col items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-gradient-to-b text-lg from-primary/90 to-primary/60 bg-clip-text text-transparent font-bold">
              {trip.userSelection.location}
            </span>
            <span className="bg-gradient-to-b text-lg from-primary/90 to-primary/60 bg-clip-text text-transparent font-bold">
              {trip.userSelection.noOfDays}{" "}
              {trip.userSelection.noOfDays > 1 ? "Days" : "Day"}
            </span>
            <span className="bg-gradient-to-b text-lg from-primary/90 to-primary/60 bg-clip-text text-transparent font-bold">
              {trip.userSelection.Budget} Budget
            </span>
          </div>
        </div>
        {data.chatId!=="null" && (
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={shareTrip}
          >
            Share With {data.isGroupChat ? data.user.groupName : data.user.displayName}
          </button>
        )}
      </div>
    </>
  );
};

export default AlltripsCard;
