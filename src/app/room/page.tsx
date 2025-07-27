import { Suspense } from 'react';
import FocusRoomContent from './FocusRoomContent';

// A fallback component to show while the main component is loading
function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="text-xl font-semibold">Loading Focus Room...</div>
    </div>
  );
}

export default function RoomPage() {
  return (
    <Suspense fallback={<Loading />}>
      <FocusRoomContent />
    </Suspense>
  );
}