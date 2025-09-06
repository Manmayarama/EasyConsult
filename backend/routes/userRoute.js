import express from 'express'
import { registerUser,loginUser, getProfile, updateProfile,bookAppointment,listAppointment,cancelAppointment,paymentRazorpay ,verifyRazorpay,resetPassword,forgotPassword,verifyOtp} from '../controllers/userController.js'
import authUser from '../middlewares/authUser.js'
import upload from '../middlewares/multer.js'

const userRouter=express.Router()

//sending data to database using post
userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
// Route for resetting the password using OTP
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password', resetPassword);
userRouter.post('/verify-otp', verifyOtp);


//getting data from database using get
userRouter.get('/get-profile',authUser,getProfile)
userRouter.post('/update-profile',upload.single('image'),authUser,updateProfile)
userRouter.post('/book-appointment',authUser,bookAppointment)
userRouter.get('/appointments',authUser,listAppointment)
userRouter.post('/cancel-appointment',authUser,cancelAppointment)
userRouter.post('/payment-razorpay',authUser,paymentRazorpay)
userRouter.post('/verifyRazorpay',authUser,verifyRazorpay)





export default userRouter