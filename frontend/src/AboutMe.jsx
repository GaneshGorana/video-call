// eslint-disable-next-line no-unused-vars
import React from "react";

function AboutMe() {
  return (
    <div
      id="about-section"
      className="flex flex-col md:flex-row items-center justify-center bg-blue-900 text-white p-10 mt-10 mb-10"
    >
      <div className="w-full md:w-1/2">
        <img
          className="w-full h-64 md:h-auto md:w-64 mx-auto md:mx-0 rounded-full"
          src="https://via.placeholder.com/150"
          alt="Your Name"
        />
      </div>
      <div className="w-full md:w-1/2 mt-6 md:mt-0 md:ml-6 text-center md:text-left">
        <h1 className="text-4xl mb-4">Your Name</h1>
        <p>
          This is a placeholder for your biography. You can replace this text
          with information about yourself, such as your background, experience,
          skills, and interests.
        </p>
      </div>
    </div>
  );
}

export default AboutMe;
