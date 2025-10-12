import React, { useState, useEffect } from "react";
import logo from "/src/assets/Log.png";
import books from "/src/assets/Books pic.png";
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { FaLongArrowAltLeft } from "react-icons/fa";

function SignUp() {
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(new Array(5).fill(""));

  const handleSignup = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowOtp(true);
    }, 2000);
  };

  const handleChange = (e, index) => {
    if (isNaN(e.target.value)) return false;
    let newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    if (e.target.value && e.target.nextSibling) {
      e.target.nextSibling.focus();
    }
  };
  return (
    <>
      <section className="flex md:h-screen h-auto overflow-hidden md:py-0 py-12">
        {/* SignUp Section */}
        {!showOtp && (
          <div className="md:w-[45%] w-full flex flex-col gap-7 items-start justify-center sm:px-10 px-5">
            <img src={logo} alt="" />
            <div className="w-full">
              <h1 className="text-4xl font-normal mb-8">Sign-Up</h1>
              <form action="#" className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-normal text-gray-600">
                    Your Name
                  </label>
                  <input
                    type="text"
                    className="w-full py-4 px-3 rounded-lg bg-gray-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-normal text-gray-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full py-4 px-3 rounded-lg bg-gray-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-normal text-gray-600">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full py-4 px-3 rounded-lg bg-gray-200"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-lg font-normal text-gray-600">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    className="w-full py-4 px-3 rounded-lg bg-gray-200"
                  />
                </div>
              </form>
            </div>

            <Button
              onClick={handleSignup}
              text="Create Account"
              bg="bg-[#46abbd]"
              textColor="text-white"
              width="w-full"
              borderColor="border-[#46abbd]"
            />

            <Link to="/login" className="text-center w-full">
              {" "}
              <p className="text-sm font-normal text-black text-center">
                Already have an account?{" "}
                <span className="underline cursor-pointer text-[#47acb7]">
                  Login
                </span>
              </p>
            </Link>
          </div>
        )}
        {/* OTP Section */}
        {showOtp && (
          <div className="md:w-[45%] w-full flex flex-col gap-8 items-start justify-center sm:px-10 px-5">
            <p
              className="flex items-center gap-1 font-normal text-xl text-[#47acb7] cursor-pointer"
              onClick={() => setShowOtp(false)}
            >
              <FaLongArrowAltLeft className="text-2xl" /> Back
            </p>
            <img className="mt-4 mb-4" src={logo} alt="Logo" />

            <div className="flex flex-col gap-4 justify-center text-center w-full">
              <p className="text-base font-normal text-gray-500 text-center mb-3">
                Verification code has been sent to this email
              </p>
              <h2 className="text-2xl font-bold text-black">
                abdullahzafar6802@gmail.com
              </h2>

              <div className="flex gap-3 justify-center mt-6">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleChange(e, index)}
                    className="w-12 h-12 text-center text-xl border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ))}
              </div>

              <p className="text-sm font-normal text-red-500 mt-4 cursor-pointer">
                Resend Code
              </p>

             <Link to="/dashboard">
              <Button
                text="Verify Code"
                bg="bg-[#46abbd]"
                textColor="text-white"
                width="w-full"
                borderColor="border-[#46abbd]"
              /></Link>
            </div>
          </div>
        )}
        <div className="md:w-[55%] w-0">
          <img className="h-[100%]" src={books} alt="" />
        </div>
      </section>
    </>
  );
}

export default SignUp;
