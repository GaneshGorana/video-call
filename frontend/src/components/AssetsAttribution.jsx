const AssetsAttribution = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Asset Credits</h1>
      <div className="flex flex-wrap justify-center">
        <div className="max-w-sm w-full lg:max-w-full lg:flex">
          <div className="m-4 border-r border-b border-l border-t border-gray-400 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
            <img
              className="w-full h-48 object-cover"
              src="https://ik.imagekit.io/imgUpload/videocall_assests/two.jpg"
              alt="Beautiful Landscape"
              loading="lazy"
            />
            <div className="mt-4">
              <p className="text-gray-700 text-base">
                Image by studio4rt on Freepik
              </p>
              <a
                href="https://www.freepik.com/free-vector/woman-man-talking-online-video-call-communication-via-computer-screen-friends-waving-videoconference-talking-with-snacks-virtual-digital-meeting_27399578.htm#fromView=search&page=2&position=26&uuid=dcd3ccc1-f3c7-4e9c-894f-b304afe42ec5"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded"
              >
                Visit Author
              </a>
            </div>
          </div>
          <div className="m-4 border-r border-b border-l border-t border-gray-400 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
            <img
              className="w-full h-48 object-cover"
              src="https://ik.imagekit.io/imgUpload/videocall_assests/three.jpg"
              alt="Beautiful Landscape"
              loading="lazy"
            />
            <div className="mt-4">
              <p className="text-gray-700 text-base">Image by vecteezy.com</p>
              <a
                href="https://pin.it/34fdbiWSD"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded"
              >
                Visit Author
              </a>
            </div>
          </div>
          <div className="m-4 border-r border-b border-l border-t border-gray-400 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
            <img
              className="w-full h-48 object-cover"
              src="https://ik.imagekit.io/imgUpload/videocall_assests/one.jpg"
              alt="Beautiful Landscape"
              loading="lazy"
            />
            <div className="mt-4">
              <p className="text-gray-700 text-base">Image by freepik.com</p>
              <a
                href="https://pin.it/3XifD02mh"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded"
              >
                Visit Author
              </a>
            </div>
          </div>
          <div className="m-4 border-r border-b border-l border-t border-gray-400 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
            <img
              className="w-full h-48 object-cover"
              src="https://ik.imagekit.io/imgUpload/videocall_assests/how-we.jpg"
              alt="Beautiful Landscape"
              loading="lazy"
            />
            <div className="mt-4">
              <p className="text-gray-700 text-base">Image by freepik.com</p>
              <a
                href="https://pin.it/1c8UMo8Ww"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded"
              >
                Visit Author
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="text-center mt-8 text-sm text-gray-600">
        <b>NOTE : </b>
        Copyright © All assets and materials belong to their respective authors
        and are used under their guidelines. I do not claim ownership of these
        assets.
      </p>
    </div>
  );
};

export default AssetsAttribution;
