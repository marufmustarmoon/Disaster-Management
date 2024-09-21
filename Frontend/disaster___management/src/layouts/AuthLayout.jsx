/* eslint-disable react/prop-types */
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AuthLayout = ({ children }) => {
  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        {children} {/* This renders the content of the page (e.g., Login, Register forms) */}
      </div>
    </div>
    <Footer />
    </>
  );
};

export default AuthLayout;
