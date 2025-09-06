import doctorModel from "../models/doctorModel.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js"
import userModel from "../models/userModel.js"
import nodemailer from "nodemailer";


const changeAvailability = async (req, res) => {

    try {

        const { docId } = req.body
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, { available: !docData.available })
        res.json({ success: true, message: 'Availabilty Changed' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}


//list of doctor to display
const doctorList = async (req, res) => {

    try {

        const doctors = await doctorModel.find({}).select(['-password', '-email'])//excluding password & email getting displayed.
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for doctor login
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body
        const doctor = await doctorModel.findOne({ email })

        //checking whether doctor with same email
        if (!doctor) {
            return res.json({ success: false, message: 'Invalid Credentials' })
        }

        const isMatch = await bcrypt.compare(password, doctor.password)
        if (isMatch) {
            const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid Credentials' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//API to get all appointments for particular doctor in doctor panel
const appointmentsDoctor = async (req, res) => {

    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })

        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

//API for email
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USE,
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

//API to make complete appointment in doctor panel

const appointmentComplete = async (req, res) => {
    try {
        const { docId, appointmentId } = req.body;

        // Fetch the appointment data using the appointmentId
        const appointmentData = await appointmentModel.findById(appointmentId);

        // If the appointment exists and the doctor ID matches
        if (appointmentData && appointmentData.docId === docId) {
            // Mark the appointment as completed
            appointmentData.isCompleted = true;
            await appointmentData.save();

            // Fetch the user and doctor details to send in the email
            const userData = await userModel.findById(appointmentData.userId);  // Assuming you have the userId in the appointment
            const docData = await doctorModel.findById(docId);

            // Construct the email content
            const subject = "Appointment Completed";
            const text = `
                    Dear ${userData.name},<br><br>
                    We are pleased to inform you that your appointment with ${docData.name} has been completed.<br><br>
                    The details of your appointment are as follows:<br>
                    - Date: ${appointmentData.slotDate}<br>
                    - Time: ${appointmentData.slotTime}<br><br>
                    Thank you for choosing our services. We hope to assist you again in the future.<br><br>
                    Best regards,<br>
                    EasyConsult
                `;

            // Send the email to the user
            sendMail(userData.email, subject, text);

            // Return success response
            return res.json({ success: true, message: 'Appointment Completed' });

        } else {
            // Return failure if appointment data or doctor ID does not match
            return res.json({ success: false, message: 'Appointment Marking Failed: Invalid Doctor or Appointment' });
        }

    } catch (error) {
        console.log('Error in completing appointment:', error);
        res.json({ success: false, message: error.message });
    }
};

//API to make cancel appointment in doctor panel
const appointmentCancel = async (req, res) => {

    try {

        const { docId, appointmentId } = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        if (appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })
            // Fetch the user and doctor details to send in the email
            const userData = await userModel.findById(appointmentData.userId);  // Assuming you have the userId in the appointment
            const docData = await doctorModel.findById(docId);

            // Construct the email content
            const subject = "Appointment Cancelled";
            const text = `
                            Dear ${userData.name},<br><br>
                            We regret to inform you that your appointment with ${docData.name} has been cancelled by the doctor.<br><br>
                            The details of your appointment were as follows:<br>
                            - Date: ${appointmentData.slotDate}<br>
                            - Time: ${appointmentData.slotTime}<br><br>
                            We apologize for this inconvenience caused. If you wish to reschedule or have any questions, please don't hesitate to contact us.<br><br>
                            Thank you for your understanding.<br><br>
                            Best regards,<br>
                            EasyConsult
                        `;

            // Send the email to the user
            sendMail(userData.email, subject, text);
            return res.json({ success: true, message: 'Appointment Cancelled' })

        } else {
            return res.json({ success: false, message: 'Cancellation Failed' })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//API to get dashboard for doctor panel
const doctorDashboard = async (req, res) => {

    try {

        const { docId } = req.body
        const appointments = await appointmentModel.find({ docId })
        let earnings = 0
        appointments.map((item) => {
            if (item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []
        appointments.map((item) => {
            if (!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)

        }
        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

//API to get doctor profile
const doctorProfile = async (req, res) => {
    try {
        // Destructure the incoming data
        const { docId } = req.body
        const profileData = await doctorModel.findById(docId).select('-password')

        res.json({ success: true, profileData })
    } catch (error) {
        // Log and return any errors
        console.log('Error in updating profile:', error);
        res.json({ success: false, message: error.message });
    }
}

//API to update doctor profile
const updateDoctorProfile = async (req, res) => {
    try {

        const { docId, fees, address, available } = req.body
        await doctorModel.findByIdAndUpdate(docId, { fees, address, available })
        res.json({ success: true, message: 'Profile Updated' })

    } catch (error) {
        // Log and return any errors
        console.log('Error in updating profile:', error);
        res.json({ success: false, message: error.message });
    }
}


export { changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile }