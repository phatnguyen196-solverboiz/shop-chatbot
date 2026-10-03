const fs = require('fs');
let content = fs.readFileSync('README.md', 'utf8');

content = content.replace(
  '## ✨ Các tính năng nổi bật',
  '## ✨ Các tính năng AI cao cấp (Advanced Features)\n\n- 🔍 **Tìm kiếm ngữ nghĩa (Semantic Search):** Không chỉ tìm theo từ khóa cứng, khách hàng có thể tìm kiếm theo ý nghĩa (VD: "loại nào ít chua", "cà phê biếu sếp") và Gemini sẽ trả về kết quả chính xác.\n- 📸 **Thanh toán tự động bằng OCR:** Khách hàng upload ảnh chụp màn hình hóa đơn chuyển khoản, Gemini Vision sẽ tự động đọc biên lai, xác nhận số tiền và nội dung chuyển khoản ngay lập tức.\n- 🧠 **Phân tích cảm xúc (Sentiment Analysis):** Khi khách hàng để lại đánh giá, AI sẽ phân tích tức thì xem thái độ của khách là Tích cực (Positive) hay Tiêu cực (Negative) để phản hồi tương ứng.\n- 🛒 **Gợi ý mua kèm thông minh (Smart Upsell):** Dựa vào các món đang có trong giỏ hàng, hệ thống đưa ra gợi ý các sản phẩm bổ trợ (VD: mua cà phê hạt sẽ được gợi ý mua thêm French Press).\n- 🤖 **Trợ lý Tư vấn Chọn vị:** Chatbot hiểu ngữ cảnh và có khả năng đưa ra bài trắc nghiệm ngắn gọn giúp khách hàng tìm ra đúng gu cà phê yêu thích.\n\n## ✨ Các tính năng Chatbot cơ bản'
);

fs.writeFileSync('README.md', content);
