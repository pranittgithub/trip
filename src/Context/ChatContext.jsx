import {
  createContext,
  useContext,
  useReducer,
} from "react";
import { LogInContext } from "./LogInContext/Login";
// import { LogInContext } from "@/Context/LogInContext/Login.jsx";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
  const { user } = useContext(LogInContext);
  const INITIAL_STATE = {
    chatId: "null",
    isGroupChat: false,
    user: {},
  };

  const chatReducer = (state, action) => {
    switch (action.type) {
      case "CHANGE_USER":
        return {
          user: action.payload,
          isGroupChat: false,
          chatId:
            user.uid > action.payload.uid
              ? user.uid + action.payload.uid
              : action.payload.uid + user.uid,
        };
        case "CHANGE_GROUP":
        return {
          isGroupChat: true,
          chatId: action.payload.groupId, // groupId is used as chatId
          user: action.payload, // Store group info
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE);

  return (
    <ChatContext.Provider value={{ data:state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
};
