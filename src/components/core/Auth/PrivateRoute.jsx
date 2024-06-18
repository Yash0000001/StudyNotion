import React, { Children } from 'react'
import { useSelector } from 'react-redux'

export const PrivateRoute = ({children}) => {
    const {token}=useSelector((state)=>state.auth);
    if(token!=null){
        return children
    }
    else{
        return <Navigate to="/login"/>
    }
  
}
