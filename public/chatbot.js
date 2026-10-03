/**
 * Khung chat nhúng được vào bất kỳ website nào bằng MỘT dòng:
 *
 *   <script src="https://ten-server-cua-ban.com/chatbot.js" defer></script>
 *
 * Tùy chọn (thuộc tính data-* trên thẻ script):
 *   data-api       Địa chỉ server chatbot (mặc định: cùng domain với file chatbot.js)
 *   data-title     Tiêu đề cửa sổ chat
 *   data-greeting  Lời chào đầu tiên
 *   data-color     Màu chủ đạo, dạng #rrggbb
 */
(function () {
  'use strict';
  if (window.__shopChatLoaded) return;
  window.__shopChatLoaded = true;

  var script = document.currentScript;
  var attr = function (name, fallback) {
    return (script && script.getAttribute(name)) || fallback;
  };

  var apiBase = attr('data-api', script && script.src ? new URL(script.src).origin : '').replace(/\/+$/, '');
  var title = attr('data-title', 'Trợ lý bán hàng');
  var greeting = attr('data-greeting', 'Xin chào! Mình có thể giúp gì cho bạn? 😊');
  var color = attr('data-color', '#8b5a2b');
  if (!/^#[0-9a-f]{3,8}$/i.test(color)) color = '#8b5a2b'; // chặn chèn CSS lạ
  var suggestions = ['Có những sản phẩm nào?', 'Phí ship thế nào?', 'Chính sách đổi trả?'];

  var STORAGE_KEY = 'shopchat_history_v1';
  var MAX_HISTORY = 12;
  var history = [];
  var busy = false;
  var demoNoticeShown = false;

  try {
    history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(history)) history = [];
  } catch (e) {
    history = [];
  }

  // ----------------------------------------------------------------- giao diện --

  var css =
    '.sc-root{--sc-color:' + color + ';font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:15px;line-height:1.45;color:#222}' +
    '.sc-root *{box-sizing:border-box}' +
    '.sc-fab{position:fixed;right:20px;bottom:20px;width:60px;height:60px;border-radius:50%;border:0;background:var(--sc-color);color:#fff;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.25);font-size:28px;z-index:2147483000;transition:transform .15s}' +
    '.sc-fab:hover{transform:scale(1.08)}' +
    '.sc-panel{position:fixed;right:20px;bottom:92px;width:370px;max-width:calc(100vw - 24px);height:540px;max-height:calc(100vh - 110px);background:#fff;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,.28);display:none;flex-direction:column;overflow:hidden;z-index:2147483000}' +
    '.sc-panel.sc-open{display:flex}' +
    '.sc-head{background:var(--sc-color);color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;font-weight:600}' +
    '.sc-close{background:none;border:0;color:#fff;font-size:22px;cursor:pointer;line-height:1}' +
    '.sc-msgs{flex:1;overflow-y:auto;padding:14px;background:#f6f4f1;display:flex;flex-direction:column;gap:8px}' +
    '.sc-msg{max-width:84%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}' +
    '.sc-bot{align-self:flex-start;background:#fff;border:1px solid #e6e1da;border-bottom-left-radius:4px}' +
    '.sc-user{align-self:flex-end;background:var(--sc-color);color:#fff;border-bottom-right-radius:4px}' +
    '.sc-err{align-self:flex-start;background:#fdecea;color:#8a1c14;border:1px solid #f5c2bd}' +
    '.sc-note{align-self:center;font-size:12px;color:#7a6f63;text-align:center}' +
    '.sc-chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:2px}' +
    '.sc-chip{border:1px solid var(--sc-color);color:var(--sc-color);background:#fff;border-radius:999px;padding:5px 11px;font-size:13px;cursor:pointer}' +
    '.sc-chip:hover{background:var(--sc-color);color:#fff}' +
    '.sc-typing{align-self:flex-start;color:#7a6f63;font-size:13px;padding:2px 6px}' +
    '.sc-form{display:flex;gap:8px;padding:10px;border-top:1px solid #e6e1da;background:#fff}' +
    '.sc-input{flex:1;border:1px solid #d6d0c8;border-radius:999px;padding:9px 14px;font:inherit;outline:none}' +
    '.sc-input:focus{border-color:var(--sc-color)}' +
    '.sc-send{border:0;background:var(--sc-color);color:#fff;border-radius:999px;padding:0 16px;font:inherit;font-weight:600;cursor:pointer}' +
    '.sc-send:disabled,.sc-input:disabled{opacity:.55;cursor:not-allowed}' +
    '@media(max-width:480px){.sc-panel{right:8px;bottom:84px;width:calc(100vw - 16px)}.sc-fab{right:12px;bottom:12px}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  var root = el('div', 'sc-root');
  var fab = el('button', 'sc-fab', '💬');
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Mở khung chat');

  var panel = el('div', 'sc-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', title);

  var head = el('div', 'sc-head');
  head.appendChild(el('span', '', title));
  var closeBtn = el('button', 'sc-close', '×');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Đóng khung chat');
  head.appendChild(closeBtn);

  var msgs = el('div', 'sc-msgs');
  msgs.setAttribute('aria-live', 'polite');

  var form = el('form', 'sc-form');
  var input = el('input', 'sc-input');
  input.type = 'text';
  input.placeholder = 'Nhập câu hỏi của bạn...';
  input.maxLength = 500;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Tin nhắn');
  var sendBtn = el('button', 'sc-send', 'Gửi');
  sendBtn.type = 'submit';
  form.appendChild(input);
  form.appendChild(sendBtn);

  panel.appendChild(head);
  panel.appendChild(msgs);
  panel.appendChild(form);
  root.appendChild(fab);
  root.appendChild(panel);
  document.body.appendChild(root);

  // ------------------------------------------------------------------ hiển thị --

  /** Hiển thị văn bản an toàn: chỉ dùng textContent, hỗ trợ **in đậm** và gạch đầu dòng. */
  function renderText(node, text) {
    text.split('\n').forEach(function (line, i) {
      if (i > 0) node.appendChild(document.createElement('br'));
      line = line.replace(/^\s*[-*]\s+/, '• ');
      line.split(/\*\*(.+?)\*\*/g).forEach(function (part, j) {
        if (!part) return;
        if (j % 2 === 1) node.appendChild(el('strong', '', part));
        else node.appendChild(document.createTextNode(part));
      });
    });
  }

  function scrollDown() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addMessage(role, text, extraClass) {
    var bubble = el('div', 'sc-msg ' + (role === 'user' ? 'sc-user' : 'sc-bot') + (extraClass ? ' ' + extraClass : ''));
    renderText(bubble, text);
    msgs.appendChild(bubble);
    scrollDown();
    return bubble;
  }

  function addNote(text) {
    msgs.appendChild(el('div', 'sc-note', text));
    scrollDown();
  }

  function saveHistory() {
    history = history.slice(-MAX_HISTORY);
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      /* bỏ qua nếu trình duyệt chặn storage */
    }
  }

  function showSuggestions() {
    var box = el('div', 'sc-chips');
    suggestions.forEach(function (s) {
      var chip = el('button', 'sc-chip', s);
      chip.type = 'button';
      chip.addEventListener('click', function () {
        box.remove();
        send(s);
      });
      box.appendChild(chip);
    });
    msgs.appendChild(box);
    scrollDown();
  }

  function setBusy(state) {
    busy = state;
    input.disabled = state;
    sendBtn.disabled = state;
  }

  // ------------------------------------------------------------------ gửi tin --

  function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;

    addMessage('user', text);
    history.push({ role: 'user', content: text });
    saveHistory();
    input.value = '';
    setBusy(true);

    var typing = el('div', 'sc-typing', 'Đang trả lời...');
    msgs.appendChild(typing);
    scrollDown();

    fetch(apiBase + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data && data.error ? data.error : 'Có lỗi xảy ra');
          return data;
        });
      })
      .then(function (data) {
        typing.remove();
        addMessage('assistant', data.reply);
        history.push({ role: 'assistant', content: data.reply });
        saveHistory();
        if (data.demo && !demoNoticeShown) {
          demoNoticeShown = true;
          addNote('Chế độ demo: chưa gắn API key AI, trả lời theo từ khóa.');
        }
      })
      .catch(function (err) {
        typing.remove();
        // Bỏ tin vừa gửi khỏi lịch sử để lần thử lại không bị trùng
        history.pop();
        saveHistory();
        var message = err instanceof TypeError ? 'Không kết nối được tới server chatbot.' : err.message;
        addMessage('assistant', message, 'sc-err');
      })
      .then(function () {
        setBusy(false);
        input.focus();
      });
  }

  // ------------------------------------------------------------------ sự kiện --

  function toggle(open) {
    panel.classList.toggle('sc-open', open);
    fab.textContent = open ? '×' : '💬';
    fab.setAttribute('aria-label', open ? 'Đóng khung chat' : 'Mở khung chat');
    if (open) input.focus();
  }

  fab.addEventListener('click', function () {
    toggle(!panel.classList.contains('sc-open'));
  });
  closeBtn.addEventListener('click', function () {
    toggle(false);
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    send(input.value);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') toggle(false);
  });

  // Khôi phục cuộc trò chuyện khi tải lại trang
  addMessage('assistant', greeting);
  if (history.length === 0) {
    showSuggestions();
  } else {
    history.forEach(function (m) {
      addMessage(m.role, m.content);
    });
  }
})();
