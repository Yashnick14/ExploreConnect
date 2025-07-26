import React from "react";
import { BsInstagram } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-black to-emerald-950 text-[#eeeeee] px-4 md:px-8 py-10 text-sm">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8 mb-6">

        <div className="min-w-[150px]">
          <h4 className="text-[#3ddc91] font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-2">
            <li>About us</li>
            <li>Available Places</li>
            <li>Register Slot</li>
          </ul>
        </div>

        <div className="min-w-[150px]">
          <h4 className="text-[#3ddc91] font-semibold mb-2">Information</h4>
          <ul className="space-y-2">
            <li>Terms and conditions</li>
            <li>Privacy policy</li>
            <li>FAQs</li>
          </ul>
        </div>

        <div className="min-w-[200px]">
          <h4 className="text-[#3ddc91] font-semibold mb-2">Contact us</h4>
          <p>Email: ExploreConnect@gmail.com</p>
          <p>Mobile: 0771234567</p>
          <p>Address: No 10, Kandy road, Colombo</p>
        </div>

        <div className="min-w-[150px]">
          <h4 className="text-[#3ddc91] font-semibold mb-2">Follow us</h4>
          <div className="flex items-center space-x-4 mt-2 text-lg">
            <BsInstagram className="hover:text-[#3ddc91] cursor-pointer" />
            <FaFacebookF className="hover:text-[#3ddc91] cursor-pointer" />
            <FaXTwitter className="hover:text-[#3ddc91] cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4 text-center text-[#cccccc]">
        © EXPLORECONNECT 2025
      </div>
    </footer>
  );
};

export default Footer;
