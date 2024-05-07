// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import { Link } from "react-scroll";

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="flex items-center justify-between flex-wrap bg-blue-900 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">Vidget</span>
      </div>
      <div className="block lg:hidden">
        <button
          onClick={toggleMenu}
          className="flex items-center px-3 py-2 border rounded text-blue-200 border-blue-400 hover:text-white hover:border-white"
        >
          <svg
            className={`fill-current h-3 w-3 transition-transform duration-500 transform ${
              isOpen ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div
        className={`w-full block flex-grow lg:flex lg:items-center lg:w-auto transition-height duration-500 ease-in-out ${
          isOpen ? "" : "hidden"
        }`}
      >
        <div className="text-sm lg:flex-grow lg:flex lg:justify-end">
          <Link
            to="home-section"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mx-4 px-4 py-2 rounded transition-colors duration-300 text-lg lg:text-xl transform hover:scale-110 md:hover:scale-100"
          >
            Home
          </Link>
          <Link
            to="about-section"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mx-4 px-4 py-2 rounded transition-colors duration-300 text-lg lg:text-xl transform hover:scale-110 md:hover:scale-100"
          >
            About
          </Link>
          <Link
            to="videocal-section"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mx-4 px-4 py-2 rounded transition-colors duration-300 text-lg lg:text-xl transform hover:scale-110 md:hover:scale-100"
          >
            Service
          </Link>
          <Link
            to="how-to-use"
            smooth={true}
            duration={500}
            onClick={toggleMenu}
            className="cursor-pointer block mt-4 lg:inline-block lg:mt-0 text-blue-200 hover:text-white mx-4 px-4 py-2 rounded transition-colors duration-300 text-lg lg:text-xl transform hover:scale-110 md:hover:scale-100"
          >
            How to Use
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
