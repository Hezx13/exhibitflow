import { createContext, FC, useContext, useEffect, useState } from "react";
import { getUserData, getUsers } from "../api/user-api";

type UserContextProps = {
    currentUser: User | null;
    users: User[]
}

const UserContext = createContext<UserContextProps | null>(null);

export const UserProvider: FC = ({children}) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([])
    
    useEffect(()=>{
        try{
            getUserData().then(user => {
              console.log(user)
                const userData = {
                    _id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
  
                }
                setCurrentUser(userData);
            })
            if (currentUser?.role === "Admin"){
              getUsers().then(usrs => {
                setUsers(usrs);
              })
            }
        } catch(error) {
            setCurrentUser(null);
        }
    }, [])

    return (
        <UserContext.Provider value={{currentUser, users}}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}