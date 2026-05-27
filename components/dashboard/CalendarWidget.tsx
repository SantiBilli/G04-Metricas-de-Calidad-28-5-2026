export default function CalendarWidget() {
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const days = [
    { day: 31, isCurrentMonth: false },
    ...Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: true,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      day: i + 1,
      isCurrentMonth: false,
    })),
  ];

  return (
    <div className="bg-black rounded-[12px] p-6 border border-[#1a1a1a] w-full max-w-[380px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Apr 2024</h2>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-[6px] bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-all">
            <span className="material-symbols-outlined text-[#a0a0a0] text-[18px]">
              sync
            </span>
          </button>
          <button className="px-3 h-8 rounded-[6px] bg-[#2a2a2a] text-[#a0a0a0] text-sm font-medium hover:bg-[#3a3a3a] transition-all">
            Today
          </button>
          <button className="w-8 h-8 rounded-[6px] bg-[#2a2a2a] flex items-center justify-center hover:bg-[#3a3a3a] transition-all">
            <span className="material-symbols-outlined text-[#a0a0a0] text-[18px]">
              settings
            </span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 text-sm font-medium">
        <button className="text-[var(--color-neutral-a60)] hover:text-white transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">
            arrow_back
          </span>{" "}
          Mar
        </button>
        <button className="text-[var(--color-neutral-a60)] hover:text-white transition-colors flex items-center gap-1">
          May{" "}
          <span className="material-symbols-outlined text-[16px]">
            arrow_forward
          </span>
        </button>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="text-center text-[11px] font-bold text-[var(--color-neutral-a60)]"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-3 gap-x-2">
        {days.map((item, index) => {
          const isSelected = item.day === 24 && item.isCurrentMonth;
          return (
            <div key={index} className="flex justify-center">
              <button
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-[#1e5a9c] text-white"
                    : item.isCurrentMonth
                      ? "text-white hover:bg-[#333] bg-[#222]"
                      : "text-[#555] hover:bg-[#333] bg-[#222]"
                }`}
              >
                {item.day}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
