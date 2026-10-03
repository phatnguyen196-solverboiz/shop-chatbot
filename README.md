# Chatbot bán hàng cho website

Không cần cài thêm thư viện, chỉ cần Node.js 18 trở lên.

## Chạy thử (30 giây)

```powershell
node server.js
```

Mở http://localhost:3000. Bấm nút 💬 ở góc phải để chat.
Chưa có API key thì bot chạy **chế độ demo** (trả lời theo từ khóa) để bạn xem giao diện.

## Bật AI thật (Gemini)

1. Lấy key miễn phí: https://aistudio.google.com/apikey
2. Sao chép `.env.example` thành `.env`, điền `GEMINI_API_KEY=...`
3. Chạy lại `node server.js`

> Không bao giờ dán API key vào `chatbot.js` hay `index.html`. Chỉ để trong `.env` (file này đã được `.gitignore`).

## Dùng dữ liệu shop của bạn

Sửa `products.json`: tên shop, hotline, chính sách, sản phẩm (giá, tồn kho, mô tả).
Bot chỉ trả lời dựa trên file này nên không bịa giá. Tồn kho `stock: 0` nghĩa là hết hàng.

## Gắn vào website của bạn

Dán một dòng trước thẻ `</body>`:

```html
<script src="https://ten-server-cua-ban.com/chatbot.js" defer></script>
```

Tùy chỉnh bằng thuộc tính: `data-title`, `data-greeting`, `data-color="#8b5a2b"`,
`data-api` (nếu server chatbot khác domain với file chatbot.js).

Hoạt động với WordPress (Appearance → Theme File Editor hoặc plugin chèn code header/footer),
Shopify (theme.liquid), Wix (Custom Code) và web tự code.

## Đưa lên mạng thật

Server cần chạy ở đâu đó có địa chỉ công khai (Render, Railway, Fly.io, VPS...).
Khi đó:
- Đặt biến môi trường `GEMINI_API_KEY` trên dịch vụ đó (không đưa file `.env` lên).
- Đặt `ALLOWED_ORIGINS=https://shopcuaban.com` để chỉ web của bạn gọi được bot.

## Cấu trúc

| File | Vai trò |
|---|---|
| `server.js` | Giữ API key, nhận tin nhắn, gọi Gemini, giới hạn tốc độ |
| `public/chatbot.js` | Khung chat nhúng được vào mọi web |
| `public/index.html` | Trang web demo |
| `products.json` | Dữ liệu shop cho bot |
