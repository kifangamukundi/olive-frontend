import { BrowserRouter, Routes, Route } from "react-router-dom";

import styles from './styles/styles';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Home } from './components/pages';
import { Navbar, Footer } from './components/layout';
import { ActivateAccount, ForgotPassword, Login, PasswordReset, Register } from './components/authentication';
import { CreateCategory, CreateRoom, Dashboard, EditRoom, Rooms } from "./components/admin";

function App() {

  return (
    <BrowserRouter>
      <div className="bg-white w-full overflow-hidden">
        {/* Header section */}
        <header>
          <div className={`${styles.paddingX} ${styles.flexCenter} bg-gray-800`}>
            <div className={`${styles.boxWidth}`}>
              <h2 className="hidden">Olive</h2>
              <Navbar />
            </div>
          </div>
        </header>
        
        {/* Main section or content section */}
        <main>
          <div className={`bg-white ${styles.paddingX} ${styles.flexCenter}`}>
            <div className={`${styles.boxWidth}`}>
              <h2 className="hidden">Main Content</h2>
                
                <Routes>
                  <Route path="/" element={<Home />} />

                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/password-reset/:resetToken" element={<PasswordReset />} />
                  <Route path="/activate-account/:activationToken" element={<ActivateAccount/>} />


                  <Route path="/admin" element={<Dashboard/>} />

                  <Route path="/admin/rooms" element={<Rooms/>} />
                  <Route path="/admin/rooms/create" element={<CreateRoom/>} />
                  <Route path="/admin/rooms/edit/:id" element={<EditRoom/>} />

                  
                  <Route path="/admin/categories/create" element={<CreateCategory/>} />

                </Routes>

                <ToastContainer/>
            </div>
          </div>
        </main>

        {/* footer section */}
        <footer>
        <h2 className="hidden">Footer Links</h2>
          <Footer/>
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App
