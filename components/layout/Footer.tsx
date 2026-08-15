import { Mail, MapPin, Phone, Smartphone } from "lucide-react";
import Link from "next/link";
const columns = [
  { title: "THÔNG TIN", links: ["Giới thiệu", "Tin tức", "Tuyển dụng"] },
  {
    title: "CHÍNH SÁCH",
    links: [
      "Chính sách bảo hành",
      "Chính sách đổi trả",
      "Chính sách vận chuyển",
    ],
  },
  { title: "HỖ TRỢ", links: ["Hướng dẫn mua hàng", "Thanh toán", "Liên hệ"] },
];
export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-100 text-gray-600">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link
            className="flex items-center gap-2 text-xl font-black text-gray-900"
            href="/"
          >
            <span className="grid size-9 place-items-center rounded-md bg-blue-600 text-white">
              <Smartphone size={20} />
            </span>
            PhoneStore
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6">
            Điện thoại và phụ kiện chính hãng, giá minh bạch, tư vấn đúng nhu
            cầu và giao hàng toàn quốc.
          </p>
          <p className="mt-4 text-sm font-bold text-blue-600">
            Hotline: 1900 1234
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="border-b border-gray-300 pb-2 text-sm font-bold text-gray-900">
              {column.title}
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {column.links.map((label) => (
                <li key={label}>
                  <Link className="hover:text-blue-600" href="#">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-2 px-4 py-3 text-xs">
          <span>© 2026 PhoneStore. All rights reserved.</span>
          <span className="flex gap-4">
            <span className="flex gap-1">
              <Phone size={13} />
              1900 1234
            </span>
            <span className="flex gap-1">
              <Mail size={13} />
              support@phonestore.vn
            </span>
            <span className="hidden gap-1 md:flex">
              <MapPin size={13} />
              TP. Hồ Chí Minh
            </span>
          </span>
        </div>
      </div>
    </footer>
  );
}
