import React, { useEffect, useReducer, useState, useRef } from 'react'
import { toast } from 'react-toastify';
import axios from 'axios';

import { Link, useNavigate } from 'react-router-dom';

import { getError, BASE_URL, LoadingSpinner, Messages, Tiptap, ImageGalleryModal } from '../helpers';

import { useAuth, useCheckbox, useRadio } from '../../hooks';
import { IconArrowBackCircleSharp, IconCamera, IconSave, IconUpload } from '../../icons';

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loadingCreate: true };
    case 'CREATE_SUCCESS':
      return { ...state, loadingCreate: false, room: action.payload.room };
    case 'CREATE_FAIL':
      return { ...state, loadingCreate: false, error: action.payload };
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
export default function CreateRoom() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const { axiosInstance, accessToken } = useAuth();

  const [{ error, loadingCreate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: '',
    });
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [summary, setSummary] = useState('');
  const [defaultImage, setDafaultImage] = useState({});
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [content, setContent] = useState("<p>Test</p>");

  const [checkedItems, checkboxes] = useCheckbox(categories);

  const [selectedId, radios] = useRadio(roomTypes);

  const [showModal, setShowModal] = useState(false);
  const handleModalOpen = () => {
    setShowModal(true);
  };
  
  // Fetch Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`${BASE_URL}/categories`);

        dispatch({ type: 'FETCH_SUCCESS' });

        setCategories(data.data.categories);
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, []);

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

  const createHandler = async (e) => {
    e.preventDefault();
    try {
      dispatch({ type: 'CREATE_REQUEST' });
      const {data} = await axiosInstance.post(
        `${BASE_URL}/rooms`,
        {
          title,
          slug,
          summary,
          defaultImage,
          otherImages: images,
          content,
          price,
          capacity,
          categories: checkedItems,
          roomType: selectedId,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      dispatch({ type: 'CREATE_SUCCESS', payload: data });
      toast.success(data.message);
      navigate(`/admin/rooms`);
    } catch (err) {
      dispatch({ type: 'CREATE_FAIL', payload: getError(err), });
    }
  };

  // Generate slug
  function generateSlug(title) {
    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    setSlug(generatedSlug);
    return generatedSlug;
  }

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
  


  return (
    <div className="container w-full md:max-w-3xl mx-auto pt-20">
      
      {loadingCreate ? (
        <LoadingSpinner/>
      ) : error ? (
        <Messages>{error}</Messages>
      ) : (
        <div className="flex flex-wrap">
          
          <div className="w-full mb-4">
            <h1 className="block uppercase tracking-wide text-gray-700 text-lg font-bold mb-2">
              New Room
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

        <div className="w-full md:w-1/2 mb-4 md:pl-2">
          <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="price">
            Price
          </label>
          <input 
            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" 
            id="price" 
            type="text" 
            placeholder="price"
            onChange={(e) => setPrice(e.target.value)}
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
            placeholder="capacity"
            onChange={(e) => setCapacity(e.target.value)}
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
            placeholder="summary"
            onChange={(e) => setSummary(e.target.value)}
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
          Description
        </label>
        <Tiptap setContent={setContent} content={content} />
      </div>

      <div className="flex mb-4">
        <div className={`mb-4 ${loadingCreate ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} onClick={!loadingCreate ? createHandler : undefined}>
          <IconSave title="Save the room" />
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

