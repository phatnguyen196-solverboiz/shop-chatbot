# Shop Chatbot

Widget chat tư vấn sản phẩm bằng tiếng Việt, gồm một server Node.js và trang cửa hàng minh họa. Không cần cài thư viện ngoài. Khi có Gemini API key, server gửi hội thoại và dữ liệu cửa hàng cho Gemini; khi chưa có key, bot trả lời theo từ khóa để thử giao diện.

**Đây là bản demo:** `products.json` chứa sản phẩm, giá, chính sách và số liên hệ mẫu. Trang web chưa có giỏ hàng, thanh toán hay đặt hàng. Ảnh sản phẩm là ảnh minh họa. Hãy thay toàn bộ thông tin mẫu trước khi dùng cho cửa hàng thật.

## Chạy trên máy

Cần Node.js **18 trở lên**. Trong thư mục dự án:

```bash
npm start
```

Mở [http://localhost:3000](http://localhost:3000). Bấm nút chat ở góc dưới hoặc nút **Hỏi sản phẩm** trên một thẻ sản phẩm. Chưa cấu hình API key thì `/healthz` báo `mode: "demo"`.

Để dùng Gemini:

1. Tạo API key tại [Google AI Studio](https://aistudio.google.com/apikey).
2. Sao chép `.env.example` thành `.env` và điền `GEMINI_API_KEY`.
3. Khởi động lại server. Truy cập `/healthz` để kiểm tra `mode: "gemini"`.

Không đưa `.env` hoặc API key vào Git, HTML hay JavaScript trên trình duyệt. File `.env` đã nằm trong `.gitignore`.

## Tùy chỉnh cửa hàng

Sửa `products.json` rồi **khởi động lại server**: tên shop, liên hệ, giờ hỗ trợ, chính sách và danh sách sản phẩm. `price` là số tiền VND, `stock: 0` hiển thị hết hàng, còn `keywords` giúp chế độ demo nhận diện sản phẩm. Dữ liệu được đọc một lần khi server khởi động; đây chưa phải hệ thống tồn kho cập nhật theo thời gian thực.

Chế độ demo dùng quy tắc từ khóa đơn giản nên có thể không hiểu nhiều cách hỏi. Chế độ Gemini được hướng dẫn trả lời theo `products.json`, nhưng câu trả lời do AI tạo vẫn cần kiểm tra trước khi áp dụng cho thông tin giao dịch quan trọng.

## Nhúng vào website khác

Đặt đoạn sau trước `</body>`, thay tên miền bằng địa chỉ server đã triển khai:

```html
<script
  src="https://chat.example.com/chatbot.js"
  data-title="Trợ lý cửa hàng"
  data-greeting="Chào bạn! Mình có thể giúp gì?"
  data-color="#8b5a2b"
  defer
></script>
```

Widget mặc định gọi API ở cùng origin với file `chatbot.js`. Chỉ dùng `data-api="https://api.example.com"` khi API nằm ở địa chỉ khác. `data-color` nhận mã màu dạng `#rgb` hoặc `#rrggbb`. Website có thể mở chat và điền sẵn một câu hỏi bằng:

```js
document.dispatchEvent(new CustomEvent('shopchat:open', {
  detail: { question: 'Cho mình hỏi về cà phê Robusta' }
}));
```

Đặt `ALLOWED_ORIGINS` thành danh sách **origin của các trang nhúng** (gồm giao thức và tên miền, ngăn cách bằng dấu phẩy), ví dụ `https://shop.example.com,https://www.shop.example.com`. Nếu truy cập từ localhost để thử, thêm origin localhost tương ứng. `*` chỉ nên dùng khi thử nghiệm. CORS giới hạn việc gọi từ trình duyệt, **không phải cơ chế xác thực** và không ngăn được client gửi HTTP trực tiếp; một API công khai vẫn có thể phát sinh chi phí Gemini.

## Cấu hình và triển khai

| Biến | Mặc định | Công dụng |
| --- | --- | --- |
| `GEMINI_API_KEY` | rỗng | Rỗng thì chạy demo; có key thì gọi Gemini. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Tên model gửi đến Gemini. |
| `GEMINI_THINKING_BUDGET` | không gửi | Tùy chọn cho model hỗ trợ thinking budget. |
| `PORT` | `3000` | Cổng HTTP của server. |
| `ALLOWED_ORIGINS` | `*` | Các origin được phép gọi API từ trình duyệt. |
| `RATE_LIMIT_PER_MIN` | `20` | Giới hạn số yêu cầu chat mỗi phút theo IP, lưu trong bộ nhớ tiến trình. |
| `TRUST_PROXY` | `false` | Chỉ bật nếu server đứng sau reverse proxy đáng tin cậy. |

Triển khai server Node.js bằng `npm start`; repo có `render.yaml` làm cấu hình mẫu cho Render. Đặt `GEMINI_API_KEY` và `ALLOWED_ORIGINS` trong biến môi trường của dịch vụ. `render.yaml` hiện để `ALLOWED_ORIGINS=*` cho demo, vì vậy cần thay giá trị này trước khi mở cho khách dùng. Khi chạy sau proxy của nền tảng, kiểm tra cấu hình `TRUST_PROXY` để giới hạn theo IP có ý nghĩa. Rate limit nằm trong bộ nhớ, không chia sẻ giữa nhiều instance và không thay thế bảo vệ chi phí ở tầng triển khai.

## Kiểm tra

```bash
npm test
```

| Thành phần | Vai trò |
| --- | --- |
| `server.js` | Phục vụ trang tĩnh, API chat, gọi Gemini và giới hạn yêu cầu. |
| `public/index.html` | Giao diện cửa hàng minh họa. |
| `public/chatbot.js` | Widget chat có thể nhúng. |
| `products.json` | Dữ liệu mẫu của cửa hàng. |
| `.env.example` | Các biến cấu hình mẫu. |
