import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center p-4 text-center text-slate-900">
      <h1 className="text-8xl font-black text-teal-600">404</h1>
      <h2 className="text-2xl font-bold mt-4">Page Not Found</h2>
      <p className="text-xs text-slate-600 max-w-sm mt-2">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};
