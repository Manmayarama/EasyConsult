import React from 'react'
import { useNavigate } from 'react-router-dom'

const Banner = () => {
  const navigate=useNavigate()
  return (
    <div className='flex bg-primary rounded-lg px-6 sm:px-10 md:px-14 lg:px-12 my-20 md:mx-10'>
        {/* ----leftside------*/}
        <div className='flex-1 py-8 sm:py-10 md:py-16 lg:py-24 lg:pl-5'>
            <div className='text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold text-white'>
                <center><p>Don't have an account?</p></center>
            </div>
            <center><button  onClick={()=>{ navigate('/login'); scrollTo(0,0) }} className='bg-white text-sm sm:text-base text-gray-600 px-8 py-3 rounded-full mt-6 hover:scale-105 transition-all'>Create Account</button></center>
        </div>
         
    </div>
  )
}

export default Banner