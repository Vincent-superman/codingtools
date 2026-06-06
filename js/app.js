/* ============================================================
   DevTools - Application Logic
   ============================================================ */

(function () {
  'use strict';

  var toolInited = {};

  // ============================================================
  // ROUTING
  // ============================================================

  function navigate(hash) {
    const name = (hash || location.hash || '#home').replace('#', '') || 'home';

    // Update active section
    document.querySelectorAll('.tool-section').forEach(function (s) {
      s.classList.toggle('active', s.id === name);
    });

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-nav') === name);
    });

    // Scroll to top
    document.querySelector('.main').scrollTop = 0;
    window.scrollTo(0, 0);

    // Close sidebar on mobile
    closeSidebar();

    // Init tool-specific logic
    initTool(name);
  }

  window.addEventListener('hashchange', function () {
    navigate(location.hash);
  });

  // Sidebar clicks
  document.querySelectorAll('.nav-item, .tool-card, .sidebar-logo').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var nav = this.getAttribute('data-nav');
      if (nav) {
        e.preventDefault();
        location.hash = nav;
      }
    });
  });

  // Mobile sidebar
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  var menuToggle = document.getElementById('menuToggle');

  menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', closeSidebar);

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  }

  // Initial route
  navigate();

  // ============================================================
  // TOAST UTILITY
  // ============================================================

  function showToast(msg, type) {
    var toast = document.createElement('div');
    toast.className = 'toast ' + (type || '');
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 2000);
  }

  // ============================================================
  // COPY UTILITY
  // ============================================================

  function copyToClipboard(text, label) {
    if (!text) { showToast('没有可复制的内容', 'error'); return; }
    navigator.clipboard.writeText(text).then(function () {
      showToast((label || '内容') + ' 已复制到剪贴板', 'success');
    }).catch(function () {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast((label || '内容') + ' 已复制到剪贴板', 'success');
    });
  }

  // ============================================================
  // TOOL INITIALIZATION
  // ============================================================

  function initTool(name) {
    if (toolInited[name]) return;
    toolInited[name] = true;

    switch (name) {
      case 'json-formatter': initJsonFormatter(); break;
      case 'json-convert': initJsonConvert(); break;
      case 'yaml-json': initYamlJson(); break;
      case 'xml-json': initXmlJson(); break;
      case 'sql-format': initSqlFormat(); break;
      case 'base64-text': initBase64Text(); break;
      case 'base64-image': initBase64Image(); break;
      case 'base64-decode-img': initBase64Decode(); break;
      case 'qrcode-gen': initQrcodeGen(); break;
      case 'qrcode-decode': initQrcodeDecode(); break;
      case 'url-encode': initUrlEncode(); break;
      case 'html-entity': initHtmlEntity(); break;
      case 'unicode': initUnicode(); break;
      case 'aes-crypt': initAesCrypt(); break;
      case 'uuid-gen': initUuidGen(); break;
      case 'hash-gen': initHashGen(); break;
      case 'password-gen': initPasswordGen(); break;
      case 'lorem-gen': initLoremGen(); break;
      case 'regex-tester': initRegexTester(); break;
      case 'text-diff': initTextDiff(); break;
      case 'markdown': initMarkdown(); break;
      case 'case-convert': initCaseConvert(); break;
      case 'text-stats': initTextStats(); break;
      case 'timestamp': initTimestamp(); break;
      case 'cron-parse': initCronParse(); break;
      case 'color': initColor(); break;
      case 'css-gradient': initCssGradient(); break;
      case 'number-base': initNumberBase(); break;
      case 'jwt-decode': initJwtDecode(); break;
      case 'http-status': initHttpStatus(); break;
    }
  }

  // ============================================================
  // JSON FORMATTER
  // ============================================================

  function initJsonFormatter() {
    var input = document.getElementById('jsonInput');
    var output = document.getElementById('jsonOutput');
    var stats = document.getElementById('jsonStats');

    document.getElementById('jsonFormat').addEventListener('click', function () {
      try {
        var obj = JSON.parse(input.value);
        var formatted = JSON.stringify(obj, null, 2);
        output.className = 'result-area json-tree';
        output.textContent = formatted;
        highlightJson(output);
        updateJsonStats(obj);
        stats.style.display = 'flex';
      } catch (e) {
        output.className = 'result-area';
        output.textContent = 'JSON 解析错误: ' + e.message;
        output.style.color = 'var(--accent-red)';
        stats.style.display = 'none';
      }
    });

    document.getElementById('jsonCompress').addEventListener('click', function () {
      try {
        var obj = JSON.parse(input.value);
        var compressed = JSON.stringify(obj);
        output.className = 'result-area';
        output.textContent = compressed;
        output.style.color = 'var(--text-primary)';
        updateJsonStats(obj);
        stats.style.display = 'flex';
      } catch (e) {
        output.className = 'result-area';
        output.textContent = 'JSON 解析错误: ' + e.message;
        output.style.color = 'var(--accent-red)';
        stats.style.display = 'none';
      }
    });

    document.getElementById('jsonValidate').addEventListener('click', function () {
      try {
        var obj = JSON.parse(input.value);
        output.className = 'result-area';
        output.innerHTML = '<span style="color:var(--accent-green);">✓ 有效的 JSON</span>';
        output.style.color = '';
        updateJsonStats(obj);
        stats.style.display = 'flex';
      } catch (e) {
        output.className = 'result-area';
        output.innerHTML = '<span style="color:var(--accent-red);">✗ 无效的 JSON: ' + escapeHtml(e.message) + '</span>';
        output.style.color = '';
        stats.style.display = 'none';
      }
    });

    document.getElementById('jsonClear').addEventListener('click', function () {
      input.value = '';
      output.className = 'result-area empty';
      output.textContent = '等待输入...';
      output.style.color = '';
      stats.style.display = 'none';
    });

    document.getElementById('jsonCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, 'JSON');
    });

    function updateJsonStats(obj) {
      var text = JSON.stringify(obj);
      stats.innerHTML =
        '<span>类型: ' + (Array.isArray(obj) ? 'Array' : typeof obj) + '</span>' +
        '<span>大小: ' + (new Blob([text]).size) + ' bytes</span>' +
        '<span>字符数: ' + text.length + '</span>';
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function highlightJson(el) {
    var text = el.textContent;
    var highlighted = text.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
    el.innerHTML = highlighted;
  }

  // ============================================================
  // JSON CONVERT (Serialize / Deserialize)
  // ============================================================

  function initJsonConvert() {
    var objInput = document.getElementById('jsonObjInput');
    var strInput = document.getElementById('jsonStrInput');

    document.getElementById('jsonSerialize').addEventListener('click', function () {
      try {
        var obj = (new Function('return (' + objInput.value + ')'))();
        strInput.value = JSON.stringify(obj, null, 2);
        showToast('序列化成功', 'success');
      } catch (e) {
        strInput.value = '错误: ' + e.message;
      }
    });

    document.getElementById('jsonEscape').addEventListener('click', function () {
      strInput.value = JSON.stringify(objInput.value);
    });

    document.getElementById('jsonDeserialize').addEventListener('click', function () {
      try {
        var obj = JSON.parse(strInput.value);
        objInput.value = JSON.stringify(obj, null, 2);
        showToast('反序列化成功', 'success');
      } catch (e) {
        objInput.value = '错误: ' + e.message;
      }
    });

    document.getElementById('jsonUnescape').addEventListener('click', function () {
      try {
        objInput.value = JSON.parse(strInput.value);
      } catch (e) {
        var s = strInput.value;
        try { objInput.value = JSON.parse(s); } catch (e2) {
          objInput.value = '错误: 无法反转义';
        }
      }
    });
  }

  // ============================================================
  // BASE64 IMAGE GENERATOR
  // ============================================================

  function initBase64Image() {
    var fileInput = document.getElementById('base64FileInput');
    var preview = document.getElementById('base64Preview');
    var output = document.getElementById('base64Output');

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;

      var reader = new FileReader();
      reader.onload = function (e) {
        var base64 = e.target.result;
        output.value = base64;

        preview.innerHTML = '<img src="' + base64 + '" alt="Preview" style="max-width:100%;max-height:400px;border-radius:8px;">';
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('base64Copy').addEventListener('click', function () {
      copyToClipboard(output.value, 'Base64');
    });

    document.getElementById('base64Download').addEventListener('click', function () {
      if (!output.value) { showToast('请先选择图片', 'error'); return; }
      var blob = new Blob([output.value], { type: 'text/plain' });
      downloadBlob(blob, 'base64-image.txt');
    });
  }

  // ============================================================
  // BASE64 DECODE TO IMAGE
  // ============================================================

  function initBase64Decode() {
    var input = document.getElementById('base64DecodeInput');
    var preview = document.getElementById('base64DecodePreview');
    var actions = document.getElementById('base64DecodeImgActions');
    var error = document.getElementById('base64DecodeError');
    var currentSrc = null;

    document.getElementById('base64DecodeBtn').addEventListener('click', function () {
      error.style.display = 'none';
      actions.style.display = 'none';
      preview.innerHTML = '<span style="color:var(--text-tertiary);">还原后的图片将显示在此处</span>';

      var val = input.value.trim();
      if (!val) {
        error.textContent = '请输入 Base64 字符串';
        error.style.display = 'block';
        return;
      }

      // Ensure it has data URI prefix
      var src = val;
      if (!/^data:image\//i.test(src)) {
        // Try to detect image type from base64 header
        var mime = 'image/png';
        if (/^\/9j\//.test(src)) mime = 'image/jpeg';
        else if (/^R0lGOD/.test(src)) mime = 'image/gif';
        else if (/^iVBOR/.test(src)) mime = 'image/png';
        else if (/^UklGR/.test(src)) mime = 'image/webp';
        src = 'data:' + mime + ';base64,' + src;
      }

      // Clean the string - extract just the base64 portion
      var match = src.match(/^data:image\/\w+;base64,(.+)$/i);
      if (!match) {
        error.textContent = '无效的 Base64 图片格式';
        error.style.display = 'block';
        return;
      }

      currentSrc = src;
      preview.innerHTML = '<img src="' + src + '" alt="Decoded" style="max-width:100%;max-height:400px;border-radius:8px;" onerror="this.onerror=null;this.parentElement.innerHTML=\'<span style=color:var(--accent-red);>无法渲染图片，请检查 Base64 字符串</span>\';">';
      actions.style.display = 'flex';
    });

    document.getElementById('base64DecodeClear').addEventListener('click', function () {
      input.value = '';
      preview.innerHTML = '<span style="color:var(--text-tertiary);">还原后的图片将显示在此处</span>';
      actions.style.display = 'none';
      error.style.display = 'none';
      currentSrc = null;
    });

    document.getElementById('base64DecodeDownload').addEventListener('click', function () {
      if (!currentSrc) return;
      var a = document.createElement('a');
      a.href = currentSrc;
      a.download = 'decoded-image.' + getImageExt(currentSrc);
      a.click();
    });
  }

  function getImageExt(dataUri) {
    var m = dataUri.match(/^data:image\/(\w+)/i);
    return m ? m[1] : 'png';
  }

  // ============================================================
  // QRCODE GENERATOR
  // ============================================================

  function initQrcodeGen() {
    var container = document.getElementById('qrContainer');
    var actions = document.getElementById('qrActions');
    var sizeEl = document.getElementById('qrSize');
    var sizeVal = document.getElementById('qrSizeVal');
    var currentDataUrl = null;

    sizeEl.addEventListener('input', function () {
      sizeVal.textContent = this.value + 'px';
    });

    document.getElementById('qrGenerate').addEventListener('click', function () {
      var text = document.getElementById('qrText').value.trim();
      var size = parseInt(sizeEl.value);
      var fg = document.getElementById('qrFg').value;
      var bg = document.getElementById('qrBg').value;

      if (!text) { showToast('请输入文本或链接', 'error'); return; }

      container.innerHTML = '';
      actions.style.display = 'none';

      var canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: { dark: fg, light: bg }
      }, function (err) {
        if (err) {
          container.innerHTML = '<span style="color:var(--accent-red);">生成失败: ' + err.message + '</span>';
          return;
        }
        container.appendChild(canvas);
        currentDataUrl = canvas.toDataURL('image/png');
        actions.style.display = 'flex';
      });
    });

    document.getElementById('qrDownload').addEventListener('click', function () {
      if (!currentDataUrl) return;
      var a = document.createElement('a');
      a.href = currentDataUrl;
      a.download = 'qrcode.png';
      a.click();
    });
  }

  // ============================================================
  // QRCODE DECODER
  // ============================================================

  function initQrcodeDecode() {
    var fileInput = document.getElementById('qrDecodeFile');
    var urlInput = document.getElementById('qrDecodeUrl');
    var preview = document.getElementById('qrDecodePreview');
    var result = document.getElementById('qrDecodeResult');

    function decodeImage(img) {
      preview.innerHTML = '';
      var clone = img.cloneNode(true);
      clone.style.maxWidth = '100%';
      clone.style.maxHeight = '300px';
      clone.style.borderRadius = '8px';
      preview.appendChild(clone);

      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');

      // Wait for image to be available in DOM
      var w = img.naturalWidth || img.width;
      var h = img.naturalHeight || img.height;

      if (w === 0 || h === 0) {
        // Try again after a short delay
        setTimeout(function () {
          var w2 = img.naturalWidth || img.width;
          var h2 = img.naturalHeight || img.height;
          canvas.width = w2;
          canvas.height = h2;
          ctx.drawImage(img, 0, 0);
          doDecode(canvas, ctx);
        }, 300);
        return;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0);
      doDecode(canvas, ctx);
    }

    function doDecode(canvas, ctx) {
      var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      var code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        result.value = code.data;
        showToast('解码成功', 'success');
      } else {
        result.value = '';
        showToast('未检测到二维码，请确认图片清晰度', 'error');
      }
    }

    fileInput.addEventListener('change', function () {
      var file = fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () { decodeImage(img); };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('qrDecodeUrlBtn').addEventListener('click', function () {
      var url = urlInput.value.trim();
      if (!url) { showToast('请输入图片 URL', 'error'); return; }
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { decodeImage(img); };
      img.onerror = function () { showToast('加载图片失败，请检查 URL', 'error'); };
      img.src = url;
    });
  }

  // ============================================================
  // URL ENCODE / DECODE
  // ============================================================

  function initUrlEncode() {
    var raw = document.getElementById('urlRaw');
    var encoded = document.getElementById('urlEncoded');

    document.getElementById('urlEncodeBtn').addEventListener('click', function () {
      try {
        encoded.value = encodeURIComponent(raw.value);
      } catch (e) {
        encoded.value = '编码错误: ' + e.message;
      }
    });

    document.getElementById('urlDecodeBtn').addEventListener('click', function () {
      try {
        raw.value = decodeURIComponent(encoded.value);
      } catch (e) {
        raw.value = '解码错误: ' + e.message;
      }
    });
  }

  // ============================================================
  // HTML ENTITY ENCODE / DECODE
  // ============================================================

  function initHtmlEntity() {
    var raw = document.getElementById('htmlRaw');
    var encoded = document.getElementById('htmlEncoded');

    document.getElementById('htmlEncodeBtn').addEventListener('click', function () {
      var div = document.createElement('div');
      div.textContent = raw.value;
      encoded.value = div.innerHTML;
    });

    document.getElementById('htmlDecodeBtn').addEventListener('click', function () {
      var div = document.createElement('div');
      div.innerHTML = encoded.value;
      raw.value = div.textContent;
    });
  }

  // ============================================================
  // UNICODE ENCODE / DECODE
  // ============================================================

  function initUnicode() {
    var raw = document.getElementById('unicodeRaw');
    var encoded = document.getElementById('unicodeEncoded');

    document.getElementById('unicodeEncodeBtn').addEventListener('click', function () {
      var result = '';
      for (var i = 0; i < raw.value.length; i++) {
        var code = raw.value.charCodeAt(i);
        if (code > 127) {
          result += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          result += raw.value[i];
        }
      }
      encoded.value = result;
    });

    document.getElementById('unicodeDecodeBtn').addEventListener('click', function () {
      try {
        raw.value = encoded.value.replace(/\\u([0-9a-fA-F]{4})/g, function (_, hex) {
          return String.fromCharCode(parseInt(hex, 16));
        });
      } catch (e) {
        raw.value = '解码错误: ' + e.message;
      }
    });
  }

  // ============================================================
  // UUID GENERATOR
  // ============================================================

  function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      var v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function formatUuid(uuid, fmt) {
    switch (fmt) {
      case 'upper': return uuid.toUpperCase();
      case 'compact': return uuid.replace(/-/g, '');
      default: return uuid;
    }
  }

  function initUuidGen() {
    var output = document.getElementById('uuidOutput');
    var fmtSelect = document.getElementById('uuidFormat');

    function generateOne() {
      var fmt = fmtSelect.value;
      output.className = 'result-area';
      output.textContent = formatUuid(uuidv4(), fmt);
    }

    document.getElementById('uuidGenerate').addEventListener('click', generateOne);

    document.getElementById('uuidBatch10').addEventListener('click', function () {
      var fmt = fmtSelect.value;
      var uuids = [];
      for (var i = 0; i < 10; i++) {
        uuids.push(formatUuid(uuidv4(), fmt));
      }
      output.className = 'result-area';
      output.textContent = uuids.join('\n');
    });

    document.getElementById('uuidCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, 'UUID');
    });
  }

  // ============================================================
  // HASH GENERATOR
  // ============================================================

  function initHashGen() {
    var input = document.getElementById('hashInput');
    var output = document.getElementById('hashOutput');
    var label = document.getElementById('hashAlgoLabel');
    var currentAlgo = 'MD5';

    var algoMap = {
      'MD5': CryptoJS.MD5,
      'SHA-1': CryptoJS.SHA1,
      'SHA-256': CryptoJS.SHA256,
      'SHA-512': CryptoJS.SHA512
    };

    function compute() {
      var val = input.value;
      if (!val) {
        output.textContent = '等待输入...';
        return;
      }
      var hash = algoMap[currentAlgo](val).toString();
      output.textContent = hash;
    }

    input.addEventListener('input', compute);

    document.querySelectorAll('.hash-algo').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.hash-algo').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentAlgo = this.getAttribute('data-algo');
        label.textContent = currentAlgo;
        compute();
      });
    });

    document.getElementById('hashCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, 'Hash');
    });
  }

  // ============================================================
  // PASSWORD GENERATOR
  // ============================================================

  function initPasswordGen() {
    var lenEl = document.getElementById('pwdLen');
    var lenVal = document.getElementById('pwdLenVal');
    var output = document.getElementById('pwdOutput');
    var strength = document.getElementById('pwdStrength');

    lenEl.addEventListener('input', function () {
      lenVal.textContent = this.value;
    });

    document.getElementById('pwdGenerate').addEventListener('click', function () {
      var len = parseInt(lenEl.value);
      var chars = '';
      if (document.getElementById('pwdLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (document.getElementById('pwdUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (document.getElementById('pwdDigits').checked) chars += '0123456789';
      if (document.getElementById('pwdSymbols').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!chars) { showToast('请至少选择一种字符集', 'error'); return; }

      var array = new Uint32Array(len);
      crypto.getRandomValues(array);
      var pwd = '';
      for (var i = 0; i < len; i++) {
        pwd += chars[array[i] % chars.length];
      }

      output.value = pwd;

      // Strength assessment
      var entropy = chars.length;
      var bits = Math.log2(Math.pow(entropy, len));
      var level, color;
      if (bits < 40) { level = '弱'; color = 'var(--accent-red)'; }
      else if (bits < 80) { level = '中等'; color = 'var(--accent-orange)'; }
      else if (bits < 120) { level = '强'; color = 'var(--accent-green)'; }
      else { level = '非常强'; color = 'var(--accent-cyan)'; }
      strength.innerHTML = '<span>熵值: ' + Math.round(bits) + ' bits</span><span style="color:' + color + ';">强度: ' + level + '</span>';
    });

    document.getElementById('pwdCopy').addEventListener('click', function () {
      copyToClipboard(output.value, '密码');
    });
  }

  // ============================================================
  // REGEX TESTER
  // ============================================================

  function initRegexTester() {
    var patternEl = document.getElementById('regexPattern');
    var flagsEl = document.getElementById('regexFlags');
    var textEl = document.getElementById('regexText');
    var resultEl = document.getElementById('regexResult');

    function test() {
      var pattern = patternEl.value.trim();
      var text = textEl.value;
      var flags = flagsEl.value;

      if (!pattern) {
        resultEl.className = 'result-area empty';
        resultEl.innerHTML = '输入正则和文本后自动匹配...';
        return;
      }

      // Strip leading/trailing slashes if present
      if (/^\/.*\/[a-z]*$/.test(pattern)) {
        var match = pattern.match(/^\/(.*)\/([a-z]*)$/);
        if (match) {
          pattern = match[1];
          if (match[2] && !flags) flags = match[2];
        }
      }

      try {
        var re = new RegExp(pattern, flags);
        var matches = [];
        var m;
        var hasGlobal = flags.indexOf('g') !== -1;

        if (hasGlobal) {
          while ((m = re.exec(text)) !== null) {
            matches.push({
              index: m.index,
              text: m[0],
              groups: m.length > 1 ? Array.prototype.slice.call(m, 1) : []
            });
            if (!re.lastIndex) break; // Prevent infinite loop
          }
        } else {
          m = re.exec(text);
          if (m) {
            matches.push({
              index: m.index,
              text: m[0],
              groups: m.length > 1 ? Array.prototype.slice.call(m, 1) : []
            });
          }
        }

        resultEl.className = 'result-area';
        if (matches.length === 0) {
          resultEl.innerHTML = '<span style="color:var(--text-secondary);">未找到匹配</span>';
        } else {
          // Highlight matches in text
          var highlighted = '';
          var lastIdx = 0;
          var matchPositions = [];
          for (var i = 0; i < matches.length; i++) {
            matchPositions.push({ start: matches[i].index, end: matches[i].index + matches[i].text.length });
          }
          // Merge overlapping
          matchPositions.sort(function (a, b) { return a.start - b.start; });
          var merged = [];
          for (var i = 0; i < matchPositions.length; i++) {
            if (merged.length === 0 || matchPositions[i].start > merged[merged.length - 1].end) {
              merged.push(matchPositions[i]);
            } else {
              merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, matchPositions[i].end);
            }
          }
          for (var i = 0; i < merged.length; i++) {
            highlighted += escapeHtml(text.slice(lastIdx, merged[i].start));
            highlighted += '<mark style="background:rgba(88,166,255,0.25);color:#e6edf3;border-radius:2px;padding:0 1px;">' + escapeHtml(text.slice(merged[i].start, merged[i].end)) + '</mark>';
            lastIdx = merged[i].end;
          }
          highlighted += escapeHtml(text.slice(lastIdx));
          resultEl.innerHTML = highlighted;

          resultEl.innerHTML += '<hr style="border-color:var(--border-primary);margin:12px 0;">';
          resultEl.innerHTML += '<div style="color:var(--text-secondary);font-size:12px;">找到 ' + matches.length + ' 个匹配</div>';
          if (matches.length <= 20) {
            for (var i = 0; i < matches.length; i++) {
              resultEl.innerHTML += '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">[' + i + '] 位置 ' + matches[i].index + ': "' + escapeHtml(matches[i].text) + '"</div>';
            }
          }
        }
      } catch (e) {
        resultEl.className = 'result-area';
        resultEl.innerHTML = '<span style="color:var(--accent-red);">正则错误: ' + escapeHtml(e.message) + '</span>';
      }
    }

    patternEl.addEventListener('input', test);
    flagsEl.addEventListener('change', test);
    textEl.addEventListener('input', test);
  }

  // ============================================================
  // TEXT DIFF
  // ============================================================

  function initTextDiff() {
    document.getElementById('diffCompare').addEventListener('click', function () {
      var oldText = document.getElementById('diffOld').value;
      var newText = document.getElementById('diffNew').value;
      var output = document.getElementById('diffOutput');

      if (!oldText && !newText) {
        output.className = 'result-area empty';
        output.textContent = '请输入文本后再对比...';
        return;
      }

      var changes = Diff.diffLines(oldText, newText);
      output.className = 'result-area';
      output.style.padding = '0';

      var html = '';
      var addedCount = 0, removedCount = 0;
      for (var i = 0; i < changes.length; i++) {
        var ch = changes[i];
        var text = escapeHtml(ch.value);
        if (ch.added) {
          html += '<div class="diff-line diff-added">+ ' + text.replace(/\n$/, '') + '</div>';
          addedCount += ch.count || (text.match(/\n/g) || []).length;
        } else if (ch.removed) {
          html += '<div class="diff-line diff-removed">- ' + text.replace(/\n$/, '') + '</div>';
          removedCount += ch.count || (text.match(/\n/g) || []).length;
        } else {
          html += '<div class="diff-line">  ' + text.replace(/\n$/, '') + '</div>';
        }
      }
      output.innerHTML = html;

      // Summary
      var summary = document.createElement('div');
      summary.className = 'stats-bar';
      summary.style.padding = '8px 10px';
      summary.innerHTML = '<span style="color:var(--accent-green);">+ ' + addedCount + ' additions</span><span style="color:var(--accent-red);">- ' + removedCount + ' deletions</span>';
      output.insertBefore(summary, output.firstChild);
    });
  }

  // ============================================================
  // MARKDOWN PREVIEW
  // ============================================================

  function initMarkdown() {
    var input = document.getElementById('mdInput');
    var preview = document.getElementById('mdPreview');

    // Configure marked
    if (typeof marked.setOptions === 'function') {
      marked.setOptions({ breaks: true, gfm: true });
    }

    document.getElementById('mdRender').addEventListener('click', function () {
      try {
        var html = marked.parse(input.value);
        preview.innerHTML = html;
        preview.style.color = 'var(--text-primary)';
      } catch (e) {
        preview.innerHTML = '<span style="color:var(--accent-red);">渲染错误: ' + escapeHtml(e.message) + '</span>';
      }
    });
  }

  // ============================================================
  // CASE CONVERT
  // ============================================================

  function initCaseConvert() {
    var input = document.getElementById('caseInput');
    var output = document.getElementById('caseOutput');
    var currentCase = 'upper';

    var converters = {
      upper: function (s) { return s.toUpperCase(); },
      lower: function (s) { return s.toLowerCase(); },
      title: function (s) { return s.replace(/\w\S*/g, function (t) { return t.charAt(0).toUpperCase() + t.substr(1).toLowerCase(); }); },
      camel: toCamelCase,
      pascal: function (s) { var c = toCamelCase(s); return c.charAt(0).toUpperCase() + c.slice(1); },
      snake: function (s) { return toCamelCase(s).replace(/[A-Z]/g, function (m) { return '_' + m.toLowerCase(); }).replace(/^_/, ''); },
      kebab: function (s) { return toCamelCase(s).replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }).replace(/^-/, ''); }
    };

    function toCamelCase(s) {
      return s
        .replace(/[-_\s]+(.)?/g, function (_, c) { return c ? c.toUpperCase() : ''; })
        .replace(/^[A-Z]/, function (m) { return m.toLowerCase(); });
    }

    function doConvert() {
      var val = input.value;
      if (!val) {
        output.className = 'result-area empty';
        output.textContent = '等待输入...';
        return;
      }
      output.className = 'result-area';
      output.textContent = converters[currentCase](val);
    }

    input.addEventListener('input', doConvert);

    document.querySelectorAll('.case-algo').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.case-algo').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentCase = this.getAttribute('data-case');
        doConvert();
      });
    });

    document.getElementById('caseCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, '转换结果');
    });
  }

  // ============================================================
  // TIMESTAMP CONVERTER
  // ============================================================

  function initTimestamp() {
    var tsInput = document.getElementById('tsInput');
    var tsResult = document.getElementById('tsResult');
    var tsDateInput = document.getElementById('tsDateInput');
    var tsDateResult = document.getElementById('tsDateResult');

    function formatDate(d) {
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0') + '.' +
        String(d.getMilliseconds()).padStart(3, '0');
    }

    document.getElementById('tsConvert').addEventListener('click', function () {
      var val = tsInput.value.trim();
      if (!val) { tsResult.textContent = '请输入时间戳'; return; }
      var ts = parseInt(val);
      if (isNaN(ts)) { tsResult.textContent = '无效的时间戳'; return; }

      // Autodetect seconds vs milliseconds
      if (ts > 1e12) ts = Math.floor(ts); // already ms
      else if (ts < 1e10) ts = ts * 1000; // seconds to ms
      // Between 1e10 and 1e12 is milliseconds range

      var d = new Date(ts);
      if (isNaN(d.getTime())) { tsResult.textContent = '无效的时间戳'; return; }

      tsResult.innerHTML =
        '<div>本地时间: <strong>' + formatDate(d) + '</strong></div>' +
        '<div>UTC 时间: <strong>' + d.toISOString() + '</strong></div>' +
        '<div>星期: ' + ['日','一','二','三','四','五','六'][d.getDay()] + '</div>' +
        '<div>Unix 秒: ' + Math.floor(ts / 1000) + '</div>' +
        '<div>Unix 毫秒: ' + ts + '</div>';
    });

    document.getElementById('tsNow').addEventListener('click', function () {
      var now = Date.now();
      tsInput.value = now;
      tsResult.innerHTML =
        '<div>当前 Unix 秒: <strong>' + Math.floor(now / 1000) + '</strong></div>' +
        '<div>当前 Unix 毫秒: <strong>' + now + '</strong></div>';
    });

    document.getElementById('tsDateConvert').addEventListener('click', function () {
      var val = tsDateInput.value.trim();
      if (!val) { tsDateResult.textContent = '请输入日期'; return; }
      var d = new Date(val);
      if (isNaN(d.getTime())) {
        // Try common Chinese format
        var m = val.match(/(\d{4})[年\/\-.](\d{1,2})[月\/\-.](\d{1,2})/);
        if (m) d = new Date(m[1], m[2] - 1, m[3]);
      }
      if (isNaN(d.getTime())) { tsDateResult.textContent = '无法解析日期，请使用格式: 2024-01-01 12:00:00'; return; }

      var sec = Math.floor(d.getTime() / 1000);
      var ms = d.getTime();
      tsDateResult.innerHTML =
        '<div>Unix 秒: <strong>' + sec + '</strong></div>' +
        '<div>Unix 毫秒: <strong>' + ms + '</strong></div>' +
        '<div>ISO: ' + d.toISOString() + '</div>';
    });
  }

  // ============================================================
  // COLOR CONVERTER
  // ============================================================

  function initColor() {
    var input = document.getElementById('colorInput');
    var result = document.getElementById('colorResult');
    var swatch = document.getElementById('colorSwatch');
    var hexLabel = document.getElementById('colorHexLabel');
    var rgbLabel = document.getElementById('colorRgbLabel');
    var hslLabel = document.getElementById('colorHslLabel');
    var picker = document.getElementById('colorPicker');

    function updateColorDisplay(colorStr) {
      var c = parseColor(colorStr);
      if (!c) return false;

      swatch.style.background = c.hex;
      hexLabel.textContent = c.hex;
      rgbLabel.textContent = 'rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')';
      hslLabel.textContent = 'hsl(' + c.h + ', ' + c.s + '%, ' + c.l + '%)';
      picker.value = c.hex;

      result.className = 'result-area';
      result.innerHTML =
        '<div><strong>HEX:</strong> ' + c.hex + '</div>' +
        '<div><strong>RGB:</strong> rgb(' + c.r + ', ' + c.g + ', ' + c.b + ')</div>' +
        '<div><strong>HSL:</strong> hsl(' + c.h + ', ' + c.s + '%, ' + c.l + '%)</div>' +
        '<div><strong>CSS:</strong> ' + c.hex + '</div>';
      return true;
    }

    document.getElementById('colorConvert').addEventListener('click', function () {
      if (!updateColorDisplay(input.value)) {
        result.className = 'result-area';
        result.innerHTML = '<span style="color:var(--accent-red);">无法解析颜色值，支持 HEX (#fff, #ffffff), RGB, HSL</span>';
      }
    });

    picker.addEventListener('input', function () {
      input.value = picker.value;
      updateColorDisplay(picker.value);
    });

    document.getElementById('colorCopy').addEventListener('click', function () {
      copyToClipboard(hexLabel.textContent, 'HEX 颜色');
    });

    // Initial display
    updateColorDisplay('#58a6ff');
  }

  function parseColor(str) {
    str = str.trim().toLowerCase();
    var r, g, b;

    // HEX
    var hexMatch = str.match(/^#?([a-f0-9]{3}|[a-f0-9]{6})$/i);
    if (hexMatch) {
      var hex = hexMatch[1];
      if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
      r = parseInt(hex.substr(0,2), 16);
      g = parseInt(hex.substr(2,2), 16);
      b = parseInt(hex.substr(4,2), 16);
      return buildColorResult(r, g, b);
    }

    // RGB
    var rgbMatch = str.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (rgbMatch) {
      r = parseInt(rgbMatch[1]); g = parseInt(rgbMatch[2]); b = parseInt(rgbMatch[3]);
      return buildColorResult(r, g, b);
    }

    // HSL
    var hslMatch = str.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
    if (hslMatch) {
      var h = parseInt(hslMatch[1]) / 360;
      var s = parseInt(hslMatch[2]) / 100;
      var l = parseInt(hslMatch[3]) / 100;
      var result = hslToRgb(h, s, l);
      return buildColorResult(result[0], result[1], result[2], Math.round(parseInt(hslMatch[1])), parseInt(hslMatch[2]), parseInt(hslMatch[3]));
    }

    return null;
  }

  function buildColorResult(r, g, b, h, s, l) {
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    var hex = '#' + [r,g,b].map(function (x) { return x.toString(16).padStart(2,'0'); }).join('');

    if (h === undefined) {
      var hsl = rgbToHsl(r, g, b);
      h = hsl[0]; s = hsl[1]; l = hsl[2];
    }

    return { r: r, g: g, b: b, hex: hex, h: h, s: s, l: l };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b);
    var h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; }
    else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g-b)/d + (g<b?6:0)) / 6; break;
        case g: h = ((b-r)/d + 2) / 6; break;
        case b: h = ((r-g)/d + 4) / 6; break;
      }
    }
    return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
  }

  function hslToRgb(h, s, l) {
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var hue2rgb = function (p, q, t) {
        if (t < 0) t += 1; if (t > 1) t -= 1;
        if (t < 1/6) return p + (q-p)*6*t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q-p)*(2/3-t)*6;
        return p;
      };
      var q = l < 0.5 ? l * (1+s) : l + s - l*s;
      var p = 2*l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }

  // ============================================================
  // NUMBER BASE CONVERTER
  // ============================================================

  function initNumberBase() {
    document.getElementById('numConvert').addEventListener('click', function () {
      var input = document.getElementById('numInput').value.trim();
      var fromBase = parseInt(document.getElementById('numFromBase').value);
      var output = document.getElementById('numResult');

      if (!input) { output.textContent = '请输入数字'; return; }

      try {
        var num = parseInt(input, fromBase);
        if (isNaN(num)) { output.textContent = '无效的数字或与所选进制不匹配'; return; }

        output.className = 'result-area';
        output.innerHTML =
          '<div><strong>二进制 (Base 2):</strong> ' + num.toString(2) + '</div>' +
          '<div><strong>八进制 (Base 8):</strong> ' + num.toString(8) + '</div>' +
          '<div><strong>十进制 (Base 10):</strong> ' + num.toString(10) + '</div>' +
          '<div><strong>十六进制 (Base 16):</strong> ' + num.toString(16).toUpperCase() + '</div>';
      } catch (e) {
        output.textContent = '转换错误: ' + e.message;
      }
    });
  }

  // ============================================================
  // JWT DECODER
  // ============================================================

  function initJwtDecode() {
    document.getElementById('jwtDecode').addEventListener('click', function () {
      var input = document.getElementById('jwtInput').value.trim();
      var partsContainer = document.getElementById('jwtParts');
      var error = document.getElementById('jwtError');

      partsContainer.innerHTML = '';
      error.style.display = 'none';

      if (!input) {
        error.textContent = '请输入 JWT Token';
        error.style.display = 'block';
        return;
      }

      var parts = input.split('.');
      if (parts.length !== 3) {
        error.textContent = '无效的 JWT Token 格式（应包含 3 段，由 . 分隔）';
        error.style.display = 'block';
        return;
      }

      var labels = ['Header', 'Payload', 'Signature'];
      for (var i = 0; i < 3; i++) {
        var decoded;
        try {
          // Base64Url decode
          var b64 = parts[i].replace(/-/g, '+').replace(/_/g, '/');
          while (b64.length % 4) b64 += '=';
          var raw = atob(b64);

          if (i < 2) {
            var obj = JSON.parse(raw);
            decoded = JSON.stringify(obj, null, 2);
          } else {
            decoded = '(签名数据，无法解码为 JSON)';
          }
        } catch (e) {
          decoded = '(解码失败: ' + e.message + ')';
        }

        var partEl = document.createElement('div');
        partEl.className = 'jwt-part';
        partEl.innerHTML =
          '<div class="jwt-part-header">' + labels[i] + '</div>' +
          '<div class="jwt-part-content">' + (i < 2 ? syntaxHighlightJson(decoded) : decoded) + '</div>';
        partsContainer.appendChild(partEl);
      }
    });
  }

  function syntaxHighlightJson(json) {
    return json.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      function (match) {
        var cls = 'json-number';
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? 'json-key' : 'json-string';
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  }

  // ============================================================
  // UTILITY: Download Blob
  // ============================================================

  function downloadBlob(blob, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  // ============================================================
  // YAML / JSON CONVERTER
  // ============================================================

  function initYamlJson() {
    var yamlEl = document.getElementById('yamlInput');
    var jsonEl = document.getElementById('yamlJsonInput');
    var error = document.getElementById('yamlError');

    function showErr(msg) {
      error.textContent = msg;
      error.style.display = msg ? 'block' : 'none';
    }

    document.getElementById('yamlToJson').addEventListener('click', function () {
      try {
        var obj = jsyaml.load(yamlEl.value);
        jsonEl.value = JSON.stringify(obj, null, 2);
        showErr('');
        showToast('已转换为 JSON', 'success');
      } catch (e) {
        showErr('YAML 解析错误: ' + e.message);
      }
    });

    document.getElementById('jsonToYaml').addEventListener('click', function () {
      try {
        var obj = JSON.parse(jsonEl.value);
        yamlEl.value = jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
        showErr('');
        showToast('已转换为 YAML', 'success');
      } catch (e) {
        showErr('JSON 解析错误: ' + e.message);
      }
    });
  }

  // ============================================================
  // XML / JSON CONVERTER
  // ============================================================

  function initXmlJson() {
    var xmlEl = document.getElementById('xmlInput');
    var jsonEl = document.getElementById('xmlJsonInput');
    var error = document.getElementById('xmlError');

    function showErr(msg) {
      error.textContent = msg;
      error.style.display = msg ? 'block' : 'none';
    }

    document.getElementById('xmlToJson').addEventListener('click', function () {
      try {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xmlEl.value, 'application/xml');
        var perr = doc.getElementsByTagName('parsererror');
        if (perr.length) throw new Error(perr[0].textContent.split('\n')[0]);
        var obj = xmlNodeToObj(doc.documentElement);
        var wrap = {};
        wrap[doc.documentElement.nodeName] = obj;
        jsonEl.value = JSON.stringify(wrap, null, 2);
        showErr('');
        showToast('已转换为 JSON', 'success');
      } catch (e) {
        showErr('XML 解析错误: ' + e.message);
      }
    });

    document.getElementById('jsonToXml').addEventListener('click', function () {
      try {
        var obj = JSON.parse(jsonEl.value);
        xmlEl.value = formatXml(jsonToXml(obj));
        showErr('');
        showToast('已转换为 XML', 'success');
      } catch (e) {
        showErr('转换错误: ' + e.message);
      }
    });
  }

  function xmlNodeToObj(node) {
    var obj = {};
    if (node.attributes && node.attributes.length) {
      for (var i = 0; i < node.attributes.length; i++) {
        var a = node.attributes[i];
        obj['@' + a.nodeName] = a.nodeValue;
      }
    }
    var children = node.childNodes;
    var hasElement = false;
    var textContent = '';
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c.nodeType === 1) {
        hasElement = true;
        var childObj = xmlNodeToObj(c);
        if (obj[c.nodeName] === undefined) {
          obj[c.nodeName] = childObj;
        } else {
          if (!Array.isArray(obj[c.nodeName])) obj[c.nodeName] = [obj[c.nodeName]];
          obj[c.nodeName].push(childObj);
        }
      } else if (c.nodeType === 3) {
        textContent += c.nodeValue;
      }
    }
    if (!hasElement) {
      var trimmed = textContent.trim();
      if (Object.keys(obj).length === 0) return trimmed;
      if (trimmed) obj['#text'] = trimmed;
    }
    return obj;
  }

  function jsonToXml(obj) {
    var keys = Object.keys(obj);
    if (keys.length === 1) {
      return buildXmlNode(keys[0], obj[keys[0]]);
    }
    var s = '';
    for (var i = 0; i < keys.length; i++) s += buildXmlNode(keys[i], obj[keys[i]]);
    return s;
  }

  function buildXmlNode(name, value) {
    if (name.charAt(0) === '@' || name === '#text') return '';
    if (value === null || value === undefined) return '<' + name + '/>';
    if (typeof value !== 'object') {
      return '<' + name + '>' + escapeXml(String(value)) + '</' + name + '>';
    }
    if (Array.isArray(value)) {
      var s = '';
      for (var i = 0; i < value.length; i++) s += buildXmlNode(name, value[i]);
      return s;
    }
    var attrs = '';
    var inner = '';
    var keys = Object.keys(value);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (k.charAt(0) === '@') attrs += ' ' + k.substring(1) + '="' + escapeXml(String(value[k])) + '"';
      else if (k === '#text') inner += escapeXml(String(value[k]));
      else inner += buildXmlNode(k, value[k]);
    }
    if (!inner) return '<' + name + attrs + '/>';
    return '<' + name + attrs + '>' + inner + '</' + name + '>';
  }

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatXml(xml) {
    var formatted = '';
    var indent = '';
    var tab = '  ';
    xml.split(/>\s*</).forEach(function (node, idx) {
      if (idx > 0) node = '<' + node;
      if (idx < xml.split(/>\s*</).length - 1) node = node + '>';
      if (/^<\/\w/.test(node)) indent = indent.substring(tab.length);
      formatted += indent + node + '\n';
      if (/^<\w[^>]*[^\/]>$/.test(node)) indent += tab;
    });
    return formatted.trim();
  }

  // ============================================================
  // SQL FORMATTER
  // ============================================================

  function initSqlFormat() {
    var input = document.getElementById('sqlInput');
    var output = document.getElementById('sqlOutput');
    var dialect = document.getElementById('sqlDialect');

    function getFormatter() {
      return (window.sqlFormatter && window.sqlFormatter.format) || (window.SqlFormatter && window.SqlFormatter.format);
    }

    document.getElementById('sqlFormatBtn').addEventListener('click', function () {
      var fmt = getFormatter();
      if (!fmt) { output.textContent = 'SQL 格式化库未加载'; return; }
      try {
        output.className = 'result-area';
        output.textContent = fmt(input.value, { language: dialect.value, keywordCase: 'upper' });
      } catch (e) {
        output.className = 'result-area';
        output.innerHTML = '<span style="color:var(--accent-red);">格式化错误: ' + escapeHtml(e.message) + '</span>';
      }
    });

    document.getElementById('sqlCompressBtn').addEventListener('click', function () {
      output.className = 'result-area';
      output.textContent = input.value.replace(/\s+/g, ' ').trim();
    });

    document.getElementById('sqlCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, 'SQL');
    });
  }

  // ============================================================
  // BASE64 TEXT
  // ============================================================

  function initBase64Text() {
    var raw = document.getElementById('b64TextRaw');
    var enc = document.getElementById('b64TextEnc');
    var error = document.getElementById('b64TextError');

    function showErr(msg) {
      error.textContent = msg;
      error.style.display = msg ? 'block' : 'none';
    }

    document.getElementById('b64TextEncode').addEventListener('click', function () {
      try {
        var bytes = new TextEncoder().encode(raw.value);
        var bin = '';
        for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        enc.value = btoa(bin);
        showErr('');
      } catch (e) {
        showErr('编码错误: ' + e.message);
      }
    });

    document.getElementById('b64TextDecode').addEventListener('click', function () {
      try {
        var bin = atob(enc.value.replace(/\s/g, ''));
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        raw.value = new TextDecoder('utf-8').decode(bytes);
        showErr('');
      } catch (e) {
        showErr('解码错误: ' + e.message);
      }
    });
  }

  // ============================================================
  // AES CRYPT
  // ============================================================

  function initAesCrypt() {
    var keyEl = document.getElementById('aesKey');
    var modeEl = document.getElementById('aesMode');
    var plainEl = document.getElementById('aesPlain');
    var cipherEl = document.getElementById('aesCipher');
    var error = document.getElementById('aesError');

    function showErr(msg) {
      error.textContent = msg;
      error.style.display = msg ? 'block' : 'none';
    }

    document.getElementById('aesEncryptBtn').addEventListener('click', function () {
      try {
        if (!keyEl.value) { showErr('请输入密钥'); return; }
        var opts = modeEl.value === 'ECB'
          ? { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
          : undefined;
        var encrypted;
        if (modeEl.value === 'ECB') {
          var key = CryptoJS.enc.Utf8.parse(keyEl.value.padEnd(32, '\0').slice(0, 32));
          encrypted = CryptoJS.AES.encrypt(plainEl.value, key, opts).toString();
        } else {
          encrypted = CryptoJS.AES.encrypt(plainEl.value, keyEl.value).toString();
        }
        cipherEl.value = encrypted;
        showErr('');
        showToast('加密成功', 'success');
      } catch (e) {
        showErr('加密失败: ' + e.message);
      }
    });

    document.getElementById('aesDecryptBtn').addEventListener('click', function () {
      try {
        if (!keyEl.value) { showErr('请输入密钥'); return; }
        var bytes;
        if (modeEl.value === 'ECB') {
          var key = CryptoJS.enc.Utf8.parse(keyEl.value.padEnd(32, '\0').slice(0, 32));
          bytes = CryptoJS.AES.decrypt(cipherEl.value, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        } else {
          bytes = CryptoJS.AES.decrypt(cipherEl.value, keyEl.value);
        }
        var text = bytes.toString(CryptoJS.enc.Utf8);
        if (!text) throw new Error('结果为空，请检查密钥或密文');
        plainEl.value = text;
        showErr('');
        showToast('解密成功', 'success');
      } catch (e) {
        showErr('解密失败: ' + e.message);
      }
    });
  }

  // ============================================================
  // LOREM IPSUM GENERATOR
  // ============================================================

  var LOREM_LATIN_WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');
  var LOREM_ZH_WORDS = '人之初性本善性相近习相远苟不教性乃迁教之道贵以专昔孟母择邻处子不学断机杼养不教父之过教不严师之惰子不学非所宜幼不学老何为玉不琢不成器人不学不知义为人子方少时亲师友习礼仪'.split('');

  function loremGenerate(lang, type, count, startLorem) {
    var words = lang === 'zh' ? LOREM_ZH_WORDS : LOREM_LATIN_WORDS;
    var rand = function (max) { return Math.floor(Math.random() * max); };

    function makeSentence(idx) {
      var n = 6 + rand(10);
      var arr = [];
      for (var i = 0; i < n; i++) arr.push(words[rand(words.length)]);
      var sentence;
      if (lang === 'zh') {
        sentence = arr.join('') + '。';
      } else {
        sentence = arr.join(' ');
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
      }
      if (idx === 0 && startLorem && lang === 'latin') {
        sentence = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, ' + sentence.toLowerCase();
      }
      return sentence;
    }

    function makeParagraph(idx) {
      var n = 3 + rand(4);
      var sentences = [];
      for (var i = 0; i < n; i++) sentences.push(makeSentence(idx === 0 && i === 0 ? 0 : 1));
      return sentences.join(lang === 'zh' ? '' : ' ');
    }

    if (type === 'words') {
      var arr = [];
      for (var i = 0; i < count; i++) arr.push(words[rand(words.length)]);
      var s = arr.join(lang === 'zh' ? '' : ' ');
      if (lang === 'latin') s = s.charAt(0).toUpperCase() + s.slice(1);
      return s;
    }
    if (type === 'sentences') {
      var arr = [];
      for (var i = 0; i < count; i++) arr.push(makeSentence(i));
      return arr.join(lang === 'zh' ? '' : ' ');
    }
    var paras = [];
    for (var i = 0; i < count; i++) paras.push(makeParagraph(i));
    return paras.join('\n\n');
  }

  function initLoremGen() {
    var output = document.getElementById('loremOutput');

    document.getElementById('loremGenerateBtn').addEventListener('click', function () {
      var lang = document.getElementById('loremLang').value;
      var type = document.getElementById('loremType').value;
      var count = Math.max(1, Math.min(100, parseInt(document.getElementById('loremCount').value) || 1));
      var startLorem = document.getElementById('loremStartLorem').checked;
      output.className = 'result-area';
      output.textContent = loremGenerate(lang, type, count, startLorem);
    });

    document.getElementById('loremCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, 'Lorem 文本');
    });
  }

  // ============================================================
  // TEXT STATS
  // ============================================================

  function initTextStats() {
    var input = document.getElementById('statsInput');
    var fields = {
      chars: document.getElementById('statChars'),
      charsNoSpace: document.getElementById('statCharsNoSpace'),
      words: document.getElementById('statWords'),
      lines: document.getElementById('statLines'),
      paras: document.getElementById('statParas'),
      bytes: document.getElementById('statBytes'),
      cjk: document.getElementById('statCjk'),
      readTime: document.getElementById('statReadTime')
    };

    function update() {
      var text = input.value;
      fields.chars.textContent = text.length.toLocaleString();
      fields.charsNoSpace.textContent = text.replace(/\s/g, '').length.toLocaleString();
      var wordMatches = text.trim().match(/[一-龥]|[A-Za-z0-9_'-]+/g);
      var wordCount = wordMatches ? wordMatches.length : 0;
      fields.words.textContent = wordCount.toLocaleString();
      fields.lines.textContent = (text === '' ? 0 : text.split('\n').length).toLocaleString();
      var paras = text.split(/\n\s*\n/).filter(function (p) { return p.trim() !== ''; });
      fields.paras.textContent = paras.length.toLocaleString();
      fields.bytes.textContent = (new Blob([text]).size).toLocaleString();
      var cjk = text.match(/[一-龥　-〿＀-￯]/g);
      fields.cjk.textContent = (cjk ? cjk.length : 0).toLocaleString();
      var sec = Math.ceil(wordCount / 200 * 60);
      if (sec < 60) fields.readTime.textContent = sec + ' 秒';
      else fields.readTime.textContent = Math.floor(sec / 60) + ' 分 ' + (sec % 60) + ' 秒';
    }

    input.addEventListener('input', update);
    update();
  }

  // ============================================================
  // CRON PARSER
  // ============================================================

  function initCronParse() {
    var input = document.getElementById('cronInput');
    var explain = document.getElementById('cronExplain');
    var nextEl = document.getElementById('cronNext');

    function parse() {
      var expr = input.value.trim();
      if (!expr) { explain.textContent = '请输入 Cron 表达式'; nextEl.textContent = ''; return; }

      var parts = expr.split(/\s+/);
      if (parts.length !== 5) {
        explain.className = 'result-area';
        explain.innerHTML = '<span style="color:var(--accent-red);">仅支持标准 5 段表达式（分 时 日 月 周）</span>';
        nextEl.textContent = '';
        return;
      }

      var fields = [
        { name: '分钟', range: [0, 59] },
        { name: '小时', range: [0, 23] },
        { name: '日期', range: [1, 31] },
        { name: '月份', range: [1, 12] },
        { name: '星期', range: [0, 6] }
      ];

      try {
        var parsed = parts.map(function (p, i) { return parseField(p, fields[i].range[0], fields[i].range[1]); });
        var lines = [];
        var labelsMonth = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
        var labelsWeek = ['周日','周一','周二','周三','周四','周五','周六'];

        lines.push('分钟: ' + describeField(parts[0], parsed[0], fields[0].range));
        lines.push('小时: ' + describeField(parts[1], parsed[1], fields[1].range));
        lines.push('日期: ' + describeField(parts[2], parsed[2], fields[2].range));
        lines.push('月份: ' + describeField(parts[3], parsed[3], fields[3].range, labelsMonth, 1));
        lines.push('星期: ' + describeField(parts[4], parsed[4], fields[4].range, labelsWeek, 0));

        explain.className = 'result-area';
        explain.innerHTML = lines.map(function (l) { return '<div>' + escapeHtml(l) + '</div>'; }).join('');

        var times = nextRunTimes(parsed, 10);
        nextEl.className = 'result-area';
        nextEl.innerHTML = times.map(function (d, i) {
          return '<div>[' + (i + 1) + '] ' + formatLocal(d) + '</div>';
        }).join('') || '<span style="color:var(--text-secondary);">未来一年内无匹配时间</span>';
      } catch (e) {
        explain.className = 'result-area';
        explain.innerHTML = '<span style="color:var(--accent-red);">解析错误: ' + escapeHtml(e.message) + '</span>';
        nextEl.textContent = '';
      }
    }

    function parseField(field, min, max) {
      var set = {};
      field.split(',').forEach(function (part) {
        var step = 1;
        var stepIdx = part.indexOf('/');
        if (stepIdx !== -1) {
          step = parseInt(part.substring(stepIdx + 1));
          part = part.substring(0, stepIdx);
          if (isNaN(step) || step <= 0) throw new Error('无效的步长: ' + part);
        }
        var lo, hi;
        if (part === '*' || part === '') { lo = min; hi = max; }
        else if (part.indexOf('-') !== -1) {
          var seg = part.split('-');
          lo = parseInt(seg[0]); hi = parseInt(seg[1]);
        } else {
          lo = hi = parseInt(part);
        }
        if (isNaN(lo) || isNaN(hi)) throw new Error('无效字段: ' + part);
        if (lo < min || hi > max || lo > hi) throw new Error('字段超出范围 [' + min + ',' + max + ']: ' + part);
        for (var i = lo; i <= hi; i += step) set[i] = true;
      });
      return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
    }

    function describeField(raw, values, range, labels, base) {
      if (raw === '*') return '每' + (range[0] === 0 ? '' : '') + '值';
      if (values.length === range[1] - range[0] + 1) return '任意';
      if (values.length === 1) {
        return labels ? labels[values[0] - (base || 0)] : String(values[0]);
      }
      if (values.length <= 8) {
        return values.map(function (v) { return labels ? labels[v - (base || 0)] : v; }).join(', ');
      }
      return values.length + ' 个匹配值: ' + values.slice(0, 6).join(', ') + '...';
    }

    function nextRunTimes(parsed, n) {
      var out = [];
      var d = new Date();
      d.setSeconds(0, 0);
      d = new Date(d.getTime() + 60000);
      var maxIter = 366 * 24 * 60;
      for (var i = 0; i < maxIter && out.length < n; i++) {
        if (parsed[0].indexOf(d.getMinutes()) !== -1 &&
            parsed[1].indexOf(d.getHours()) !== -1 &&
            parsed[2].indexOf(d.getDate()) !== -1 &&
            parsed[3].indexOf(d.getMonth() + 1) !== -1 &&
            parsed[4].indexOf(d.getDay()) !== -1) {
          out.push(new Date(d));
        }
        d = new Date(d.getTime() + 60000);
      }
      return out;
    }

    function formatLocal(d) {
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':00 (' +
        ['日','一','二','三','四','五','六'][d.getDay()] + ')';
    }

    input.addEventListener('input', parse);

    document.getElementById('cronParseBtn').addEventListener('click', parse);

    document.querySelectorAll('.cron-preset').forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = this.getAttribute('data-cron');
        parse();
      });
    });

    parse();
  }

  // ============================================================
  // CSS GRADIENT
  // ============================================================

  function initCssGradient() {
    var typeEl = document.getElementById('gradType');
    var angleEl = document.getElementById('gradAngle');
    var angleVal = document.getElementById('gradAngleVal');
    var angleGroup = document.getElementById('gradAngleGroup');
    var stopsEl = document.getElementById('gradStops');
    var preview = document.getElementById('gradPreview');
    var cssEl = document.getElementById('gradCss');

    var stops = [
      { color: '#58a6ff', pos: 0 },
      { color: '#a371f7', pos: 100 }
    ];

    function renderStops() {
      stopsEl.innerHTML = '';
      stops.forEach(function (s, i) {
        var row = document.createElement('div');
        row.className = 'grad-stop-row';
        row.innerHTML =
          '<input type="color" data-i="' + i + '" data-k="color" value="' + s.color + '">' +
          '<input type="number" data-i="' + i + '" data-k="pos" value="' + s.pos + '" min="0" max="100">' +
          '<span class="grad-stop-pos-label">%</span>' +
          '<button class="grad-stop-remove" data-i="' + i + '" title="删除">×</button>';
        stopsEl.appendChild(row);
      });

      stopsEl.querySelectorAll('input').forEach(function (el) {
        el.addEventListener('input', function () {
          var i = parseInt(this.getAttribute('data-i'));
          var k = this.getAttribute('data-k');
          stops[i][k] = k === 'pos' ? Math.max(0, Math.min(100, parseInt(this.value) || 0)) : this.value;
          updateGradient();
        });
      });

      stopsEl.querySelectorAll('.grad-stop-remove').forEach(function (el) {
        el.addEventListener('click', function () {
          var i = parseInt(this.getAttribute('data-i'));
          if (stops.length <= 2) { showToast('至少保留 2 个色标', 'error'); return; }
          stops.splice(i, 1);
          renderStops();
          updateGradient();
        });
      });
    }

    function updateGradient() {
      var sorted = stops.slice().sort(function (a, b) { return a.pos - b.pos; });
      var stopsStr = sorted.map(function (s) { return s.color + ' ' + s.pos + '%'; }).join(', ');
      var css;
      if (typeEl.value === 'linear') {
        css = 'linear-gradient(' + angleEl.value + 'deg, ' + stopsStr + ')';
      } else {
        css = 'radial-gradient(circle, ' + stopsStr + ')';
      }
      preview.style.background = css;
      cssEl.value = 'background: ' + css + ';';
    }

    typeEl.addEventListener('change', function () {
      angleGroup.style.display = typeEl.value === 'linear' ? '' : 'none';
      updateGradient();
    });

    angleEl.addEventListener('input', function () {
      angleVal.textContent = angleEl.value + '°';
      updateGradient();
    });

    document.getElementById('gradAddStop').addEventListener('click', function () {
      var newPos = stops.length < 2 ? 50 : Math.round((stops[stops.length - 1].pos + stops[stops.length - 2].pos) / 2);
      stops.push({ color: '#39d2c0', pos: newPos });
      renderStops();
      updateGradient();
    });

    document.getElementById('gradCopy').addEventListener('click', function () {
      copyToClipboard(cssEl.value, 'CSS');
    });

    renderStops();
    updateGradient();
  }

  // ============================================================
  // HTTP STATUS
  // ============================================================

  var HTTP_STATUS = [
    { code: 100, name: 'Continue', desc: '客户端应继续发送请求剩余部分。' },
    { code: 101, name: 'Switching Protocols', desc: '服务器已理解并切换协议（如升级到 WebSocket）。' },
    { code: 102, name: 'Processing', desc: '服务器已收到并处理中（WebDAV）。' },
    { code: 103, name: 'Early Hints', desc: '提前返回提示头部信息，便于预加载资源。' },

    { code: 200, name: 'OK', desc: '请求成功，最常见的成功响应。' },
    { code: 201, name: 'Created', desc: '请求成功且创建了新资源（POST 后常用）。' },
    { code: 202, name: 'Accepted', desc: '请求已接收但尚未处理完成（异步任务）。' },
    { code: 203, name: 'Non-Authoritative Information', desc: '响应来自第三方副本而非源服务器。' },
    { code: 204, name: 'No Content', desc: '请求成功但响应体为空（DELETE 后常用）。' },
    { code: 205, name: 'Reset Content', desc: '客户端应重置文档视图。' },
    { code: 206, name: 'Partial Content', desc: '范围请求成功，返回部分内容（断点续传）。' },

    { code: 301, name: 'Moved Permanently', desc: '资源已永久移动到新位置，搜索引擎应更新索引。' },
    { code: 302, name: 'Found', desc: '资源临时位于其他位置（保留请求方法）。' },
    { code: 303, name: 'See Other', desc: '使用 GET 方法跳转到指定地址。' },
    { code: 304, name: 'Not Modified', desc: '资源未变化，可使用本地缓存。' },
    { code: 307, name: 'Temporary Redirect', desc: '临时重定向，必须保留原方法和请求体。' },
    { code: 308, name: 'Permanent Redirect', desc: '永久重定向，必须保留原方法和请求体。' },

    { code: 400, name: 'Bad Request', desc: '请求语法错误，服务器无法理解。' },
    { code: 401, name: 'Unauthorized', desc: '需要身份认证，认证失败或未提供凭据。' },
    { code: 402, name: 'Payment Required', desc: '保留状态码，预留给付费场景。' },
    { code: 403, name: 'Forbidden', desc: '服务器拒绝执行，权限不足。' },
    { code: 404, name: 'Not Found', desc: '请求的资源不存在。' },
    { code: 405, name: 'Method Not Allowed', desc: '请求方法不被允许（如对静态资源使用 POST）。' },
    { code: 406, name: 'Not Acceptable', desc: '资源无法满足客户端 Accept 头要求。' },
    { code: 407, name: 'Proxy Authentication Required', desc: '需要先通过代理认证。' },
    { code: 408, name: 'Request Timeout', desc: '客户端发送请求超时。' },
    { code: 409, name: 'Conflict', desc: '请求与服务器当前状态冲突（如版本冲突）。' },
    { code: 410, name: 'Gone', desc: '资源已永久删除，无转发地址。' },
    { code: 411, name: 'Length Required', desc: '请求未指定 Content-Length。' },
    { code: 412, name: 'Precondition Failed', desc: '请求头中的前提条件不成立。' },
    { code: 413, name: 'Payload Too Large', desc: '请求体过大，服务器拒绝处理。' },
    { code: 414, name: 'URI Too Long', desc: '请求 URI 过长。' },
    { code: 415, name: 'Unsupported Media Type', desc: '不支持的媒体类型。' },
    { code: 416, name: 'Range Not Satisfiable', desc: 'Range 请求范围无效。' },
    { code: 417, name: 'Expectation Failed', desc: 'Expect 请求头无法满足。' },
    { code: 418, name: "I'm a teapot", desc: '愚人节彩蛋，永远不会冲泡咖啡的茶壶。' },
    { code: 422, name: 'Unprocessable Entity', desc: '请求格式正确但语义错误（参数校验失败）。' },
    { code: 423, name: 'Locked', desc: '资源被锁定（WebDAV）。' },
    { code: 425, name: 'Too Early', desc: '服务器拒绝处理可能被重放的请求。' },
    { code: 426, name: 'Upgrade Required', desc: '客户端应升级到不同协议。' },
    { code: 428, name: 'Precondition Required', desc: '需要先决条件头部。' },
    { code: 429, name: 'Too Many Requests', desc: '请求过于频繁，触发限流。' },
    { code: 431, name: 'Request Header Fields Too Large', desc: '请求头过大。' },
    { code: 451, name: 'Unavailable For Legal Reasons', desc: '因法律原因无法提供。' },

    { code: 500, name: 'Internal Server Error', desc: '服务器内部错误，最常见的服务端错误。' },
    { code: 501, name: 'Not Implemented', desc: '服务器不支持该请求方法。' },
    { code: 502, name: 'Bad Gateway', desc: '网关或代理收到上游无效响应。' },
    { code: 503, name: 'Service Unavailable', desc: '服务暂不可用（过载或维护）。' },
    { code: 504, name: 'Gateway Timeout', desc: '网关或代理上游响应超时。' },
    { code: 505, name: 'HTTP Version Not Supported', desc: '不支持的 HTTP 版本。' },
    { code: 507, name: 'Insufficient Storage', desc: '存储空间不足。' },
    { code: 508, name: 'Loop Detected', desc: '检测到无限循环（WebDAV）。' },
    { code: 510, name: 'Not Extended', desc: '需要进一步扩展才能完成请求。' },
    { code: 511, name: 'Network Authentication Required', desc: '需要进行网络认证（如公共 WiFi 登录）。' }
  ];

  function initHttpStatus() {
    var listEl = document.getElementById('httpList');
    var search = document.getElementById('httpSearch');
    var currentCat = 'all';

    function render() {
      var q = search.value.trim().toLowerCase();
      var filtered = HTTP_STATUS.filter(function (s) {
        var cat = String(s.code).charAt(0);
        if (currentCat !== 'all' && cat !== currentCat) return false;
        if (!q) return true;
        return String(s.code).indexOf(q) !== -1
          || s.name.toLowerCase().indexOf(q) !== -1
          || s.desc.toLowerCase().indexOf(q) !== -1;
      });

      if (!filtered.length) {
        listEl.innerHTML = '<div style="color:var(--text-secondary);padding:20px;">没有匹配的状态码</div>';
        return;
      }

      listEl.innerHTML = filtered.map(function (s) {
        var cat = String(s.code).charAt(0);
        return '<div class="http-item cat-' + cat + '">' +
          '<div class="http-code">' + s.code + '</div>' +
          '<div class="http-name">' + escapeHtml(s.name) + '</div>' +
          '<div class="http-desc">' + escapeHtml(s.desc) + '</div>' +
        '</div>';
      }).join('');
    }

    search.addEventListener('input', render);

    document.querySelectorAll('.http-filter').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.http-filter').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentCat = this.getAttribute('data-cat');
        render();
      });
    });

    render();
  }

})();
