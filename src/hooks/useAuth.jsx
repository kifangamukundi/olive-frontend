import { useContext, useState } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

import { BASE_URL } from '../components/helpers';
import { StateContext } from '../state/StateProvider';

const useAuth = () => {
    const { state: { userInfo }, dispatch: dispatch } = useContext(StateContext);
  
    const [accessToken, setAccessToken] = useState(userInfo?.user?.accessToken);
    const [refreshToken, setRefreshToken] = useState(userInfo?.user?.refreshToken);
  
    const axiosInstance = axios.create({
      BASE_URL,
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  
    axiosInstance.interceptors.request.use(async (req) => {
      const tokenExpiration = jwtDecode(accessToken)?.exp;
      const currentTime = Math.floor(Date.now() / 1000);
  
      const isExpired = tokenExpiration < currentTime;
      if (!isExpired) return req;
  
      try {
        const refreshTokenData = jwtDecode(refreshToken);
        const refreshExpiration = refreshTokenData.exp;
  
        const isRefreshExpired = refreshExpiration < currentTime;
        if (isRefreshExpired) {
          dispatch({ type: 'USER_LOGOUT' });
          localStorage.removeItem('userInfo');
          window.location.href = '/login';
          return Promise.reject('Refresh token expired');
        }
  
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          refresh: refreshToken,
        });
  
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          data.user;
  
        localStorage.setItem(
          'userInfo',
          JSON.stringify({ ...userInfo, user: { accessToken: newAccessToken, refreshToken: newRefreshToken } })
        );
  
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);
  
        req.headers.Authorization = `Bearer ${newAccessToken}`;
        return req;
      } catch (error) {
        dispatch({ type: 'USER_SIGNOUT' });
        return Promise.reject(error);
      }
    });

    return { axiosInstance, accessToken, refreshToken, setAccessToken, setRefreshToken };
}

export default useAuth;