import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './Context/Appcontext';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegisterLogin = () => {
  const [state, setState] = useState('sign up');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const Navigate = useNavigate();
  const { backendUrl, setIsLoggedin,getUserData } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();
      axios.defaults.withCredentials = true;
      if (state === 'sign up') {
        const { data } = await axios.post(backendUrl + '/api/auth/register', {
          name,
          email,
          password
        });
        if (data.success) {
        await  getUserData();
          Navigate('/user-home');
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          backendUrl + '/api/auth/login',
          {
            email,
            password
          },
          {
            withCredentials: true
          }
        );

        if (data.success) {
          setIsLoggedin(true);
        await getUserData();
           Navigate('/user-home');
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
    
  };
  return (
    <div className='flex flex-col items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <div className='bg-slate-900 p-10 rounded shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>
          {state === 'sign up' ? 'Create Account' : 'Login to'}
        </h2>
        <p className='text-center text-sm mb-6'>
          {state === 'sign up' ? 'Create your account' : 'Login to your account'}
        </p>
        <form onSubmit={onSubmitHandler}>
          {state === 'sign up' && (
            <div className='h-20 mb-6 flex items-center gap-3 w-full px-3 py-3 rounded-3xl bg-[#ffffff]'>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                className='bg-white text-black border border-black rounded px-4 py-2 mt-4 w-72 focus:outline-none focus:ring-2 focus:ring-black'
                type='text'
                placeholder='Full Name'
                required
              />
            </div>
          )}
          <div className='h-20 mb-6 flex items-center gap-3 w-full px-3 py-3 rounded-3xl bg-[#ffffff]'>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='bg-white text-black border border-black rounded px-4 py-2 mt-4 w-72 focus:outline-none focus:ring-2 focus:ring-black'
              type='email'
              placeholder='Email id'
              required
            />
          </div>

          <div className='h-20 mb-4 flex items-center gap-3 w-full px-3 py-3 rounded-3xl bg-[#ffffff]'>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='bg-white text-black border border-black rounded px-4 py-2 mt-4 w-72 focus:outline-none focus:ring-2 focus:ring-black'
              type='password'
              placeholder='Password'
              required
            />
          </div>

          <p
            onClick={() => Navigate('/Register-Resetpass')}
            className='mb-4 text-indigo-500 cursor-pointer'
          >
            Forgot password?
          </p>

          <button className='w-full py-2 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>
            {state}
          </button>
        </form>

        {state === 'sign up' ? (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Already have an account?
            <span
              onClick={() => setState('login')}
              className='text-blue-400 cursor-pointer underline'
            >
              {' '}
              Login here
            </span>
          </p>
        ) : (
          <p className='text-gray-400 text-center text-xs mt-4'>
            Don’t have an account?
            <span
              onClick={() => setState('sign up')}
              className='text-blue-400 cursor-pointer underline'
            >
              {' '}
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterLogin;
