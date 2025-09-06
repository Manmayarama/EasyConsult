import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>
      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>US</span></p>
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28 text-sm'>
        <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-lg text-gray-600'>Our Office</p>
          <p className='text-gray-500'>Tel:<a href="tel:+919876543210">+919876543210</a></p>
          <p className='text-gray-500'>Email:<a href="mailto:easyconsult11@gmail.com">easyconsult11@gmail.com</a></p>
        </div>
      </div>

      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='text-gray-700 font-semibold'>DEVELOPERS</span></p>
      </div>

      <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b'>
        <div>
          <img className='w-32 bg-indigo-50' src={assets.profile_pic} alt="" />
        </div>
        <div className='flex-1 text-sm text-zinc-600'>
          <p className='text-neutral-800 font-semibold'>Manmaya Rama </p>
          {/* Social Media Icons */}
          <div className="flex gap-4 mt-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-facebook-f text-xl text-black hover:text-gray-600"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-instagram text-xl text-black hover:text-gray-600"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <i className="fab fa-linkedin-in text-xl text-black hover:text-gray-600"></i>
                </a>
                {/* Added Mail Icon */}
                <a href="mailto:easyconsult11@gmail.com">
                  <i className="fas fa-envelope text-xl text-black hover:text-gray-600"></i>
                </a>
              </div>
        </div>
      </div> <hr />
    </div>
  )
}

export default Contact