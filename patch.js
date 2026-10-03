const fs = require('fs');
let content = fs.readFileSync('C:/Users/ADMIN/.gemini/antigravity/scratch/shop-chatbot/public/index.html', 'utf8');

// 1. AI Search Button
content = content.replace(
  '<input type="text" id="search-input" placeholder="Tìm kiếm cà phê Robusta, Arabica, Cold brew, Phin...">',
  '<input type="text" id="search-input" placeholder="Tìm kiếm cà phê Robusta, Arabica, Cold brew, Phin...">\n        <button class="ai-search-btn" id="ai-search-btn">✨ Tìm bằng AI</button>'
);

// 2. Review Form
content = content.replace(
  '<div class="reviews-grid">',
  '<div class="review-form" id="review-form-container">\n      <h3 style="margin-bottom:12px">Gửi đánh giá của bạn (AI Phân Tích)</h3>\n      <textarea id="review-input" placeholder="Nhập đánh giá của bạn..."></textarea>\n      <button class="btn btn-primary" id="submit-review-btn" style="padding: 10px 24px">Gửi Đánh Giá</button>\n      <div id="review-ai-feedback" style="margin-top:12px; font-weight:600; font-size:0.9rem"></div>\n    </div>\n    <div class="reviews-grid">'
);

// 3. Checkout OCR modal
content = content.replace(
  '<!-- Toast Container -->',
  `<!-- OCR Checkout Modal -->
  <div class="checkout-modal" id="checkout-modal">
    <div class="checkout-content">
      <h3>Thanh toán Chuyển Khoản</h3>
      <p style="margin-top:10px; color:var(--text-muted)">Vui lòng chuyển khoản và tải lên ảnh chụp màn hình bill để AI xác nhận tự động.</p>
      <input type="file" id="bill-upload" accept="image/*" style="display:none">
      <label for="bill-upload" class="file-upload">
        <div style="font-size:2rem; margin-bottom:10px">📸</div>
        <div>Nhấn để tải lên ảnh bill chuyển khoản</div>
      </label>
      <div id="ocr-status" style="margin-bottom:16px; font-weight:600; color:var(--primary)"></div>
      <button class="btn btn-primary" id="close-checkout-modal" style="width:100%">Đóng</button>
    </div>
  </div>

  <!-- Toast Container -->`
);

// 4. JS Logic for AI Search, OCR, and Review
const scriptToAdd = `
    // AI Search
    document.getElementById('ai-search-btn').addEventListener('click', async () => {
      if (!searchQuery.trim()) { showToast('Vui lòng nhập từ khóa'); return; }
      showToast('AI đang tìm kiếm...');
      try {
        const res = await fetch('/api/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchQuery })
        });
        const data = await res.json();
        if (data.ids && data.ids.length > 0) {
          const grid = document.getElementById('products');
          grid.innerHTML = '';
          const filtered = allProducts.filter(p => data.ids.includes(p.id));
          if(filtered.length) {
            filtered.forEach(p => {
              // Re-use card HTML
              const card = document.createElement('div');
              card.className = 'card';
              const isOut = p.stock <= 0;
              card.innerHTML = "<div class='card-img-wrap'>" + 
                (isOut ? "<span class='tag out'>Tạm hết hàng</span>" : "<span class='tag'>Còn hàng</span>") +
                "<img src='" + p.image + "'></div>" +
                "<div class='card-content'><h3>" + p.name + "</h3><p>" + p.description + "</p>" +
                "<div class='card-footer'><div class='price-row'><span class='price'>" + vnd(p.price) + "</span><span class='stock-info'>" + (isOut ? 'Hết' : 'Còn ' + p.stock) + "</span></div>" +
                "<div class='action-row'><button class='buy-btn' onclick='addToCart(\\\"" + p.id + "\\\")' " + (isOut?'disabled':'') + ">" + (isOut?'Tạm hết':'🛒 Thêm') + "</button>" +
                "<button class='ask-btn' onclick='askBotAbout(\\\"" + p.name.replace(/'/g, "\\\\'") + "\\\")'>💬 Hỏi bot</button></div></div></div>";
              grid.appendChild(card);
            });
            showToast('Đã lọc kết quả bằng AI');
          } else {
             showToast('Không tìm thấy sản phẩm');
          }
        } else {
          showToast('Không tìm thấy sản phẩm phù hợp');
        }
      } catch { showToast('Lỗi tìm kiếm AI'); }
    });

    // Review Sentiment
    document.getElementById('submit-review-btn').addEventListener('click', async () => {
      const val = document.getElementById('review-input').value.trim();
      if (!val) return;
      document.getElementById('submit-review-btn').disabled = true;
      document.getElementById('submit-review-btn').textContent = 'Đang phân tích...';
      try {
        const res = await fetch('/api/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ review: val })
        });
        const data = await res.json();
        const fb = document.getElementById('review-ai-feedback');
        fb.style.color = data.sentiment === 'positive' ? 'var(--success)' : (data.sentiment === 'negative' ? 'var(--danger)' : 'var(--primary)');
        fb.innerHTML = 'AI Phân tích: ' + data.summary;
      } catch {}
      document.getElementById('submit-review-btn').disabled = false;
      document.getElementById('submit-review-btn').textContent = 'Gửi Đánh Giá';
    });

    // OCR Checkout
    document.getElementById('checkout-btn').addEventListener('click', () => {
      if (cart.length === 0) return;
      document.getElementById('checkout-modal').classList.add('active');
    });
    document.getElementById('close-checkout-modal').addEventListener('click', () => {
      document.getElementById('checkout-modal').classList.remove('active');
    });

    document.getElementById('bill-upload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const b64 = ev.target.result;
        document.getElementById('ocr-status').textContent = '⏳ Đang quét hóa đơn bằng Gemini...';
        try {
          const res = await fetch('/api/ocr', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ image: b64 })
          });
          const data = await res.json();
          if (data.valid) {
            document.getElementById('ocr-status').innerHTML = '✅ Xác nhận đã nhận chuyển khoản: ' + vnd(data.amount);
            if (data.content) document.getElementById('ocr-status').innerHTML += '<br><small>Nội dung: ' + data.content + '</small>';
            showToast('Thanh toán thành công!');
          } else {
            document.getElementById('ocr-status').textContent = '❌ Không nhận diện được hóa đơn hợp lệ.';
          }
        } catch {
          document.getElementById('ocr-status').textContent = 'Lỗi hệ thống OCR.';
        }
      };
      reader.readAsDataURL(file);
    });

    // Smart Upsell in Cart
    function renderUpsell() {
      const c = document.getElementById('upsell-container');
      if (!c) return;
      if (cart.length === 0) { c.innerHTML = ''; return; }
      
      const inCartIds = cart.map(i => i.id);
      let suggested = allProducts.filter(p => !inCartIds.includes(p.id) && p.stock > 0);
      if (suggested.length > 0) {
        const p = suggested[Math.floor(Math.random() * suggested.length)];
        c.innerHTML = \`<div class="upsell-section">
          <div class="upsell-title">✨ Gợi ý mua kèm:</div>
          <div style="display:flex; gap:10px; align-items:center;">
             <img src="\${p.image}" style="width:50px; height:50px; border-radius:8px; object-fit:cover">
             <div style="flex:1">
               <div style="font-weight:700; font-size:0.9rem">\${p.name}</div>
               <div style="color:var(--primary); font-weight:800; font-size:0.9rem">\${vnd(p.price)}</div>
             </div>
             <button class="buy-btn" style="padding:6px 12px; font-size:0.85rem" onclick="addToCart('\${p.id}')">Thêm</button>
          </div>
        </div>\`;
      } else {
        c.innerHTML = '';
      }
    }
`;

content = content.replace(
  '// Checkout button demo action',
  scriptToAdd + '\n\n    // Checkout button demo action'
);

// Delete the old demo checkout action so it doesn't double run
content = content.replace(
  `// Checkout button demo action
    document.getElementById('checkout-btn').addEventListener('click', () => {
      if (cart.length === 0) return;
      const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      alert(\`Cảm ơn bạn! Đơn hàng trị giá \${vnd(total)} đã được ghi nhận. Để hoàn tất đặt hàng, bạn có thể nhắn tin trực tiếp qua khung Chatbot bên góc phải nhé!\`);
    });`,
  `// Old checkout action replaced`
);

// Upsell container
content = content.replace(
  '<div class="cart-items" id="cart-items-container">\n      <!-- Sẽ được render tự động qua Javascript -->\n    </div>',
  '<div class="cart-items">\n      <div id="cart-items-container"></div>\n      <div id="upsell-container"></div>\n    </div>'
);

// Add renderUpsell to saveCart / renderCart
content = content.replace(
  'function renderCart() {',
  'function renderCart() { setTimeout(renderUpsell, 100); '
);

fs.writeFileSync('C:/Users/ADMIN/.gemini/antigravity/scratch/shop-chatbot/public/index.html', content);
