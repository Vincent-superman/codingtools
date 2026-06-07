/* ============================================================
   DevTools - Application Logic
   ============================================================ */

(function () {
  'use strict';

  var toolInited = {};

  // i18n shortcut + safe fallback
  function t(key, params) {
    if (window.i18n && typeof window.i18n.t === 'function') {
      return window.i18n.t(key, params);
    }
    return key;
  }

  // Language toggle (top-right)
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      if (!window.i18n) return;
      window.i18n.setLang(window.i18n.getLang() === 'zh' ? 'en' : 'zh');
    });
  }

  // Re-render handlers registered by individual tools so dynamic content
  // (toasts excluded — they're transient) refreshes when language changes.
  var rerenderers = [];
  function onLangChange(fn) { rerenderers.push(fn); }
  document.addEventListener('i18n:change', function () {
    rerenderers.forEach(function (fn) { try { fn(); } catch (e) {} });
  });

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
    if (!text) { showToast(t('common.copyEmpty'), 'error'); return; }
    var msg = t('common.copySuccess', { label: label || t('copy.content') });
    navigator.clipboard.writeText(text).then(function () {
      showToast(msg, 'success');
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
      showToast(msg, 'success');
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
      case 'json-diff': initJsonDiff(); break;
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
    var lastObj = null;

    document.getElementById('jsonFormat').addEventListener('click', function () {
      try {
        var obj = JSON.parse(input.value);
        var formatted = JSON.stringify(obj, null, 2);
        output.className = 'result-area json-tree';
        output.textContent = formatted;
        highlightJson(output);
        lastObj = obj;
        updateJsonStats(obj);
        stats.style.display = 'flex';
      } catch (e) {
        output.className = 'result-area';
        output.textContent = t('jf.err.parse', { msg: e.message });
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
        lastObj = obj;
        updateJsonStats(obj);
        stats.style.display = 'flex';
      } catch (e) {
        output.className = 'result-area';
        output.textContent = t('jf.err.parse', { msg: e.message });
        output.style.color = 'var(--accent-red)';
        stats.style.display = 'none';
      }
    });

    document.getElementById('jsonValidate').addEventListener('click', function () {
      try {
        var obj = JSON.parse(input.value);
        output.className = 'result-area';
        output.innerHTML = '<span style="color:var(--accent-green);">' + escapeHtml(t('jf.valid')) + '</span>';
        output.style.color = '';
        lastObj = obj;
        updateJsonStats(obj);
        stats.style.display = 'flex';
      } catch (e) {
        output.className = 'result-area';
        output.innerHTML = '<span style="color:var(--accent-red);">' + escapeHtml(t('jf.invalid', { msg: e.message })) + '</span>';
        output.style.color = '';
        stats.style.display = 'none';
      }
    });

    document.getElementById('jsonClear').addEventListener('click', function () {
      input.value = '';
      output.className = 'result-area empty';
      output.textContent = t('common.waiting');
      output.style.color = '';
      stats.style.display = 'none';
      lastObj = null;
    });

    document.getElementById('jsonCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, t('copy.json'));
    });

    function updateJsonStats(obj) {
      var text = JSON.stringify(obj);
      stats.innerHTML =
        '<span>' + escapeHtml(t('jf.stats.type', { type: Array.isArray(obj) ? 'Array' : typeof obj })) + '</span>' +
        '<span>' + escapeHtml(t('jf.stats.size', { size: new Blob([text]).size })) + '</span>' +
        '<span>' + escapeHtml(t('jf.stats.chars', { n: text.length })) + '</span>';
    }

    onLangChange(function () {
      if (lastObj !== null && stats.style.display !== 'none') updateJsonStats(lastObj);
    });
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
        showToast(t('jc.toast.serialized'), 'success');
      } catch (e) {
        strInput.value = t('jc.err.generic', { msg: e.message });
      }
    });

    document.getElementById('jsonEscape').addEventListener('click', function () {
      strInput.value = JSON.stringify(objInput.value);
    });

    document.getElementById('jsonDeserialize').addEventListener('click', function () {
      try {
        var obj = JSON.parse(strInput.value);
        objInput.value = JSON.stringify(obj, null, 2);
        showToast(t('jc.toast.deserialized'), 'success');
      } catch (e) {
        objInput.value = t('jc.err.generic', { msg: e.message });
      }
    });

    document.getElementById('jsonUnescape').addEventListener('click', function () {
      try {
        objInput.value = JSON.parse(strInput.value);
      } catch (e) {
        var s = strInput.value;
        try { objInput.value = JSON.parse(s); } catch (e2) {
          objInput.value = t('jc.err.unescape');
        }
      }
    });
  }

  // ============================================================
  // JSON DIFF (Content Compare)
  // ============================================================

  function initJsonDiff() {
    var leftEl = document.getElementById('jdLeft');
    var rightEl = document.getElementById('jdRight');
    var output = document.getElementById('jdOutput');
    var summary = document.getElementById('jdSummary');
    var error = document.getElementById('jdError');
    var optionsGroup = document.getElementById('jdOptionsGroup');
    var sortKeysCb = document.getElementById('jdSortKeys');
    var currentMode = 'structural';
    var lastResult = null;

    document.querySelectorAll('.jd-mode').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.jd-mode').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        currentMode = this.getAttribute('data-mode');
        optionsGroup.style.display = currentMode === 'structural' ? '' : 'none';
        if (lastResult) {
          lastResult.mode = currentMode;
          render();
        }
      });
    });

    document.getElementById('jdCompare').addEventListener('click', runCompare);
    sortKeysCb.addEventListener('change', function () {
      if (lastResult) {
        lastResult.sortKeys = sortKeysCb.checked;
        render();
      }
    });
    document.getElementById('jdSwap').addEventListener('click', function () {
      var tmp = leftEl.value;
      leftEl.value = rightEl.value;
      rightEl.value = tmp;
      if (lastResult) runCompare();
    });
    document.getElementById('jdClear').addEventListener('click', function () {
      leftEl.value = '';
      rightEl.value = '';
      output.className = 'result-area empty';
      output.textContent = t('jd.placeholder.result');
      summary.style.display = 'none';
      error.style.display = 'none';
      lastResult = null;
    });

    function runCompare() {
      error.style.display = 'none';
      var leftRaw = leftEl.value.trim();
      var rightRaw = rightEl.value.trim();

      if (!leftRaw || !rightRaw) {
        error.textContent = t('jd.err.empty');
        error.style.display = 'block';
        return;
      }

      var left, right;
      try { left = JSON.parse(leftRaw); }
      catch (e) {
        error.textContent = t('jd.err.parseLeft', { msg: e.message });
        error.style.display = 'block';
        return;
      }
      try { right = JSON.parse(rightRaw); }
      catch (e) {
        error.textContent = t('jd.err.parseRight', { msg: e.message });
        error.style.display = 'block';
        return;
      }

      lastResult = { left: left, right: right, mode: currentMode, sortKeys: sortKeysCb.checked };
      render();
    }

    function render() {
      if (!lastResult) return;
      var left = lastResult.left, right = lastResult.right;

      if (lastResult.mode === 'structural') {
        var counts = { added: 0, removed: 0, changed: 0, unchanged: 0 };
        var html = renderStructuralRoot(left, right, lastResult.sortKeys, counts);
        output.className = 'result-area';
        output.style.padding = '0';
        output.innerHTML = '<div class="jd-tree">' + html + '</div>';
        renderSummary(counts);
      } else {
        var leftStr = JSON.stringify(left, null, 2);
        var rightStr = JSON.stringify(right, null, 2);
        var changes = Diff.diffLines(leftStr, rightStr);
        var added = 0, removed = 0;
        var lines = '';
        for (var i = 0; i < changes.length; i++) {
          var ch = changes[i];
          var text = escapeHtml(ch.value).replace(/\n$/, '');
          if (ch.added) {
            lines += '<div class="diff-line diff-added">+ ' + text + '</div>';
            added += ch.count || (ch.value.match(/\n/g) || []).length;
          } else if (ch.removed) {
            lines += '<div class="diff-line diff-removed">- ' + text + '</div>';
            removed += ch.count || (ch.value.match(/\n/g) || []).length;
          } else {
            lines += '<div class="diff-line">  ' + text + '</div>';
          }
        }
        output.className = 'result-area';
        output.style.padding = '0';
        output.innerHTML = lines || '<div class="diff-line">' + escapeHtml(t('jd.same')) + '</div>';
        renderSummary({ added: added, removed: removed, changed: 0, unchanged: 0 }, true);
      }
    }

    function renderSummary(counts, lineMode) {
      var parts = [];
      parts.push('<span class="jd-chip jd-chip-added">+ ' + escapeHtml(t('jd.sum.added', { n: counts.added })) + '</span>');
      parts.push('<span class="jd-chip jd-chip-removed">- ' + escapeHtml(t('jd.sum.removed', { n: counts.removed })) + '</span>');
      if (!lineMode) {
        parts.push('<span class="jd-chip jd-chip-changed">~ ' + escapeHtml(t('jd.sum.changed', { n: counts.changed })) + '</span>');
        parts.push('<span class="jd-chip jd-chip-unchanged">= ' + escapeHtml(t('jd.sum.unchanged', { n: counts.unchanged })) + '</span>');
      }
      summary.innerHTML = parts.join('');
      summary.style.display = '';
    }

    onLangChange(function () {
      if (lastResult) render();
      else if (output.classList.contains('empty')) output.textContent = t('jd.placeholder.result');
    });
  }

  // Render the structural diff tree starting at the root pair.
  // Emits HTML that visualises both objects/arrays as a single aligned tree,
  // marking added (+), removed (-), and changed (-/+ pair) entries.
  function renderStructuralRoot(left, right, sortKeys, counts) {
    var lt = jsonType(left), rt = jsonType(right);

    if (lt === 'object' && rt === 'object') {
      return jdRow(0, '', '{', null) + jdObjectBody(left, right, 1, sortKeys, counts) + jdRow(0, '', '}', null);
    }
    if (lt === 'array' && rt === 'array') {
      return jdRow(0, '', '[', null) + jdArrayBody(left, right, 1, sortKeys, counts) + jdRow(0, '', ']', null);
    }
    if (deepEqual(left, right)) {
      counts.unchanged++;
      return jdRow(0, '', renderValueInline(left), null);
    }
    counts.changed++;
    return jdRow(0, '', renderValueInline(left), 'removed') + jdRow(0, '', renderValueInline(right), 'added');
  }

  function jdObjectBody(left, right, depth, sortKeys, counts) {
    var keys = mergeKeys(Object.keys(left), Object.keys(right), sortKeys);
    var out = '';
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var hasL = Object.prototype.hasOwnProperty.call(left, k);
      var hasR = Object.prototype.hasOwnProperty.call(right, k);
      var keyHtml = '<span class="jd-key">' + escapeHtml(JSON.stringify(k)) + '</span>: ';
      var sep = (i < keys.length - 1) ? ',' : '';

      if (hasL && !hasR) {
        out += jdRow(depth, '-', keyHtml + renderValueInline(left[k]) + sep, 'removed');
        countLeaves(left[k], counts, 'removed');
      } else if (!hasL && hasR) {
        out += jdRow(depth, '+', keyHtml + renderValueInline(right[k]) + sep, 'added');
        countLeaves(right[k], counts, 'added');
      } else {
        out += jdComparePair(left[k], right[k], depth, keyHtml, sep, sortKeys, counts);
      }
    }
    return out;
  }

  function jdArrayBody(left, right, depth, sortKeys, counts) {
    var max = Math.max(left.length, right.length);
    var out = '';
    for (var i = 0; i < max; i++) {
      var hasL = i < left.length;
      var hasR = i < right.length;
      var idxHtml = '<span class="jd-index">[' + i + ']</span> ';
      var sep = (i < max - 1) ? ',' : '';
      if (hasL && !hasR) {
        out += jdRow(depth, '-', idxHtml + renderValueInline(left[i]) + sep, 'removed');
        countLeaves(left[i], counts, 'removed');
      } else if (!hasL && hasR) {
        out += jdRow(depth, '+', idxHtml + renderValueInline(right[i]) + sep, 'added');
        countLeaves(right[i], counts, 'added');
      } else {
        out += jdComparePair(left[i], right[i], depth, idxHtml, sep, sortKeys, counts);
      }
    }
    return out;
  }

  function jdComparePair(lv, rv, depth, prefix, sep, sortKeys, counts) {
    var lvt = jsonType(lv), rvt = jsonType(rv);
    if (lvt === 'object' && rvt === 'object') {
      return jdRow(depth, '', prefix + '{', null)
        + jdObjectBody(lv, rv, depth + 1, sortKeys, counts)
        + jdRow(depth, '', '}' + sep, null);
    }
    if (lvt === 'array' && rvt === 'array') {
      return jdRow(depth, '', prefix + '[', null)
        + jdArrayBody(lv, rv, depth + 1, sortKeys, counts)
        + jdRow(depth, '', ']' + sep, null);
    }
    if (deepEqual(lv, rv)) {
      counts.unchanged++;
      return jdRow(depth, '', prefix + renderValueInline(lv) + sep, null);
    }
    counts.changed++;
    return jdRow(depth, '-', prefix + renderValueInline(lv) + sep, 'removed')
      + jdRow(depth, '+', prefix + renderValueInline(rv) + sep, 'added');
  }

  function jdRow(depth, marker, content, kind) {
    var pad = depth * 18;
    var cls = 'jd-row' + (kind ? ' jd-row-' + kind : '');
    var m = '<span class="jd-marker">' + (marker || '&nbsp;') + '</span>';
    return '<div class="' + cls + '" style="padding-left:' + pad + 'px;">' + m + content + '</div>';
  }

  function jsonType(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    return typeof v;
  }

  function mergeKeys(a, b, sortKeys) {
    var seen = {};
    var out = [];
    function add(arr) {
      for (var i = 0; i < arr.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(seen, arr[i])) {
          seen[arr[i]] = true;
          out.push(arr[i]);
        }
      }
    }
    add(a); add(b);
    if (sortKeys) out.sort();
    return out;
  }

  function deepEqual(a, b) {
    if (a === b) return true;
    var ta = jsonType(a), tb = jsonType(b);
    if (ta !== tb) return false;
    if (ta === 'array') {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
      return true;
    }
    if (ta === 'object') {
      var ka = Object.keys(a), kb = Object.keys(b);
      if (ka.length !== kb.length) return false;
      for (var j = 0; j < ka.length; j++) {
        if (!Object.prototype.hasOwnProperty.call(b, ka[j])) return false;
        if (!deepEqual(a[ka[j]], b[ka[j]])) return false;
      }
      return true;
    }
    return false;
  }

  function renderValueInline(v) {
    var ty = jsonType(v);
    if (ty === 'string') return '<span class="json-string">' + escapeHtml(JSON.stringify(v)) + '</span>';
    if (ty === 'number') return '<span class="json-number">' + escapeHtml(String(v)) + '</span>';
    if (ty === 'boolean') return '<span class="json-boolean">' + String(v) + '</span>';
    if (ty === 'null') return '<span class="json-null">null</span>';
    if (ty === 'array') {
      if (v.length === 0) return '[]';
      return escapeHtml(JSON.stringify(v));
    }
    if (ty === 'object') {
      if (Object.keys(v).length === 0) return '{}';
      return escapeHtml(JSON.stringify(v));
    }
    return escapeHtml(String(v));
  }

  function countLeaves(v, counts, kind) {
    var ty = jsonType(v);
    if (ty === 'array') {
      for (var i = 0; i < v.length; i++) countLeaves(v[i], counts, kind);
    } else if (ty === 'object') {
      var ks = Object.keys(v);
      for (var j = 0; j < ks.length; j++) countLeaves(v[ks[j]], counts, kind);
    } else {
      counts[kind]++;
    }
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
      copyToClipboard(output.value, t('copy.b64'));
    });

    document.getElementById('base64Download').addEventListener('click', function () {
      if (!output.value) { showToast(t('b64i.toast.noImage'), 'error'); return; }
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
      preview.innerHTML = '<span style="color:var(--text-tertiary);">' + escapeHtml(t('b64d.preview')) + '</span>';

      var val = input.value.trim();
      if (!val) {
        error.textContent = t('b64d.err.empty');
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
        error.textContent = t('b64d.err.invalid');
        error.style.display = 'block';
        return;
      }

      currentSrc = src;
      var renderErr = t('b64d.err.render').replace(/'/g, '&#39;');
      preview.innerHTML = '<img src="' + src + '" alt="Decoded" style="max-width:100%;max-height:400px;border-radius:8px;" onerror="this.onerror=null;this.parentElement.innerHTML=\'<span style=color:var(--accent-red);>' + renderErr + '</span>\';">';
      actions.style.display = 'flex';
    });

    document.getElementById('base64DecodeClear').addEventListener('click', function () {
      input.value = '';
      preview.innerHTML = '<span style="color:var(--text-tertiary);">' + escapeHtml(t('b64d.preview')) + '</span>';
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

      if (!text) { showToast(t('qr.toast.empty'), 'error'); return; }

      container.innerHTML = '';
      actions.style.display = 'none';

      var canvas = document.createElement('canvas');
      QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: { dark: fg, light: bg }
      }, function (err) {
        if (err) {
          container.innerHTML = '<span style="color:var(--accent-red);">' + escapeHtml(t('qr.err.fail', { msg: err.message })) + '</span>';
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
        showToast(t('qrd.toast.success'), 'success');
      } else {
        result.value = '';
        showToast(t('qrd.toast.notFound'), 'error');
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
      if (!url) { showToast(t('qrd.toast.urlEmpty'), 'error'); return; }
      var img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function () { decodeImage(img); };
      img.onerror = function () { showToast(t('qrd.toast.loadFail'), 'error'); };
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
        encoded.value = t('url.err.encode', { msg: e.message });
      }
    });

    document.getElementById('urlDecodeBtn').addEventListener('click', function () {
      try {
        raw.value = decodeURIComponent(encoded.value);
      } catch (e) {
        raw.value = t('url.err.decode', { msg: e.message });
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
        raw.value = t('uni.err.decode', { msg: e.message });
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
      copyToClipboard(output.textContent, t('copy.uuid'));
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
        output.textContent = t('common.waiting');
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
      copyToClipboard(output.textContent, t('copy.hash'));
    });

    onLangChange(function () {
      if (!input.value) output.textContent = t('common.waiting');
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
    var lastBits = null;

    lenEl.addEventListener('input', function () {
      lenVal.textContent = this.value;
    });

    function renderStrength(bits) {
      var levelKey, color;
      if (bits < 40) { levelKey = 'pwd.level.weak'; color = 'var(--accent-red)'; }
      else if (bits < 80) { levelKey = 'pwd.level.medium'; color = 'var(--accent-orange)'; }
      else if (bits < 120) { levelKey = 'pwd.level.strong'; color = 'var(--accent-green)'; }
      else { levelKey = 'pwd.level.veryStrong'; color = 'var(--accent-cyan)'; }
      strength.innerHTML =
        '<span>' + escapeHtml(t('pwd.entropy', { n: Math.round(bits) })) + '</span>' +
        '<span style="color:' + color + ';">' + escapeHtml(t('pwd.strength', { level: t(levelKey) })) + '</span>';
    }

    document.getElementById('pwdGenerate').addEventListener('click', function () {
      var len = parseInt(lenEl.value);
      var chars = '';
      if (document.getElementById('pwdLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
      if (document.getElementById('pwdUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (document.getElementById('pwdDigits').checked) chars += '0123456789';
      if (document.getElementById('pwdSymbols').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (!chars) { showToast(t('pwd.toast.charset'), 'error'); return; }

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
      lastBits = bits;
      renderStrength(bits);
    });

    document.getElementById('pwdCopy').addEventListener('click', function () {
      copyToClipboard(output.value, t('copy.password'));
    });

    onLangChange(function () {
      if (lastBits !== null) renderStrength(lastBits);
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
        resultEl.textContent = t('rx.placeholder.result');
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
          resultEl.innerHTML = '<span style="color:var(--text-secondary);">' + escapeHtml(t('rx.noMatch')) + '</span>';
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
          resultEl.innerHTML += '<div style="color:var(--text-secondary);font-size:12px;">' + escapeHtml(t('rx.found', { n: matches.length })) + '</div>';
          if (matches.length <= 20) {
            for (var i = 0; i < matches.length; i++) {
              resultEl.innerHTML += '<div style="font-size:12px;color:var(--text-secondary);margin-top:4px;">' + escapeHtml(t('rx.matchItem', { i: i, pos: matches[i].index, text: matches[i].text })) + '</div>';
            }
          }
        }
      } catch (e) {
        resultEl.className = 'result-area';
        resultEl.innerHTML = '<span style="color:var(--accent-red);">' + escapeHtml(t('rx.err', { msg: e.message })) + '</span>';
      }
    }

    patternEl.addEventListener('input', test);
    flagsEl.addEventListener('change', test);
    textEl.addEventListener('input', test);

    onLangChange(test);
  }

  // ============================================================
  // TEXT DIFF
  // ============================================================

  function initTextDiff() {
    var output = document.getElementById('diffOutput');
    var lastResult = null;

    function render(oldText, newText) {
      if (!oldText && !newText) {
        output.className = 'result-area empty';
        output.textContent = t('diff.empty');
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
      summary.innerHTML =
        '<span style="color:var(--accent-green);">' + escapeHtml(t('diff.added', { n: addedCount })) + '</span>' +
        '<span style="color:var(--accent-red);">' + escapeHtml(t('diff.removed', { n: removedCount })) + '</span>';
      output.insertBefore(summary, output.firstChild);
    }

    document.getElementById('diffCompare').addEventListener('click', function () {
      var oldText = document.getElementById('diffOld').value;
      var newText = document.getElementById('diffNew').value;
      lastResult = { oldText: oldText, newText: newText };
      render(oldText, newText);
    });

    onLangChange(function () {
      if (lastResult) render(lastResult.oldText, lastResult.newText);
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
        preview.innerHTML = '<span style="color:var(--accent-red);">' + escapeHtml(t('md.err.render', { msg: e.message })) + '</span>';
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
        output.textContent = t('common.waiting');
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
      copyToClipboard(output.textContent, t('copy.case'));
    });

    onLangChange(doConvert);
  }

  // ============================================================
  // TIMESTAMP CONVERTER
  // ============================================================

  function initTimestamp() {
    var tsInput = document.getElementById('tsInput');
    var tsResult = document.getElementById('tsResult');
    var tsDateInput = document.getElementById('tsDateInput');
    var tsDateResult = document.getElementById('tsDateResult');
    var lastLeft = null, lastRight = null;

    function formatDate(d) {
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0') + '.' +
        String(d.getMilliseconds()).padStart(3, '0');
    }

    function renderLeft(state) {
      lastLeft = state;
      if (!state) return;
      if (state.kind === 'err') { tsResult.textContent = t(state.key); return; }
      if (state.kind === 'now') {
        tsResult.innerHTML =
          '<div>' + escapeHtml(t('ts.nowSec')) + ': <strong>' + Math.floor(state.now / 1000) + '</strong></div>' +
          '<div>' + escapeHtml(t('ts.nowMs')) + ': <strong>' + state.now + '</strong></div>';
        return;
      }
      var d = new Date(state.ts);
      tsResult.innerHTML =
        '<div>' + escapeHtml(t('ts.local')) + ': <strong>' + formatDate(d) + '</strong></div>' +
        '<div>' + escapeHtml(t('ts.utc')) + ': <strong>' + d.toISOString() + '</strong></div>' +
        '<div>' + escapeHtml(t('ts.weekday')) + ': ' + escapeHtml(t('ts.weekdayShort.' + d.getDay())) + '</div>' +
        '<div>' + escapeHtml(t('ts.unixSec')) + ': ' + Math.floor(state.ts / 1000) + '</div>' +
        '<div>' + escapeHtml(t('ts.unixMs')) + ': ' + state.ts + '</div>';
    }

    function renderRight(state) {
      lastRight = state;
      if (!state) return;
      if (state.kind === 'err') { tsDateResult.textContent = t(state.key); return; }
      var d = new Date(state.ms);
      tsDateResult.innerHTML =
        '<div>' + escapeHtml(t('ts.unixSec')) + ': <strong>' + Math.floor(state.ms / 1000) + '</strong></div>' +
        '<div>' + escapeHtml(t('ts.unixMs')) + ': <strong>' + state.ms + '</strong></div>' +
        '<div>ISO: ' + d.toISOString() + '</div>';
    }

    document.getElementById('tsConvert').addEventListener('click', function () {
      var val = tsInput.value.trim();
      if (!val) { renderLeft({ kind: 'err', key: 'ts.err.empty' }); return; }
      var ts = parseInt(val);
      if (isNaN(ts)) { renderLeft({ kind: 'err', key: 'ts.err.invalid' }); return; }

      // Autodetect seconds vs milliseconds
      if (ts > 1e12) ts = Math.floor(ts);
      else if (ts < 1e10) ts = ts * 1000;

      var d = new Date(ts);
      if (isNaN(d.getTime())) { renderLeft({ kind: 'err', key: 'ts.err.invalid' }); return; }

      renderLeft({ kind: 'ts', ts: ts });
    });

    document.getElementById('tsNow').addEventListener('click', function () {
      var now = Date.now();
      tsInput.value = now;
      renderLeft({ kind: 'now', now: now });
    });

    document.getElementById('tsDateConvert').addEventListener('click', function () {
      var val = tsDateInput.value.trim();
      if (!val) { renderRight({ kind: 'err', key: 'ts.err.dateEmpty' }); return; }
      var d = new Date(val);
      if (isNaN(d.getTime())) {
        var m = val.match(/(\d{4})[年\/\-.](\d{1,2})[月\/\-.](\d{1,2})/);
        if (m) d = new Date(m[1], m[2] - 1, m[3]);
      }
      if (isNaN(d.getTime())) { renderRight({ kind: 'err', key: 'ts.err.dateInvalid' }); return; }

      renderRight({ kind: 'ms', ms: d.getTime() });
    });

    onLangChange(function () {
      if (lastLeft) renderLeft(lastLeft);
      if (lastRight) renderRight(lastRight);
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
        result.innerHTML = '<span style="color:var(--accent-red);">' + t('color.err.parse') + '</span>';
      }
    });

    picker.addEventListener('input', function () {
      input.value = picker.value;
      updateColorDisplay(picker.value);
    });

    document.getElementById('colorCopy').addEventListener('click', function () {
      copyToClipboard(hexLabel.textContent, t('copy.hex'));
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
    var output = document.getElementById('numResult');
    var lastNum = null;

    function renderResult(num) {
      output.className = 'result-area';
      output.innerHTML =
        '<div><strong>' + t('nb.bin') + ':</strong> ' + num.toString(2) + '</div>' +
        '<div><strong>' + t('nb.oct') + ':</strong> ' + num.toString(8) + '</div>' +
        '<div><strong>' + t('nb.dec') + ':</strong> ' + num.toString(10) + '</div>' +
        '<div><strong>' + t('nb.hex') + ':</strong> ' + num.toString(16).toUpperCase() + '</div>';
    }

    document.getElementById('numConvert').addEventListener('click', function () {
      var input = document.getElementById('numInput').value.trim();
      var fromBase = parseInt(document.getElementById('numFromBase').value);

      if (!input) { lastNum = null; output.textContent = t('nb.err.empty'); return; }

      try {
        var num = parseInt(input, fromBase);
        if (isNaN(num)) { lastNum = null; output.textContent = t('nb.err.invalid'); return; }
        lastNum = num;
        renderResult(num);
      } catch (e) {
        lastNum = null;
        output.textContent = t('nb.err.generic', { msg: e.message });
      }
    });

    onLangChange(function () { if (lastNum !== null) renderResult(lastNum); });
  }

  // ============================================================
  // JWT DECODER
  // ============================================================

  function initJwtDecode() {
    var partsContainer = document.getElementById('jwtParts');
    var error = document.getElementById('jwtError');
    var lastInput = null;

    function decodeAndRender(input) {
      partsContainer.innerHTML = '';
      error.style.display = 'none';

      if (!input) {
        error.textContent = t('jwt.err.empty');
        error.style.display = 'block';
        return;
      }

      var parts = input.split('.');
      if (parts.length !== 3) {
        error.textContent = t('jwt.err.format');
        error.style.display = 'block';
        return;
      }

      var labels = ['Header', 'Payload', 'Signature'];
      for (var i = 0; i < 3; i++) {
        var decoded;
        try {
          var b64 = parts[i].replace(/-/g, '+').replace(/_/g, '/');
          while (b64.length % 4) b64 += '=';
          var raw = atob(b64);

          if (i < 2) {
            var obj = JSON.parse(raw);
            decoded = JSON.stringify(obj, null, 2);
          } else {
            decoded = t('jwt.signatureNote');
          }
        } catch (e) {
          decoded = t('jwt.err.decodeFail', { msg: e.message });
        }

        var partEl = document.createElement('div');
        partEl.className = 'jwt-part';
        partEl.innerHTML =
          '<div class="jwt-part-header">' + labels[i] + '</div>' +
          '<div class="jwt-part-content">' + (i < 2 ? syntaxHighlightJson(decoded) : decoded) + '</div>';
        partsContainer.appendChild(partEl);
      }
    }

    document.getElementById('jwtDecode').addEventListener('click', function () {
      lastInput = document.getElementById('jwtInput').value.trim();
      decodeAndRender(lastInput);
    });

    onLangChange(function () { if (lastInput !== null) decodeAndRender(lastInput); });
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
        showToast(t('yj.toast.toJson'), 'success');
      } catch (e) {
        showErr(t('yj.err.yaml', { msg: e.message }));
      }
    });

    document.getElementById('jsonToYaml').addEventListener('click', function () {
      try {
        var obj = JSON.parse(jsonEl.value);
        yamlEl.value = jsyaml.dump(obj, { indent: 2, lineWidth: -1 });
        showErr('');
        showToast(t('yj.toast.toYaml'), 'success');
      } catch (e) {
        showErr(t('yj.err.json', { msg: e.message }));
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
        showToast(t('xj.toast.toJson'), 'success');
      } catch (e) {
        showErr(t('xj.err.xml', { msg: e.message }));
      }
    });

    document.getElementById('jsonToXml').addEventListener('click', function () {
      try {
        var obj = JSON.parse(jsonEl.value);
        xmlEl.value = formatXml(jsonToXml(obj));
        showErr('');
        showToast(t('xj.toast.toXml'), 'success');
      } catch (e) {
        showErr(t('xj.err.convert', { msg: e.message }));
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
      if (!fmt) { output.textContent = t('sql.err.notLoaded'); return; }
      try {
        output.className = 'result-area';
        output.textContent = fmt(input.value, { language: dialect.value, keywordCase: 'upper' });
      } catch (e) {
        output.className = 'result-area';
        output.innerHTML = '<span style="color:var(--accent-red);">' + t('sql.err.format', { msg: escapeHtml(e.message) }) + '</span>';
      }
    });

    document.getElementById('sqlCompressBtn').addEventListener('click', function () {
      output.className = 'result-area';
      output.textContent = input.value.replace(/\s+/g, ' ').trim();
    });

    document.getElementById('sqlCopy').addEventListener('click', function () {
      copyToClipboard(output.textContent, t('copy.sql'));
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
        showErr(t('b64t.err.encode', { msg: e.message }));
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
        showErr(t('b64t.err.decode', { msg: e.message }));
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
        if (!keyEl.value) { showErr(t('aes.err.noKey')); return; }
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
        showToast(t('aes.toast.encrypt'), 'success');
      } catch (e) {
        showErr(t('aes.err.encrypt', { msg: e.message }));
      }
    });

    document.getElementById('aesDecryptBtn').addEventListener('click', function () {
      try {
        if (!keyEl.value) { showErr(t('aes.err.noKey')); return; }
        var bytes;
        if (modeEl.value === 'ECB') {
          var key = CryptoJS.enc.Utf8.parse(keyEl.value.padEnd(32, '\0').slice(0, 32));
          bytes = CryptoJS.AES.decrypt(cipherEl.value, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
        } else {
          bytes = CryptoJS.AES.decrypt(cipherEl.value, keyEl.value);
        }
        var text = bytes.toString(CryptoJS.enc.Utf8);
        if (!text) throw new Error(t('aes.err.empty'));
        plainEl.value = text;
        showErr('');
        showToast(t('aes.toast.decrypt'), 'success');
      } catch (e) {
        showErr(t('aes.err.decrypt', { msg: e.message }));
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
      copyToClipboard(output.textContent, t('copy.lorem'));
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
      if (sec < 60) fields.readTime.textContent = t('stats.sec', { n: sec });
      else fields.readTime.textContent = t('stats.minSec', { m: Math.floor(sec / 60), s: sec % 60 });
    }

    input.addEventListener('input', update);
    onLangChange(update);
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
      if (!expr) { explain.textContent = t('cron.empty'); nextEl.textContent = ''; return; }

      var parts = expr.split(/\s+/);
      if (parts.length !== 5) {
        explain.className = 'result-area';
        explain.innerHTML = '<span style="color:var(--accent-red);">' + t('cron.err.format') + '</span>';
        nextEl.textContent = '';
        return;
      }

      var fieldNames = [
        t('cron.field.minute'),
        t('cron.field.hour'),
        t('cron.field.date'),
        t('cron.field.month'),
        t('cron.field.weekday')
      ];
      var ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];

      try {
        var parsed = parts.map(function (p, i) { return parseField(p, ranges[i][0], ranges[i][1]); });
        var labelsMonth = [];
        for (var m = 1; m <= 12; m++) labelsMonth.push(t('cron.month.' + m));
        var labelsWeek = [];
        for (var w = 0; w <= 6; w++) labelsWeek.push(t('cron.week.' + w));

        var lines = [];
        lines.push(fieldNames[0] + ': ' + describeField(parts[0], parsed[0], ranges[0]));
        lines.push(fieldNames[1] + ': ' + describeField(parts[1], parsed[1], ranges[1]));
        lines.push(fieldNames[2] + ': ' + describeField(parts[2], parsed[2], ranges[2]));
        lines.push(fieldNames[3] + ': ' + describeField(parts[3], parsed[3], ranges[3], labelsMonth, 1));
        lines.push(fieldNames[4] + ': ' + describeField(parts[4], parsed[4], ranges[4], labelsWeek, 0));

        explain.className = 'result-area';
        explain.innerHTML = lines.map(function (l) { return '<div>' + escapeHtml(l) + '</div>'; }).join('');

        var times = nextRunTimes(parsed, 10);
        nextEl.className = 'result-area';
        nextEl.innerHTML = times.map(function (d, i) {
          return '<div>[' + (i + 1) + '] ' + formatLocal(d) + '</div>';
        }).join('') || '<span style="color:var(--text-secondary);">' + t('cron.noFutureMatch') + '</span>';
      } catch (e) {
        explain.className = 'result-area';
        explain.innerHTML = '<span style="color:var(--accent-red);">' + t('cron.err.parse', { msg: escapeHtml(e.message) }) + '</span>';
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
          if (isNaN(step) || step <= 0) throw new Error(t('cron.err.step', { p: part }));
        }
        var lo, hi;
        if (part === '*' || part === '') { lo = min; hi = max; }
        else if (part.indexOf('-') !== -1) {
          var seg = part.split('-');
          lo = parseInt(seg[0]); hi = parseInt(seg[1]);
        } else {
          lo = hi = parseInt(part);
        }
        if (isNaN(lo) || isNaN(hi)) throw new Error(t('cron.err.field', { p: part }));
        if (lo < min || hi > max || lo > hi) throw new Error(t('cron.err.range', { min: min, max: max, p: part }));
        for (var i = lo; i <= hi; i += step) set[i] = true;
      });
      return Object.keys(set).map(Number).sort(function (a, b) { return a - b; });
    }

    function describeField(raw, values, range, labels, base) {
      if (raw === '*') return t('cron.any');
      if (values.length === range[1] - range[0] + 1) return t('cron.any');
      if (values.length === 1) {
        return labels ? labels[values[0] - (base || 0)] : String(values[0]);
      }
      if (values.length <= 8) {
        return values.map(function (v) { return labels ? labels[v - (base || 0)] : v; }).join(', ');
      }
      return t('cron.values', { n: values.length, head: values.slice(0, 6).join(', ') });
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
      var weekLabels = [
        t('cron.week.0'),
        t('cron.week.1'),
        t('cron.week.2'),
        t('cron.week.3'),
        t('cron.week.4'),
        t('cron.week.5'),
        t('cron.week.6')
      ];
      return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':00 (' +
        weekLabels[d.getDay()] + ')';
    }

    input.addEventListener('input', parse);

    document.getElementById('cronParseBtn').addEventListener('click', parse);

    document.querySelectorAll('.cron-preset').forEach(function (btn) {
      btn.addEventListener('click', function () {
        input.value = this.getAttribute('data-cron');
        parse();
      });
    });

    onLangChange(parse);

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
          '<button class="grad-stop-remove" data-i="' + i + '" title="' + t('grad.btn.remove') + '">×</button>';
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
          if (stops.length <= 2) { showToast(t('grad.toast.minStops'), 'error'); return; }
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
      copyToClipboard(cssEl.value, t('copy.css'));
    });

    onLangChange(renderStops);

    renderStops();
    updateGradient();
  }

  // ============================================================
  // HTTP STATUS
  // ============================================================

  var HTTP_STATUS = [
    { code: 100, name: 'Continue', zh: '客户端应继续发送请求剩余部分。', en: 'Client should continue with its request.' },
    { code: 101, name: 'Switching Protocols', zh: '服务器已理解并切换协议（如升级到 WebSocket）。', en: 'Server is switching protocols as requested (e.g. WebSocket upgrade).' },
    { code: 102, name: 'Processing', zh: '服务器已收到并处理中（WebDAV）。', en: 'Server received and is processing (WebDAV).' },
    { code: 103, name: 'Early Hints', zh: '提前返回提示头部信息，便于预加载资源。', en: 'Early hint headers, useful for resource preloading.' },

    { code: 200, name: 'OK', zh: '请求成功，最常见的成功响应。', en: 'Request succeeded; the most common success response.' },
    { code: 201, name: 'Created', zh: '请求成功且创建了新资源（POST 后常用）。', en: 'Request succeeded and a new resource was created (typical for POST).' },
    { code: 202, name: 'Accepted', zh: '请求已接收但尚未处理完成（异步任务）。', en: 'Request accepted but processing not finished (async task).' },
    { code: 203, name: 'Non-Authoritative Information', zh: '响应来自第三方副本而非源服务器。', en: 'Response from a third-party copy, not the origin server.' },
    { code: 204, name: 'No Content', zh: '请求成功但响应体为空（DELETE 后常用）。', en: 'Request succeeded but response body is empty (typical for DELETE).' },
    { code: 205, name: 'Reset Content', zh: '客户端应重置文档视图。', en: 'Client should reset the document view.' },
    { code: 206, name: 'Partial Content', zh: '范围请求成功，返回部分内容（断点续传）。', en: 'Range request succeeded; partial content returned (resumable downloads).' },

    { code: 301, name: 'Moved Permanently', zh: '资源已永久移动到新位置，搜索引擎应更新索引。', en: 'Resource permanently moved; search engines should update their index.' },
    { code: 302, name: 'Found', zh: '资源临时位于其他位置（保留请求方法）。', en: 'Resource temporarily located elsewhere (method preserved).' },
    { code: 303, name: 'See Other', zh: '使用 GET 方法跳转到指定地址。', en: 'Redirect using GET method to the specified address.' },
    { code: 304, name: 'Not Modified', zh: '资源未变化，可使用本地缓存。', en: 'Resource unchanged; client may use cached copy.' },
    { code: 307, name: 'Temporary Redirect', zh: '临时重定向，必须保留原方法和请求体。', en: 'Temporary redirect; original method and body must be preserved.' },
    { code: 308, name: 'Permanent Redirect', zh: '永久重定向，必须保留原方法和请求体。', en: 'Permanent redirect; original method and body must be preserved.' },

    { code: 400, name: 'Bad Request', zh: '请求语法错误，服务器无法理解。', en: 'Request syntax error; server cannot understand it.' },
    { code: 401, name: 'Unauthorized', zh: '需要身份认证，认证失败或未提供凭据。', en: 'Authentication required, failed, or credentials missing.' },
    { code: 402, name: 'Payment Required', zh: '保留状态码，预留给付费场景。', en: 'Reserved status code, intended for paid resources.' },
    { code: 403, name: 'Forbidden', zh: '服务器拒绝执行，权限不足。', en: 'Server refuses to fulfill the request; insufficient permissions.' },
    { code: 404, name: 'Not Found', zh: '请求的资源不存在。', en: 'Requested resource does not exist.' },
    { code: 405, name: 'Method Not Allowed', zh: '请求方法不被允许（如对静态资源使用 POST）。', en: 'Request method not allowed (e.g. POST against a static resource).' },
    { code: 406, name: 'Not Acceptable', zh: '资源无法满足客户端 Accept 头要求。', en: 'Resource cannot satisfy the client Accept header.' },
    { code: 407, name: 'Proxy Authentication Required', zh: '需要先通过代理认证。', en: 'Client must authenticate with the proxy first.' },
    { code: 408, name: 'Request Timeout', zh: '客户端发送请求超时。', en: 'Client request timed out.' },
    { code: 409, name: 'Conflict', zh: '请求与服务器当前状态冲突（如版本冲突）。', en: 'Request conflicts with current server state (e.g. version conflict).' },
    { code: 410, name: 'Gone', zh: '资源已永久删除，无转发地址。', en: 'Resource permanently deleted; no forwarding address.' },
    { code: 411, name: 'Length Required', zh: '请求未指定 Content-Length。', en: 'Request did not specify Content-Length.' },
    { code: 412, name: 'Precondition Failed', zh: '请求头中的前提条件不成立。', en: 'Precondition in request headers failed.' },
    { code: 413, name: 'Payload Too Large', zh: '请求体过大，服务器拒绝处理。', en: 'Request body too large; server refuses to process.' },
    { code: 414, name: 'URI Too Long', zh: '请求 URI 过长。', en: 'Request URI is too long.' },
    { code: 415, name: 'Unsupported Media Type', zh: '不支持的媒体类型。', en: 'Unsupported media type.' },
    { code: 416, name: 'Range Not Satisfiable', zh: 'Range 请求范围无效。', en: 'Requested range is not satisfiable.' },
    { code: 417, name: 'Expectation Failed', zh: 'Expect 请求头无法满足。', en: 'Expect request header cannot be satisfied.' },
    { code: 418, name: "I'm a teapot", zh: '愚人节彩蛋，永远不会冲泡咖啡的茶壶。', en: 'April Fools easter egg: a teapot will never brew coffee.' },
    { code: 422, name: 'Unprocessable Entity', zh: '请求格式正确但语义错误（参数校验失败）。', en: 'Request is well-formed but semantically incorrect (validation failed).' },
    { code: 423, name: 'Locked', zh: '资源被锁定（WebDAV）。', en: 'Resource is locked (WebDAV).' },
    { code: 425, name: 'Too Early', zh: '服务器拒绝处理可能被重放的请求。', en: 'Server refuses to process a request that might be replayed.' },
    { code: 426, name: 'Upgrade Required', zh: '客户端应升级到不同协议。', en: 'Client should upgrade to a different protocol.' },
    { code: 428, name: 'Precondition Required', zh: '需要先决条件头部。', en: 'Precondition headers are required.' },
    { code: 429, name: 'Too Many Requests', zh: '请求过于频繁，触发限流。', en: 'Too many requests; rate limit triggered.' },
    { code: 431, name: 'Request Header Fields Too Large', zh: '请求头过大。', en: 'Request header fields are too large.' },
    { code: 451, name: 'Unavailable For Legal Reasons', zh: '因法律原因无法提供。', en: 'Unavailable due to legal reasons.' },

    { code: 500, name: 'Internal Server Error', zh: '服务器内部错误，最常见的服务端错误。', en: 'Server internal error; the most common server-side error.' },
    { code: 501, name: 'Not Implemented', zh: '服务器不支持该请求方法。', en: 'Server does not support the requested method.' },
    { code: 502, name: 'Bad Gateway', zh: '网关或代理收到上游无效响应。', en: 'Gateway or proxy received an invalid response from upstream.' },
    { code: 503, name: 'Service Unavailable', zh: '服务暂不可用（过载或维护）。', en: 'Service temporarily unavailable (overload or maintenance).' },
    { code: 504, name: 'Gateway Timeout', zh: '网关或代理上游响应超时。', en: 'Gateway or proxy timed out waiting for upstream.' },
    { code: 505, name: 'HTTP Version Not Supported', zh: '不支持的 HTTP 版本。', en: 'HTTP version not supported.' },
    { code: 507, name: 'Insufficient Storage', zh: '存储空间不足。', en: 'Insufficient storage.' },
    { code: 508, name: 'Loop Detected', zh: '检测到无限循环（WebDAV）。', en: 'Infinite loop detected (WebDAV).' },
    { code: 510, name: 'Not Extended', zh: '需要进一步扩展才能完成请求。', en: 'Further extensions are required to fulfill the request.' },
    { code: 511, name: 'Network Authentication Required', zh: '需要进行网络认证（如公共 WiFi 登录）。', en: 'Network authentication required (e.g. captive portal login).' }
  ];

  function initHttpStatus() {
    var listEl = document.getElementById('httpList');
    var search = document.getElementById('httpSearch');
    var currentCat = 'all';

    function descOf(s) {
      var lang = (window.i18n && window.i18n.getLang && window.i18n.getLang()) || 'zh';
      return lang === 'en' ? s.en : s.zh;
    }

    function render() {
      var q = search.value.trim().toLowerCase();
      var filtered = HTTP_STATUS.filter(function (s) {
        var cat = String(s.code).charAt(0);
        if (currentCat !== 'all' && cat !== currentCat) return false;
        if (!q) return true;
        return String(s.code).indexOf(q) !== -1
          || s.name.toLowerCase().indexOf(q) !== -1
          || s.zh.toLowerCase().indexOf(q) !== -1
          || s.en.toLowerCase().indexOf(q) !== -1;
      });

      if (!filtered.length) {
        listEl.innerHTML = '<div style="color:var(--text-secondary);padding:20px;">' + t('http.empty') + '</div>';
        return;
      }

      listEl.innerHTML = filtered.map(function (s) {
        var cat = String(s.code).charAt(0);
        return '<div class="http-item cat-' + cat + '">' +
          '<div class="http-code">' + s.code + '</div>' +
          '<div class="http-name">' + escapeHtml(s.name) + '</div>' +
          '<div class="http-desc">' + escapeHtml(descOf(s)) + '</div>' +
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

    onLangChange(render);

    render();
  }

})();
