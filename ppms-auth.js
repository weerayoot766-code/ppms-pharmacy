/**
 * PPMS — ยืนยันตัวตนทุกคำขอที่ส่งไป Apps Script
 * - แนบ token (ได้จากตอนล็อกอิน) ไปกับทุกคำขอ API อัตโนมัติ (ไม่ต้องแก้โค้ดเรียก API ในแต่ละหน้า)
 * - ถ้าหลังบ้านตอบว่า token หมดอายุ/ไม่ถูกต้อง (AUTH_REQUIRED) → ล้างการล็อกอินแล้วพาไปหน้าล็อกอินใหม่
 * ต้องโหลดไฟล์นี้ใน <head> ของทุกหน้า ก่อนสคริปต์อื่น
 */
(function () {
  var LOGIN_PAGE = 'login-mockup.html';
  var onLoginPage = /login-mockup\.html$/.test(location.pathname);
  var isIndex = /\/(index\.html)?$/.test(location.pathname);

  function readUser() {
    try { return JSON.parse(localStorage.getItem('ppms_user') || 'null'); } catch (e) { return null; }
  }
  function goLogin(reason) {
    try { localStorage.removeItem('ppms_user'); } catch (e) {}
    if (onLoginPage) return;
    if (window.__ppmsRedirecting) return;
    window.__ppmsRedirecting = true;
    location.href = LOGIN_PAGE + (reason ? '?reason=' + encodeURIComponent(reason) : '');
  }

  // ล็อกอินไว้ตั้งแต่ก่อนมีระบบ token หรือ token หมดอายุแล้ว → ให้ล็อกอินใหม่ทันที
  if (!onLoginPage && !isIndex) {
    var u = readUser();
    if (u && (!u.token || (u.tokenExpiresAt && Date.now() > Number(u.tokenExpiresAt)))) goLogin('expired');
  }

  var origFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url);
    if (!url || url.indexOf('script.google.com/macros/') === -1) return origFetch(input, init);
    var u = readUser();
    if (u && u.token) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'token=' + encodeURIComponent(u.token);
      input = url;
    }
    return origFetch(input, init).then(function (res) {
      // อ่านสำเนาของคำตอบ (ไม่กระทบโค้ดเดิมที่อ่านคำตอบต่อ) เพื่อตรวจว่า token ใช้ไม่ได้แล้วหรือยัง
      res.clone().text().then(function (txt) {
        if (txt && txt.indexOf('AUTH_REQUIRED') !== -1) goLogin('expired');
      }).catch(function () {});
      return res;
    });
  };
})();

// ================= ยิงบาร์โค้ดได้ทั้ง 2 ภาษา =================
// เครื่องยิงบาร์โค้ดทำงานเหมือนคีย์บอร์ด — ถ้าลืมสลับเป็นภาษาไทย จะได้ "ๅ/-ภถ..." แทนตัวเลข
// วิธีแยก: เครื่องยิงพิมพ์เร็วมาก (ห่างกันไม่ถึง ~50ms ต่อตัว) คนพิมพ์ไม่ได้ → ถ้ากด Enter หลังพิมพ์รัวๆ แบบนี้
// และข้อความเป็นแป้นไทย จะแปลงกลับเป็นตัวอักษรอังกฤษตามตำแหน่งแป้น (เกษมณี) ให้อัตโนมัติ · พิมพ์ชื่อยาไทยเองตามปกติไม่ถูกแปลง
(function () {
  var TH = {
    '_': '`', 'ๅ': '1', '/': '2', '-': '3', 'ภ': '4', 'ถ': '5', 'ุ': '6', 'ึ': '7', 'ค': '8', 'ต': '9', 'จ': '0', 'ข': '-', 'ช': '=',
    'ๆ': 'q', 'ไ': 'w', 'ำ': 'e', 'พ': 'r', 'ะ': 't', 'ั': 'y', 'ี': 'u', 'ร': 'i', 'น': 'o', 'ย': 'p', 'บ': '[', 'ล': ']', 'ฃ': '\\',
    'ฟ': 'a', 'ห': 's', 'ก': 'd', 'ด': 'f', 'เ': 'g', '้': 'h', '่': 'j', 'า': 'k', 'ส': 'l', 'ว': ';', 'ง': "'",
    'ผ': 'z', 'ป': 'x', 'แ': 'c', 'อ': 'v', 'ิ': 'b', 'ื': 'n', 'ท': 'm', 'ม': ',', 'ใ': '.', 'ฝ': '/',
    '%': '~', '+': '!', '๑': '@', '๒': '#', '๓': '$', '๔': '%', 'ู': '^', '฿': '&', '๕': '*', '๖': '(', '๗': ')', '๘': '_', '๙': '+',
    '๐': 'Q', '"': 'W', 'ฎ': 'E', 'ฑ': 'R', 'ธ': 'T', 'ํ': 'Y', '๊': 'U', 'ณ': 'I', 'ฯ': 'O', 'ญ': 'P', 'ฐ': '{', ',': '}', 'ฅ': '|',
    'ฤ': 'A', 'ฆ': 'S', 'ฏ': 'D', 'โ': 'F', 'ฌ': 'G', '็': 'H', '๋': 'J', 'ษ': 'K', 'ศ': 'L', 'ซ': ':', '.': '"',
    '(': 'Z', ')': 'X', 'ฉ': 'C', 'ฮ': 'V', 'ฺ': 'B', '์': 'N', '?': 'M', 'ฒ': '<', 'ฬ': '>', 'ฦ': '?'
  };
  var THAI_CHAR = /[฀-๿]/;
  /** แปลงข้อความที่พิมพ์ด้วยแป้นไทย กลับเป็นตัวอักษรอังกฤษ — คืน null ถ้าไม่ใช่บาร์โค้ด */
  function thaiKeysToBarcode(s) {
    s = String(s || '').trim();
    if (!s) return null;
    var hasTh = THAI_CHAR.test(s) || /^[\/\-]+$/.test(s); // "/-" ล้วน = เลข 2,3 ที่ยิงตอนเป็นแป้นไทย
    if (!hasTh) return null;
    var out = '';
    for (var i = 0; i < s.length; i++) out += (TH[s[i]] !== undefined ? TH[s[i]] : s[i]);
    return /^[0-9A-Za-z\-]{4,}$/.test(out) && /[0-9]/.test(out) ? out : null;
  }
  window.ppmsThaiKeysToBarcode = thaiKeysToBarcode;

  var burst = new WeakMap(); // ช่องพิมพ์ → {n: จำนวนตัวที่พิมพ์รัวๆ ต่อเนื่อง, t: เวลาล่าสุด}
  function isTextInput(el) {
    return el && (el.tagName === 'INPUT' && /^(text|search|tel|number|)$/i.test(el.type || '') || el.tagName === 'TEXTAREA');
  }
  document.addEventListener('input', function (e) {
    var el = e.target; if (!isTextInput(el) || e.ppmsBarcodeFix) return;
    var now = performance.now(), b = burst.get(el);
    if (!b || now - b.t > 60) b = { n: 0, t: now }; // เว้นช่วงนานกว่า 60ms = เริ่มนับใหม่ (คนพิมพ์)
    b.n++; b.t = now;
    burst.set(el, b);
  }, true);
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var el = e.target; if (!isTextInput(el)) return;
    var b = burst.get(el);
    burst.delete(el);
    if (!b || b.n < 4 || performance.now() - b.t > 300) return; // ไม่ได้มาจากเครื่องยิง
    var fixed = thaiKeysToBarcode(el.value);
    if (!fixed || fixed === el.value) return;
    el.value = fixed;
    var ev; try { ev = new Event('input', { bubbles: true }); } catch (x) { ev = document.createEvent('Event'); ev.initEvent('input', true, true); }
    ev.ppmsBarcodeFix = true;
    el.dispatchEvent(ev);
  }, true);
})();
