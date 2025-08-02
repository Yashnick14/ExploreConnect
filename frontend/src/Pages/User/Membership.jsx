import React from "react";
import bgImage from "../../assets/mount11.jpg"; // adjust path as needed

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

const badgeColors = [
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-blue-100 text-blue-700",
];

const Membership = () => {
  return (
    <div
      className="relative py-20"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4"><br></br>
        <h1 className="text-center text-4xl font-semibold leading-tight sm:text-5xl text-emerald-900">
          Membership
        </h1>
        <p className="text-center text-gray-700 md:text-lg mt-2">
          Choose a plan that suits your needs
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col bg-white shadow-md rounded-2xl overflow-hidden border border-gray-200 transition-transform duration-300 hover:scale-105 ${
                index === 1
                  ? "scale-105 shadow-lg z-10 border-green-500 h-[520px] md:h-[540px]"
                  : "scale-100 h-[460px] md:h-[480px]"
              }`}
            >
              {/* Top bar */}
              <div className="h-2 bg-gradient-to-r from-green-500 via-green-400 to-green-600 w-full"></div>

              {/* Plan Badge */}
              <div
                className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full font-semibold text-xs shadow ${badgeColors[index]}`}
              >
                {plan.title}
              </div>

              {/* Content */}
              <div className="flex flex-col items-center px-6 py-10 flex-1">
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-8 py-6 flex flex-col items-center shadow-sm mb-6 w-full max-w-xs">
                  <p className="text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    {plan.price}
                    <span className="text-base font-medium text-gray-500 ml-1">
                      /{plan.title === "WEEKLY" ? "week" : plan.title === "MONTHLY" ? "month" : "year"}
                    </span>
                  </p>
                  <button className="bg-black text-white px-8 py-2 rounded-full font-semibold shadow hover:bg-gray-800 transition mt-2">
                    Pay Now
                  </button>
                </div>

                {/* Features */}
                <ul className="space-y-3 w-full mt-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700 text-sm">
                      <span className="text-green-600 mr-2 text-lg">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Membership;
