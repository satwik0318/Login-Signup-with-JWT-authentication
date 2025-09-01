import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from './Context/Appcontext'
import axios from 'axios'
import { toast } from 'react-toastify'

const UserHome = () => {
  const {userData,setUserData,backendUrl,setIsLoggedin}=useContext(AppContext)
  const navigate=useNavigate()
  // console.log(userData)
  const sendVerificationOtp=async()=>{
    try {
      axios.defaults.withCredentials=true
      const {data}=await axios.post(backendUrl+'/api/auth/send-Verify-Otp')
      if(data.success){
        navigate('/Register-verify')
        toast.success(data.message)
      }
      else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }
  const logout=async()=>{
    try {
      axios.defaults.withCredentials=true
      const {data}=await axios.post(backendUrl+'/api/auth/logout')
     if(data.success){
      setIsLoggedin(false)
      setUserData(null)
      navigate('/user-home')
     }
    } catch (error) {
      toast.error(error.message)
    }
  }
  return (
    <div className='flex justify-end pr-5'>
      {userData?(
      <div className='w-8 h-8  flex justify-center items-center rounded-full bg-black text-white relative group'> {userData?.name[0]?.toUpperCase() || '?'}
      <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10'>
        <ul className='list-none m-0 p-2 bg-gray-100 text-sm'>
          {!userData.isAccountVerified && 
          <li onClick={sendVerificationOtp} className='py-1 px-4 whitespace-nowrap hover:bg-gray-200 cursor-pointer' >verify email</li>
          }
          <li onClick={logout} className='py-1 px-4 hover:bg-gray-200 cursor-pointer '>logout</li>
        </ul>
      </div>
      </div>) :(
        <div>
<h1 className=' flex justify-center'>hey{userData?userData.name:'developer'}! </h1>
      <button className='flex items-center gap-2 border border-gray-500 rounded-full px-6 py-2 text-blue-800 hover:bg-gray-400 transition-all' onClick={()=>navigate('/Register-Login')}>login</button>
      </div>
      )
      }
    </div>
  )
}

export default UserHome
