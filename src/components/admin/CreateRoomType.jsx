import React, { useReducer, useState } from 'react'
import { toast } from 'react-toastify';

import { Link, useNavigate } from 'react-router-dom';

import { getError, BASE_URL, LoadingSpinner, Messages } from '../helpers';

import { useAuth } from '../../hooks';

import { createReducer } from '../../state/Reducers';
import { IconArrowBackCircleSharp, IconSave } from '../../icons';

export default function CreateRoomType() {
  const navigate = useNavigate();

  const { axiosInstance, accessToken } = useAuth();

  const [createState, createDispatch] = useReducer(createReducer, {
    data: [],
    loading: false,
    error: null,
  });
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');


  const createHandler = async (e) => {
    e.preventDefault();
    try {
      createDispatch({ type: 'CREATE_REQUEST' });
      const {data} = await axiosInstance.post(
        `${BASE_URL}/room-types`,
        {
          title,
          slug,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      createDispatch({ type: 'CREATE_SUCCESS', payload: data.data.roomType });
      toast.success(data.message);
      navigate(`/admin/room-types`);
    } catch (err) {
        createDispatch({ type: 'CREATE_FAIL', payload: getError(err), });
    }
  };

  // Generate slug
  function generateSlug(title) {
    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSlug(generatedSlug);
    return generatedSlug;
  }
  
  

  return (
    <div className="container w-full md:max-w-3xl mx-auto pt-20">
      
        {createState.loading && <LoadingSpinner/>}
        {createState.error && <Messages>{createState.error}</Messages>}
        <div className="flex flex-wrap">
          
          <div className="w-full mb-4">
            <h1 className="block uppercase tracking-wide text-gray-700 text-lg font-bold mb-2">
              New Room Type
            </h1>
          </div>

          

        </div>

      <form className="flex flex-wrap">
        
        <div className="w-full md:w-1/2 mb-4 md:pr-2">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input 
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="title" 
            type="text" 
            placeholder="Title"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="w-full md:w-1/2 mb-4 md:pl-2">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="slug">
            Slug
          </label>
          <input 
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="slug" 
            type="text" 
            placeholder="slug"
            onChange={(e) => generateSlug(e.target.value)}
          />
        </div>

      </form>

      <div className="flex mb-4">
        <div className={`mb-4 ${createState.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={!createState.loading ? createHandler : undefined}>
          <IconSave title="Save the room type" />
        </div>
        <div className="ml-4">
          <Link to={`/admin/room-types`}>
            <IconArrowBackCircleSharp title="Back to all room types" />
          </Link>
       
        </div>
      </div>
      
    </div>
  )
}