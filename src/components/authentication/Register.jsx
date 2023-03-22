import React, { useContext, useReducer, useState } from 'react'
import { toast } from 'react-toastify';
import Axios from 'axios';

import { Link, useNavigate } from 'react-router-dom';

import { getError, BASE_URL, LoadingSpinner, Messages } from '../helpers';
import { StateContext } from '../../state/StateProvider';

const reducer = (state, action) => {
    switch (action.type) {
      case 'SIGNUP_REQUEST':
        return { ...state, signUpStatus: true };
      case 'SIGNUP_SUCCESS':
        return { ...state, signUpStatus: false, user: action.payload.user };
      case 'SIGNUP_FAIL':
        return { ...state, signUpStatus: false, error: action.payload };
      default:
        return state;
    }
  };

export default function Register() {
    const navigate = useNavigate();

    const [firstname, setFirstName] = useState('');
    const [lastname, setLastName] = useState('');
    const [mobilenumber, setMobileNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [{ signUpStatus, error }, dispatch] = useReducer(reducer, {
        error: '',
      });
    
      // using context
    const { state: { userInfo } } = useContext(StateContext);

      const submitHandler = async (e) => {
          e.preventDefault();
          
          try {
          dispatch({ type: 'SIGNUP_REQUEST' });
          const { data } = await Axios.post(`${BASE_URL}/auth/register`, {
              firstname,
              lastname,
              mobilenumber,
              email,
              password,
          });

          dispatch({ type: 'USER_SIGNIN', payload: data });

          dispatch({ type: 'SIGNUP_SUCCESS', payload: data });

          toast.success(data.data);

          navigate('/');

        } catch (err) {
          dispatch({ type: 'SIGNUP_FAIL', payload: getError(err), });
        }
      };

  return (
    <div className="container w-full md:max-w-3xl mx-auto pt-20">

        {signUpStatus ? (
          <LoadingSpinner/>
        ) : error ? (
          <Messages>{error}</Messages>
        ) : (
        <div className="max-w-md mx-auto">
          <div className="w-full md:w-1/2 mb-4 md:pr-2">
            <h1 className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
              Create An Account
            </h1>
          </div>
        </div>
        )}

        <form className="max-w-md mx-auto" onSubmit={submitHandler}>
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="firstName">
                First Name
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="firstName" type="text" placeholder="Enter your first name"
            onChange={(e) => setFirstName(e.target.value)}
            />
        </div>
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="lastName">
                Last Name
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="lastName" type="text" placeholder="Enter your last name" 
            onChange={(e) => setLastName(e.target.value)}
            />
        </div>
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="mobileNumber">
                Mobile Number
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="mobileNumber" type="text" placeholder="Enter your mobile number"
            onChange={(e) => setMobileNumber(e.target.value)}
             />
        </div>

        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="email">
                Email Address
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="email" type="email" placeholder="Enter your email address"
            onChange={(e) => setEmail(e.target.value)}
             />
        </div>

        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="password">
                Password
            </label>
            <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
             />
        </div>

        <div className="mb-4">
            <button className="bg-green-900 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" >
                Register
            </button>
        </div>
        <p className="text-sm font-semibold mt-2 pt-1 mb-0">
          Already have an account?{' '}
          <Link to={`/login?redirect=/login`}>Sign-In</Link>
        </p>

        </form>
    </div>
  )
}
