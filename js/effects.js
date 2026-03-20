/* =============================================
   effects.js — portfolio interactivity
   - typing animation on the hero headline
   - skill bars animate when scrolled into view
   - card shimmer on hover
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ── TYPING ANIMATION ──────────────────────
     Targets the hero h1. Pulls out the full text,
     clears it, then types it back character by
     character. The em tag color is preserved by
     rebuilding it as HTML rather than plain text. */

  const heroTitle = document.querySelector('.hero__title');

  if (heroTitle) {
    // grab the original inner html so we keep the <em> tag
    const originalHTML = heroTitle.innerHTML;

    // strip to plain text first to measure length, then retype with tags
    const segments = [];
    heroTitle.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        segments.push({ type: 'text', content: node.textContent });
      } else if (node.nodeName === 'EM') {
        segments.push({ type: 'em', content: node.textContent });
      } else if (node.nodeName === 'BR') {
        segments.push({ type: 'br' });
      }
    });

    // flatten into a sequence of characters with metadata
    const chars = [];
    segments.forEach(seg => {
      if (seg.type === 'br') {
        chars.push({ char: null, type: 'br' });
      } else {
        seg.content.split('').forEach(c => {
          chars.push({ char: c, type: seg.type });
        });
      }
    });

    heroTitle.innerHTML = '';
    heroTitle.style.minHeight = '1em'; // prevent layout jump while empty

    let i = 0;
    // slight delay so the page has settled before typing starts
    setTimeout(() => {
      const type = () => {
        if (i >= chars.length) return;

        const item = chars[i];

        if (item.type === 'br') {
          heroTitle.appendChild(document.createElement('br'));
        } else {
          // find or create the current text / em container
          const lastChild = heroTitle.lastChild;
          if (item.type === 'em') {
            // reuse existing trailing em, or make a new one
            if (lastChild && lastChild.nodeName === 'EM') {
              lastChild.textContent += item.char;
            } else {
              const em = document.createElement('em');
              em.textContent = item.char;
              heroTitle.appendChild(em);
            }
          } else {
            if (lastChild && lastChild.nodeType === Node.TEXT_NODE) {
              lastChild.textContent += item.char;
            } else {
              heroTitle.appendChild(document.createTextNode(item.char));
            }
          }
        }

        i++;
        // vary speed slightly so it feels hand-typed not robotic
        const delay = item.type === 'br' ? 120 : 38 + Math.random() * 30;
        setTimeout(type, delay);
      };
      type();
    }, 400);
  }


  /* ── SKILL BAR SCROLL ANIMATION ───────────────
     Skill bars start at width 0 in CSS via a class,
     then animate to their target width when they
     enter the viewport. Uses IntersectionObserver
     so it only fires once per bar. */

  const skillFills = document.querySelectorAll('.skill-fill');

  if (skillFills.length > 0) {
    // stash the target widths and reset to 0
    skillFills.forEach(fill => {
      fill.dataset.target = fill.style.width || '0%';
      fill.style.width = '0%';
      fill.style.transition = 'width 0.9s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    const barObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          // small stagger so bars in the same grid don't all fire simultaneously
          const index = [...skillFills].indexOf(fill);
          setTimeout(() => {
            fill.style.width = fill.dataset.target;
          }, index * 80);
          barObserver.unobserve(fill);
        }
      });
    }, { threshold: 0.3 });

    skillFills.forEach(fill => barObserver.observe(fill));
  }


  /* ── CARD SHIMMER ──────────────────────────────
     Injects a moving light sweep across cards on
     hover using a pseudo-element approach via JS
     (since we can't easily animate ::before position
     from CSS alone without custom props).
     Uses a canvas-free gradient overlay that follows
     the mouse position within the card. */

  const cards = document.querySelectorAll('.card, .featured, .sidebar-box, .form-box');

  cards.forEach(card => {
    // make sure the card can contain the overlay
    const existingPosition = getComputedStyle(card).position;
    if (existingPosition === 'static') card.style.position = 'relative';
    card.style.overflow = 'hidden';

    // create the shimmer overlay element
    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      border-radius: inherit;
      z-index: 1;
    `;
    card.appendChild(shimmer);

    card.addEventListener('mouseenter', () => {
      shimmer.style.opacity = '1';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      shimmer.style.background = `
        radial-gradient(
          circle at ${x}% ${y}%,
          rgba(180, 143, 224, 0.10) 0%,
          rgba(180, 143, 224, 0.04) 40%,
          transparent 70%
        )
      `;
    });

    card.addEventListener('mouseleave', () => {
      shimmer.style.opacity = '0';
    });
  });


  /* ── SCROLL FADE-IN ────────────────────────────
     Subtle — sections and timeline items fade up
     into view as you scroll. Adds a class that
     triggers a CSS transition. */

  const fadeEls = document.querySelectorAll(
    '.tl-item, .stat, .card, .featured, .form-box, .profile-grid, .sidebar-box'
  );

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  });

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        // stagger siblings slightly for a cascade feel
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 60 * (idx % 4)); // cap stagger at 4 so it doesn't get too slow
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  fadeEls.forEach(el => fadeObserver.observe(el));

});
