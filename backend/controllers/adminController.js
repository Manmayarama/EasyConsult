import validator from "validator"
import bcrypt from 'bcrypt'
import { v2 as cloudinary } from "cloudinary"
import doctorModel from "../models/doctorModel.js"
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"

//API for adding doctor
const addDoctor = async (req, res) => {

    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
        const imageFile = req.file
        console.log({ name, email, password, speciality, degree, experience, about, fees, address }, imageFile)
        //checking for all data to doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        //Validating email format i.e; if the email is not in the form of email.
        // Validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please Enter a Valid Email." });
        }

        //Validating the password whether the password is strong or not.
        if (password.length < 8) {
            return res.json({ success: false, message: "Please Enter a Strong Password." })
        }

        //Hashing the doctor's password.
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        //upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
        const imageUrl = imageUpload.secure_url

        const doctorData = {
            name, email,
            image: imageUrl,
            password: hashedPassword,
            speciality, degree, experience, about, fees,
            address: JSON.parse(address), //stores address as object
            date: Date.now() //gets current date when the doctor is added
        }

        //Saving dactor data in database.
        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: "Doctor Added." })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Doctor Already Exist." })
    }
}

//API for admin login
const loginAdmin = async (req, res) => {
    try {
        //GENERATING TOKEN WHEN EMAIL & PASSWORD IS MATCHED OF ADMIN.
        const { email, password } = req.body
        if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD) {

            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })

        }
        else {
            res.json({ success: false, message: "Invalid Credentials" })
        }

    }
    catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Delete doctor from database
const deleteDoctor = async (req, res) => {
    try {
        const docId = req.params.id; // Extract docId from the URL parameter

        if (!docId) {
            return res.status(400).json({ success: false, message: "Doctor ID is required" });
        }

        // Attempt to delete the doctor from the database
        const doctor = await doctorModel.findByIdAndDelete(docId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, message: "Doctor removed successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while removing the doctor" });
    }
};


//API to get all appointment list
const appointmentsAdmin = async (req, res) => {

    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API to cancel appointment for admin
const appointmentCancel = async (req, res) => {

    try {

        const { appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        //releasing doctor slot
        const { docId, slotDate, slotTime } = appointmentData
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked
        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime)

        //updateing slots in doctordata
        await doctorModel.findByIdAndUpdate(docId, { slots_booked })
        res.json({ success: true, message: 'Appointment Cancelled.' })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

//API to dispaly dashboard data in admin panel
const adminDashboard = async (req, res) => {

    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})

        //geting number of doctors,users,appointments
        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard, deleteDoctor }