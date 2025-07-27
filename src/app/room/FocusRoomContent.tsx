"use client";
// pages/focus-room.tsx
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useFocusRoom } from "../hooks/useRoom";
import { v4 as uuidv4 } from "uuid";
import { getRandomQuote } from "./quotes";
import { Toaster } from "react-hot-toast";
import notify from "../../../notify";

export default function FocusRoom() {
  const searchParams = useSearchParams();
  const name = searchParams.get("name");
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  // Generate or retrieve user ID
  const [userId, setUserId] = useState<string>("");
  const [displayTime, setDisplayTime] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(""); 
 // Use our custom hook
 const { users, isConnected, hasJoined, leaveRoom, timerState, startTimer, stopTimer, resetTimer } = useFocusRoom(
  name as string,
  userId
)
  // Generate UUID when component mounts
  useEffect(() => {
    console.log(users)
    const newUserId = uuidv4();
    setUserId(newUserId);

  }, [users]);
  useEffect(() => {
    let animationFrameId: number;

    const updateDisplayTime = () => {
      if (timerState.isActive) {
        const elapsed = Date.now() - timerState.startTime;
        setDisplayTime((timerState.elapsedTime + elapsed) / 1000);
      } else {
        setDisplayTime(timerState.elapsedTime / 1000);
      }
      animationFrameId = requestAnimationFrame(updateDisplayTime);
    };
    setInterval(()=>{
      setCurrentQuote(getRandomQuote());
    }, 5000)
    animationFrameId = requestAnimationFrame(updateDisplayTime);

    return () => cancelAnimationFrame(animationFrameId);
  }, [timerState]);

 ;

  const formatTime = (totalSeconds: number) => {
    const totalSecondsFloored = Math.floor(totalSeconds);
    const hours = Math.floor(totalSecondsFloored / 3600);
    const minutes = Math.floor((totalSecondsFloored % 3600) / 60);
    const seconds = totalSecondsFloored % 60;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  // Show loading state while we get user data
  if (!name || !userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }
  const angle = 360 * (1 - ((displayTime % 3600) / 3600));

  // Create the dynamic style object for the border
  const borderStyle = {
    background: `conic-gradient(from 90deg, #4f46e5 ${angle}deg, transparent ${angle}deg)`,
  };

  // Handle leaving the room
  const handleLeave = () => {
    leaveRoom();
    router.push("/");
  };

  return (
    <div className="min-h-screen animate-gradient-diagonal bg-gradient-to-br from-slate-900 via-gray-900 to-blue-950 p-8">
      {/* Header */}
      <Toaster />
      <div className="w-11/12 mx-auto max-screen-2xl">
        <div className="flex justify-between items-start lg:items-center">
          <span>
            <h1 className="text-2xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
              Focus Room
            </h1>
            <p className="text-xs lg:text-md text-gray-700 max-md:max-w-[150px]">
              Welcome, {name}!
              {hasJoined ? " You have joined the focus room." : " Joining..."}
            </p>
          </span>
          <div className="flex items-center space-x-4">
            {/* Connection status indicator */}
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  isConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>

            {/* Leave button */}
            <button
              onClick={handleLeave}
              className="bg-red-500 text-white max-md:text-xs px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Leave Room
            </button>
          </div>
        </div>

        {/* Welcome message */}
      </div>

      {/* Active users section */}
      <div
        className={`bg-white/30 backdrop-blur-lg fixed bottom-8 right-6 shadow-sm p-6 max-w-sm w-full rounded-lg transition-all duration-300 ${
          isExpanded ? "max-h-96 overflow-y-auto overflow-x-hidden" : "max-h-28 overflow-y-hidden overflow-x-auto"
        }`}
      >
        <span className="flex items-center justify-between cursor-pointer">
          <h2 className="text-xl font-semibold text-gray-800">
            Active Users ({users.length})
          </h2>
          <svg
            onClick={() => setIsExpanded(!isExpanded)}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 transition-transform duration-300 ${
              isExpanded ? "transform rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>

        <div className="mt-2">
          {users.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No one else is in the focus room yet.
            </p>
          ) : isExpanded ? (
            <div className="flex flex-col space-y-3 pt-2" >
              {users.map((user) => (
                <div key={user.id} className="flex items-center">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-semibold mr-3 border-2 border-white/30">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{user.name}</h3>
                    <p className="text-sm text-gray-300">
                      {user.id === userId ? "You" : "Online"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center pt-2 pl-3">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  title={user.name}
                  className={`w-10 h-10 bg-blue-600 rounded-full relative flex items-center justify-center text-white font-semibold border-2 border-white/50 ${
                    index > 0 ? "-ml-2" : ""
                  }`}
                  style={{ zIndex: index }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main focus area */}
      <div className="w-11/12 mx-auto max-screen-2xl">
        <div className="flex flex-col items-center justify-center h-[80vh]">
        <div
            style={borderStyle}
            className="rounded-full p-2 flex items-center justify-center transition-all duration-500"
          >
            {/* Child div to create the inner circle and content area */}
            <div className="w-full h-full bg-slate-900 rounded-full flex flex-col items-center justify-center px-16 py-32 lg:px-12 lg:py-52">
              <div className="text-5xl lg:text-8xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
                {formatTime(displayTime)}
              </div>
              <div className="max-w-[200px] lg:max-w-sm mx-auto mt-4 w-fit">
              <p className="text-[10px] lg:text-sm text-gray-300 text-center text-wrap animate-pulse">
                {currentQuote ? currentQuote : "Stay focused and keep going!"}
              </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-4 mt-6 lg:mt-12">
              {!timerState.isActive ? (
                <button
                  onClick={()=> startTimer()}
                  className="px-8 py-3 bg-green-600/80 hover:bg-green-600 rounded-lg text-white font-semibold transition-colors duration-300"
                >
                  Start
                </button>
              ) : (
                <div className="flex items-center gap-x-3">
                  <button
                  onClick={()=> {
                    if (users.length < 1) {
                      resetTimer();
                    }else{
                      notify("warning", "You can't reset the timer when other people are in the room.");
                    }
                  }}
                  // disabled={users.length > 1}
                  className="px-8 py-3 bg-gray-500 rounded-lg text-white font-semibold transition-colors duration-300"
                >
                  Reset
                </button>
                <button
                  onClick={()=> {
                    if (users.length < 1) {
                      stopTimer();
                    }else{
                      notify("warning", "You can't reset the timer when other people are in the room.");
                    }
                  }}
                  // disabled={users.length > 1}
                  className="px-8 py-3 bg-red-600/80 hover:bg-red-600 rounded-lg text-white font-semibold transition-colors duration-300"
                >
                  Stop
                </button>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
