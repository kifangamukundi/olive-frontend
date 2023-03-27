import React, {  useReducer, useEffect } from 'react'
import { toast } from 'react-toastify';

import { Link } from 'react-router-dom';

import { getError, BASE_URL, LoadingSpinner, Messages } from '../helpers';

import { useAuth } from '../../hooks';

import { fetchReducer } from '../../state/Reducers';

import { IconViewDashboard } from '../../icons';

export default function Dashboard() {
  const { axiosInstance, accessToken } = useAuth();

  const [roomCountState, roomCountDispatch] = useReducer(fetchReducer, {
    data: [],
    loading: false,
    error: null,
  });

  const [averageRoomPriceState, setAverageRoomPriceCountDispatch] = useReducer(fetchReducer, {
    data: [],
    loading: false,
    error: null,
  });

   // Fetch room count
   useEffect(() => {
    const fetchData = async () => {
      try {
        roomCountDispatch({ type: 'FETCH_REQUEST' });

        const {data} = await axiosInstance.get(
            `${BASE_URL}/rooms/room-count`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

        roomCountDispatch({ type: 'FETCH_SUCCESS', payload: data.data });

      } catch (err) {
        roomCountDispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, []);

   // Fetch average room price
   useEffect(() => {
    const fetchData = async () => {
      try {
        setAverageRoomPriceCountDispatch({ type: 'FETCH_REQUEST' });

        const {data} = await axiosInstance.get(
            `${BASE_URL}/rooms/average-room-price`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

        setAverageRoomPriceCountDispatch({ type: 'FETCH_SUCCESS', payload: data.data });

      } catch (err) {
        setAverageRoomPriceCountDispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, []);

  return (
    <>
        {/* Top section */}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-8">
                <h1 class="text-3xl font-bold text-gray-900">Overview</h1>
                <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">Rooms</h2>
                    {roomCountState.loading && <LoadingSpinner />}
                    {roomCountState.error && <Messages>{roomCountState.error}</Messages>}
                    {!roomCountState.loading && !roomCountState.error && (
                    <p class="text-3xl font-bold text-green-500">{roomCountState.data.roomCount}</p>
                    )}
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">Average Room Price</h2>
                    {averageRoomPriceState.loading && <LoadingSpinner />}
                    {averageRoomPriceState.error && <Messages>{averageRoomPriceState.error}</Messages>}
                    {!averageRoomPriceState.loading && !averageRoomPriceState.error && (
                    <p class="text-3xl font-bold text-blue-500">{averageRoomPriceState.data.averagePrice}</p>
                    )}
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">Total Bookings</h2>
                    <p class="text-3xl font-bold text-yellow-500">1</p>

                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-bold text-gray-900 mb-4">Revenue</h2>
                    <p class="text-3xl font-bold text-red-500">Ksh. 2500</p>
                </div>
                </div>
            </div>
        </div>
        {/* Management section */}
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-8">
                <h1 class="text-3xl font-bold text-gray-900">Management</h1>
                <div class="mt-4">
                <div class="flex flex-wrap -mx-4">

                    <div class="w-full md:w-1/2 px-4">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="text-lg font-bold text-gray-900 mb-4">Room perks</h2>
                        <Link to={`/admin/perks`}>
                            <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md mr-2">
                                <IconViewDashboard title='manage room perks' />
                            </button>
                        </Link>
                    </div>
                    </div>
                    
                    <div class="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="text-lg font-bold text-gray-900 mb-4">Room Types</h2>
                        <Link to={`/admin/room-types`}>
                            <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md mr-2">
                                <IconViewDashboard title='manage room types' />
                            </button>
                        </Link>
                    </div>
                    </div>
                    
                </div>
                <div class="flex flex-wrap -mx-4 mt-4">

                    <div class="w-full md:w-1/2 px-4 mb-4 md:mb-0">
                    <div class="bg-white rounded-lg shadow p-6">
                        <h2 class="text-lg font-bold text-gray-900 mb-4">Rooms</h2>
                        <Link to={`/admin/rooms`}>
                            <button class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md mr-2">
                                <IconViewDashboard title='manage rooms' />
                            </button>
                        </Link>
                    </div>
                    </div>
                    
                </div>
                </div>
            </div>
        </div>
    </>
  )
}
