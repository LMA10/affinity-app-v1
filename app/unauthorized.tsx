"use client";

export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a1419] text-orange-500">
      <h1 className="text-6xl font-bold mb-4">Unauthorized</h1>
      <p className="text-2xl mb-8">You do not have permission to access this page.</p>
      <a href="/" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg text-lg font-semibold transition">Return Home</a>
    </div>
  );
} 