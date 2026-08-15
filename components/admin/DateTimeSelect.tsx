"use client";
import { CalendarDays, Clock3 } from "lucide-react";
import { useMemo, useState } from "react";
function initialParts(value: string) {
  const date = value ? new Date(value) : null;
  const valid = date && !Number.isNaN(date.getTime());
  return {
    day: valid ? date.getDate() : 1,
    month: valid ? date.getMonth() + 1 : new Date().getMonth() + 1,
    year: valid ? date.getFullYear() : new Date().getFullYear(),
    hour: valid ? date.getHours() : 0,
    minute: valid ? date.getMinutes() : 0,
  };
}
export function DateTimeSelect({
  label,
  name,
  value,
}: {
  label: string;
  name: string;
  value: string | null;
}) {
  const [parts, setParts] = useState(() => initialParts(value ?? ""));
  const days = new Date(parts.year, parts.month, 0).getDate();
  const encoded = useMemo(
    () =>
      `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(Math.min(parts.day, days)).padStart(2, "0")}T${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`,
    [parts, days],
  );
  const update = (key: keyof typeof parts, next: number) =>
    setParts((current) => ({ ...current, [key]: next }));
  return (
    <div className="sm:col-span-2">
      <span className="form-label flex items-center gap-2">
        <CalendarDays size={15} />
        {label}
      </span>
      <input name={name} type="hidden" value={encoded} />
      <div className="mt-2 grid grid-cols-[1fr_1.2fr_1.4fr_1fr_1fr] gap-2 rounded-lg border border-[#dfd1c4] bg-[#fdfbf7] p-2">
        <select
          aria-label="Ngày"
          className="h-10 rounded-md border border-[#e7dfd5] bg-white px-2 text-sm"
          onChange={(e) => update("day", Number(e.target.value))}
          value={Math.min(parts.day, days)}
        >
          {Array.from({ length: days }, (_, index) => (
            <option key={index + 1}>{index + 1}</option>
          ))}
        </select>
        <select
          aria-label="Tháng"
          className="h-10 rounded-md border border-[#e7dfd5] bg-white px-2 text-sm"
          onChange={(e) => update("month", Number(e.target.value))}
          value={parts.month}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              Tháng {index + 1}
            </option>
          ))}
        </select>
        <select
          aria-label="Năm"
          className="h-10 rounded-md border border-[#e7dfd5] bg-white px-2 text-sm"
          onChange={(e) => update("year", Number(e.target.value))}
          value={parts.year}
        >
          {Array.from({ length: 8 }, (_, index) => parts.year - 2 + index).map(
            (year) => (
              <option key={year}>{year}</option>
            ),
          )}
        </select>
        <label className="relative">
          <Clock3
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-[#8c6d53]"
            size={14}
          />
          <select
            aria-label="Giờ"
            className="h-10 w-full rounded-md border border-[#e7dfd5] bg-white pl-7 text-sm"
            onChange={(e) => update("hour", Number(e.target.value))}
            value={parts.hour}
          >
            {Array.from({ length: 24 }, (_, hour) => (
              <option key={hour} value={hour}>
                {String(hour).padStart(2, "0")}
              </option>
            ))}
          </select>
        </label>
        <select
          aria-label="Phút"
          className="h-10 rounded-md border border-[#e7dfd5] bg-white px-2 text-sm"
          onChange={(e) => update("minute", Number(e.target.value))}
          value={parts.minute}
        >
          {[0, 15, 30, 45].map((minute) => (
            <option key={minute} value={minute}>
              {String(minute).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
