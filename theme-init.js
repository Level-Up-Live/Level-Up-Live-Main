(function () {
  'use strict';
  var STORAGE_KEY = 'lul-theme';
  function fromMedia() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function resolve() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {}
    return fromMedia();
  }
  document.documentElement.setAttribute('data-theme', resolve());
})();
