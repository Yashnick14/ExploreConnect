// src/pages/VerifySuccess.jsx
import React from "react";

const VerifySuccess = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-green-50">
      <div className="bg-white p-8 rounded shadow text-center">
        <h1 className="text-2xl font-bold text-green-600 mb-4">🎉 Registration Successful!</h1>
        <p className="text-gray-700 mb-4">
          Your email has been verified. You can now log in to your account.
        </p>
      </div>
    </div>
  );
};

export default VerifySuccess;
