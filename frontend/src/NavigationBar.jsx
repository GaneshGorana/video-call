import React, { useState } from "react";
import { Link } from "react-scroll";

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="flex items-center justify-between flex-wrap bg-transparent p-6 top-0 z-50">
      <div className="flex items-center flex-shrink-0 text-black mr-6">
        <span className="font-semibold text-4xl tracking-tight">VidCall</span>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={toggleMenu}
          className="flex items-center px-3 py-2 border rounded text-blue-950 border-blue-400 hover:text-black hover:border-black"
        >
          <svg
            className={`fill-current h-3 w-3 transition-transform duration-500 transform ${
              isOpen ? "scale-125" : ""
            }`}
            viewBox="0 0 20 20"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div
        className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto transition-all duration-700 ease-in-out font-bold ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden lg:max-h-full lg:opacity-100`}
      >
        <div className="text-sm lg:flex-grow lg:flex lg:justify-end">
          <Link
            to="home-section"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 mx-4 px-4 py-2 rounded duration-300 text-lg lg:text-xl transform hover:scale-125 hover:font-thin hover:space-x-4 transition-all"
          >
            Home
          </Link>
          <Link
            to="service-section"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 mx-4 px-4 py-2 rounded duration-300 text-lg lg:text-xl transform hover:scale-125 hover:font-thin hover:space-x-4 transition-all"
          >
            Service
          </Link>
          <Link
            to="how-to-use-section"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 mx-4 px-4 py-2 rounded duration-300 text-lg lg:text-xl transform hover:scale-125 hover:font-thin hover:space-x-4 transition-all"
          >
            How to Use
          </Link>
          <Link
            to="about-section"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 mx-4 px-4 py-2 rounded duration-300 text-lg lg:text-xl transform hover:scale-125 hover:font-thin hover:space-x-4 transition-all"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
