"use client";

import { useEffect, useRef, useState } from "react";

const MAX_COINS = 200;
const COINS_STORAGE_KEY = "peeboard-coins";
const MONTH_STORAGE_KEY = "peeboard-month";
const SOUND_STORAGE_KEY = "peeboard-sound-enabled";
const SHARE_URL = "https://peeboard.github.io";
const DOT_STEP = 10;
const DOT_STOPS = Array.from(
  { length: MAX_COINS / DOT_STEP },
  (_, index) => ({
    coins: (index + 1) * DOT_STEP,
    position: 0.05 + index * (0.9 / (MAX_COINS / DOT_STEP - 1)),
  }),
);

const EARN_TIP_ITEMS = [
  {
    title: "Xem Livestream",
    description: "Mở các livestream để xem và nhận xu sau mỗi 5 đến 10 phút, chỉ nên nhận nếu có từ 400 xu trở lên. Tối đa 200 lượt mỗi tháng, có thể kiếm từ 30.000 - 200.000 mỗi tháng.",
    rewards: ["100", "5.000"],
    note: "Dễ, tốn thời gian nhiều, kiếm được nhiều xu. Nên tận dụng tính năng PiP (Picture in Picture) để vừa xem vừa làm việc khác",
  },
  {
    title: "Hoàn Xu Ngày Hội Thành Viên",
    description: "Hoàn thành đơn hàng vào ngày hội thành viên để nhận xu hoàn theo hạng thành viên. Bạc 3%, Vàng 4%, Kim Cương 5%.",
    rewards: ["100", "800.000"],
    note: "Khó, phải mua đơn từ 400K, xu hoàn % theo hạng.",
  },
  {
    title: "Hoàn Xu Đơn Thời Trang",
    description: "Mua đơn hàng thời trang để được hoàn 10%, tối đa 100K xu 1 đơn. 500K xu mỗi ngày. Bắt buộc có Shopee VIP mới được tham gia",
    rewards: ["100", "500.000"],
    note: "Khó, phải mua đơn thuộc Thời Trang, xu hoàn % cao.",
  },
  {
    title: "Quay Vòng Quay Livestream",
    description: "Mở các livestream để xem và quay vòng quay. Tối đa 10 lượt mỗi ngày. Nên quay vòng nào có xu lớn để khó hụt.",
    rewards: ["100", "∞"],
    note: "Trung bình, xu thưởng từ 100 - 300, tốn thời gian chờ, dễ bị hụt do số người đông",
  },
  {
    title: "Điểm Danh Shopee & Shopee Pay",
    description: "Mỗi ngày vào Shopee và Shopee Pay điểm danh để nhận xu.",
    rewards: ["100", "300"],
    note: "Dễ, nhanh, ít xu",
  },
  {
    title: "Trồng Cây",
    description: "Mỗi ngày vào trồng cây, tưới nước, chéo ở các nhóm, làm nhiệm vụ trong nông trại để cây mau chín.",
    rewards: ["100", "1000"],
    note: "Dễ, nhanh, ít xu",
  },
  {
    title: "Nhiệm Vụ Hàng Ngày",
    description: "Mỗi ngày vào Shopee sau khi điểm danh sẽ làm các nhiệm vụ: Ghé Nông Trại, Xem Tạp Hoá. Nhiệm vụ 1 Click Nhận Xu mở 3 hộp quà bên dưới.",
    rewards: ["100", "500"],
    note: "Dễ, nhanh, ít xu",
  },
  {
    title: "Lắc Siêu Xu",
    description: "Xem livestream và canh các mốc giờ được báo trước để lắc siêu xu",
    rewards: ["0", "1200"],
    note: "Dễ, cần canh đúng khung giờ, xu trung bình. Có khả năng lắc hụt không có xu.",
  },
  {
    title: "Điểm Danh Nông Trại Tuần",
    description: "Tại trang chủ lướt tìm mục Xem Thêm, kéo xuống phần Ưu Đãi → Săn Ngay 100.000 xu → Kéo xuống mục Chơi 7 ngày liên tục nhận 300 xu. Bấm Thực Hiện để mở Nông Trại, tưới nước bằng bình dưới góc phải (bắt buộc) rồi trở lại. Bấm Thực Hiện một lần nữa vào Nông Trại rồi trở lại khi nào thấy số tăng lên mới điểm danh xong nhé, liên tục 7 ngày, hụt 1 ngày coi như mất.",
    rewards: ["300"],
    note: "Trung bình, hơi rườm rà, ít xu, dễ hụt",
  },
  {
    title: "Tham Gia Game",
    description: "Tại trang chủ lướt tìm mục Xem Thêm, kéo xuống phần Ưu Đãi → Săn Ngay 100.000 xu → Kéo xuống phần Nhiệm Vụ Mỗi Ngày và thực hiện chơi các game. Chỉ cần vào game là xong.",
    rewards: ["100"],
    note: "Dễ, tốn thời gian, ít xu",
  },
  {
    title: "Máy Gắp Thú",
    description: "Gắp thú theo đúng vật phẩm vào mỗi sự kiện để nhận xu",
    rewards: ["100"],
    note: "Trung bình, hơi rườm rà, hên xui, ít xu",
  },
  {
    title: "Hộp Quà Khách Hàng Thân Thiết",
    description: "Tại trang chủ lướt tìm mục Khách Hàng Thân Thiết → Trò Chơi Săn Xu (Dưới Banner) → Bấm Mở Quà. May mắn thì được 300 xu hoặc xui thì hộp rỗng.",
    rewards: ["0", "300"],
    note: "Dễ, nhanh, hên xui, ít xu",
  },
  {
    title: "Tham Gia Các Game Khác",
    description: "Tham gia các game: Nối Hình, Kéo Thả, Bắn Bóng, Thú Cưng, Đập Kẹo, Xếp Gạch",
    rewards: [],
    note: "Khó, rườm rà, hên xui, xu thưởng tuỳ thời điểm",
  },
  {
    title: "Nhiệm Vụ Shopee Pay",
    description: "Vào mục Nhận thường mỗi ngày của app Shopee Pay có các nhiệm vụ như thanh toán hoá đơn, hoàn tất giao dịch, mua thẻ điện thoại, vé xem phim ...",
    rewards: ["5000", "20000"],
    note: "Khó, nhiệm vụ đa dạng và yêu cầu thanh toán đặc thù, xu nhiều",
  },
  {
    title: "Theo Dõi Shop",
    description: "Tại mục 1 Click Nhận Quà Ngay. Lướt xuống tìm mục Thử Thách Shopee",
    rewards: ["200", "5000"],
    note: "Khó nếu đã từng huỷ theo dõi các shop sau khi nhận xu dễ bị lọc nhiệm vụ này. Rất dễ nếu không bị lọc, chỉ cần theo dõi là lấy xu.",
  },
  {
    title: "Đánh Giá Sản Phẩm",
    description: "Vào mục đánh giá cho sản phẩm bạn đã mua, quay video theo yêu cầu, quay 1 video, chụp 1 ảnh, đánh giá 50 từ. Nhận trước 200 xu và 400 - 1000 xu nếu video theo yêu cầu được duyệt",
    rewards: ["200", "1200"],
    note: "Trung bình, yêu cầu video mẫu phải chính xác và rõ ràng để nhận thưởng thêm.",
  },
  {
    title: "Chọn Số Trúng Xu",
    description: "Chọn một số hoặc random số may mắn. Có thể mời thêm bạn để tăng tỉ lệ chắc chắn vào một số.",
    rewards: [],
    note: "Dễ, hên xui, chia kho xu trung bình",
  },
];

type LivestreamEvent = {
  image: string;
  title: string;
  kols: string[];
  dateTime: string;
  sortTime: string;
  specialTime?: string;
  specialRewards?: string[];
  rewards: string[];
};

const LIVESTREAM_EVENTS: LivestreamEvent[] = [
  {
    image: "/tuan-duong.jpg",
    title: "SĂN DEAL SIÊU TỐC - GIÁ RẺ CỰC SỐC",
    kols: ["Tuấn Dương"],
    dateTime: "12h 1/9/26",
    sortTime: "2026-09-01T12:00:00",
    rewards: ["400", "800"],
  },
  {
    image: "/vo-tan-phat.jpg",
    title: "NGHỀ SIÊU DỄ - DEAL SIÊU HỜI",
    kols: ["Võ Tấn Phát", "Sĩ Thanh", "Tâm An"],
    dateTime: "0h 1/9/26",
    sortTime: "2026-09-01T00:00:00",
    rewards: ["400", "800"],
  },
  // {
  //   image: "/diep-le.jpeg",
  //   title: "9.9 - NGÀY SIÊU MUA SẮM",
  //   kols: ["Diệp Lê"],
  //   dateTime: "11h 8/9/26",
  //   sortTime: "2026-09-08T11:00:00",
  //   rewards: ["400", "800"],
  //   specialTime: "23h30 - 0h30 9/9/26",
  //   specialRewards: ["1000", "5000"],
  // },
];

const SORTED_LIVESTREAM_EVENTS = LIVESTREAM_EVENTS
  .map((event, index) => ({ event, index }))
  .sort((a, b) => a.event.sortTime.localeCompare(b.event.sortTime) || a.index - b.index)
  .map(({ event }) => event);

const DIFFICULTY_ORDER: Record<string, number> = {
  Dễ: 0,
  "Trung bình": 1,
  Khó: 2,
};

const PRIORITY_TIP_TITLES = [
  "Xem Livestream",
  "Điểm Danh Shopee & Shopee Pay",
  "Nhiệm Vụ Hàng Ngày",
  "Trồng Cây",
  "Hộp Quà Khách Hàng Thân Thiết",
  "Chọn Số Trúng Xu",
];

const EARN_TIPS = EARN_TIP_ITEMS
  .map((item, index) => ({ item, index }))
  .sort((a, b) => {
    const priorityA = PRIORITY_TIP_TITLES.indexOf(a.item.title);
    const priorityB = PRIORITY_TIP_TITLES.indexOf(b.item.title);
    const isPriorityA = priorityA !== -1;
    const isPriorityB = priorityB !== -1;

    if (isPriorityA || isPriorityB) {
      if (isPriorityA && isPriorityB) return priorityA - priorityB;
      return isPriorityA ? -1 : 1;
    }

    const difficultyA = DIFFICULTY_ORDER[a.item.note.split(",")[0]] ?? 99;
    const difficultyB = DIFFICULTY_ORDER[b.item.note.split(",")[0]] ?? 99;
    return difficultyA - difficultyB || a.index - b.index;
  })
  .map(({ item }) => item);

function formatReward(value: string) {
  return /^\d+$/.test(value) ? new Intl.NumberFormat("vi-VN").format(Number(value)) : value;
}

function TipIcon({ title }: { title: string }) {
  const iconProps = {
    className: "tip-title-icon",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (title) {
    case "Xem Livestream":
      return (
        <svg {...iconProps}>
          <path d="M15.033 9.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56V7.648a.645.645 0 0 1 .967-.56z" />
          <path d="M7 21h10" />
          <rect width="20" height="14" x="2" y="3" rx="2" />
        </svg>
      );
    case "Điểm Danh Shopee & Shopee Pay":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "Trồng Cây":
      return (
        <svg {...iconProps}>
          <path d="M8 19a4 4 0 0 1-2.24-7.32A3.5 3.5 0 0 1 9 6.03V6a3 3 0 1 1 6 0v.04a3.5 3.5 0 0 1 3.24 5.65A4 4 0 0 1 16 19Z" />
          <path d="M12 19v3" />
        </svg>
      );
    case "Nhiệm Vụ Hàng Ngày":
    case "Hộp Quà Khách Hàng Thân Thiết":
      return (
        <svg {...iconProps}>
          <path d="M12 7v14" />
          <path d="M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
          <path d="M7.5 7a1 1 0 0 1 0-5A4.8 8 0 0 1 12 7a4.8 8 0 0 1 4.5-5 1 1 0 0 1 0 5" />
          <rect x="3" y="7" width="18" height="4" rx="1" />
        </svg>
      );
    case "Lắc Siêu Xu":
      return (
        <svg {...iconProps}>
          <path d="m2 8 2 2-2 2 2 2-2 2" />
          <path d="m22 8-2 2 2 2-2 2 2 2" />
          <rect width="8" height="14" x="8" y="5" rx="1" />
        </svg>
      );
    case "Tham Gia Game":
      return (
        <svg {...iconProps}>
          <line x1="6" x2="10" y1="11" y2="11" />
          <line x1="8" x2="8" y1="9" y2="13" />
          <line x1="15" x2="15.01" y1="12" y2="12" />
          <line x1="18" x2="18.01" y1="10" y2="10" />
          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
        </svg>
      );
    case "Chọn Số Trúng Xu":
      return (
        <svg {...iconProps}>
          <path d="M4 12V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2" />
          <path d="M14 2v5a1 1 0 0 0 1 1h5" />
          <path d="M10 16h2v6" />
          <path d="M10 22h4" />
          <rect x="2" y="16" width="4" height="6" rx="2" />
        </svg>
      );
    case "Quay Vòng Quay Livestream":
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "Điểm Danh Nông Trại Tuần":
      return (
        <svg {...iconProps}>
          <path d="M14 21v-3a2 2 0 0 0-4 0v3" />
          <path d="M18 12h.01" />
          <path d="M18 16h.01" />
          <path d="M22 7a1 1 0 0 0-1-1h-2a2 2 0 0 1-1.143-.359L13.143 2.36a2 2 0 0 0-2.286-.001L6.143 5.64A2 2 0 0 1 5 6H3a1 1 0 0 0-1 1v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2z" />
          <path d="M6 12h.01" />
          <path d="M6 16h.01" />
          <circle cx="12" cy="10" r="2" />
        </svg>
      );
    case "Máy Gắp Thú":
      return (
        <svg {...iconProps}>
          <path d="M21 17a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2Z" />
          <path d="M6 15v-2" />
          <path d="M12 15V9" />
          <circle cx="12" cy="6" r="3" />
        </svg>
      );
    case "Đánh Giá Sản Phẩm":
      return (
        <svg {...iconProps}>
          <path d="m19.06 12.501 2.78-2.707a.53.53 0 0 0-.294-.905l-5.166-.755a2.1 2.1 0 0 1-1.595-1.16l-2.31-4.68a.53.53 0 0 0-.95.001L9.216 6.974a2.1 2.1 0 0 1-1.597 1.16l-5.165.755a.53.53 0 0 0-.294.906l3.736 3.637a2.1 2.1 0 0 1 .611 1.879l-.88 5.139a.53.53 0 0 0 .769.56l4.617-2.428.027-.014" />
          <path d="m15 18 2 2 4-4" />
        </svg>
      );
    case "Hoàn Xu Ngày Hội Thành Viên":
    case "Hoàn Xu Đơn Thời Trang":
      return (
        <svg {...iconProps}>
          <path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17" />
          <path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
          <path d="m2 16 6 6" />
          <circle cx="16" cy="9" r="2.9" />
          <circle cx="6" cy="5" r="3" />
        </svg>
      );
    case "Tham Gia Các Game Khác":
      return (
        <svg {...iconProps}>
          <line x1="6" x2="10" y1="12" y2="12" />
          <line x1="8" x2="8" y1="10" y2="14" />
          <line x1="15" x2="15.01" y1="13" y2="13" />
          <line x1="18" x2="18.01" y1="11" y2="11" />
          <rect width="20" height="12" x="2" y="6" rx="2" />
        </svg>
      );
    case "Nhiệm Vụ Shopee Pay":
      return (
        <svg {...iconProps}>
          <path d="M13 16H8" />
          <path d="M14 8H8" />
          <path d="M16 12H8" />
          <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1 1 0 0 1 20 3v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
        </svg>
      );
    case "Theo Dõi Shop":
      return (
        <svg {...iconProps}>
          <path d="M2 21a8 8 0 0 1 13.292-6" />
          <circle cx="10" cy="8" r="5" />
          <path d="m16 19 2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(monthOffset = 0) {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + monthOffset);
  return `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
}

function AnimatedDigit({ value }: { value: string }) {
  const currentRef = useRef(value);
  const animationIdRef = useRef(0);
  const [current, setCurrent] = useState(value);
  const [outgoing, setOutgoing] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [animationId, setAnimationId] = useState(0);

  useEffect(() => {
    if (value === currentRef.current) return;

    const previous = currentRef.current;
    currentRef.current = value;
    animationIdRef.current += 1;
    setOutgoing(previous);
    setCurrent(value);
    setIsChanging(true);
    setAnimationId(animationIdRef.current);

    const timer = window.setTimeout(() => {
      setOutgoing(null);
      setIsChanging(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [value]);

  return (
    <span className="count-digit" aria-hidden="true">
      {outgoing !== null && (
        <span key={`old-${animationId}`} className="digit-old">
          {outgoing}
        </span>
      )}
      <span
        key={`new-${animationId}`}
        className={isChanging ? "digit-new is-changing" : "digit-new"}
      >
        {current}
      </span>
    </span>
  );
}

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function getEventEndTime(sortTime: string) {
  const end = new Date(sortTime);
  end.setDate(end.getDate() + 1);
  end.setHours(2, 0, 0, 0);
  return end.getTime();
}

function MicSignalIcon() {
  return (
    <svg
      className="event-live-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 17v4" />
      <path d="M18 11a6 6 0 0 0-3-5.197" />
      <path d="M2 11a10 10 0 0 1 5-8.662" />
      <path d="M22 11a10 10 0 0 0-5-8.662" />
      <path d="M6 11a6 6 0 0 1 3-5.197" />
      <path d="M9 21h6" />
      <rect x="10" y="9" width="4" height="8" rx="2" />
    </svg>
  );
}

function ClockFadingIcon() {
  return (
    <svg
      className="event-special-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 0 1 7.38 16.75" />
      <path d="M12 6v6l4 2" />
      <path d="M2.5 8.875a10 10 0 0 0-.5 3" />
      <path d="M2.83 16a10 10 0 0 0 2.43 3.4" />
      <path d="M4.636 5.235a10 10 0 0 1 .891-.857" />
      <path d="M8.644 21.42a10 10 0 0 0 7.631-.38" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg
      className="event-special-title-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg
      className="event-countdown-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2v13" />
      <path d="m16 6-4-4-4 4" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    </svg>
  );
}

function VolumeOnIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
      <path d="M16 9a5 5 0 0 1 0 6" />
      <path d="M19.364 18.364a9 9 0 0 0 0-12.728" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 9a5 5 0 0 1 .95 2.293" />
      <path d="M19.364 5.636a9 9 0 0 1 1.889 9.96" />
      <path d="m2 2 20 20" />
      <path d="m7 7-.587.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705 0.705 0 0 0 11 19.298V11" />
      <path d="M9.828 4.172A.686 0.686 0 0 1 11 4.657v.686" />
    </svg>
  );
}

function EventTime({ dateTime, sortTime, now }: { dateTime: string; sortTime: string; now: number | null }) {
  const targetTime = new Date(sortTime).getTime();
  const eventEndTime = getEventEndTime(sortTime);
  const isLive = now !== null && now >= targetTime && now < eventEndTime;
  const remainingSeconds = now === null
    ? null
    : Math.max(0, Math.ceil((targetTime - now) / 1000));

  if (isLive) {
    return (
      <span className="event-time event-time-live" aria-live="polite" aria-label="Đang Live">
        <MicSignalIcon />
        <span>Đang Live</span>
      </span>
    );
  }

  const countdown = remainingSeconds !== null && remainingSeconds < 24 * 60 * 60
    ? formatCountdown(remainingSeconds)
    : null;

  return (
    <span className="event-time" aria-live="polite">
      {countdown !== null && <TimerIcon />}
      <span>{countdown ?? dateTime}</span>
    </span>
  );
}

function LivestreamSchedule() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());
    updateNow();
    const timer = window.setInterval(updateNow, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="event-list">
      {SORTED_LIVESTREAM_EVENTS
        .filter((event) => now === null || now < getEventEndTime(event.sortTime))
        .map((event, eventIndex) => (
          <article className="event-item" key={`${event.dateTime}-${event.title}-${eventIndex}`}>
            <div className="event-main">
              <img className="event-image" src={event.image} alt={`Ảnh sự kiện ${event.title}`} />
              <div className="event-copy">
                <div className="event-heading">
                  <h4>{event.title}</h4>
                  <div className="event-kols" aria-label={`KOL: ${event.kols.join(", ")}`}>
                    {event.kols.map((kol) => (
                      <span key={kol}>{kol}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="event-details">
              <span className="event-reward" aria-label={`${event.rewards.join(" đến ")} xu`}>
                <img src="/logo.svg?v=4" alt="" draggable={false} />
                <span>{formatReward(event.rewards[0])}</span>
                <span aria-hidden="true">–</span>
                <span>{formatReward(event.rewards[1])}</span>
              </span>
              <EventTime dateTime={event.dateTime} sortTime={event.sortTime} now={now} />
            </div>
            {event.specialTime && (
              <div className="event-special-section">
                <h5>
                  <ZapIcon />
                  <span>Khung Giờ Đặc Biệt Có Xu Lớn</span>
                </h5>
                <div className="event-special-details">
                  <span className="event-special-reward" aria-label={`${(event.specialRewards ?? event.rewards).join(" đến ")} xu`}>
                    <img src="/logo.svg?v=4" alt="" draggable={false} />
                    <span>{formatReward((event.specialRewards ?? event.rewards)[0])}</span>
                    <span aria-hidden="true">–</span>
                    <span>{formatReward((event.specialRewards ?? event.rewards)[1])}</span>
                  </span>
                  <span className="event-special-time" aria-label={event.specialTime}>
                    <ClockFadingIcon />
                    <span>{event.specialTime}</span>
                  </span>
                </div>
              </div>
            )}
          </article>
        ))}
    </div>
  );
}

export default function Home() {
  const [coins, setCoins] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSheetClosing, setIsSheetClosing] = useState(false);
  const [sheetTitle, setSheetTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isFeedbackClosing, setIsFeedbackClosing] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [storageReady, setStorageReady] = useState(false);
  const upAudioPoolRef = useRef<HTMLAudioElement[]>([]);
  const downAudioPoolRef = useRef<HTMLAudioElement[]>([]);
  const upAudioIndexRef = useRef(0);
  const downAudioIndexRef = useRef(0);
  const shareFeedbackTimerRef = useRef<number | null>(null);
  const shareFeedbackExitTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const currentMonth = getCurrentMonthKey();
    const savedMonth = window.localStorage.getItem(MONTH_STORAGE_KEY);
    const savedCoins = Number(window.localStorage.getItem(COINS_STORAGE_KEY));

    if (savedMonth !== currentMonth) {
      window.localStorage.setItem(MONTH_STORAGE_KEY, currentMonth);
      window.localStorage.setItem(COINS_STORAGE_KEY, "0");
      setCoins(0);
    } else if (Number.isFinite(savedCoins)) {
      setCoins(Math.min(MAX_COINS, Math.max(0, savedCoins)));
    }

    setStorageReady(true);
  }, []);

  useEffect(() => {
    const savedSoundPreference = window.localStorage.getItem(SOUND_STORAGE_KEY);
    setIsSoundEnabled(savedSoundPreference !== "false");
  }, []);

  useEffect(() => {
    return () => {
      if (shareFeedbackTimerRef.current !== null) {
        window.clearTimeout(shareFeedbackTimerRef.current);
      }
      if (shareFeedbackExitTimerRef.current !== null) {
        window.clearTimeout(shareFeedbackExitTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const preventSafariZoom = (event: Event) => event.preventDefault();
    const gestureOptions = { passive: false } as AddEventListenerOptions;

    document.addEventListener("gesturestart", preventSafariZoom, gestureOptions);
    document.addEventListener("gesturechange", preventSafariZoom, gestureOptions);
    document.addEventListener("gestureend", preventSafariZoom, gestureOptions);
    document.addEventListener("dblclick", preventSafariZoom, gestureOptions);

    return () => {
      document.removeEventListener("gesturestart", preventSafariZoom, gestureOptions);
      document.removeEventListener("gesturechange", preventSafariZoom, gestureOptions);
      document.removeEventListener("gestureend", preventSafariZoom, gestureOptions);
      document.removeEventListener("dblclick", preventSafariZoom, gestureOptions);
    };
  }, []);

  useEffect(() => {
    if (!storageReady) return;

    window.localStorage.setItem(COINS_STORAGE_KEY, String(coins));
    window.localStorage.setItem(MONTH_STORAGE_KEY, getCurrentMonthKey());
  }, [coins, storageReady]);

  useEffect(() => {
    const createAudioPool = (src: string, size: number) =>
      Array.from({ length: size }, () => {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.load();
        return audio;
      });

    upAudioPoolRef.current = createAudioPool("/up-coin.mp3", 6);
    downAudioPoolRef.current = createAudioPool("/down-coin.mp3", 6);

    return () => {
      [...upAudioPoolRef.current, ...downAudioPoolRef.current].forEach((audio) => {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
      });
    };
  }, []);

  const progress = Math.min(coins / MAX_COINS, 1);
  const remaining = MAX_COINS - coins;
  const nextMonthLabel = getMonthLabel(1);
  const fillOffset = 48 - progress * 56;
  const markerOffset = 28 - progress * 56;
  const fillWidth = `calc(${progress * 100}% ${fillOffset >= 0 ? "+" : "-"} ${Math.abs(fillOffset)}px)`;
  const markerPosition = `calc(${progress * 100}% ${markerOffset >= 0 ? "+" : "-"} ${Math.abs(markerOffset)}px)`;

  function playCoinSound(
    poolRef: { current: HTMLAudioElement[] },
    indexRef: { current: number },
    src: string,
  ) {
    if (!isSoundEnabled) return;

    if (poolRef.current.length === 0) {
      const audio = new Audio(src);
      audio.preload = "auto";
      poolRef.current = [audio];
    }

    const audio = poolRef.current[indexRef.current % poolRef.current.length];
    indexRef.current += 1;
    audio.pause();
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }

  function addCoin() {
    if (coins >= MAX_COINS) return;
    playCoinSound(upAudioPoolRef, upAudioIndexRef, "/up-coin.mp3");
    setCoins((current) => Math.min(MAX_COINS, current + 1));
  }

  function removeCoin() {
    if (coins <= 0) return;
    playCoinSound(downAudioPoolRef, downAudioIndexRef, "/down-coin.mp3");
    setCoins((current) => Math.max(0, current - 1));
  }

  function toggleSound() {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(next));
    showFeedback(`Âm Thanh : ${next ? "Bật" : "Tắt"}`);
  }

  function showFeedback(message: string) {
    if (shareFeedbackTimerRef.current !== null) {
      window.clearTimeout(shareFeedbackTimerRef.current);
    }
    if (shareFeedbackExitTimerRef.current !== null) {
      window.clearTimeout(shareFeedbackExitTimerRef.current);
    }

    setIsFeedbackClosing(false);
    setFeedbackMessage(null);
    window.requestAnimationFrame(() => setFeedbackMessage(message));
    shareFeedbackTimerRef.current = window.setTimeout(() => {
      shareFeedbackTimerRef.current = null;
      setIsFeedbackClosing(true);
      shareFeedbackExitTimerRef.current = window.setTimeout(() => {
        setFeedbackMessage(null);
        setIsFeedbackClosing(false);
        shareFeedbackExitTimerRef.current = null;
      }, 220);
    }, 2200);
  }

  function openSheet(title: string) {
    setSheetTitle(title);
    setIsSheetClosing(false);
    setIsSheetOpen(true);
  }

  function closeSheet() {
    setIsSheetClosing(true);
    window.setTimeout(() => {
      setIsSheetOpen(false);
      setIsSheetClosing(false);
    }, 220);
  }

  async function sharePeeBoard() {
    const shareData = {
      title: "PeeBoard",
      text: "PeeBoard",
      url: SHARE_URL,
    };

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
      await navigator.clipboard.writeText(SHARE_URL);
      showFeedback("Đã Sao Chép");
      return;
    } catch {
      // Safari on a non-HTTPS local address may not expose Clipboard API.
    }

    try {
      const copyField = document.createElement("textarea");
      copyField.value = SHARE_URL;
      copyField.setAttribute("readonly", "true");
      copyField.style.position = "fixed";
      copyField.style.opacity = "0";
      document.body.appendChild(copyField);
      copyField.focus();
      copyField.select();
      const copied = document.execCommand("copy");
      copyField.remove();

      if (copied) {
        showFeedback("Đã Sao Chép");
        return;
      }
    } catch {
      // Fall through to the manual copy prompt below.
    }

    window.prompt("Sao chép liên kết PeeBoard:", SHARE_URL);
  }

  return (
    <main className="app-shell">
      <div className="glow glow-one" />
      <div className="glow glow-two" />

      <section className="hero" aria-label="Bảng tiến độ nhận xu">
        <div className="topbar">
          <button
            className="topbar-icon share-action"
            type="button"
            aria-label="Chia sẻ PeeBoard"
            onClick={sharePeeBoard}
          >
            <ShareIcon />
          </button>
          <div className="brand-mark" aria-label="PeeBoard">
            <span>PeeB</span>
            <img src="/logo.svg?v=4" alt="" draggable={false} />
            <span>ard</span>
          </div>
          <button
            className="topbar-icon topbar-icon-right"
            type="button"
            aria-label={isSoundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
            aria-pressed={isSoundEnabled}
            onClick={toggleSound}
          >
            {isSoundEnabled ? <VolumeOnIcon /> : <VolumeOffIcon />}
          </button>
        </div>

        <div className="hero-content">
          <div className="hero-copy">
            <h1 className="count-value" aria-label={`${coins}`}>
              {String(coins).split("").map((digit, index, digits) => {
                const place = digits.length - index - 1;
                return <AnimatedDigit key={place} value={digit} />;
              })}
            </h1>
            <span className="remaining-pill">
              {remaining === 0
                ? `Lượt nhận xu sẽ reset vào 00:00 01/${nextMonthLabel}`
                : `Còn ${remaining} lượt nhận xu livestream tháng này`}
            </span>
          </div>

          <div className="progress-meter" aria-label={`Đã hoàn thành ${Math.round(progress * 100)} phần trăm`}>
            <div className="progress-track" aria-hidden="true">
              <div
                className="progress-fill"
                style={{
                  width: fillWidth,
                }}
              />
              {DOT_STOPS.map((stop) => (
                <span
                  key={stop.coins}
                  className="progress-dot"
                  style={{
                    left: `calc(${stop.position * 100}% + ${6 - stop.position * 12}px)`,
                    opacity: coins >= stop.coins ? 0.82 : 0,
                  }}
                />
              ))}
            </div>
            <div
              className="meter-marker"
              style={{ left: markerPosition, top: "50%" }}
            >
              <span className="marker-face">
                <img src="/logo.svg?v=4" alt="" draggable={false} />
              </span>
            </div>
          </div>
          <section className="action-card">
            <button className="remove-button" onClick={removeCoin} type="button" aria-label="Giảm 1 lượt nhận">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v14" />
                <path d="m19 9-7 7-7-7" />
                <circle cx="12" cy="21" r="1" />
              </svg>
            </button>
            <button className="add-button" onClick={addCoin} type="button" disabled={coins >= MAX_COINS}>
              <span>{coins >= MAX_COINS ? "Hết lượt nhận" : "+1 lượt nhận"}</span>
            </button>
          </section>
        </div>
      </section>

      {feedbackMessage && (
        <span className={`share-feedback${isFeedbackClosing ? " is-closing" : ""}`} role="status">
          {feedbackMessage}
        </span>
      )}

      <div className="bottom-bar">
        <button
          className="bottom-bar-icon"
          type="button"
          aria-label="Mở sheet bên trái"
          onClick={() => openSheet("Mẹo Kiếm Thêm Xu")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a2.5 2.5 0 0 1 0-5H20" />
            <path d="M8 11h8" />
            <path d="M8 7h6" />
          </svg>
        </button>
        <button
          className="bottom-bar-icon"
          type="button"
          aria-label="Mở sheet bên phải"
          onClick={() => openSheet("Lịch Livestream")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12.127 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.125" />
            <path d="M14.62 17.8A2.25 2.25 0 1 1 18 14.836a2.25 2.25 0 1 1 3.38 2.966l-2.626 2.856a.998.998 0 0 1-1.507 0z" />
            <path d="M16 2v3" />
            <path d="M3 9h18" />
            <path d="M8 2v3" />
          </svg>
        </button>
      </div>

      {isSheetOpen && (
        <div className={`sheet-layer${isSheetClosing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-label="Sheet">
          <div className="sheet-header">
            {Array.from({ length: 7 }, (_, index) => (
              <span className={`sheet-blur-layer sheet-blur-layer-${index + 1}`} key={index} aria-hidden="true" />
            ))}
            <div className="sheet-header-inner">
              <h2 className="sheet-title">{sheetTitle}</h2>
              <button
                className="sheet-close"
                type="button"
                aria-label="Đóng sheet"
                onClick={closeSheet}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          <section className="full-sheet">

            {sheetTitle === "Mẹo Kiếm Thêm Xu" && (
              <div className="sheet-content">
                <div className="tip-list">
                  {EARN_TIPS.map((item) => (
                    <article
                      className={`tip-item${PRIORITY_TIP_TITLES.includes(item.title) ? " tip-item-priority" : ""}`}
                      key={item.title}
                    >
                      <div className="tip-copy">
                        <h4>
                          <TipIcon title={item.title} />
                          <span>{item.title}</span>
                        </h4>
                        <p>{item.description}</p>
                        <div className="tip-reward" aria-label={item.rewards.length > 0 ? `${item.rewards.join(" đến ")} xu` : "Chia Kho Xu"}>
                          <img src="/logo.svg?v=4" alt="" draggable={false} />
                          {item.rewards.length > 0 ? (
                            <>
                              <span>{formatReward(item.rewards[0])}</span>
                              {item.rewards.length > 1 && (
                                <>
                                  <span aria-hidden="true">–</span>
                                  <span>{formatReward(item.rewards[1])}</span>
                                </>
                              )}
                            </>
                          ) : (
                            <span>Chia Kho Xu</span>
                          )}
                        </div>
                        <p className="tip-note">{item.note}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {sheetTitle === "Lịch Livestream" && (
              <div className="sheet-content event-sheet-content">
                <LivestreamSchedule />
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
