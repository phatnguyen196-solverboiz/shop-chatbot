# ☕ Shop Chatbot AI - Trợ Lý Bán Hàng Thông Minh Cho Website

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-4285F4?style=flat&logo=google&logoColor=white)](https://aistudio.google.com/)
[![Dependencies](https://img.shields.io/badge/Dependencies-0_(Native_Only)-brightgreen?style=flat)](package.json)
[![Deploy on Render](https://img.shields.io/badge/Deploy-Render_Ready-46E3B7?style=flat&logo=render&logoColor=white)](render.yaml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Dự án cung cấp giải pháp **Chatbot AI tư vấn và bán hàng tự động**, kèm theo một website demo thương mại điện tử hoàn chỉnh. Widget khung chat được thiết kế để có thể **nhúng vào bất kỳ website nào chỉ với một dòng script**.

---

## 🌟 Điểm Nổi Bật

- ⚡ **Zero External Dependencies:** 100% sử dụng thư viện tiêu chuẩn của Node.js (`node:http`, `node:fs`). Khởi động tức thì, siêu nhẹ, không lo bảo mật từ thư viện bên thứ ba.
- 🧠 **Tích hợp Google Gemini 2.5 Flash:** Phản hồi nhanh, hiểu ngữ cảnh tự nhiên, tư vấn đúng gu khách hàng, tự động gợi ý sản phẩm phù hợp.
- 🎯 **Ground Truth từ `products.json`:** Bot chỉ trả lời dựa trên kho dữ liệu thực tế của cửa hàng. Không bịa đặt giá, không nói sai tồn kho hay chính sách.
- 🛡️ **Bảo Mật Cấp Doanh Nghiệp:**
  - Khóa API Gemini được lưu trữ an toàn tại backend, không bao giờ lộ ra trình duyệt.
  - Tích hợp Rate Limiting chống spam (hỗ trợ `TRUST_PROXY` khi deploy cloud).
  - Giới hạn kích thước payload & làm sạch dữ liệu đầu vào chống tấn công XSS.
  - Kiểm soát nguồn gốc truy cập với CORS linh hoạt.
- 🔌 **Nhúng Mọi Nền Tảng (1-Line Embed):** Tương thích hoàn hảo với WordPress, Shopify, Haravan, Wix hoặc bất kỳ website HTML/PHP nào.
- 🎨 **Giao Diện Hiện Đại & Tương Tác Cao:**
  - Website bán hàng chuẩn responsive, hiệu ứng mượt mà.
  - Tích hợp giỏ hàng tương tác, danh mục sản phẩm, bộ lọc tìm kiếm.
  - Chatbot có avatar, trạng thái online, hiệu ứng gõ tin nhắn (typing dots) chuyên nghiệp.

---

## 🚀 Khởi Động Nhanh (Local)

### 1. Yêu cầu hệ thống
- Đã cài đặt [Node.js](https://nodejs.org/) phiên bản 18 trở lên.

### 2. Tải mã nguồn và chạy
```bash
# Clone repository
git clone https://github.com/phatnguyen196-solverboiz/shop-chatbot.git
cd shop-chatbot

# Chạy server
node server.js
```

Mở trình duyệt truy cập: **`http://localhost:3000`**

> **Ghi chú:** Khi chưa cấu hình khóa API, server sẽ tự động chạy ở **Chế độ Demo** (trả lời thông minh theo từ khóa sản phẩm) giúp bạn kiểm tra giao diện trước.

---

## 🔑 Cấu Hình Google Gemini AI

Để kích hoạt trí tuệ nhân tạo Gemini phản hồi tự nhiên:

1. Lấy khóa API miễn phí tại: [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Tạo file `.env` ở thư mục gốc (hoặc sao chép từ `.env.example`):
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash
   ALLOWED_ORIGINS=*
   TRUST_PROXY=false
   ```
3. Khởi động lại server:
   ```bash
   node server.js
   ```

---

## 📦 Tùy Chỉnh Dữ Liệu Cửa Hàng (`products.json`)

Mọi thông tin bot tư vấn đều được đọc từ file `products.json`. Bạn chỉ cần cập nhật file này theo nhu cầu kinh doanh:

```json
{
  "shop": {
    "name": "Cà Phê Nhà Mộc",
    "about": "Mô tả về thương hiệu và giá trị cốt lõi của cửa hàng.",
    "hotline": "0900 000 000",
    "zalo": "zalo.me/0900000000",
    "supportHours": "8h - 21h mỗi ngày"
  },
  "policies": {
    "shipping": "Chính sách giao hàng và phí vận chuyển...",
    "returns": "Quy định đổi trả sản phẩm...",
    "payment": "Các phương thức thanh toán hỗ trợ..."
  },
  "products": [
    {
      "id": "robusta-500",
      "name": "Cà phê Robusta rang xay 500g",
      "price": 120000,
      "stock": 40,
      "description": "Vị đậm, hậu ngọt, hợp pha phin...",
      "keywords": ["robusta", "dam", "dang"]
    }
  ]
}
```

*Lưu ý: Khi sản phẩm có `stock: 0`, bot sẽ tự động hiểu là hết hàng và lịch sự giới thiệu sang các lựa chọn khác.*

---

## 🔌 Nhúng Khung Chat Vào Website Bất Kỳ

Để gắn chatbot vào trang web hiện tại của bạn, dán đoạn mã sau vào trước thẻ đóng `</body>`:

```html
<script src="https://ten-mien-server-cua-ban.com/chatbot.js" defer></script>
```

### Các thuộc tính tùy biến giao diện:
| Thuộc tính | Ý nghĩa | Mặc định |
| :--- | :--- | :--- |
| `data-api` | Địa chỉ backend chatbot (nếu tách rời domain với web bán hàng) | Cùng domain |
| `data-title` | Tiêu đề hiển thị trên thanh đầu khung chat | `Trợ lý bán hàng` |
| `data-greeting` | Câu chào khởi đầu khi khách mở chat | `Xin chào! Mình có thể giúp gì cho bạn? 😊` |
| `data-color` | Mã màu chủ đạo (`#HEX`) của khung chat | `#8b5a2b` |

**Ví dụ tùy biến màu xanh hiện đại:**
```html
<script 
  src="https://my-chatbot.onrender.com/chatbot.js"
  data-title="Chăm Sóc Khách Hàng"
  data-color="#059669"
  data-greeting="Chào bạn! Nhà Mộc có thể tư vấn món nào cho bạn hôm nay?"
  defer>
</script>
```

---

## 🌐 Triển Khai Lên Mạng (Deploy)

Dự án đã tích hợp sẵn tệp cấu hình **Render Blueprint (`render.yaml`)**, cho phép triển khai hoàn toàn miễn phí chỉ qua vài bước:

1. Đăng nhập [Render.com](https://render.com) bằng tài khoản GitHub.
2. Tại Dashboard, nhấn **New +** $\rightarrow$ chọn **Blueprint**.
3. Chọn kho mã nguồn `shop-chatbot` và nhấn **Apply**.
4. Vào mục **Environment** của dịch vụ vừa tạo:
   - Thêm biến `GEMINI_API_KEY` với giá trị là khóa API của bạn.
   - Thêm biến `ALLOWED_ORIGINS` trỏ về tên miền website chính của bạn để tăng tính bảo mật.

---

## 📂 Cấu Trúc Dự Án

```text
├── public/
│   ├── index.html       # Giao diện website bán hàng hoàn chỉnh
│   └── chatbot.js       # Widget nhúng chatbot độc lập, thuần Vanilla JS
├── products.json        # Dữ liệu sản phẩm, chính sách và thông tin cửa hàng
├── server.js            # Máy chủ Node.js: Xử lý bảo mật, gọi Gemini API, phục vụ web
├── test.js              # Bộ kiểm thử tự động (Unit Test không phụ thuộc)
├── render.yaml          # Tệp cấu hình tự động triển khai lên Render
├── .env.example         # Tệp mẫu thiết lập biến môi trường
└── README.md            # Tài liệu hướng dẫn sử dụng chi tiết
```

---

## 🧪 Kiểm Thử

Dự án đi kèm bộ test xác thực logic lọc chuỗi, làm sạch lịch sử chat và thuật toán trả lời dự phòng:

```bash
npm test
# hoặc: node test.js
```

---

## 📄 Bản Quyền

Dự án được phát hành theo giấy phép [MIT License](LICENSE). Bạn hoàn toàn tự do sử dụng cho mục đích cá nhân hoặc thương mại.
