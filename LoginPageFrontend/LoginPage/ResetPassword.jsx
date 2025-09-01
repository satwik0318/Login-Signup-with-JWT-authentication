import React, { useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from './Context/Appcontext'
import axios from 'axios'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const navigate = useNavigate()
  const inputRefs = useRef([])
  const { backendUrl } = useContext(AppContext)

  axios.defaults.withCredentials = true

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [isotpSubmited, setOtpSubmited] = useState(false)

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const paste = e.clipboardData.getData('text').slice(0, 6)
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char
        if (index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1].focus()
        }
      }
    })
  }

  const onSubmitEmail = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/send-reset-otp', { email })
      data.success ? toast.success(data.message) : toast.error(data.error)
      if (data.success) setIsEmailSent(true)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const onSubmitOtp = (e) => {
    e.preventDefault()
    const otpArray = inputRefs.current.map((ref) => ref?.value || '')
    const finalOtp = otpArray.join('')
    if (finalOtp.length === 6) {
      setOtp(finalOtp)
      setOtpSubmited(true)
    } else {
      toast.error('Please enter 6-digit OTP')
    }
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/reset-password', {
        email,
        otp,
        newPassword
      })
      data.success ? toast.success(data.message) : toast.error(data.message)
      if (data.success) navigate('/Register-Login')
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>

      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} className='bg-slate-900 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>
          <div className='mb-8 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] h-16'>
            <input
              type='email'
              placeholder='Email ID'
              className='bg-transparent outline-none text-white w-full'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button className='w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-950 text-white rounded-full mt-3'>Submit</button>
        </form>
      )}

      {isEmailSent && !isotpSubmited && (
        <form onSubmit={onSubmitOtp} className='bg-slate-900 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>Enter OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email</p>
          <div className='flex justify-between mb-8 px-4' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input
                key={index}
                type='text'
                maxLength='1'
                className='w-10 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md border border-white mx-1 focus:outline-none focus:ring-2 focus:ring-blue-300'
                ref={(el) => inputRefs.current[index] = el}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
              />
            ))}
          </div>
          <button className='w-full py-2 my-2 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full'>Submit</button>
        </form>
      )}

      {isEmailSent && isotpSubmited && (
        <form onSubmit={onSubmitNewPassword} className='bg-slate-900 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your new password below</p>
          <div className='mb-8 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C] h-16'>
            <input
              type='password'
              placeholder='New Password'
              className='bg-transparent outline-none text-white w-full'
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <button className='w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-950 text-white rounded-full mt-3'>Submit</button>
        </form>
      )}
    </div>
  )
}

export default ResetPassword
