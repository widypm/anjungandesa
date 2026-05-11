"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaEnvelope,
  FaLock,
  FaSignInAlt,
  FaGoogle,
  FaFacebookF,
  FaTwitter,
  FaGithub,
  FaSpinner,
} from "react-icons/fa";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { DebugLog, FetchData, GetDecrypt, GetEncrypt } from "../../lib/helper";
import { setLocal } from "../../lib/redux/counterSlice";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [btnLoad, setBtnLoad] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👁️ show/hide
  const [load, setLoad] = useState(true);
  const dispatch = useDispatch();
  const loginstate = useSelector((state: any) => state?.value);
  const [localData, setLocalData] = useState<any>(null); // ⬅️ taruh hasil decrypt di state
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setBtnLoad(true);
      const raw = JSON.stringify({
        email: email,
        password: password,
      });
      const aesraw = GetEncrypt(raw);
      const data = FetchData("api/auth", "POST", aesraw, false, "", true);
      const datajson = await data;
      if (datajson?.code == "200") {
        dispatch(setLocal(GetEncrypt(JSON.stringify(datajson))));
      } else {
        setBtnLoad(false);
      }
    } catch (error) {
      setBtnLoad(false);
      DebugLog(error);
    }
  };

  const router = useRouter();
  useEffect(() => {
    const decrypted =
      typeof loginstate === "string"
        ? JSON.parse(GetDecrypt(loginstate) ?? "{}")
        : null;
    setLocalData(decrypted);

    if (decrypted?.data?.token) {
      router.push("/cms/dashboard");
    } else {
      setLoad(false); // ⬅️ biarkan load false hanya kalau ga ada token
    }
  }, [loginstate]);
  if (load) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <FaSpinner className="animate-spin text-3xl text-indigo-600 mx-auto" />
          <p className="text-gray-700 font-medium">Checking session...</p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card-gradient px-4">
        <div className="bg-white bg-opacity-90 rounded-3xl shadow-2xl max-w-md w-full p-10">
          <div className="flex justify-center mb-8">
            <img
              src="https://storage.googleapis.com/a1aa/image/e9f03d82-4d22-4c9e-824b-23f1d8cc3716.jpg"
              alt="Login Icon"
              className="w-24 h-24"
            />
          </div>
          <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">
            Welcome Back
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-gray-700 font-semibold mb-2 flex items-center"
                htmlFor="email"
              >
                <FaEnvelope className="mr-3 text-indigo-600 text-lg" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <label
                className="block text-gray-700 font-semibold mb-2 flex items-center"
                htmlFor="password"
              >
                <FaLock className="mr-3 text-indigo-600 text-lg" />
                Password
              </label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center text-gray-700">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-indigo-600"
                />
                <span className="ml-2">Remember me</span>
              </label>
              <a
                href="#"
                className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={btnLoad}
              className={`w-full ${
                btnLoad ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
              } text-white font-semibold py-3 rounded-lg shadow-md flex items-center justify-center space-x-3 transition`}
            >
              {btnLoad ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }
}
