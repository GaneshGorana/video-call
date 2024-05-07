// eslint-disable-next-line no-unused-vars
import React from "react";
function Home() {
  return (
    <div
      id="home-section"
      className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-black p-10 mt-10 mb-10"
    >
      <h1 className="text-5xl mb-4">Welcome to our Video Call Application!</h1>
      <p>
        This application allows you to connect with your friends or colleagues
        through a simple and intuitive interface.
      </p>
      <p>
        To get started, you need to enter your mobile number in the 'Your mobile
        number' field and click on the 'Join' button. This will connect you to
        our server and prepare you for the call.
      </p>
      <p>
        To initiate a call, enter your friend's mobile number in the 'Friend
        mobile number' field and click on the 'Call' button. This will send a
        call request to your friend.
      </p>
      <p>
        When you receive a call, you will see a notification on your screen
        showing 'Incoming Call from: [caller's mobile number]'. You can accept
        the call by clicking on the 'Accept' button.
      </p>
      <p>
        During the call, you will see two video feeds. The larger feed is your
        friend's video, and the smaller one is your video.
      </p>
      <p>
        Our application uses the latest WebRTC technology to ensure
        high-quality, real-time communication. It also uses socket.io for
        real-time bidirectional event-based communication.
      </p>
      <p className="mt-4">Enjoy your call!</p>
    </div>
  );
}

export default Home;
