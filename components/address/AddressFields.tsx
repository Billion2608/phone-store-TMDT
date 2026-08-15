"use client";

import { useEffect, useState } from "react";

type Location = { code: number; name: string };
type Address = {
  province: string;
  district: string;
  ward: string;
  address: string;
};

function SearchableLocation({
  label,
  options,
  value,
  disabled,
  onSelect,
}: {
  label: string;
  options: Location[];
  value: string;
  disabled?: boolean;
  onSelect: (item: Location) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const normalizedQuery = query.trim().toLocaleLowerCase("vi");
  const filteredOptions = options.filter((item) =>
    item.name.toLocaleLowerCase("vi").includes(normalizedQuery),
  );

  function choose(input: string) {
    setQuery(input);
    const selected = options.find(
      (item) =>
        item.name.toLocaleLowerCase("vi") ===
        input.trim().toLocaleLowerCase("vi"),
    );
    if (selected) onSelect(selected);
  }

  return (
    <div
      className="form-label relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          if (!options.some((item) => item.name === query)) setQuery(value);
        }
      }}
    >
      <span>{label}</span>
      <input
        autoComplete="off"
        className="form-control"
        disabled={disabled}
        onChange={(event) => {
          choose(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={`Tìm và chọn ${label.toLocaleLowerCase("vi")}`}
        required
        value={query}
      />
      {open && !disabled ? (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] max-h-72 overflow-y-auto rounded-md border border-[#d9cabc] bg-white py-1 shadow-lg">
          {filteredOptions.length ? (
            filteredOptions.map((item) => (
              <button
                className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-[#f5f2eb] ${item.name === value ? "bg-[#f5f2eb] font-bold text-[#6f523e]" : "text-[#2c221e]"}`}
                key={item.code}
                onClick={() => {
                  setQuery(item.name);
                  onSelect(item);
                  setOpen(false);
                }}
                type="button"
              >
                {item.name}
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm font-normal text-[#7d7068]">
              Không tìm thấy địa phương phù hợp.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}

async function loadLocations(
  type: "provinces" | "districts" | "wards",
  code?: number,
) {
  const query = new URLSearchParams({ type });
  if (code) query.set("code", String(code));
  const response = await fetch(`/api/locations?${query}`);
  const result = await response.json();
  if (!response.ok) throw new Error(result.message);
  return result.data as Location[];
}

export function AddressFields({ initial }: { initial: Address }) {
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [province, setProvince] = useState(initial.province);
  const [district, setDistrict] = useState(initial.district);
  const [ward, setWard] = useState(initial.ward);

  useEffect(() => {
    void loadLocations("provinces")
      .then(async (provinceRows) => {
        setProvinces(provinceRows);
        const provinceCode = provinceRows.find(
          (item) => item.name === initial.province,
        )?.code;
        if (!provinceCode) return;
        const districtRows = await loadLocations("districts", provinceCode);
        setDistricts(districtRows);
        const districtCode = districtRows.find(
          (item) => item.name === initial.district,
        )?.code;
        if (districtCode) setWards(await loadLocations("wards", districtCode));
      })
      .catch(() => setProvinces([]));
  }, [initial.district, initial.province]);

  async function chooseProvince(code: number) {
    const selected = provinces.find((item) => item.code === code);
    setProvince(selected?.name ?? "");
    setDistrict("");
    setWard("");
    setWards([]);
    setDistricts(code ? await loadLocations("districts", code) : []);
  }

  async function chooseDistrict(code: number) {
    const selected = districts.find((item) => item.code === code);
    setDistrict(selected?.name ?? "");
    setWard("");
    setWards(code ? await loadLocations("wards", code) : []);
  }

  return (
    <div className="grid gap-4 sm:col-span-2 sm:grid-cols-3">
      <SearchableLocation
        key={`province-${province}`}
        label="Tỉnh / Thành phố"
        onSelect={(item) => void chooseProvince(item.code)}
        options={provinces}
        value={province}
      />
      <SearchableLocation
        key={`district-${district}`}
        disabled={!districts.length}
        label="Quận / Huyện"
        onSelect={(item) => void chooseDistrict(item.code)}
        options={districts}
        value={district}
      />
      <SearchableLocation
        key={`ward-${ward}`}
        disabled={!wards.length}
        label="Phường / Xã"
        onSelect={(item) => setWard(item.name)}
        options={wards}
        value={ward}
      />
      <input name="province" type="hidden" value={province} />
      <input name="district" type="hidden" value={district} />
      <input name="ward" type="hidden" value={ward} />
      <label className="form-label sm:col-span-3">
        Số nhà, tên đường
        <input
          autoComplete="off"
          className="form-control"
          defaultValue={initial.address}
          name="address"
          required
        />
      </label>
    </div>
  );
}
