import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';

const DoctorAppointments = () => {
  const {
    dToken,
    appointments,
    getAppointments,
    completeAppointment,
    cancelAppointment,
    profileData,
    getProfileData,
  } = useContext(DoctorContext);

  const { calculateAge, slotDateFormate, currency } = useContext(AppContext);

  const [showModal, setShowModal] = useState(false);
  const [medicines, setMedicines] = useState([{ name: '', time: '', food: '' }]);
  const [medicineCharge, setMedicineCharge] = useState('');
  const [currentItem, setCurrentItem] = useState(null);

  useEffect(() => {
    if (dToken) {
      getAppointments();
      if (!profileData) {
        getProfileData();
      }
    }
  }, [dToken, profileData, getAppointments, getProfileData]);

  // Handle Print Logic
  const handlePrint = (item, profile) => {
    const printWindow = window.open('', '_blank');

    const doctorName = profile?.name || 'Unknown Doctor';
    const doctorSpeciality = profile?.speciality || 'N/A';
    const doctorAddress = profile?.address
      ? `${profile?.address?.line1 || ''} ${profile?.address?.line2 || ''}`.trim() || 'N/A'
      : 'N/A';

    const userAge = calculateAge(item.userData.dob);

    const logoUrl = assets?.admin_logo?.svg || 'https://via.placeholder.com/120';

    const totalAmount = item.payment
      ? parseFloat(medicineCharge || 0)
      : parseFloat(medicineCharge || 0) + parseFloat(item.amount);

    printWindow.document.write(
      `<html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f9; }
            .receipt { max-width: 700px; margin: 40px auto; padding: 30px; background-color: #fff; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .header h2 { margin: 0; font-size: 24px; color: #333; }
            .doctor-info { margin-bottom: 20px; font-size: 14px; color: #555; }
            .details { margin-top: 20px; font-size: 14px; color: #333; }
            .status { font-weight: bold; color: ${item.cancelled ? '#e74c3c' : item.isCompleted ? '#2ecc71' : '#f39c12'}; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #ddd; }
            th, td { padding: 10px; text-align: left; }
            th { background-color: #f2f2f2; }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .signature-section div {
              text-align: center;
              flex: 1;
            }
            .signature-section p {
              font-size: 16px;
              margin: 5px 0;
            }
            .signature-line {
              width: 200px;
              border-top: 1px solid #333;
              margin: 10px auto;
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h1>EasyConsult</h1>
              <h2>Receipt</h2><hr>
              <p>Appointment ID: ${item._id}</p>
              <p>Date: ${slotDateFormate(item.slotDate)}</p><hr>
            </div>
            <div class="doctor-info">
              <p><strong>Doctor's Name:</strong> ${doctorName}</p>
              <p><strong>Speciality:</strong> ${doctorSpeciality}</p>
              <p><strong>Address:</strong> ${doctorAddress}</p>
            </div><hr>
            <div class="details">
              <p><strong>Patient Name:</strong> ${item.userData.name}</p>
              <p><strong>Date Of Birth:</strong> ${item.userData.dob}</p>
              <p><strong>Age:</strong> ${userAge}</p>
              <p><strong>Phone:</strong> ${item.userData.phone}</p>
              <p><strong>Status:</strong> <span class="status">${item.cancelled ? 'Cancelled' : item.isCompleted ? 'Completed' : 'Pending'}</span></p>
              ${medicines.length > 0 && `
              <p><strong>Prescribed Medicines:</strong></p>
              <table>
                <tr>
                  <th>Medicine</th>
                  <th>Time</th>
                  <th>Food</th>
                </tr>
                ${medicines.map((med, index) => (
                 `<tr>
                    <td>${med.name}</td>
                    <td>${med.time || 'N/A'}</td>
                    <td>${med.food || 'N/A'}</td>
                  </tr>`
      )).join('')}
              </table>`}
              <p><strong>Fees Payment Mode:</strong> ${item.payment ? 'Online' : 'Cash'}</p>
              <p><strong>Consultation Fees:</strong> ${currency}${item.amount}</p>
              <p><strong>Medicine Charge:</strong> ${currency}${medicineCharge}</p><hr>
              <p><strong>Total Amount:</strong> ${currency}${totalAmount.toFixed(2)}</p><hr>
            </div>
            <!-- Signature Section -->
            <div class="signature-section">
              <div>
                <p>Doctor's Signature</p>
                <div class="signature-line"></div>
              </div>
              <div>
                <p>Patient's/CareTaker's Signature</p>
                <div class="signature-line"></div>
              </div>
            </div>
            <br><br><br><br><br><br>
            <p><strong>This is computer generated Receipt hence Signature is not mandatory.</strong></p>
          </div>
          </div>
          <script>
            window.print();
            window.onafterprint = window.close;
          </script>
        </body>
      </html>`
    );
  };

  // Handle Open Modal
  const handleOpenModal = (item) => {
    setCurrentItem(item);
    setShowModal(true);
  };

  // Handle Close Modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle Medicine Input Change
  const handleMedicineChange = (index, field, value) => {
    const updatedMedicines = [...medicines];
    updatedMedicines[index][field] = value;
    setMedicines(updatedMedicines);
  };

  // Add New Medicine Row
  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', time: '', food: '' }]);
  };

  // Remove Medicine Row
  const handleRemoveMedicine = (index) => {
    const updatedMedicines = medicines.filter((_, i) => i !== index);
    setMedicines(updatedMedicines);
  };

  // Handle Submit (Print) Logic
  const handleSubmit = () => {
    if (currentItem) {
      handlePrint(currentItem, profileData);
    }
    setMedicines([{ name: '', time: '', food: '' }]); // Reset medicines after submit
    setMedicineCharge(''); // Reset medicine charge
    setShowModal(false); // Close the modal after submitting
  };

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
          <p>Receipt</p>
        </div>

        {appointments.reverse().map((item, index) => (
          <div key={index} className="flex flex-wrap justify-between max-sm:gap-5 mx-sm:text-base sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50">
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img className="w-8 rounded-full bg-gray-200" src={item.userData.image} alt="" />
              <p>{item.userData.name}</p>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.payment ? 'Online' : 'Cash'}
              </p>
            </div>
            <p className="max-sm:hidden">{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormate(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>

            {item.cancelled ? (
              <p className="text-red-600 text-xs font-medium">Cancelled</p>
            ) : item.isCompleted ? (
              <p className="text-green-600 text-xs font-medium">Completed</p>
            ) : (
              <div className="flex">
                <img onClick={() => cancelAppointment(item._id)} className="w-10 cursor-pointer" src={assets.cancel_icon} alt="Cancel"/>
                <img onClick={() => completeAppointment(item._id)} className="w-10 cursor-pointer" src={assets.tick_icon} alt="Complete"/>
              </div>
            )}

            {item.isCompleted && (
              <div className="flex">
                <button
                  onClick={() => handleOpenModal(item)}
                  className="ml-2 text-white bg-blue-500 hover:bg-blue-700 px-3 py-1 text-xs rounded-md">
                  Print
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for Prescribed Medicine */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50" role="dialog">
          <div className="bg-white p-5 rounded-md w-80">
            <h2 className="text-lg font-medium">Enter Prescribed Medicine</h2>
            {medicines.map((medicine, index) => (
              <div key={index} className="mb-3">
                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={medicine.name}
                  onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mb-2"
                />
                <div className="flex justify-between">
                  <select
                    value={medicine.time}
                    onChange={(e) => handleMedicineChange(index, 'time', e.target.value)}
                    className="w-5/12 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Time</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Night">Night</option>
                    <option value="Morning,Night">Morning,Night</option>
                    <option value="Morning,Afternoon">Morning,Afternoon</option>
                    <option value="Afternoon,Night">Afternoon,Night</option>
                    <option value="Morning,Afternoon,Night">Morning,Afternoon,Night</option>
                  </select>

                  <select
                    value={medicine.food}
                    onChange={(e) => handleMedicineChange(index, 'food', e.target.value)}
                    className="w-5/12 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Before/After Food</option>
                    <option value="Before Food">Before Food</option>
                    <option value="After Food">After Food</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveMedicine(index)}
                  className="text-red-500 text-xs mt-2"
                >
                  Remove
                </button>
              </div>
            ))}

            <div className="flex justify-between">
              {/*<button onClick={handleCloseModal} className="text-gray-500">Cancel</button>*/}
              <button
                onClick={handleAddMedicine}
                className="text-white bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded-md">
                Add Medicine
              </button>
            </div>

            <div className="mt-2">
              <input
                type="number"
                value={medicineCharge}
                onChange={(e) => setMedicineCharge(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter medicine charge"
              />
            </div>

            <div className="mt-4 flex justify-between">
              <button onClick={handleCloseModal} className="text-gray-500">Cancel</button>
              <button
                onClick={handleSubmit}
                className="text-white bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded-md">
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
