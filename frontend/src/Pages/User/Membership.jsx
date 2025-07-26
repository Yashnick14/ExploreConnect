import React from "react";

const plans = [
  {
    title: "WEEKLY",
    price: "$4.99",
    features: [
      "Get access to exclusive places",
      "Arrange events on request",
      "Access to seasonal offers",
    ],
  },
  {
    title: "MONTHLY",
    price: "$14.99",
    features: [
      "Get access to exclusive places",
      "Arrange events on request",
      "Access to seasonal offers",
      "Get various discounts",
    ],
  },
  {
    title: "YEARLY",
    price: "$159.99",
    features: [
      "Access to seasonal offers",
      "Get various discounts",
      "Free 1 month trial",
    ],
  },
];

const Membership = () => {
  return (
    <div className="py-20 max-w-6xl mx-auto px-4">
      <h1 className="text-center text-4xl font-semibold leading-tight sm:text-5xl">
        Membership
      </h1>
      <p className="text-center text-gray-500 md:text-lg mt-2">
        Choose a plan that suits your needs
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative flex flex-col bg-white shadow-md rounded-xl overflow-hidden border border-gray-200 ${
              index === 1 ? "scale-105 shadow-lg z-10" : "scale-100"
            }`}
          >
            {/* Green top bar */}
            <div className="h-2 bg-green-600 w-full"></div>

            {/* Content */}
            <div className="flex flex-col items-center px-6 py-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {plan.title}
              </h2>
              <p className="text-4xl font-bold text-gray-900 mb-4">
                {plan.price}
              </p>

              {/* Pay Button */}
              <button className="bg-black text-white px-6 py-2 rounded-full mb-6 hover:bg-gray-800 transition">
                Pay
              </button>

              {/* Features */}
              <ul className="space-y-3 w-full">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-700 text-sm">
                    <span className="text-green-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Membership;
