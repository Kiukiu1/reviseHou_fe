# ReviseHOU – Frontend

Web cho sinh viên ôn tập: thư viện tài liệu theo khoa – ngành – môn, đăng tài liệu, tạo và làm bài kiểm tra. Dựng bằng **React 19 + TypeScript + Vite**.

Thư viện chính:

| Thư viện | Dùng cho |
|---|---|
| `react-router-dom` | Điều hướng trang |
| `axios` | Gọi API của BE (`src/services/http/httpClient.ts`) |
| `@tanstack/react-query` | Tải và cache dữ liệu (`hooks/useRequest.ts`) |
| `react-hook-form` + `zod` | Form và kiểm tra dữ liệu nhập |
| `@headlessui/react` | Ô chọn, ô chọn có tìm kiếm, hộp thoại (`components/common`) |

Muốn web chạy được thì **BE phải chạy trước** ở `http://localhost:4000`. Cách dựng BE và tạo dữ liệu ban đầu xem README của repo `revise-app-be`.

---

## 1. Cần cài gì

- **Node.js 20 trở lên**. Kiểm tra bằng lệnh `node -v`.
- Trình soạn code: IntelliJ IDEA Ultimate, WebStorm hoặc VS Code.

## 2. Cách chạy

```bash
npm install      # cài thư viện (lần đầu, hoặc khi package.json thay đổi)
npm run dev      # chạy web ở http://localhost:5173
```

Không cần tạo file `.env`. Địa chỉ BE lấy từ biến `VITE_API_URL` trong 2 file có sẵn:

| File | Dùng khi | `VITE_API_URL` |
|---|---|---|
| `.env.development` | `npm run dev` | `http://localhost:4000` |
| `.env.production` | `npm run build` | `https://api.revise-hou.tech` |

BE chạy ở địa chỉ khác thì tạo `.env.development.local` ghi đè `VITE_API_URL` (file `.local` không đưa lên git). Đăng nhập bằng Google với email `hou.edu.vn`.

Mở `http://localhost:5173` mà trình duyệt báo *refused to connect*: trên một số máy Windows Vite chỉ nghe IPv6 (`::1`) còn trình duyệt lại gọi IPv4 (`127.0.0.1`). Khi đó chạy thêm host:

```bash
npm run dev -- --host 127.0.0.1
```

rồi mở `http://127.0.0.1:5173`, và trong `.env` của BE đặt `FRONTEND_URL=http://127.0.0.1:5173` (để BE cho phép CORS và đăng nhập Google quay về đúng địa chỉ), khởi động lại BE. Không sửa `vite.config.ts` cho việc này vì chỉ một số máy bị.

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
│   └── errors/         Trang 403, 404
│
├── utils/              HÀM TIỆN ÍCH THUẦN (định dạng ngày, dung lượng file...)
└── assets/             Ảnh, icon, font import vào code
```

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
| `rating.service` (dùng trong trang chi tiết) | RatingsModule |

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
