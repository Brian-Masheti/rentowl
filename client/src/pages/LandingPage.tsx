import React from "react";
import { Link } from "react-router-dom";
import { Button, Card } from "@radix-ui/themes";
import Slideshow from "./Slideshow";

const roleCards = [
  {
    title: "Landlord",
    color: "teal",
    features: [
      "View/manage properties & finances",
      "Assign caretakers",
      "Access legal docs & reports",
      "Monitor occupancy & arrears",
    ],
  },
  {
    title: "Caretaker",
    color: "orange",
    features: [
      "Manage maintenance & tasks",
      "Communicate with tenants",
      "View rent status (paid/unpaid)",
      "Track service history",
    ],
  },
  {
    title: "Tenant",
    color: "teal",
    features: [
      "View agreements & payment history",
      "Make online payments",
      "Submit maintenance requests",
      "Receive reminders & announcements",
    ],
  },
];

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #FFF8F0 0%, #FFE3BB 40%, #03A6A1 100%)' }}>
      {/* Top Navigation Bar */}
      <nav className="w-full flex justify-end items-center px-8 py-6">
        <div className="flex gap-6">
          <div className="group relative">
            <Link to="/register">
              <div className="transition-all duration-300 rounded-xl shadow-lg bg-white/90 border-2 border-[#03A6A1] px-6 py-2 flex items-center justify-center cursor-pointer group-hover:bg-[#03A6A1] group-hover:scale-105">
                <Button color="teal" radius="full" size="3" variant="ghost" className="font-bold group-hover:text-white transition-colors duration-300">Register</Button>
              </div>
            </Link>
          </div>
          <div className="group relative">
            <Link to="/login">
              <div className="transition-all duration-300 rounded-xl shadow-lg bg-white/90 border-2 border-[#FFA673] px-6 py-2 flex items-center justify-center cursor-pointer group-hover:bg-[#FFA673] group-hover:scale-105">
                <Button color="orange" radius="full" size="3" variant="ghost" className="font-bold group-hover:text-white transition-colors duration-300">Login</Button>
              </div>
            </Link>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <img src="/images/logo2.png" alt="RentOwl Logo" className="h-24 w-24 mb-6 animate-fade-in" />
        <h1 className="text-5xl font-extrabold text-[#03A6A1] mb-4 text-center animate-fade-in">RentOwl</h1>
        {/* Animated Slideshow */}
        <div className="w-full max-w-2xl mb-8 animate-fade-in">
          <Slideshow />
        </div>
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl mt-12 animate-slide-up">
          {roleCards.map((role) => (
            <Card
              key={role.title}
              style={{
                background:
                  role.color === "teal"
                    ? "linear-gradient(135deg, #E6FFFA 0%, #FFF8F0 100%)"
                    : "linear-gradient(135deg, #FFF8F0 0%, #FFE3BB 100%)",
                border: `2px solid ${role.color === "teal" ? "#03A6A1" : "#FFA673"}`,
                boxShadow: `0 8px 32px 0 rgba(3,166,161,0.10)`
              }}
              className="flex-1 min-w-[340px] rounded-3xl shadow-2xl p-10 transition-transform duration-300 hover:scale-105 hover:shadow-2xl group"
            >
              <h2 className={`text-2xl font-bold mb-5 text-center ${role.color === "teal" ? "text-[#03A6A1]" : "text-[#FFA673]"}`}>{role.title}</h2>
              <ul className="list-disc ml-8 text-gray-700 text-lg space-y-2">
                {role.features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </main>
      <footer className="text-center mt-12 mb-4 text-sm animate-fade-in" style={{ color: '#23272F', fontWeight: 600, textShadow: '0 1px 4px #fff' }}>
        &copy; {new Date().getFullYear()} RentOwl. All rights reserved.
      </footer>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(0.4, 0, 0.2, 1) both; }
        .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) both; }
      `}</style>
    </div>
  );
};

export default LandingPage;
