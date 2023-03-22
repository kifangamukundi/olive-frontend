import React, {useState, useContext} from 'react';
import { Link } from 'react-router-dom';
import jwt_decode from "jwt-decode";

import { StateContext } from '../../state/StateProvider';

import { close, menu } from '../../assets';

import { navLinks } from '../../constants';


export default function Navbar() {
  const [toggle, setToggle] = useState(false);

  // using context
  const { state: { userInfo }, dispatch: ctxDispatch } = useContext(StateContext);

  const decodedUser = userInfo ? jwt_decode(userInfo.user.accessToken) : null;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  return (
    <nav className="w-full flex py-6 justify-between items-center navbar">
      <h3 className="hidden">Main Navigation</h3>
      <Link to={`/`}>
        <h3 className="font-sans text-3xl font-medium text-white sm:text-4xl">
        Hospitality Hub
        </h3>
      </Link>

      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-sans font-normal cursor-pointer text-[16px] text-white mr-10`}
          >
            <Link to={`${nav.link}`}>
                <h4>{nav.title}</h4>
              </Link>
          </li>
        ))}

        {userInfo?.user?.accessToken && decodedUser?.isadmin && (
        <li className={`font-sans font-normal cursor-pointer text-[16px] text-white mr-10`}>
            <Link
            to="/admin"
            >
            <h4>Dashboard</h4>
            </Link>
        </li>
        )}
        {userInfo?.user?.accessToken ? (
          <>
          <li className={`font-sans font-normal cursor-pointer text-[16px] text-white mr-10`}>
            <Link
                to="/bookings"
            >
                <h4>My Bookings</h4>
            </Link>
            </li>

            <li className={`font-sans font-normal cursor-pointer text-[16px] text-white mr-10`}>
            <Link
                to="#signout"
                onClick={signoutHandler}
            >
                <h4>Sign Out</h4>
            </Link>
            </li>
          </>
        ) : (
            <li className={`font-sans font-normal cursor-pointer text-[16px] text-white mr-10`}>
            <Link to="/login">
                <h4>Sign In</h4>
            </Link>
            </li>
        )}
      </ul>
      
      
      {/* Mobile devices */}
      <h3 className="hidden">Mobile Navigation</h3>
      <div className="sm:hidden flex flex-1 justify-end items-center">
            <img
            src={toggle ? close : menu}
            alt="menu"
            className="w-[28px] h-[28px] object-contain"
            onClick={() => setToggle(!toggle)}
            />

            <div
            className={`${
                !toggle ? "hidden" : "flex"
            } p-6 bg-black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] rounded-xl sidebar`}
            >
            <ul className="list-none flex justify-end items-start flex-1 flex-col">
                {navLinks.map((nav, index) => (
                <li
                    key={nav.id}
                    className={`font-poppins font-medium cursor-pointer text-[16px] text-white mb-4`}
                >
                    <Link to={`${nav.link}`}>
                      <h4>{nav.title}</h4>
                    </Link>
                </li>
                ))}

                {userInfo?.user?.accessToken && decodedUser?.isadmin && (
                <li className={`font-poppins font-medium cursor-pointer text-[16px] text-white mb-4`}>
                    <Link
                    to="/admin"
                    >
                    <h4>Dashboard</h4>
                    </Link>
                </li>
                )}
                {userInfo?.user?.accessToken ? (
                    <li className={`font-poppins font-medium cursor-pointer text-[16px] text-white mb-4`}>
                    <Link
                        to="#signout"
                        onClick={signoutHandler}
                    >
                        <h4>Sign Out</h4>
                    </Link>
                    </li>
                ) : (
                    <li className={`font-poppins font-medium cursor-pointer text-[16px] text-white mb-4`}>
                    <Link to="/login">
                        <h4>Sign In</h4>
                    </Link>
                    </li>
                )}
            </ul>
            </div>
        </div>

    </nav>
  )
}
