(function () {
  'use strict';

  // Location form: redirect to venue page
  var locationUrls = {
    evike: 'location-evike.html',
    'cube-vr': 'location-cube-vr.html',
    'lake-erie-arms': 'location-lake-erie-arms.html'
  };

  var locationForm = document.getElementById('location-form');
  if (locationForm) {
    locationForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var select = locationForm.querySelector('select[name="location"]');
      var value = select && select.value;
      if (value && locationUrls[value]) {
        window.location.href = locationUrls[value];
      } else {
        if (select) select.focus();
      }
    });
  }

  // Ensure Play mega menu includes How It Works and Our Experiences
  var playMenuGrids = document.querySelectorAll('.play-mega-grid');
  var createPlayMegaCard = function (href, imageClass, titleText) {
    var card = document.createElement('a');
    card.href = href;
    card.className = 'play-mega-card';
    card.setAttribute('role', 'menuitem');
    card.innerHTML =
      '<span class="play-mega-card-image ' + imageClass + '"></span>' +
      '<span class="play-mega-card-content">' +
        '<span class="play-mega-card-text">' +
          '<span class="play-mega-card-title">' + titleText + '</span>' +
        '</span>' +
        '<span class="play-mega-card-arrow" aria-hidden="true">' +
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
        '</span>' +
      '</span>';
    return card;
  };

  if (playMenuGrids.length) {
    playMenuGrids.forEach(function (grid) {
      var hasHowItWorks = grid.querySelector('a[href="how-it-works.html"]');
      var hasOurExperiences = grid.querySelector('a[href="our-experiences.html"]');

      if (!hasHowItWorks) {
        grid.appendChild(createPlayMegaCard('how-it-works.html', 'play-mega-thumb-howitworks', 'How It Works'));
      }

      if (!hasOurExperiences) {
        grid.appendChild(createPlayMegaCard('our-experiences.html', 'play-mega-thumb-experiences', 'Our Experiences'));
      }
    });
  }

  // Remove duplicate "How it works" text link in Play footer (card remains)
  var playFooterHowItWorksLinks = document.querySelectorAll('.play-mega-footer a[href^="how-it-works.html"]');
  if (playFooterHowItWorksLinks.length) {
    playFooterHowItWorksLinks.forEach(function (link) {
      link.remove();
    });
  }

  // Header dropdowns: click to toggle, close on outside click
  var dropdownItems = document.querySelectorAll('.nav-item-dropdown');
  if (dropdownItems.length) {
    dropdownItems.forEach(function (item) {
      var trigger = item.querySelector('.nav-dropdown-trigger');
      if (!trigger) return;
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

        dropdownItems.forEach(function (otherItem) {
          var otherTrigger = otherItem.querySelector('.nav-dropdown-trigger');
          if (!otherTrigger) return;
          if (otherItem !== item) {
            otherTrigger.setAttribute('aria-expanded', 'false');
            otherItem.classList.remove('is-open');
          }
        });

        trigger.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        item.classList.toggle('is-open', !isExpanded);
      });
    });

    document.addEventListener('click', function (e) {
      dropdownItems.forEach(function (item) {
        if (!item.contains(e.target)) {
          var trigger = item.querySelector('.nav-dropdown-trigger');
          if (trigger) trigger.setAttribute('aria-expanded', 'false');
          item.classList.remove('is-open');
        }
      });
    });
  }

  // Mobile menu
  var menuToggle = document.querySelector('.menu-toggle');
  var navMobile = document.querySelector('.nav-mobile');
  var navLinks = navMobile ? navMobile.querySelectorAll('a') : [];

  if (menuToggle && navMobile) {
    menuToggle.addEventListener('click', function () {
      var isOpen = navMobile.classList.toggle('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        navMobile.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open menu');
        document.body.style.overflow = '';
      });
    });
  }

  // Plan an event page: venue picker redirects to corresponding location page
  var planEventForm = document.getElementById('plan-event-venue-form');
  var planEventSelect = document.getElementById('plan-event-venue-select');
  if (planEventForm && planEventSelect) {
    planEventForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = planEventSelect.value;
      if (value && locationUrls[value]) {
        window.location.href = locationUrls[value] + '#plan-an-event';
      } else {
        planEventSelect.focus();
      }
    });
  }

  // Upcoming tournaments/events page: render synced Google Sheet data
  var eventsList = document.getElementById('events-list');
  if (eventsList) {
    var filterForm = document.getElementById('events-filters');
    var filterState = document.getElementById('filter-state');
    var filterType = document.getElementById('filter-type');
    var filterClear = document.getElementById('events-filter-clear');
    var allEvents = [];

    var formatSingleDate = function (value) {
      var parsed = new Date(value);
      if (isNaN(parsed.getTime())) return '';
      return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
    var formatDateRange = function (startValue, endValue) {
      var start = new Date(startValue);
      var end = new Date(endValue);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

      var startYear = start.getFullYear();
      var endYear = end.getFullYear();
      var startMonth = start.getMonth();
      var endMonth = end.getMonth();
      var startDay = start.getDate();
      var endDay = end.getDate();

      if (startYear === endYear && startMonth === endMonth) {
        var month = start.toLocaleDateString('en-US', { month: 'short' });
        return month + ' ' + startDay + '-' + endDay + ', ' + startYear;
      }

      if (startYear === endYear) {
        var startPart = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        var endPart = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return startPart + ' - ' + endPart + ', ' + startYear;
      }

      return formatSingleDate(startValue) + ' - ' + formatSingleDate(endValue);
    };
    var formatEventDate = function (value) {
      if (!value) return 'Date TBA';
      var normalized = String(value).trim();
      var rangeMatch = normalized.match(/^(.+?)(?:\s+to\s+|\s*–\s*|\s*-\s*)(.+)$/i);
      if (rangeMatch) {
        var startText = rangeMatch[1].trim();
        var endText = rangeMatch[2].trim();
        var formattedRange = formatDateRange(startText, endText);
        if (formattedRange) return formattedRange;
      }

      var formattedSingle = formatSingleDate(normalized);
      return formattedSingle || normalized;
    };
    var escapeHtml = function (value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    var normalizeValue = function (value) {
      return String(value || '').trim().toLowerCase();
    };
    var extractState = function (event) {
      var cityState = String(event.city_state || '').trim();
      if (cityState) {
        var parts = cityState.split(',');
        var lastPart = parts.length > 1 ? parts[parts.length - 1].trim() : cityState;
        if (lastPart) return lastPart.toUpperCase();
      }
      return '';
    };
    var populateFilterOptions = function () {
      if (!filterState || !filterType) return;

      var stateSet = {};
      var typeSet = {};

      allEvents.forEach(function (event) {
        var state = extractState(event);
        var type = String(event.event_type || '').trim();
        if (state) stateSet[state] = true;
        if (type) typeSet[type] = true;
      });

      var states = Object.keys(stateSet).sort();
      var types = Object.keys(typeSet).sort(function (a, b) {
        return a.localeCompare(b);
      });

      filterState.innerHTML = ['<option value="">All states</option>']
        .concat(states.map(function (state) {
          return '<option value="' + escapeHtml(state) + '">' + escapeHtml(state) + '</option>';
        }))
        .join('');

      filterType.innerHTML = ['<option value="">All types</option>']
        .concat(types.map(function (type) {
          return '<option value="' + escapeHtml(type) + '">' + escapeHtml(type) + '</option>';
        }))
        .join('');
    };
    var renderEvents = function () {
      var selectedState = normalizeValue(filterState && filterState.value);
      var selectedType = normalizeValue(filterType && filterType.value);
      var filtered = allEvents.filter(function (event) {
        var eventState = normalizeValue(extractState(event));
        var eventType = normalizeValue(event.event_type);
        if (selectedState && eventState !== selectedState) return false;
        if (selectedType && eventType !== selectedType) return false;
        return true;
      });

      if (!filtered.length) {
        eventsList.innerHTML = '<li><a href="#"><span class="news-title">No matching events</span><span class="news-meta">Try different filters</span></a></li>';
        return;
      }

      eventsList.innerHTML = filtered
        .map(function (event) {
          var title = escapeHtml(event.event_name || 'Untitled event');
          var typeLabel = escapeHtml(event.event_type || 'Event');
          var date = escapeHtml(formatEventDate(event.date));
          var location = escapeHtml(event.location_name || 'Location TBA');
          var cityState = escapeHtml(event.city_state || '');
          var locationText = cityState ? location + ' (' + cityState + ')' : location;
          var startTime = escapeHtml(event.start_time || 'TBD');
          var endTime = escapeHtml(event.end_time || '');
          var timeText = endTime ? 'Starts: ' + startTime + ' | Ends: ' + endTime : 'Starts: ' + startTime;
          var href = String(event.registration_url || '#').trim();
          var normalizedRegistration = href.toLowerCase();
          var isNoRegistrationRequired = normalizedRegistration === 'none';
          var isValidUrl = /^https?:\/\//i.test(href);
          var registerAction = isNoRegistrationRequired
            ? '<span class="btn btn-ghost btn-small event-register-btn no-registration" aria-label="No registration required">No registration required</span>'
            : isValidUrl
              ? '<a href="' + href + '" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-small event-register-btn">Register</a>'
              : '<span class="btn btn-ghost btn-small event-register-btn is-disabled" aria-disabled="true">Registration soon</span>';
          return '<li class="event-card"><div class="event-card-summary"><div class="event-title-block"><span class="news-title">' + title + '</span><span class="event-type-label">' + typeLabel + '</span></div><span class="news-meta">' + date + ' - ' + locationText + '</span></div><div class="event-card-details"><span class="event-time-meta">' + timeText + '</span>' + registerAction + '</div></li>';
        })
        .join('');
    };

    fetch('content/data/events.json')
      .then(function (response) {
        if (!response.ok) throw new Error('Unable to load events');
        return response.json();
      })
      .then(function (payload) {
        allEvents = (payload && payload.events) || [];
        if (!allEvents.length) {
          eventsList.innerHTML = '<li><a href="#"><span class="news-title">No upcoming events yet</span><span class="news-meta">Check back soon</span></a></li>';
          return;
        }

        populateFilterOptions();
        renderEvents();

        if (filterForm) {
          filterForm.addEventListener('change', renderEvents);
        }

        if (filterClear) {
          filterClear.addEventListener('click', function () {
            if (filterState) filterState.value = '';
            if (filterType) filterType.value = '';
            renderEvents();
          });
        }
      })
      .catch(function () {
        var fallbackPayload = window.__EVENTS_DATA__;
        allEvents = (fallbackPayload && fallbackPayload.events) || [];
        if (!allEvents.length) {
          eventsList.innerHTML = '<li><a href="#"><span class="news-title">Could not load events</span><span class="news-meta">Try again later</span></a></li>';
          return;
        }
        populateFilterOptions();
        renderEvents();

        if (filterForm) {
          filterForm.addEventListener('change', renderEvents);
        }

        if (filterClear) {
          filterClear.addEventListener('click', function () {
            if (filterState) filterState.value = '';
            if (filterType) filterType.value = '';
            renderEvents();
          });
        }
      });
  }

  // Gallery page: rotating carousel
  var aboutGalleryCarousel = document.getElementById('about-gallery-carousel');
  var aboutGalleryTrack = document.getElementById('about-gallery-carousel-track');
  var aboutGalleryPrev = document.getElementById('about-gallery-prev');
  var aboutGalleryNext = document.getElementById('about-gallery-next');
  var aboutGalleryDots = document.getElementById('about-gallery-dots');
  if (aboutGalleryCarousel && aboutGalleryTrack && aboutGalleryPrev && aboutGalleryNext && aboutGalleryDots) {
    var galleryFileNames = [
      'AirsoftCon Recap.00_00_05_21.Still001.jpg',
      'AirsoftCon Recap.00_00_10_23.Still003.jpg',
      'CHO_3492-Enhanced-NR.jpg',
      'CHO_3624-Enhanced-NR.jpg',
      'CHO_3699-Enhanced-NR.jpg',
      'CHO_8692.jpg',
      'CHO_8704.jpg',
      'CHO_8760.jpg',
      'CHO_8768.jpg',
      'CHO_8778.jpg',
      'CHO_8832.jpg',
      'CHO_8906.jpg',
      'CHO_8928.jpg',
      'CHO_8939.jpg',
      'CHO_8976.jpg',
      'Copy of P1074537.MOV.07_24_41_36.Still001.png',
      'Copy of P1074606.MOV.07_28_13_11.Still001-2.jpg',
      'Copy of P1074611.MOV.07_29_55_43.Still001-2.jpg',
      'IMG_0137-Enhanced-NR.jpg',
      'IMG_0190-Enhanced-NR.jpg',
      'IMG_1093.HEIC',
      'IMG_6467-Enhanced-NR.jpg',
      'IMG_6478.jpg',
      'IMG_6678-Enhanced-NR.jpg',
      'IMG_6891.JPG',
      'IMG_6901.JPG',
      'IMG_6920.JPG',
      'IMG_6923.jpg',
      'IMG_6938.JPG',
      'IMG_6987.JPG',
      'IMG_7066-Enhanced-NR.jpg',
      'IMG_7113-Enhanced-NR.jpg',
      'IMG_7175-Enhanced-NR.jpg',
      'P1092759.jpg',
      'P1092785.jpg',
      'Website landing page.00_01_05_10.Still001.jpg',
      '_1092201.jpg',
      '_1092408.jpg',
      '_1092420.jpg',
      '_1092484.jpg',
      '_1092496.jpg',
      '_1092562.jpg',
      '_1092661.jpg'
    ];
    var normalizeAltText = function (fileName) {
      return String(fileName || '')
        .replace(/\.[^.]+$/, '')
        .replace(/[_\.]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    var isSupportedImage = function (fileName) {
      return /\.(jpe?g|png|webp|gif|avif)$/i.test(String(fileName || ''));
    };
    galleryFileNames = galleryFileNames.filter(isSupportedImage);
    var imageMarkup = function (fileName, eager) {
      var src = 'content/images/gallery/' + encodeURIComponent(fileName);
      var alt = normalizeAltText(fileName)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      var loading = eager ? 'eager' : 'lazy';
      return '<img src="' + src + '" alt="' + alt + '" loading="' + loading + '" decoding="async" />';
    };

    if (!galleryFileNames.length) return;

    aboutGalleryTrack.innerHTML = galleryFileNames.map(function (fileName, index) {
      return '<figure class="about-gallery-slide' + (index === 0 ? ' is-active' : '') + '" aria-hidden="' + (index === 0 ? 'false' : 'true') + '">' +
        imageMarkup(fileName, index === 0) +
      '</figure>';
    }).join('');

    aboutGalleryDots.innerHTML = galleryFileNames.map(function (_, index) {
      return '<button type="button" class="about-gallery-dot' + (index === 0 ? ' is-active' : '') + '" data-index="' + index + '" aria-label="Go to slide ' + (index + 1) + '"></button>';
    }).join('');

    var currentSlide = 0;
    var totalSlides = galleryFileNames.length;
    var autoplayMs = 4500;
    var autoplayTimer = null;
    var slideEls = aboutGalleryTrack.querySelectorAll('.about-gallery-slide');
    var dotEls = aboutGalleryDots.querySelectorAll('.about-gallery-dot');

    var renderSlide = function (index) {
      currentSlide = (index + totalSlides) % totalSlides;
      slideEls.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === currentSlide);
        slide.setAttribute('aria-hidden', idx === currentSlide ? 'false' : 'true');
      });
      dotEls.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === currentSlide);
      });
    };

    var restartAutoplay = function () {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      autoplayTimer = window.setInterval(function () {
        renderSlide(currentSlide + 1);
      }, autoplayMs);
    };

    aboutGalleryPrev.addEventListener('click', function () {
      renderSlide(currentSlide - 1);
      restartAutoplay();
    });

    aboutGalleryNext.addEventListener('click', function () {
      renderSlide(currentSlide + 1);
      restartAutoplay();
    });

    dotEls.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var targetIndex = Number(dot.getAttribute('data-index'));
        if (!Number.isNaN(targetIndex)) {
          renderSlide(targetIndex);
          restartAutoplay();
        }
      });
    });

    aboutGalleryCarousel.addEventListener('mouseenter', function () {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
    });
    aboutGalleryCarousel.addEventListener('mouseleave', function () {
      restartAutoplay();
    });
    aboutGalleryCarousel.addEventListener('focusin', function () {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
    });
    aboutGalleryCarousel.addEventListener('focusout', function (event) {
      if (!aboutGalleryCarousel.contains(event.relatedTarget)) {
        restartAutoplay();
      }
    });

    if (totalSlides > 1) {
      restartAutoplay();
    }
  }

  // Optional: smooth scroll for anchor links (some browsers need this)
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    var id = anchor.getAttribute('href');
    if (id === '#') return;
    var target = document.querySelector(id);
    if (target) {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  });
})();
