(function () {
  'use strict';

  var GA_MEASUREMENT_ID = 'G-XDHF2H7QK9';
  if (!window.__lulGaInitialized) {
    window.__lulGaInitialized = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);

    var gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    document.head.appendChild(gaScript);
  }

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
