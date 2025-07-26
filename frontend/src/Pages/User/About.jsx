import React from 'react'

const About = () => {
return (
  <div className="flex flex-col items-center justify-center text-sm max-md:px-4 py-20">
    <h1 className="text-8xl md:text-9xl font-bold text-indigo-500">🚧</h1>
    <div className="h-1 w-16 rounded bg-indigo-500 my-5 md:my-7"></div>
    
    <p className="text-2xl md:text-3xl font-bold text-gray-800">
      Page Under Construction
    </p>
    <br/><br/>
    <svg xmlns="http://www.w3.org/2000/svg" class="w-10 animate-[spin_0.8s_linear_infinite] fill-blue-600 block mx-auto"
      viewBox="0 0 24 24">
      <path
        d="M12 22c5.421 0 10-4.579 10-10h-2c0 4.337-3.663 8-8 8s-8-3.663-8-8c0-4.336 3.663-8 8-8V2C6.579 2 2 6.58 2 12c0 5.421 4.579 10 10 10z"
        data-original="#000000" />
    </svg>
    <br/><br/>
    <p className="text-sm md:text-base mt-4 text-gray-500 max-w-md text-center">
      This page is not yet implemented. We are working hard to build it soon. Please check back later or contact support if needed.
    </p>
    <div className="flex items-center gap-4 mt-6">
      <a
        href="/"
        className="bg-gray-800 hover:bg-black px-7 py-2.5 text-white rounded-md active:scale-95 transition-all"
      >
        Return Home
      </a>
      <a
        href="/contact"
        className="border border-gray-300 px-7 py-2.5 text-gray-800 rounded-md active:scale-95 transition-all"
      >
        Contact Support
      </a>
    </div>
  </div>
);
}

export default About