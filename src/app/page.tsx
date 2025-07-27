"use client";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import focus from "../assets/focus-log.png";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (name.trim()) router.push(`/room?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="animate-gradient-diagonal bg-gradient-to-br from-slate-900 via-gray-900 to-blue-950 font-sans flex items-center justify-center min-h-screen p-8 pb-20 sm:p-20">
      {/* <div className="absolute top-0 left-0 w-full h-full "></div> */}
      <div className="flex flex-col items-center justify-center px-8 py-8 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-4xl text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 -mb-16">
          Lock The Fuck In
        </h1>
        <div className="relative w-96 h-96">
          <Image
            src={focus}
            alt="Focus Logo"
            className="absolute h-full w-full object-cover"
          />
        </div>
        <input
          type="text"
          placeholder="Welcome Hustler, enter your name"
          autoFocus
          required
          className="w-full p-2 bg-transparent border-b-2 border-white/30 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <button
          onClick={handleSubmit}
          className="mt-6 w-full px-4 py-2 bg-blue-600/50 hover:bg-blue-600/80 text-white rounded-lg border border-white/10 transition-colors duration-300"
        >
          Join Room
        </button>
      </div>
    </div>
  );
}
