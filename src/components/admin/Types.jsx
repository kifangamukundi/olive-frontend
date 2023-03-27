import React, {  useReducer, useEffect } from 'react'
import { toast } from 'react-toastify';

import { Link } from 'react-router-dom';

import { getError, BASE_URL, LoadingSpinner, Messages } from '../helpers';

import { useAuth } from '../../hooks';
import { IconAddCircle, IconArrowBackCircleSharp, IconDelete, IconEdit } from '../../icons';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        roomTypes: action.payload.data.roomtypes,
        loading: false,
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        loadingDelete: false,
        successDelete: true,
      };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };
    default:
      return state;
  }
};
export default function Types() {
  const first20 = /^([\w'-]+(?:\s+[\w'-]+){0,19})/;

  const { axiosInstance, accessToken } = useAuth();

  
  const [{ loading, error, roomTypes, loadingDelete, 
    successDelete }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });
  
  useEffect(() => {
    const fetchData = async () => {
        try {
        const { data } = await axiosInstance.get(
            `${BASE_URL}/room-types`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        toast.success(data.message);
        } catch (err) {
          dispatch({
            type: 'FETCH_FAIL',
            payload: getError(err),
          });
        }
    };
    if (successDelete) {
        dispatch({ type: 'DELETE_RESET' });
    } else {
        fetchData();
    }
    }, [successDelete, accessToken]);

  // Delete Handler
  const deleteHandler = async (type) => {
    if (window.confirm('Are you sure you want to delete?')) {
        try {
        dispatch({ type: 'DELETE_REQUEST' });
        const {data} = await axiosInstance.delete(`${BASE_URL}/room-types/${type._id}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        dispatch({ type: 'DELETE_SUCCESS', payload: data });
        toast.success(data.message);
        } catch (error) {
          dispatch({
              type: 'DELETE_FAIL',
              payload: getError(error),
          });
        }
    }
  };

  return (
    <>
      {/* Top Section */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-8">
                <h1 class="text-3xl font-bold text-gray-900">Manage Room Types</h1>
                <div class="mt-4">
                <div class="flex flex-wrap -mx-4 mt-4">

                    <div class="w-full md:w-1/2 px-4 mb-4 md:mb-0 p-6">
                          <Link to={`/admin`}>
                            <IconArrowBackCircleSharp title="Back to dashboard" />
                          </Link>
                    </div>

                    <div class="w-full md:w-1/2 px-4 mb-4 md:mb-0 p-6">
                          <Link to={`/admin/room-types/create`}>
                              <IconAddCircle title="Add a new room type" />
                          </Link>
                    </div>
                    
                </div>
                </div>
            </div>
        </div>

        {(loading || loadingDelete) ? (
          <LoadingSpinner/>
        ) : error ? (
          <Messages>{error}</Messages>
        ) : (
        <div class="flex flex-wrap">

            {roomTypes.map((type) => (
            <div key={type._id} class="w-full md:w-1/2 lg:w-1/3 px-2 mb-4">
                <div class="bg-white shadow-md rounded-md overflow-hidden">
                  <div class="bg-gray-200 px-4 py-2">
                      <h2 class="text-lg font-semibold text-gray-700">{type.title.match(first20)[1]}</h2>
                  </div>
                  <div class="px-4 py-2">
                      <ul class="divide-y divide-gray-300">

                      <li class="py-2 flex">
                          <div class="ml-4">
                              <div class="flex mt-2">
                              <Link to={`/admin/rooms/edit/${type._id}`} state={type}>
                                <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md mr-2">
                                   <IconEdit title='edit perk' />
                                </button>
                              </Link>
                              <button onClick={() => deleteHandler(type)} class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md">
                                  <IconDelete title='delete perk' />
                              </button>
                              </div>
                          </div>
                      </li>
                      </ul>
                  </div>
                </div>
            </div>
            ))}
                
        </div>
        )}

    </>
  )
}
