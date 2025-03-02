import React, { useContext } from 'react'
import {signOut} from "firebase/auth"
import { auth } from '../../../Service/Firebase'
import { LogInContext } from '../../../Context/LogInContext/Login';


const Navbar = () => {
   const { user, isAuthenticated, handleSignOut,handleSignIn } = useContext(LogInContext);

  return (
    <div>
    <div className='navbar'>
      <span className="logo">Trip Chat</span>
      <div className="user">
        <img src={user.photoURL} alt="" />
        <span>{user.displayName}</span>
        {/* <button onClick={()=>signOut(auth)}>logout</button> */}
      </div>
    </div>
    
    </div>
  )
}

export default Navbar