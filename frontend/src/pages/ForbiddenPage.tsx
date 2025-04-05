import React from "react";
import { Link } from "react-router-dom";

const ForbiddenPage: React.FC = () => {
  return (
    <div className=" flex justify-center items-center h-screen bg-background overflow-hidden ">
      <div className="text-center p-8 bg-background ">
        <h1 className="text-4xl font-bold text-red-600">403 Forbidden</h1>
        <p className="mt-4 text-xl text-gray-700">
          You do not have permission to access this page!
        </p>
        <Link to="/" className="mt-6 text-blue-500 hover:underline font-bold">
          Go Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
