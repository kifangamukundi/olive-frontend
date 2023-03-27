import React, {  useReducer, useEffect, useState, useMemo, useRef } from 'react'
import axios from 'axios';
import { toast } from 'react-toastify';

import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

import { Link, useNavigate, useLocation } from 'react-router-dom';

import { getError, BASE_URL, LoadingSpinner, Messages, Tiptap, ImageGalleryModal } from '../helpers';

import { useAuth, useCheckbox, useRadio } from '../../hooks';

import { IconArrowBackCircleSharp, IconCamera, IconSave, IconUpload } from '../../icons';


const reducer = (state, action) => {
    switch (action.type) {
      case 'UPDATE_REQUEST':
        return { ...state, loadingUpdate: true };
      case 'UPDATE_SUCCESS':
        return { ...state, loadingUpdate: false, product: action.payload.product };
      case 'UPDATE_FAIL':
        return { ...state, loadingUpdate: false, error: action.payload };
      case 'UPLOAD_REQUEST':
        return { ...state, loadingUpload: true, errorUpload: '' };
      case 'UPLOAD_SUCCESS':
        return {
          ...state,
          loadingUpload: false,
          errorUpload: '',
        };
      case 'UPLOAD_FAIL':
        return { ...state, loadingUpload: false, errorUpload: action.payload };
  
      default:
        return state;
    }
  };

export default function EditRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const room = location.state;

  const initialState = room;

  const { axiosInstance, accessToken } = useAuth();

  const [{ error, loadingUpdate, loadingUpload }, dispatch] =
  useReducer(reducer, {
    error: '',
  });

  const [defaultImage, setDafaultImage] = useState(room.defaultImage);
  const [images, setImages] = useState(room.otherImages);
  const [content, setContent] = useState(room.content);
  const [categories, setCategories] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [newCategories, setNewCategories] = useState([]);

  const [item, setItem] = useState(initialState);

  const [showModal, setShowModal] = useState(false);
  const handleModalOpen = () => {
    setShowModal(true);
  };

  const preSelectedIds =room.categories.map(item => item._id);
  const [checkedItems, checkboxes] = useCheckbox(newCategories, preSelectedIds);

  const [selectedId, radios] = useRadio(roomTypes, room.roomType);



  const addCheckedProperty = (options, selectedIds) => {
    return options.map((option) => {
      if (selectedIds.includes(option._id)) {
        return { ...option, checked: true };
      } else {
        return { ...option, checked: false };
      }
    });
  };

  
  // Fetch types
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`${BASE_URL}/room-types`);

        dispatch({ type: 'FETCH_SUCCESS' });

        setRoomTypes(data.data.roomtypes);
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`${BASE_URL}/categories`);

        dispatch({ type: 'FETCH_SUCCESS' });

        setCategories(data.data.categories);
        const newcollection = addCheckedProperty(data.data.categories, preSelectedIds)
        setNewCategories(newcollection)
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem(prevItem => ({
      ...prevItem,
      [name]: name === 'otherImages' ? value.split(',') : value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Only include fields that have been changed
    const updatedFields = {};
    for (const key in item) {
      if (item[key] !== initialState[key]) {
        updatedFields[key] = item[key];
      }
    }

    const updates = {
      ...updatedFields,
      content,
      categories: checkedItems,
      roomType: selectedId,
      defaultImage,
      otherImages: images,
    }

    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      const { data } = await axiosInstance.patch(`${BASE_URL}/rooms/${room._id}`, updates, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      dispatch({ type: 'UPDATE_SUCCESS', payload: data });
      toast.success(data.message);
      navigate(`/admin/rooms`);
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
    }
  };

  const fileUploadHandler = async (files) => {
    const formData = new FormData();
    // Append existing images to formData
    images.forEach((image) => {
      formData.append('files', image.secure_url);
    });
    // Append new images to formData
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
  
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      const { data } = await axios.post(`${BASE_URL}/uploads/new-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${accessToken}`,
        },
      });
      dispatch({ type: 'UPLOAD_SUCCESS' });
      toast.success('Upload Success');
      const urls = data.map((image) => ({ secure_url: image.secure_url, public_id: image.public_id }));
      // Concatenate existing images with new ones
      setImages([...images, ...urls]);
  
      if (urls.length > 0) {
        const firstImageUrl = urls[0];
        setDafaultImage(firstImageUrl);
      }
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL', payload: getError(err) });
      toast.error(getError(err));
    }
  };
  

  const handleFileInputChange = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      fileUploadHandler(files);
    }
  };

  function handleIconClick() {
    fileInputRef.current.click();
  };


  const output = useMemo(() => {
      return generateHTML(content, [
          StarterKit,
          Underline,
          Highlight.configure({multicolor: true}),
      ])
      }, []);

    
  return (
    <div className="container w-full md:max-w-3xl mx-auto pt-20">
      
      {loadingUpdate ? (
        <LoadingSpinner/>
      ) : error ? (
        <Messages>{error}</Messages>
      ) : (
        <div className="flex flex-wrap">

          <div className="w-full mb-4">
            <h1 className="block uppercase tracking-wide text-gray-700 text-lg font-bold mb-2">
              Editing: {room.title}
            </h1>
          </div>


        </div>
      )}

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
            value={item.title}
            name='title'
            onChange={handleChange}
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
            placeholder="Example... structure-name"
            value={item.slug}
            name='slug'
            onChange={handleChange}
          />
        </div>

        <div className="w-full md:w-1/2 mb-4 md:pl-2">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="price">
            Price
          </label>
          <input 
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="price" 
            type="text"
            value={item.price}
            name='price'
            placeholder="price"
            onChange={handleChange}
          />
        </div>

        <div className="w-full md:w-1/2 mb-4 md:pl-2">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="capacity">
            Capacity
          </label>
          <input 
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="capacity" 
            type="text" 
            value={item.capacity}
            name='capacity'
            placeholder="capacity"
            onChange={handleChange}
          />
        </div>

        <div className="w-full mb-4">
          <div className="mb-2">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="category">
              Room Types
            </label>
          </div>
          <div className="flex flex-wrap">
            {radios}
            <p>Selected ID: {selectedId}</p>
          </div>
        </div>

        <div className="w-full mb-4">
          <div className="mb-2">
            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="perks">
              Room Perks
            </label>
          </div>
          <div className="flex flex-wrap">
            {checkboxes}
            <div>
              <p>Selected items:</p>
              <ul>
                {checkedItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="w-full mb-4">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="summary">
            Short Summary
          </label>
          <textarea 
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="summary" 
            placeholder="Enter your summary here"
            value={item.summary}
            name='summary'
            onChange={handleChange}
          >
          </textarea>
        </div>

        <div className="w-full mb-4">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="image">
            Upload Images
          </label>
          <input type="file" multiple onChange={handleFileInputChange} id="image" className="hidden" ref={fileInputRef} />

          <div className={`mb-4 ${loadingUpload ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={!loadingUpload ? handleIconClick : undefined}>
            <IconUpload title="Upload Images" />
          </div>

          <div className="flex items-center justify-center w-full md:w-1/2 mb-4 md:pl-2">
            <div id="image-preview" className="w-full p-2 rounded-lg border border-gray-300">
              <img id="preview" className="w-full h-auto" src={defaultImage.secure_url} alt="Image Preview" />
              <div id="no-preview" className="hidden">
                No image selected.
              </div>
              {loadingUpload && <LoadingSpinner></LoadingSpinner>}
            </div>
          </div>
        </div>

      </form>

      <div className="w-full mb-4">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="media">
          Manage Media
        </label>
        <div className={`mb-4 ${loadingUpload ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={!loadingUpload ? handleModalOpen : undefined}>
          <IconCamera title="Manage Images" />
        </div>
        <ImageGalleryModal id="media" setDafaultImage={setDafaultImage} setImages={setImages} showModal={showModal} setShowModal={setShowModal} images={images} defaultImage={defaultImage} />
      </div>

      <div className="w-full mb-4">
        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="content">
          Structure Content
        </label>
        <Tiptap setContent={setContent} content={output} />
      </div>

      <div className="flex mb-4">
        <div className={`mb-4 ${loadingUpdate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={!loadingUpdate ? handleSubmit : undefined}>
          <IconSave title="Update the room" />
        </div>
        <div className="ml-4">
          <Link to={`/admin/rooms`}>
            <IconArrowBackCircleSharp title="Back to all rooms" />
          </Link>
        </div>
      </div>
      
    </div>
  )
}
