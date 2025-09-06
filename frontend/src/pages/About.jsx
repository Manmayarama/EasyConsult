import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div>
        <div className='text-center text-2xl pt-10 text-gray-500'>
          <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
          <div className='my-10 flex flex-col md:flex-row gap-12'>
            <img  className='w-ful md:max-w-[360px]'src={assets.about_image} alt="" />
            <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm text-gray-600'>
              <p>Welcome to EasyConsult, your go-to platform for seamless doctor appointment bookings! At EasyConsult, we understand the importance of timely and efficient healthcare access.</p>
              <p>Our intuitive system allows you to book appointments with your preferred doctors effortlessly, ensuring you get the care you need without the hassle. Whether you're looking for a specialist or a general practitioner, our extensive network of healthcare professionals is here to serve you.</p>
              <b></b>
              <p>EasyConsult is dedicated to making healthcare accessible and straightforward, giving you peace of mind and more time to focus on what matters most—your health. Join us and experience the future of healthcare booking today!</p>
            </div>
          </div>
        </div>
    </div>
  )
}

export default About