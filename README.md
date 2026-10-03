# ☕ Shop Chatbot AI - Trợ Lý Bán Hàng & Tư Vấn Thông Minh Cho Website

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_3.1_Flash_Lite-4285F4?style=flat&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Dependencies](https://img.shields.io/badge/Dependencies-0_(Native_Only)-brightgreen?style=flat)](package.json)
[![Deploy on Render](https://img.shields.io/badge/Deploy-Render_Ready-46E3B7?style=flat&logo=render&logoColor=white)](render.yaml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Giải pháp **Chatbot AI tư vấn và bán hàng tự động**, kèm theo một website demo thương mại điện tử chuyên nghiệp. Widget khung chat được thiết kế độc lập, bảo mật và có thể **nhúng vào bất kỳ website nào chỉ với một dòng script**.

---

## 🌟 Điểm Nổi Bật

- ⚡ **Zero External Dependencies:** 100% sử dụng thư viện tiêu chuẩn của Node.js (`node:http`, `node:fs`). Khởi động tức thì, siêu nhẹ, không lo bảo mật từ các package trung gian.
- 🧠 **Tích hợp Google Gemini AI đa tầng:** Mặc định chạy `gemini-3.1-flash-lite` với cơ chế tự động chuyển vùng dự phòng (fallback) sang `gemini-3.5-flash-lite` / `gemini-3.8-flash` khi mạng quá tải.
- 🎯 **Ground Truth từ `products.json`:** Bot chỉ trả lời dựa trên kho dữ liệu thực tế của cửa hàng. Không bịa đặt giá, không nói sai tồn kho hay chính sách.
- 🛡️ **Bảo Mật Tuyệt Đối:**
  - Khóa API Gemini được lưu trữ an toàn tại backend qua file `.env`, không bao giờ lộ xuống trình duyệt.
  - Rate Limiting chống spam tin nhắn theo IP (hỗ trợ `TRUST_PROXY` khi deploy cloud).
  - Làm sạch dữ liệu đầu vào chống tấn công XSS và chặn path traversal.
  - Hỗ trợ CORS linh hoạt (`ALLOWED_ORIGINS`).
- 🔌 **Nhúng Mọi Nền Tảng (1-Line Embed):** Tương thích hoàn hảo với WordPress, Shopify, Haravan, Wix hoặc web tự code. Hỗ trợ sự kiện tùy biến `shopchat:open` để kích hoạt chat từ bất cứ nút bấm nào trên web.
- 🎨 **Website Bán Hàng & Giỏ Hàng Hoàn Chỉnh:**
  - Giao diện Storefront hiện đại, chuẩn Responsive trên cả điện thoại và máy tính.
  - Tích hợp giỏ hàng trượt (Cart Drawer), tính toán miễn phí vận chuyển, bộ lọc danh mục và ô tìm kiếm tức thì.
  - Khung chat chuyên nghiệp có avatar, chấm xanh online và hiệu ứng 3 dấu chấm nhảy (typing indicator).

---

## 🚀 Khởi Động Nhanh (Local)

### 1. Yêu cầu
- Máy đã cài [Node.js](https://nodejs.org/) phiên bản 18 trở lên.

### 2. Cài đặt và khởi chạy
```bash
# Clone repository
git clone https://github.com/phatnguyen196-solverboiz/shop-chatbot.git
cd shop-chatbot

# Khởi động server
node server.js
```

Mở trình duyệt truy cập: **`http://localhost:3000`**

> **Chế độ Demo:** Khi chưa cấu hình khóa API, server sẽ tự động chạy ở chế độ dự phòng thông minh (trả lời theo từ khóa sản phẩm, giá, địa chỉ, phí ship) giúp bạn trải nghiệm ngay mà không bị báo lỗi.

---

## 🔑 Kích Hoạt Trí Tuệ Nhân Tạo Gemini AI

1. Lấy khóa API miễn phí tại: [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Tạo file `.env` ở thư mục gốc (hoặc sao chép từ `.env.example`):
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-3.1-flash-lite
   ALLOWED_ORIGINS=*
   TRUST_PROXY=false
   ```
3. Khởi động lại server:
   ```bash
   node server.js
   ```

---

## 📦 Tùy Chỉnh Thông Tin Cửa Hàng (`products.json`)

Mọi câu trả lời của AI đều được đối chiếu từ `products.json`. Bạn chỉ cần cập nhật file này theo thông tin thực tế:

```json
{
  "shop": {
    "name": "Cà Phê Nhà Mộc",
    "about": "Mô tả cửa hàng...",
    "address": "123 Đường Cà Phê, Quận 1, TP. Hồ Chí Minh",
    "hotline": "0900 000 000",
    "zalo": "zalo.me/0900000000",
    "supportHours": "8h - 21h mỗi ngày"
  },
  "policies": {
    "shipping": "Chính sách vận chuyển...",
    "returns": "Chính sách đổi trả...",
    "payment": "Hình thức thanh toán..."
  },
  "products": [
    {
      "id": "robusta-500",
      "name": "Cà phê Robusta rang xay 500g",
      "category": "coffee",
      "price": 120000,
      "stock": 40,
      "description": "Vị đậm đà, hậu ngọt sâu...",
      "keywords": ["robusta", "dam", "dang"]
    }
  ]
}
```

---

## 🔌 Hướng Dẫn Nhúng Vào Website Của Bạn

Chỉ cần chèn dòng script sau vào trước thẻ đóng `</body>`:

```html
<script 
  src="https://ten-mien-server-cua-ban.com/chatbot.js" 
  data-title="Trợ Lý Bán Hàng"
  data-color="#8b5a2b"
  defer>
</script>
```

### Kích hoạt chat từ nút bấm trên website:
Bạn có thể mở khung chat và điền sẵn câu hỏi từ bất kỳ nút nào trên website bằng Javascript:
```js
document.dispatchEvent(new CustomEvent('shopchat:open', {
  detail: { question: 'Cho mình xin địa chỉ shop và tư vấn cà phê Robusta nhé!' }
}));
```

---

## 🌐 Hướng Dẫn Triển Khai Lên Render (Miễn Phí 24/7)

Dự án đã có sẵn file Blueprint `render.yaml`:

1. Đăng nhập [Render.com](https://render.com) bằng tài khoản GitHub.
2. Nhấn nút **New +** $\rightarrow$ chọn **Blueprint**.
3. Chọn repo `shop-chatbot` và bấm **Apply**.
4. Vào mục **Environment** của Web Service trên Render:
   - Thêm biến `GEMINI_API_KEY` (điền key của bạn).
   - Thêm biến `GEMINI_MODEL` (giá trị `gemini-3.1-flash-lite`).
   - Đặt `ALLOWED_ORIGINS` trỏ về domain web bán hàng của bạn.

---

## 📂 Cấu Trúc Mã Nguồn

```text
├── public/
│   ├── index.html       # Website bán hàng tích hợp giỏ hàng và danh mục
│   └── chatbot.js       # Widget khung chat nhúng độc lập, thuần JS
├── products.json        # Dữ liệu sản phẩm, địa chỉ và chính sách cửa hàng
├── server.js            # Server Node.js: Xử lý bảo mật, gọi Gemini AI, fallback đa tầng
├── test.js              # Bộ kiểm thử tự động (Unit Test chuẩn node:assert)
├── render.yaml          # File cấu hình deploy tự động lên Render
├── .env.example         # File mẫu các biến môi trường
└── README.md            # Tài liệu dự án chi tiết
```

---

## 🧪 Kiểm Thử Hệ Thống

Chạy bộ test kiểm tra khả năng chuẩn hóa tiếng Việt, làm sạch hội thoại và thuật toán phản hồi dự phòng:

```bash
npm test
```

---

## 📄 Bản Quyền

Phát hành theo giấy phép [MIT License](LICENSE).
