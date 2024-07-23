import { useState } from "react";
import { Link } from "react-scroll";
import { useNavigate } from "react-router-dom";

const NavigationBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropMenu = () => {
    setIsDropOpen(!isDropOpen);
  };

  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between flex-wrap bg-transparent p-6 top-0 z-50 relative">
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
            Usage
          </Link>
        </div>
        <div className="lg:mt-0 mx-4 cursor-pointer mt-4 ">
          <button
            id="dropdownDividerButton"
            onClick={toggleDropMenu}
            data-dropdown-toggle="dropdownDivider"
            className="text-black bg-white text-xl hover:bg-black border-2 focus:ring-black font-medium rounded-lg px-4 py-1 text-center inline-flex items-center dark:bg-white dark:hover:bg-white "
            type="button"
          >
            More
          </button>
          {isDropOpen && (
            <ul
              role="menu"
              data-popover="profile-menu"
              data-popover-placement="bottom"
              className="absolute z-10 flex  flex-col gap-2 overflow-auto rounded-md border border-blue-gray-50 bg-white p-3 font-sans text-sm font-normal text-blue-gray-500 shadow-lg shadow-blue-gray-500/10 focus:outline-none"
            >
              <button
                onClick={() => {
                  navigate("/assets-attribution");
                }}
                role="menuitem"
                className="flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
              >
                <p className="block font-sans text-sm antialiased font-medium leading-normal text-inherit">
                  Assets Attribution
                </p>
              </button>
              <hr className="my-2 border-blue-gray-50" role="menuitem" />
              <button
                onClick={() => {
                  navigate("/faq");
                }}
                role="menuitem"
                className="flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900"
              >
                <p className="block font-sans text-sm antialiased font-medium leading-normal text-inherit">
                  FAQ
                </p>
              </button>
              <hr className="my-2 border-blue-gray-50" role="menuitem" />
              <Link
                to="about-section"
                smooth={true}
                duration={500}
                onClick={() => {
                  toggleDropMenu();
                  toggleMenu();
                }}
                className="flex w-full cursor-pointer select-none items-center gap-2 rounded-md px-3 pt-[9px] pb-2 text-start leading-tight outline-none transition-all hover:bg-blue-gray-50 hover:bg-opacity-80 hover:text-blue-gray-900 focus:bg-blue-gray-50 focus:bg-opacity-80 focus:text-blue-gray-900 active:bg-blue-gray-50 active:bg-opacity-80 active:text-blue-gray-900 font-sans text-sm antialiased font-medium text-inherit"
              >
                About Me
              </Link>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
