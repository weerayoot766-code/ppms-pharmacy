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
