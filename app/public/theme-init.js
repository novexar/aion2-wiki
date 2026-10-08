// 初回描画前にテーマを適用してちらつきを防ぐ（CSP のためインラインではなく外部ファイル）
(function () {
  var pref = 'system';
  try {
    pref = localStorage.getItem('aion2wiki:theme') || 'system';
  } catch (e) {}
  var dark =
    pref === 'dark' ||
    (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  var root = document.documentElement;
  root.dataset.theme = dark ? 'dark' : 'light';
  root.style.colorScheme = dark ? 'dark' : 'light';
})();
