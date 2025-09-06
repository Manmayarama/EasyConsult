import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import SpecialityMenu from '../components/SpecialityMenu';
import TopDoctors from '../components/TopDoctors';
import Banner from '../components/Banner';
import Loader from '../components/Loader'; // Import the Loader component

const Home = () => {
  const [loading, setLoading] = useState(true);

  // Simulate page load (or use actual data fetching)
  useEffect(() => {
    // Set a timeout to simulate a page loading (3 seconds)
    setTimeout(() => {
      setLoading(false);
    }, 3000); // Change 3000ms to your expected load time
  }, []);

  return (
    <div>
      {loading ? (
        <Loader /> // Show the loader while loading
      ) : (
        <>
          <Header />
          <SpecialityMenu />
          <TopDoctors />
          <Banner />
        </>
      )}
    </div>
  );
};

export default Home;
