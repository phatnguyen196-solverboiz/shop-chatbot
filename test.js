'use strict';

const assert = require('node:assert');
const { demoReply, sanitizeMessages, normalize } = require('./server.js');

console.log('--- Đang chạy test tự động ---');

// Test 1: normalize tiếng Việt
assert.strictEqual(normalize('Cà Phê Đậm Đà!'), 'ca phe dam da');
console.log('✓ Test normalize thành công');

// Test 2: demoReply từ khóa chính xác
const replyRobusta = demoReply('Giá robusta bao nhiêu?');
assert(replyRobusta.includes('120.000đ'), 'Phải có giá Robusta');
console.log('✓ Test demoReply (Robusta) thành công');

// Test 3: demoReply hỏi phí ship
const replyShip = demoReply('Có free ship không? Phí ship thế nào?');
assert(replyShip.includes('25.000đ'), 'Phải có thông tin phí ship');
console.log('✓ Test demoReply (Shipping) thành công');

// Test 4: sanitizeMessages
const validHistory = [
  { role: 'user', content: 'Chào bạn' },
  { role: 'assistant', content: 'Chào bạn! Mình giúp gì được?' },
  { role: 'user', content: 'Tư vấn cà phê' }
];
const sanitized = sanitizeMessages(validHistory);
assert.strictEqual(sanitized.length, 3);
assert.strictEqual(sanitized[0].role, 'user');
assert.strictEqual(sanitized[1].role, 'model');
assert.strictEqual(sanitized[2].role, 'user');
console.log('✓ Test sanitizeMessages thành công');

// Test 5: sanitizeMessages loại bỏ tin bot dư ở đầu/cuối
const invalidHistory = [
  { role: 'assistant', content: 'Lời chào' },
  { role: 'user', content: 'Tôi muốn mua hàng' },
  { role: 'assistant', content: 'Vâng ạ' }
];
assert.strictEqual(sanitizeMessages(invalidHistory), null, 'Phải kết thúc bằng role user');
console.log('✓ Test sanitizeMessages validation thành công');

console.log('\n🎉 TẤT CẢ TEST ĐỀU VƯỢT QUA!');
