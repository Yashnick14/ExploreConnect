// src/Pages/AboutUs.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { FaLeaf, FaTree, FaHandsHelping } from "react-icons/fa";

// 👇 Import your images here
import journeyImg from "../../assets/aboutus.jpg";
import registrationsImg from "../../assets/registrations.jpg";
import membershipImg from "../../assets/memberships.jpg";

const AboutUs = () => {
  const [animateCount, setAnimateCount] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    // Trigger animation once on page load/refresh
    setAnimateCount(true);
  }, []);

  const faqs = [
    {
      question: "What is ExploreConnect?",
      answer:
        "ExploreConnect is a platform that helps you discover Sri Lanka’s green treasures — parks, sanctuaries, and eco-trails — and make easy visit registrations online.",
    },
    {
      question: "How do I register for a place?",
      answer:
        "Simply browse the available places, select your destination, and complete a quick registration form. You’ll receive a confirmation of your visit instantly.",
    },
    {
      question: "What are the benefits of membership?",
      answer:
        "Membership gives you access to exclusive perks such as exclusive places, special discounts, and a community of eco-conscious explorers.",
    },
    {
      question: "Is ExploreConnect free to use?",
      answer:
        "Yes, browsing parks and making basic registrations is free. Membership plans are optional and designed for those who want extra features and benefits.",
    },
    {
      question: "Can I cancel or edit my registration?",
      answer:
        "Yes, you can easily cancel or edit your visit by accessing your dashboard. Our system ensures flexibility so you can plan your trips stress-free.",
    },
  ];

  return (
    <div className="min-h-screen bg-green-50 text-gray-800">
      {/* ===== Our Story Banner ===== */}
      <section className="relative w-full h-[70vh] mt-20">
        {/* Background Image */}
        <img
          src={journeyImg}
          alt="Our Story Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg"
          >
            Our Story
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-4xl text-lg md:text-xl leading-relaxed text-gray-200"
          >
            ExploreConnect was founded with a simple mission: to connect people
            with nature. Every park, sanctuary, and trail tells a story worth
            experiencing. By simplifying registrations, we make sure you spend
            less time planning and more time exploring.
          </motion.p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 space-y-24">
        {/* ===== Stats Section ===== */}
        <div className="grid items-center lg:grid-cols-12 gap-10 lg:gap-16">
          {/* Highlight Stat */}
          <div className="lg:col-span-4">
            <p className="text-6xl font-bold text-green-700">
              {animateCount && <CountUp start={0} end={95} duration={3} />}%
              <span className="ml-2 inline-flex items-center gap-x-1 bg-green-100 font-medium text-green-800 text-xs rounded-full py-0.5 px-2">
                +10% this year
              </span>
            </p>
            <p className="mt-3 text-gray-600">
              of users say ExploreConnect makes their trips easier
            </p>
          </div>

          {/* Other Stats */}
          <div className="lg:col-span-8 relative lg:before:absolute lg:before:top-0 lg:before:-left-12 lg:before:w-px lg:before:h-full lg:before:bg-gray-200">
            <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <p className="text-3xl font-semibold text-green-700">
                  {animateCount && (
                    <CountUp start={0} end={1000} duration={3} separator="," />
                  )}
                  +
                </p>
                <p className="mt-1 text-gray-600">happy explorers</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-green-700">
                  {animateCount && (
                    <CountUp start={0} end={500} duration={3} separator="," />
                  )}
                  +
                </p>
                <p className="mt-1 text-gray-600">registrations monthly</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-green-700">
                  {animateCount && <CountUp start={0} end={88} duration={3} />}%
                </p>
                <p className="mt-1 text-gray-600">recommend us to friends</p>
              </div>
              <div>
                <p className="text-3xl font-semibold text-green-700">
                  {animateCount && <CountUp start={0} end={30} duration={3} />}+
                </p>
                <p className="mt-1 text-gray-600">partner parks & trails</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Core Features ===== */}
        <div className="space-y-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Our Core Features
          </h2>

          {/* Row 1: Registrations */}
          <div className="md:flex md:items-center md:gap-12 text-left">
            <motion.img
              initial={{ x: 100 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
              src={registrationsImg}
              alt="Registrations"
              className="md:w-1/2 rounded-xl shadow-lg object-cover w-full mb-8 md:mb-0"
            />
            <motion.div
              initial={{ x: 100 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
              className="md:w-1/2 space-y-4"
            >
              <h3 className="text-2xl font-semibold text-green-700">
                Easy Visit Registrations
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Reserve your spot in parks and sanctuaries with just a few
                clicks. Our simple system ensures hassle-free entry so you can
                focus on enjoying nature.
              </p>
            </motion.div>
          </div>

          {/* Row 2: Membership */}
          <div className="md:flex md:flex-row-reverse md:items-center md:gap-12 text-left">
            <motion.img
              initial={{ x: -100 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.3 }}
              src={membershipImg}
              alt="Membership"
              className="md:w-1/2 rounded-xl shadow-lg object-cover w-full mb-8 md:mb-0"
            />
            <motion.div
              initial={{ x: -100 }}
              whileInView={{ x: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
              className="md:w-1/2 space-y-4"
            >
              <h3 className="text-2xl font-semibold text-green-700">
                Exclusive Membership Benefits
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Unlock premium perks like priority booking, event invites, and
                discounts. Join a community of eco-conscious explorers.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ===== Core Values ===== */}
        <div>
          <h2 className="text-3xl font-bold mb-12 text-gray-900 text-center">
            Our Core Values
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition"
            >
              <FaLeaf className="text-green-600 text-4xl mb-4 mx-auto" />
              <h3 className="font-semibold text-lg">Sustainability</h3>
              <p className="text-gray-600 text-sm mt-2">
                Promoting eco-friendly travel and encouraging respect for
                nature.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition"
            >
              <FaTree className="text-emerald-600 text-4xl mb-4 mx-auto" />
              <h3 className="font-semibold text-lg">Conservation</h3>
              <p className="text-gray-600 text-sm mt-2">
                Partnering with parks to preserve Sri Lanka’s unique green
                spaces.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 rounded-xl bg-white shadow hover:shadow-lg transition"
            >
              <FaHandsHelping className="text-teal-600 text-4xl mb-4 mx-auto" />
              <h3 className="font-semibold text-lg">Community</h3>
              <p className="text-gray-600 text-sm mt-2">
                Building a supportive network of explorers, locals, and
                eco-conscious travelers.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ===== FAQ Section ===== */}
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center px-4 md:px-0">
          <p className="text-green-600 text-sm font-medium">FAQ’s</p>
          <h2 className="text-3xl font-bold text-center">
            Looking for answers?
          </h2>
          <p className="text-sm text-slate-500 mt-2 pb-8 text-center">
            Here are some common questions about ExploreConnect and how it
            works.
          </p>
          {faqs.map((faq, index) => (
            <div
              key={index}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="border-b border-slate-200 py-4 cursor-pointer w-full"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{faq.question}</h3>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`${
                    openIndex === index ? "rotate-180" : ""
                  } transition-all duration-500 ease-in-out`}
                >
                  <path
                    d="m4.5 7.2 3.793 3.793a1 1 0 0 0 1.414 0L13.5 7.2"
                    stroke="#1D293D"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p
                className={`text-sm text-slate-500 transition-all duration-500 ease-in-out max-w-md ${
                  openIndex === index
                    ? "opacity-100 max-h-[300px] translate-y-0 pt-4"
                    : "opacity-0 max-h-0 -translate-y-2"
                }`}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
