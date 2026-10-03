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
  if (!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) color = '#8b5a2b';
  var suggestions = ['Có những sản phẩm nào?', 'Phí ship thế nào?', 'Chính sách đổi trả?'];

  var STORAGE_KEY = 'shopchat_history_v1:' + apiBase;
  var MAX_HISTORY = 12;
  var history = [];
  var busy = false;
  var demoNoticeShown = false;

  try {
    history = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(history)) history = [];
    history = history.filter(function (m) {
      return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string';
    }).slice(-MAX_HISTORY);
  } catch (e) {
    history = [];
  }

  // ----------------------------------------------------------------- giao diện --

  var css =
    '.sc-root{--sc-color:' + color + ';font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;font-size:15px;line-height:1.5;color:#111827}' +
    '.sc-root *{box-sizing:border-box}' +
    '.sc-fab{position:fixed;right:24px;bottom:24px;width:64px;height:64px;border-radius:50%;border:0;background:var(--sc-color);color:#fff;cursor:pointer;box-shadow:0 10px 25px -5px rgba(0,0,0,0.2),0 8px 10px -6px rgba(0,0,0,0.1);font-size:28px;z-index:2147483000;transition:all 0.3s cubic-bezier(0.4,0,0.2,1); display:flex; align-items:center; justify-content:center}' +
    '.sc-fab:hover{transform:scale(1.1) translateY(-2px); box-shadow:0 20px 25px -5px rgba(0,0,0,0.2),0 8px 10px -6px rgba(0,0,0,0.1)}' +
    '.sc-fab svg {width:32px; height:32px; fill:currentColor; transition: transform 0.3s ease}' +
    '.sc-panel.sc-open + .sc-fab svg {transform: rotate(90deg)}' +
    '.sc-panel{position:fixed;right:24px;bottom:104px;width:380px;max-width:calc(100vw - 32px);height:600px;max-height:calc(100vh - 128px);background:#fff;border-radius:20px;box-shadow:0 20px 40px -10px rgba(0,0,0,0.2),0 0 20px rgba(0,0,0,0.05);display:flex;flex-direction:column;overflow:hidden;z-index:2147483000; opacity:0; transform:translateY(20px); pointer-events:none; transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.1)}' +
    '.sc-panel.sc-open{opacity:1; transform:translateY(0); pointer-events:auto;}' +
    '.sc-head{background:var(--sc-color);color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;font-weight:600; box-shadow:0 2px 5px rgba(0,0,0,0.1); position:relative; z-index:2}' +
    '.sc-bot-info{display:flex; align-items:center; gap:12px}' +
    '.sc-avatar{width:40px; height:40px; background:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; position:relative}' +
    '.sc-status{position:absolute; bottom:0; right:0; width:12px; height:12px; background:#10b981; border:2px solid var(--sc-color); border-radius:50%}' +
    '.sc-title-wrap{display:flex; flex-direction:column; line-height:1.2}' +
    '.sc-title{font-size:16px; font-weight:600}' +
    '.sc-subtitle{font-size:12px; font-weight:400; opacity:0.9}' +
    '.sc-close{background:none;border:0;color:#fff;font-size:28px;cursor:pointer;line-height:1; padding:0; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:background 0.2s}' +
    '.sc-close:hover{background:rgba(255,255,255,0.2)}' +
    '.sc-msgs{flex:1;overflow-y:auto;padding:20px;background:#f9fafb;display:flex;flex-direction:column;gap:16px; scroll-behavior:smooth}' +
    '.sc-msg{max-width:85%;padding:12px 16px;border-radius:18px;white-space:pre-wrap;word-wrap:break-word; position:relative; font-size:15px; box-shadow:0 1px 2px rgba(0,0,0,0.05)}' +
    '.sc-bot{align-self:flex-start;background:#fff;border:1px solid #e5e7eb;border-bottom-left-radius:4px; color:#1f2937}' +
    '.sc-user{align-self:flex-end;background:var(--sc-color);color:#fff;border-bottom-right-radius:4px}' +
    '.sc-err{align-self:flex-start;background:#fef2f2;color:#991b1b;border:1px solid #fecaca}' +
    '.sc-note{align-self:center;font-size:12px;color:#6b7280;text-align:center; background:rgba(0,0,0,0.05); padding:4px 12px; border-radius:999px; margin:8px 0}' +
    '.sc-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}' +
    '.sc-chip{border:1px solid var(--sc-color);color:var(--sc-color);background:#fff;border-radius:999px;padding:8px 16px;font-size:14px;font-weight:500;cursor:pointer; transition:all 0.2s}' +
    '.sc-chip:hover{background:var(--sc-color);color:#fff}' +
    '.sc-typing{align-self:flex-start;background:#fff;border:1px solid #e5e7eb;border-bottom-left-radius:4px; padding:16px; border-radius:18px; display:flex; gap:4px; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.05)}' +
    '.sc-dot{width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:sc-bounce 1.4s infinite ease-in-out both}' +
    '.sc-dot:nth-child(1){animation-delay:-0.32s}.sc-dot:nth-child(2){animation-delay:-0.16s}' +
    '@keyframes sc-bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}' +
    '.sc-form{display:flex;gap:12px;padding:16px;border-top:1px solid #e5e7eb;background:#fff; align-items:center}' +
    '.sc-input{flex:1;border:1px solid #d1d5db;border-radius:999px;padding:12px 18px;font:inherit;outline:none; transition:border-color 0.2s, box-shadow 0.2s; font-size:15px; background:#f9fafb}' +
    '.sc-input:focus{border-color:var(--sc-color); background:#fff; box-shadow:0 0 0 3px rgba(0,0,0,0.05)}' +
    '.sc-send{border:0;background:var(--sc-color);color:#fff;border-radius:50%;width:44px;height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer; transition:transform 0.2s, background 0.2s; padding:0}' +
    '.sc-send:hover:not(:disabled){transform:scale(1.05)}' +
    '.sc-send svg{width:20px; height:20px; fill:currentColor; margin-left:2px}' +
    '.sc-send:disabled,.sc-input:disabled{opacity:0.5;cursor:not-allowed}' +
    '@media(max-width:480px){.sc-panel{right:16px;left:16px;bottom:92px;width:auto;height:calc(100dvh - 112px);max-height:calc(100dvh - 112px)}.sc-fab{right:16px;bottom:16px}}' +
    '@media(prefers-reduced-motion:reduce){.sc-root *{animation-duration:0.01ms!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}}';

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
  var fab = el('button', 'sc-fab');
  fab.innerHTML = '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Mở khung chat');
  fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-controls', 'sc-chat-panel');

  var panel = el('div', 'sc-panel');
  panel.id = 'sc-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', title);
  panel.inert = true;

  var head = el('div', 'sc-head');
  var botInfo = el('div', 'sc-bot-info');
  var avatar = el('div', 'sc-avatar', '☕');
  avatar.appendChild(el('div', 'sc-status'));
  var titleWrap = el('div', 'sc-title-wrap');
  titleWrap.appendChild(el('span', 'sc-title', title));
  titleWrap.appendChild(el('span', 'sc-subtitle', 'Đang hoạt động'));
  botInfo.appendChild(avatar);
  botInfo.appendChild(titleWrap);
  head.appendChild(botInfo);
  
  var closeBtn = el('button', 'sc-close');
  closeBtn.innerHTML = '×';
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Đóng khung chat');
  head.appendChild(closeBtn);

  var msgs = el('div', 'sc-msgs');
  msgs.setAttribute('aria-live', 'polite');
  msgs.setAttribute('aria-relevant', 'additions');

  var form = el('form', 'sc-form');
  var input = el('input', 'sc-input');
  input.type = 'text';
  input.placeholder = 'Nhập tin nhắn...';
  input.maxLength = 500;
  input.autocomplete = 'off';
  input.setAttribute('aria-label', 'Tin nhắn');
  
  var sendBtn = el('button', 'sc-send');
  sendBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  sendBtn.type = 'submit';
  sendBtn.setAttribute('aria-label', 'Gửi');
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

    var userBubble = addMessage('user', text);
    history.push({ role: 'user', content: text });
    saveHistory();
    input.value = '';
    setBusy(true);

    var typing = el('div', 'sc-typing');
    typing.appendChild(el('div', 'sc-dot'));
    typing.appendChild(el('div', 'sc-dot'));
    typing.appendChild(el('div', 'sc-dot'));
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
        // Khôi phục nội dung để khách sửa hoặc gửi lại sau khi lỗi.
        history.pop();
        saveHistory();
        userBubble.remove();
        input.value = text;
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
    panel.inert = !open;
    fab.setAttribute('aria-label', open ? 'Đóng khung chat' : 'Mở khung chat');
    fab.setAttribute('aria-expanded', String(open));
    if (open) input.focus();
    else fab.focus();
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
    if (e.key === 'Escape' && panel.classList.contains('sc-open')) toggle(false);
  });
  document.addEventListener('shopchat:open', function (e) {
    toggle(true);
    if (e.detail && typeof e.detail.question === 'string') {
      input.value = e.detail.question.slice(0, input.maxLength);
      input.focus();
    }
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
