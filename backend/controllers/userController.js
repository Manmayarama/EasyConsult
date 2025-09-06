import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import { v2 as cloudinary } from "cloudinary"
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from 'razorpay'
import axios from 'axios';
import nodemailer from "nodemailer";
import otpGenerator from 'otp-generator'

//API for email
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function sendMail(to, sub, msg) {
    transporter.sendMail({
        to: to,
        subject: sub,
        html: msg,
    });
}

//API to register user
const registerUser = async (req, res) => {

    try {

        const { name, email, password } = req.body
        if (!name || !password || !email) {
            return res.json({ success: false, message: "Missing Details" })
        }

        //checking valid email or not
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Enter a Valid Email" })
        }

        //Validating the password whether the password is strong or not.
        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter a Strong Password" })
        }

        //hashing user password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name, email, password: hashedPassword
        }

        //saving new user data in database.
        const newUser = new userModel(userData)
        const user = await newUser.save()

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        const subject = "Welcome to EasyConsult!";
        const text = `
                    Dear ${newUser.name},<br><br>  
                    Welcome to EasyConsult! We're excited to have you on board.<br><br>
                    Your account has been successfully created, and you can now access all our services. To get started, simply log in to your account and explore the available features.<br><br>
                    PLease Add Phone Number,Date of Birth in your profile information.<br><br>
                    Thank you for choosing EasyConsult. We look forward to supporting your health and wellness journey!<br><br>
                    Best regards,<br> 
                    EasyConsult`;
        sendMail(newUser.email, subject, text);
        res.json({ success: true, token })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for user login
const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body
        const user = await userModel.findOne({ email })//finding user by email
        if (!user) {
            return res.json({ success: false, message: "User doesn't Exist" })
        }

        //matching user password
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            const subject = "Successful Login to Your Account";
            const text = `
                    Dear ${user.name},<br><br>  
                    We are pleased to inform you that you have successfully logged into your account.<br><br>
                    If this was you, no further action is needed. If you did not initiate this login, please secure your account immediately by changing your password and contacting support.<br><br>
                    For any questions or assistance, feel free to reach out to our support team.<br><br> 
                    Thank you for using EasyConsult.<br><br> 
                    Best regards,<br> 
                    EasyConsult`;

            sendMail(user.email, subject, text);
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid Credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// In-memory OTP to store
const otpStore = {};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the user exists
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Generate a 6-digit OTP
        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false, digits: true });

        // Store OTP in memory with expiration time
        otpStore[email] = {
            otp: otp,
            expiresAt: Date.now() + 10 * 60 * 1000, // OTP expires in 10 minutes
        };

        // Prepare the OTP email content
        const subject = "Your OTP for Password Reset";
        const text = `Dear ${user.name},<br><br>
            You have requested to reset your password. Please use the following OTP to proceed with the reset:<br><br>
            <strong>OTP: ${otp}</strong><br><br>
            This OTP will expire in 10 minutes.<br><br>
            If you did not request this, please ignore this message.<br><br>
            Best regards,<br>
            EasyConsult`;

        // Send the OTP to the user's email (replace with your actual email sending function)
        sendMail(user.email, subject, text);

        return res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        console.error('Error during forgotPassword:', error);
        return res.json({ success: false, message: "Something went wrong, please try again later." });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check if the required parameters are provided
        if (!email || !otp) {
            return res.json({ success: false, message: "Email and OTP are required" });
        }

        // Retrieve OTP from memory
        const storedData = otpStore[email];

        if (!storedData) {
            return res.json({ success: false, message: "No OTP found for this email. Please request a new one." });
        }

        // Check if OTP has expired
        if (storedData.expiresAt < Date.now()) {
            // OTP has expired, delete it
            delete otpStore[email]; // Remove expired OTP from store
            return res.json({ success: false, message: "OTP has expired" });
        }

        // Check if the OTP is correct
        if (storedData.otp !== otp.trim()) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        return res.json({ success: true, message: "OTP verified successfully" });
    } catch (error) {
        console.error('Error during OTP verification:', error);
        return res.json({ success: false, message: "Something went wrong, please try again later." });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate the new password strength
        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (at least 8 characters)." });
        }

        // Find the user by email
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Retrieve OTP from memory (stored OTP)
        const storedData = otpStore[email];

        if (!storedData) {
            return res.json({ success: false, message: "No OTP found for this email. Please request a new one." });
        }

        // Check if the OTP has expired
        if (storedData.expiresAt < Date.now()) {
            delete otpStore[email]; // Clean up expired OTP
            return res.json({ success: false, message: "OTP has expired" });
        }

        // Hash the new password without using trim
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        // Clear OTP from memory after password reset
        delete otpStore[email];

        // Prepare the Password Reset Success email content
        const subject = "Your Password Has Been Successfully Reset";
        const text = `Dear ${user.name},<br><br>
                    We wanted to let you know that your password has been successfully reset.<br><br>
                    If you did not make this request or believe this to be an error, please contact our support team immediately.<br><br>
                    Best regards,<br>
                    EasyConsult`;

        // Send the Password Reset Success email to the user's email (replace with your actual email sending function)
        sendMail(user.email, subject, text);

        return res.json({ success: true, message: "Password reset successful" });

    } catch (error) {
        console.error('Error during password reset:', error);
        return res.json({ success: false, message: "Something went wrong, please try again later." });
    }
};

//API to get user profile data
const getProfile = async (req, res) => {

    try {

        const { userId } = req.body
        const userData = await userModel.findById(userId).select('-password')

        res.json({ success: true, userData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//API to update user profile
const updateProfile = async (req, res) => {
    try {
        // Destructure the incoming data
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        // Check for missing required fields
        if (!name || !phone || !dob || !gender) {
            return res.json({ success: false, message: "Data Missing" });
        }

        // Parse address if it's a valid JSON string
        let parsedAddress = address;
        if (address && typeof address === 'string') {
            try {
                parsedAddress = JSON.parse(address); // Parse stringified address if needed
            } catch (e) {
                return res.json({ success: false, message: 'Invalid address format' });
            }
        }

        // Log incoming data for debugging
        console.log('Updating user:', { userId, name, phone, address: parsedAddress, dob, gender });

        // Try to update the user
        const updatedUser = await userModel.findByIdAndUpdate(userId, {
            name,
            phone,
            address: parsedAddress,
            dob,
            gender
        }, { new: true });  // Ensure the updated document is returned

        // If the user doesn't exist, return an error
        if (!updatedUser) {
            return res.json({ success: false, message: "User not found or unable to update" });
        }

        // Log the updated user to ensure changes are reflected
        console.log('User after update:', updatedUser);

        // Handle image upload to Cloudinary if file exists
        if (imageFile) {
            // Upload image to Cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            const imageUrl = imageUpload.secure_url;

            // Update the user image URL
            const updatedWithImage = await userModel.findByIdAndUpdate(userId, { image: imageUrl }, { new: true });

            // Log the user after the image update
            console.log('User after image upload:', updatedWithImage);
        }

        // Send success response
        res.json({ success: true, message: "Profile Updated" });

    } catch (error) {
        // Log and return any errors
        console.log('Error in updating profile:', error);
        res.json({ success: false, message: error.message });
    }
};

//API to book appointment
const bookAppointment = async (req, res) => {
    try {

        const { userId, docId, slotDate, slotTime } = req.body //taking data from request
        const docData = await doctorModel.findById(docId).select('-password')//finding doctor 
        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor not Available' })
        }
        //geting slots booked for the current docctor
        let slots_booked = docData.slots_booked//copy of slots booked data
        //checking availabilty
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot not Available' })
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = []
            slots_booked[slotDate].push(slotTime)
        }

        const userData = await userModel.findById(userId).select('-password')
        delete docData.slots_booked//deleting slot booked data from docData

        const appointmentData = {
            userId, docId, userData, docData, amount: docData.fees,
            slotDate, slotTime,
            date: Date.now()//storing appointment booked date
        }
        //storng appointment data in database
        const newAppointment = new appointmentModel(appointmentData)
        await newAppointment.save()

        //save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment Booked.' })
        //sending email
        const subject = "Appointment Booked";
        const text = `
                        Dear ${userData.name},<br><br>  
                        We are pleased to inform you that your appointment with  ${docData.name} has been successfully booked.<br><br>
                        The details of your appointment are as follows:<br>
                        Date: ${slotDate}<br> 
                        Time: ${slotTime}<br><br>
                        Please ensure that you arrive on time or, if possible, a few minutes before your scheduled appointment to avoid any delays.<br><br> 
                        Thank you for choosing our services.<br><br> 
                        Best regards,<br> 
                        EasyConsult`;

        sendMail(userData.email, subject, text);

    } catch (error) {
        console.log('Error in Booking', error);
        res.json({ success: false, message: error.message })
    }
}

//API to get appointments for forntend
const listAppointment = async (req, res) => {

    try {
        const { userId } = req.body
        const appointments = await appointmentModel.find({ userId })//array to store all appointment list of user booked

        res.json({ success: true, appointments })
    } catch (error) {
        console.log('Error in Booking', error);
        res.json({ success: false, message: error.message })
    }
}

//API to cancel appointment
const cancelAppointment = async (req, res) => {

    try {

        const { userId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        const userData = await userModel.findById(userId);

        //verifying the appointment booked by same user
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized Action' })
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        //updateing slots in doctordata
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        //sending email
        const subject = "Appointment Cancelled";
        const text = `
                        Dear ${userData.name},<br><br>  
                        We have received your request to cancel the appointment with ${doctorData.name}. Your appointment has been successfully canceled.<br><br>
                        If you wish to reschedule or need further assistance, please don't hesitate to contact us.<br><br>
                        Thank you for using our services.<br><br> 
                        Best regards,<br> 
                        EasyConsult`;
        sendMail(userData.email, subject, text);
        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

//API to make payment using razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: "Appointment Cancelled/not Found" });
        }

        // Creating options for Razorpay
        const options = {
            amount: appointmentData.amount * 100, // removing decimal point
            receipt: appointmentId,
        };

        // Creation of an order
        const order = await razorpayInstance.orders.create(options);
        res.json({ success: true, order });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API to verify payment
const verifyRazorpay = async (req, res) => {
    try {

        const { razorpay_order_id } = req.body
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true })
            res.json({ success: true, message: "Payment Successful" })
        } else {
            res.json({ success: false, message: "Payment Failed" })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, forgotPassword, resetPassword, verifyOtp }