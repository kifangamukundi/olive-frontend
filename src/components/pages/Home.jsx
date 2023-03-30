import React, {  useReducer, useEffect } from 'react'
import { toast } from 'react-toastify';
import axios from 'axios';

import { Link } from 'react-router-dom';

import { getError, BASE_URL, LoadingSpinner, Messages } from '../helpers';

import { fetchReducer } from '../../state/Reducers';
import { IconMoneyDollarCircleFill } from '../../icons';

export default function Home() {
  const [fetchState, fetchDispatch] = useReducer(fetchReducer, {
    data: [],
    loading: false,
    error: null,
  });

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Fetch available rooms
  useEffect(() => {
    const fetchData = async () => {
      try {
        fetchDispatch({ type: 'FETCH_REQUEST' });

        const {data} = await axios.get(`${BASE_URL}/rooms/available-rooms`);

        fetchDispatch({ type: 'FETCH_SUCCESS', payload: data.data.rooms });
        toast.success(data.message);

      } catch (err) {
        fetchDispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {fetchState.loading ? (
          <LoadingSpinner/>
        ) : fetchState.error ? (
          <Messages>{fetchState.error}</Messages>
        ) : (
      <div className="flex flex-wrap">

        {fetchState.data.map((room) => (
        <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4" key={room._id}>
            
          <div className="flex flex-col items-center justify-start">
            <div className="mb-4">
                <div className="w-full">
                <img src={room.defaultImage.secure_url} alt={room.title} className="w-full" />
                </div>
            </div>
            <div className="w-full">
                <div display="flex" className="flex justify-between items-center mb-4">
                  <div className="text-grey-500 hover:text-grey-600">
                      <span className="font-medium">{room.roomType.title}</span>
                  </div>
                  <p font-weight="400" color="grey.3" className="text-grey-500">
                    <time datetime={room.createdAt}>
                      {`${monthNames[new Date(room.createdAt).getMonth()]} ${new Date(room.createdAt).getDate()}, ${new Date(room.createdAt).getFullYear()}`}
                    </time>
                  </p>
                  </div>
                  <div className="text-grey-700 hover:text-grey-900">
                    <h2 className="text-xl font-bold leading-tight mb-2">{room.title}</h2>
                  </div>

                  <div display="flex" className="flex items-center">
                    <div className="w-8 h-8 rounded-full mr-2">
                      <IconMoneyDollarCircleFill title='price per person' />
                    </div>
                    <p font-weight="400" color="grey.3" className="text-grey-500">{room.price}</p>
                  </div>

                  <Link to={`/book/${room._id}`}>
                    <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
                      Book Now
                    </button>
                  </Link>

              </div>
          </div>

        </div>
        ))}             
      </div>
      )}
    </>
  )
}
