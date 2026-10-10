# ReviseHOU – Frontend

Đây là template **React + TypeScript + Vite** gốc, được tạo bằng `npm create vite@latest`. Chưa thêm thư viện nào khác.

---

## 1. Cần cài gì

- **Node.js 20 trở lên**. Kiểm tra bằng lệnh `node -v`.
- Trình soạn code: IntelliJ IDEA Ultimate, WebStorm hoặc VS Code.

## 2. Cách chạy

```bash
npm install      # cài thư viện (lần đầu, hoặc khi package.json thay đổi)
npm run dev      # chạy web ở http://localhost:5173
```

Sửa code và lưu lại là trình duyệt tự cập nhật (gọi là **HMR**). Khi đang code thì **không cần build**.

| Lệnh | Dùng để |
|---|---|
| `npm run dev` | Chạy khi đang code |
| `npm run build` | Kiểm tra lỗi TypeScript và đóng gói ra thư mục `dist/` để deploy |
| `npm run preview` | Chạy thử bản đã build trong `dist/` |
| `npm run lint` | Kiểm tra lỗi code bằng Oxlint |

**Trên IntelliJ:** mở file `package.json`, bấm nút ▶ cạnh script `dev`. Hoặc gõ lệnh trong tab Terminal.

---

## 3. Cấu trúc thư mục

### 3.1. File ở thư mục gốc

```
frontend/
├── index.html            Trang HTML duy nhất. React được gắn vào thẻ <div id="root">
├── public/               File tĩnh, dùng trực tiếp theo đường dẫn /ten-file (favicon...)
├── src/                  TOÀN BỘ CODE NẰM Ở ĐÂY (xem 3.2)
├── vite.config.ts        Cấu hình Vite (plugin, cổng chạy, proxy...)
├── tsconfig*.json        Cấu hình TypeScript
├── .oxlintrc.json        Luật kiểm tra code (Oxlint)
├── package.json          Danh sách thư viện và các lệnh npm
└── node_modules/         Thư viện đã cài (không sửa, không đưa lên git)
```

### 3.2. Thư mục `src/`

```
src/
├── main.tsx            Điểm khởi động: gắn <App /> vào #root
├── App.tsx             Component gốc (hiện vẫn là trang mẫu của Vite)
├── index.css           CSS dùng chung
│
├── config/             CẤU HÌNH: đọc biến .env ở 1 chỗ duy nhất (env.ts)
│
├── types/              KIỂU DỮ LIỆU: mô tả cấu trúc JSON mà Backend trả về / FE gửi lên
│                       (user.ts, document.ts, quiz.ts, catalog.ts...)
│
├── services/           GỌI API: chỉ ở đây mới gọi ra Backend
│                       (http.ts dùng chung, document.service.ts, quiz.service.ts,
│                        ai.service.ts, rating.service.ts, catalog.service.ts,
│                        user.service.ts, statistics.service.ts)
│
├── contexts/           TRẠNG THÁI DÙNG CHUNG cho nhiều trang (sau này: đăng nhập)
├── hooks/              HOOK TỰ VIẾT dùng lại nhiều chỗ (vd: useDebounce cho ô tìm kiếm)
├── routes/             ĐIỀU HƯỚNG: khai báo tất cả các trang ở 1 file (AppRouter.tsx)
│
├── layouts/            KHUNG TRANG
│                       (MainLayout: header + nội dung; AdminLayout: sidebar + nội dung)
│
├── components/         THÀNH PHẦN GIAO DIỆN DÙNG CHUNG
│   ├── common/         Button, Modal, Loading, Pagination, EmptyState...
│   └── document-viewer/  Xem tài liệu PDF / DOCX / PPTX
│
├── pages/              GIAO DIỆN TỪNG TRANG, chia theo nhóm chức năng
│   ├── home/           Trang chủ
│   ├── documents/      Danh sách + tìm kiếm, Chi tiết (xem, đánh giá, bình luận),
│   │                   Đăng tài liệu, Tài liệu của tôi
│   ├── quiz/           Danh sách, Làm bài, Kết quả, Tạo bài kiểm tra, Lịch sử
│   ├── ai-assistant/   Chat với trợ lý AI
│   ├── review/         Kiểm duyệt tài liệu và bài kiểm tra (giảng viên)
│   ├── admin/          Quản lý tài khoản, Danh mục khoa - ngành - môn, Thống kê
│   └── errors/         Trang 403, 404
│
├── utils/              HÀM TIỆN ÍCH THUẦN (định dạng ngày, dung lượng file...)
└── assets/             Ảnh, icon, font import vào code
```

> Các thư mục hiện đang trống, chỉ có file `.gitkeep` để git giữ lại thư mục. Khi đã có file thật trong thư mục thì xóa `.gitkeep` đi.

### 3.3. Quy tắc đặt file

| Cần làm | Đặt ở đâu |
|---|---|
| Thêm một trang | `pages/<nhóm>/` |
| Gọi một API | `services/<nhóm>.service.ts` |
| Mô tả dữ liệu Backend trả về | `types/` |
| Giao diện dùng lại từ 2 trang trở lên | `components/` |
| Logic dùng lại từ 2 trang trở lên | `hooks/` |
| Hàm tính toán / định dạng không liên quan React | `utils/` |

**Luồng gọi dữ liệu:** `pages` → `services` → `services/http.ts` → Backend. Trang **không** gọi API trực tiếp.

Các nhóm trong `pages/` và `services/` đặt tên theo nhóm chức năng ở Chương 3 và các module NestJS ở Bảng 4.2, nên FE và BE đối chiếu được 1–1:

| Nhóm FE | Module Backend |
|---|---|
| `documents` | DocumentsModule, StorageModule |
| `quiz` | QuizModule |
| `ai-assistant` / `ai.service` | AiModule |
| `rating.service` (dùng trong trang chi tiết) | RatingsModule |
| `review` | DocumentsModule, QuizModule (phần kiểm duyệt) |
| `admin` | UsersModule, CatalogModule, StatisticsModule |

---

## 4. Luồng chạy của trang

```
Trình duyệt mở http://localhost:5173
   │
   ▼
index.html  ── có <div id="root"> và nạp /src/main.tsx
   │
   ▼
main.tsx    ── createRoot(#root).render(<App />)
   │
   ▼
App.tsx     ── trả về giao diện (JSX), dùng useState để lưu dữ liệu
   │
   ▼
Người dùng bấm nút → state thay đổi → React tự vẽ lại phần giao diện liên quan
```

Muốn sửa giao diện thì bắt đầu từ **`src/App.tsx`**.

---

## 5. Khi bắt đầu làm dự án

Hiện mới có khung thư mục. Các việc tiếp theo:

1. Xóa nội dung mẫu trong `App.tsx`, `App.css` và các ảnh trong `assets/`.
2. Cài thêm thư viện:
   - `react-router-dom` để chuyển giữa các trang (dùng trong `routes/`)
   - `axios` để gọi API Backend (dùng trong `services/http.ts`)
   - Tailwind CSS / shadcn để làm giao diện (khi có thiết kế Figma)
3. Đổi `<title>` trong `index.html` thành tên dự án.
4. Phần **đăng nhập** chờ chốt luồng với Backend rồi mới làm.

---

## 6. Tài liệu tham khảo

- React: https://react.dev
- Vite: https://vite.dev
- TypeScript: https://www.typescriptlang.org/docs
