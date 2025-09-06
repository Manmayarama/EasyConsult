import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState('Login'); // Track if we're in "Sign Up" or "Login" mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0); // Track failed login attempts
  const [forgotPassword, setForgotPassword] = useState(false); // Show forgot password form after 3 failed attempts
  const [otp, setOtp] = useState(''); // OTP entered by user
  const [newPassword, setNewPassword] = useState(''); // New password for reset
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirm new password
  const [otpVerified, setOtpVerified] = useState(false); // Track OTP verification status
  const [otpSent, setOtpSent] = useState(false); // Track if OTP was sent successfully

  // Handle form submission for login or signup
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (state === 'Sign Up') {
        // Register a new user
        const { data } = await axios.post(backendUrl + '/api/user/register', { name, password, email });
        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
        }
      } else if (state === 'Login') {
        // Login user
        const { data } = await axios.post(backendUrl + '/api/user/login', { email, password });
        if (data.success) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
        } else {
          toast.error(data.message);
          setFailedAttempts(failedAttempts + 1);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Redirect user to home page if already logged in
  useEffect(() => {
    if (token) {
      navigate('/');
    }
  }, [token]);

  // Handle forgot password flow after 3 failed attempts
  useEffect(() => {
    if (failedAttempts >= 3) {
      setForgotPassword(true);
    }
  }, [failedAttempts]);

  // Handle forgot password form submission
  const onForgotPasswordSubmit = async (event) => {
    event.preventDefault();

    try {
      const { data } = await axios.post(backendUrl + '/api/user/forgot-password', { email });
      if (data.success) {
        toast.success(data.message);
        setOtpSent(true); // OTP sent successfully, show OTP input form
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle OTP verification
  const onVerifyOtpSubmit = async (event) => {
    event.preventDefault();

    try {
      const { data } = await axios.post(backendUrl + '/api/user/verify-otp', { email, otp });
      if (data.success) {
        toast.success(data.message);
        setOtpVerified(true); // Enable reset password step
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle password reset after OTP verification
  const onResetPasswordSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + '/api/user/reset-password', { email, newPassword });
      if (data.success) {
        toast.success(data.message);
        setForgotPassword(false); // Reset forgot password form state
        setOtpSent(false); // Reset OTP sent state
        setOtpVerified(false); // Reset OTP verified state
        setEmail(''); // Clear email
        setNewPassword(''); // Clear new password
        setConfirmPassword(''); // Clear confirm password
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <motion.form
      onSubmit={forgotPassword ? (otpSent ? onVerifyOtpSubmit : onForgotPasswordSubmit) : onSubmitHandler}
      className="min-h-[80vh] flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-2xl font-semibold">
          {forgotPassword
            ? 'Forgot Password'
            : state === 'Sign Up'
              ? 'Create Account'
              : 'Login'}
        </p>
        <p>
          {forgotPassword
            ? 'Enter your email to receive an OTP for password reset.'
            : state === 'Sign Up'
              ? 'Please Sign Up to continue.'
              : 'Please log in to your account.'}
        </p>

        {forgotPassword ? (
          // Forgot Password Form
          <>
            {/* Show Send OTP Button */}
            {!otpSent && (
              <div className="w-full">
                <p>Email:</p>
                <motion.input
                  className="border border-zinc-300 rounded w-full p-2 mt-1"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  required
                />
              </div>
            )}

            {/* Send OTP Button */}
            {!otpSent && (
              <motion.button
                type="submit"
                className="bg-primary text-white w-full py-2 rounded-md text-base mt-4"
              >
                Send OTP
              </motion.button>
            )}

            {/* OTP Input Form (only show after OTP is sent successfully) */}
            {otpSent && (
              <div className="mt-4 w-full">
                <p>Enter OTP:</p>
                <motion.input
                  className="border border-zinc-300 rounded w-full p-2 mt-1"
                  type="text"
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  required
                />
              </div>
            )}

            {/* Show "Verify OTP" Button only after OTP Input */}
            {otpSent && !otpVerified && (
              <motion.button
                type="submit"
                className="bg-primary text-white w-full py-2 rounded-md text-base mt-4"
              >
                Verify OTP
              </motion.button>
            )}
          </>
        ) : state === 'Sign Up' ? (
          // Sign Up Form
          <>
            <div className="w-full">
              <p>Full Name:</p>
              <motion.input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>
            <div className="w-full">
              <p>Email:</p>
              <motion.input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <div className="w-full">
              <p>Password:</p>
              <motion.input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
            <motion.button
              type="submit"
              className="bg-primary text-white w-full py-2 rounded-md text-base"
            >
              Create Account
            </motion.button>
          </>
        ) : (
          // Login Form
          <>
            <div className="w-full">
              <p>Email:</p>
              <motion.input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
            </div>
            <div className="w-full">
              <p>Password:</p>
              <motion.input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
            </div>
            <motion.button
              type="submit"
              className="bg-primary text-white w-full py-2 rounded-md text-base"
            >
              Log In
            </motion.button>
            {failedAttempts >= 3 && (
              <div className="mt-4 text-center">
                <p
                  className="text-sm cursor-pointer text-blue-500"
                  onClick={() => setForgotPassword(true)}
                >
                  Forgot Password?
                </p>
              </div>
            )}
          </>
        )}

        {/* Reset Password Form */}
        {otpVerified && (
          <div className="mt-4 w-full">
            <div className="w-full">
              <p>New Password:</p>
              <motion.input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setNewPassword(e.target.value)}
                value={newPassword}
                required
              />
            </div>
            <div className="w-full">
              <p>Confirm Password:</p>
              <motion.input
                className="border border-zinc-300 rounded w-full p-2 mt-1"
                type="password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                required
              />
            </div>
            <motion.button
              type="submit"
              className="bg-primary text-white w-full py-2 rounded-md text-base mt-4"
              onClick={onResetPasswordSubmit}
            >
              Reset Password
            </motion.button>
          </div>
        )}

        <div className="mt-4 text-center">
          <p
            className="text-sm cursor-pointer text-blue-500"
            onClick={() => setState(state === 'Sign Up' ? 'Login' : 'Sign Up')}
          >
            {state === 'Sign Up'
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </p>
        </div>
      </motion.div>
    </motion.form>
  );
};

export default Login;
