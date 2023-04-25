import React, {useEffect, useReducer, useMemo, useState, useContext} from 'react';
import jwt_decode from "jwt-decode";

import { toast } from 'react-toastify';

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

import { Link, useParams } from 'react-router-dom';
import { IconCheckCircle } from '../../icons';

import { useAuth } from '../../hooks';
import { StateContext } from '../../state/StateProvider';

import { getError, BASE_URL, LoadingSpinner, Messages, ImageCarousel } from '../helpers';

import { useDateRangePicker } from '../../hooks';
import { fetchReducer, createReducer } from '../../state/Reducers';

export default function Book() {
const { axiosInstance, accessToken } = useAuth();

const { state: { userInfo }, dispatch: ctxDispatch } = useContext(StateContext);

const decodedUser = userInfo ? jwt_decode(userInfo.user.accessToken) : null;

const { id } = useParams();

const [content, setContent] = useState({
    "type": "doc",
    "content": [
        {
            "type": "paragraph",
            "content": [
                {
                    "type": "text",
                    "text": "test"
                }
            ]
        }
    ]
});
// room state
const [fetchState, fetchDispatch] = useReducer(fetchReducer, {
    data: [],
    loading: false,
    error: null,
    });

const [predictState, predictDispatch] = useReducer(fetchReducer, {
    data: [],
    loading: false,
    error: null,
    });
// stk push state
const [stkPushState, stkPushDispatch] = useReducer(createReducer, {
    data: [],
    loading: false,
    error: null,
    });
// stk query state
const [stkPushQueryState, stkPushQueryDispatch] = useReducer(createReducer, {
    data: [],
    loading: false,
    error: null,
    });

const {
    startDate,
    endDate,
    handleStartDateChange,
    handleEndDateChange,
    } = useDateRangePicker();

// Fetch the room
useEffect(() => {
    const fetchData = async () => {
      try {
        fetchDispatch({ type: 'FETCH_REQUEST' });
        const {data} = await axiosInstance.get(
            `${BASE_URL}/rooms/${id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

        fetchDispatch({ type: 'FETCH_SUCCESS', payload: data.data.room });
        setContent(data.data.room.content);
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

  const output = useMemo(() => {
    return generateHTML(content, [
        StarterKit,
        Underline,
        Highlight.configure({multicolor: true}),
    ])
    }, [content]);

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            stkPushDispatch({ type: 'CREATE_REQUEST' });
            const {data} = await axiosInstance.post(
                `${BASE_URL}/mpesa/stkpush`,
                {
                  phone: decodedUser.mobilenumber,
                  amount: fetchState.data.price,
                },
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              );
            
            stkPushDispatch({ type: 'CREATE_SUCCESS', payload: data.data.mpesa });
            stkPushQuery(data.data.mpesa.CheckoutRequestID);
            toast.success(data.message);

         } catch (err) {
            stkPushDispatch({ type: 'CREATE_FAIL', payload: getError(err), });
        }
    };

    const handlePrediction = async (e) => {
        e.preventDefault();
        try {
            predictDispatch({ type: 'CREATE_REQUEST' });
            const {data} = await axiosInstance.post(
                `${BASE_URL}/predictions`,
                {
                  price: 1,
                },
                {
                  headers: { Authorization: `Bearer ${accessToken}` },
                }
              );
            
            predictDispatch({ type: 'CREATE_SUCCESS', payload: data.data.result });

         } catch (err) {
            predictDispatch({ type: 'CREATE_FAIL', payload: getError(err), });
        }
    };

    const stkPushQuery = async (checkOutRequestID) => {
        try {
          let reqcount = 0;
          const interval = setInterval(async () => {
            reqcount++;
            if (reqcount === 30) {
              stkPushQueryDispatch({ type: 'CREATE_FAIL', payload: "Payment timed out" });
              clearInterval(interval);
            }
            stkPushQueryDispatch({ type: "CREATE_REQUEST" });
            const { data } = await axiosInstance.post(
                `${BASE_URL}/mpesa/stkpushquery`,
                {
                CheckoutRequestID: checkOutRequestID,
                },
                {
                headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            const resultCode = data.data.mpesa.ResultCode;
            
            if (resultCode === "0") {
                stkPushQueryDispatch({ type: 'CREATE_SUCCESS', payload: data.data.mpesa });
                clearInterval(interval);
              } else if (resultCode === "2001") {
                stkPushQueryDispatch({ type: 'CREATE_FAIL', payload: "Invalid user credentials" });
                clearInterval(interval);
              } else if (resultCode === "1") {
                stkPushQueryDispatch({ type: 'CREATE_FAIL', payload: "Insufficient balance" });
                clearInterval(interval);
              } else if (resultCode === "1032") {
                stkPushQueryDispatch({ type: 'CREATE_FAIL', payload: "Transaction cancelled by user" });
                clearInterval(interval);
              } else if (resultCode === "1037") {
                stkPushQueryDispatch({ type: 'CREATE_FAIL', payload: "DS timeout user cannot be reached"})
                clearInterval(interval)
              } else {
                stkPushQueryDispatch({ type: 'CREATE_FAIL', payload: "Unknown error occurred" });
                clearInterval(interval);
              }
            }, 2000);
        } catch (err) {
            stkPushQueryDispatch({
                type: "CREATE_FAIL",
                payload: getError(err),
              });
        }
      };
          
      

  return (
    <div className="container w-full md:max-w-3xl mx-auto pt-20">
      
      {fetchState.loading ? (
          <LoadingSpinner/>
        ) : fetchState.error ? (
          <Messages>{fetchState.error}</Messages>
        ) : (
        <div className="flex flex-wrap">
          
          <div className="w-full mb-4">
            <h1 className="block uppercase tracking-wide text-gray-700 text-lg font-bold mb-2">
              {fetchState.data.title}
            </h1>
          </div>

        </div>
      )}

    <div class="flex flex-wrap">

        <div class="w-full md:w-1/2 lg:w-1/2 px-2 mb-4">
            
            <div className="w-full mb-4">
                <ImageCarousel images={fetchState?.data?.otherImages} description ={fetchState.data.title} />
            </div>

        </div>

        <div class="w-full md:w-1/2 lg:w-1/2 px-2 mb-4">
            
            <form className="flex flex-wrap">

                <div className="w-full md:w-1/2 mb-4 md:pr-2">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="start-date">
                    Check In
                </label>
                <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(event) => handleStartDateChange(event.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                </div>
                <div className="w-full md:w-1/2 mb-4 md:pl-2">
                <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="end-date">
                    Check Out
                </label>
                <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(event) => handleEndDateChange(event.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                </div>

            </form>

            <div className="flex flex-wrap pl-2">
                <div className="w-full md:w-1/2 mb-4 md:pr-2">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="price">
                        Price Per Person
                    </label>
                    <p class="text-3xl font-bold text-green-500">{fetchState.data.price}</p>
                </div>

                <div className="w-full md:w-1/2 mb-4 md:pr-2">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="capacity">
                        Maximum Capacity
                    </label>
                    <p class="text-3xl font-bold text-green-500">{fetchState.data.capacity}</p>
                </div>

                <div className="w-full md:w-1/2 mb-4 md:pr-2">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="room-type">
                        Room Type
                    </label>
                    <p class="text-xl font-bold text-green-500">{fetchState?.data?.roomType?.title}</p>
                </div>

                <div className="w-full md:w-1/2 mb-4 md:pr-2">
                    <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="room-perks">
                        Perks Offered
                    </label>
                    
                    <div className="flex flex-wrap">
                        {fetchState?.data?.categories?.map((perk) => (
                        <div className="w-full md:w-1/2 mb-4 md:pr-2" key={perk._id}>
                            <p class="text-xs font-bold text-green-500">{perk.title}</p>
                        </div>
                        ))}
                    </div>

                </div>
                <div className="w-full md:w-1/2 mb-4 md:pr-2">
                    
                    {stkPushState.loading && <LoadingSpinner />}
                    {stkPushState.error && <Messages>{stkPushState.error}</Messages>}
                    {!stkPushState.loading && !stkPushState.error && (
                    <button onClick={handlePayment} class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full">
                      Pay
                    </button>
                
                    )}


                </div>

                <div className="w-full md:w-1/2 mb-4 md:pr-2">

                    {stkPushQueryState.loading && <LoadingSpinner />}
                    {stkPushQueryState.error && <Messages>{stkPushQueryState.error}</Messages>}
                    {!stkPushQueryState.loading && !stkPushQueryState.error && (
                    <div>
                        {stkPushQueryState.data.ResultCode === "0" ? (
                        <div>
                            <IconCheckCircle title='payment successful' />
                            {/* {stkPushQueryState.data.ResultDesc} */}
                        </div>
                        ) : (
                        <div>
                            {stkPushQueryState.error === "Invalid user credentials" ? (
                            <div>Invalid user credentials. Please check your credentials and try again.</div>
                            ) : stkPushQueryState.error === "Insufficient balance" ? (
                            <div>Insufficient balance. Please top up your account and try again.</div>
                            ): stkPushQueryState.error === "Payment timed out" ?(
                            <div>Payment timed out. Please don't wait for too long.</div>
                            ) : stkPushQueryState.error === "Transaction cancelled by user" ? (
                            <div>The transaction was cancelled by the user.</div>
                            ) : (
                            <div>{stkPushQueryState.error}</div>
                            )}
                        </div>
                        )}
                    </div>
                    )}

                </div>
            </div>

        </div>

    </div>


      <div className="flex flex-wrap">

        <div className="w-full mb-4">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="description">
                        Room Description
            </label>
            
            <div class="prose prose-lg text-gray-700">
                <div dangerouslySetInnerHTML={{ __html: output }} />
            </div>

        </div>

      </div>

    </div>
  )
}
