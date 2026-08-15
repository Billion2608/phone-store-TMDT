"use client";
export function AskAdvisorButton() {
  return (
    <button
      className="rounded-sm bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
      onClick={() => window.dispatchEvent(new Event("open-phone-advisor"))}
    >
      Hỏi trợ lý
    </button>
  );
}
