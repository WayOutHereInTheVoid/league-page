/**
 * Enhanced Mobile Touch Interactions for Phase 3.1
 * Provides swipe gestures, touch optimizations, and progressive disclosure
 *
 * @module mobileInteractions
 */

/**
 * Attaches swipe left, swipe right, tap, and long press touch gesture handlers to a card or container element.
 *
 * @param {HTMLElement} element - The target DOM element.
 * @param {Object} [options={}] - Custom configuration parameters.
 * @param {Function} [options.onSwipeLeft] - Swipe-left callback.
 * @param {Function} [options.onSwipeRight] - Swipe-right callback.
 * @param {Function} [options.onTap] - Tap callback.
 * @param {Function} [options.onLongPress] - Long press callback.
 * @param {number} [options.swipeThreshold=50] - Pixel distance required to register a swipe.
 * @param {number} [options.longPressDelay=500] - Duration in ms before registering a long press.
 * @returns {{destroy: Function}} Object containing a destroy cleanup function to detach registered event listeners.
 */
export const addTouchGestures = (element, options = {}) => {
  const {
    onSwipeLeft = () => {},
    onSwipeRight = () => {},
    onTap = () => {},
    onLongPress = () => {},
    swipeThreshold = 50,
    longPressDelay = 500,
  } = options;

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isLongPress = false;
  let longPressTimer = null;
  let isDragging = false;

  /**
   * Internal touch start gesture hook.
   * @param {TouchEvent} e - Touch event.
   */
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isLongPress = false;
    isDragging = false;

    // Start long press timer
    longPressTimer = setTimeout(() => {
      isLongPress = true;
      onLongPress(e);
      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, longPressDelay);

    // Add visual feedback
    element.style.transform = "scale(0.98)";
    element.style.transition = "transform 0.1s ease";
  };

  /**
   * Internal touch move gesture hook.
   * @param {TouchEvent} e - Touch event.
   */
  const handleTouchMove = (e) => {
    if (!startX || !startY) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);

    // If significant movement, cancel long press
    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      isDragging = true;
    }

    // Prevent scrolling during horizontal swipes
    if (deltaX > deltaY && deltaX > 20) {
      e.preventDefault();
    }
  };

  /**
   * Internal touch end gesture hook.
   * @param {TouchEvent} e - Touch event.
   */
  const handleTouchEnd = (e) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    // Remove visual feedback
    element.style.transform = "";
    element.style.transition = "";

    if (!startX || !startY || isLongPress) {
      startX = startY = 0;
      return;
    }

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = Date.now() - startTime;

    // Determine gesture type
    if (!isDragging && distance < 10 && duration < 300) {
      // Tap
      onTap(e);
    } else if (
      Math.abs(deltaX) > Math.abs(deltaY) &&
      Math.abs(deltaX) > swipeThreshold
    ) {
      // Horizontal swipe
      if (deltaX > 0) {
        onSwipeRight(e, Math.abs(deltaX));
      } else {
        onSwipeLeft(e, Math.abs(deltaX));
      }
    }

    startX = startY = 0;
    isDragging = false;
  };

  /**
   * Internal touch cancel gesture hook.
   */
  const handleTouchCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    element.style.transform = "";
    element.style.transition = "";
    startX = startY = 0;
    isDragging = false;
    isLongPress = false;
  };

  // Attach event listeners
  element.addEventListener("touchstart", handleTouchStart, { passive: false });
  element.addEventListener("touchmove", handleTouchMove, { passive: false });
  element.addEventListener("touchend", handleTouchEnd, { passive: true });
  element.addEventListener("touchcancel", handleTouchCancel, { passive: true });

  // Return cleanup function
  return {
    destroy() {
      element.removeEventListener("touchstart", handleTouchStart);
      element.removeEventListener("touchmove", handleTouchMove);
      element.removeEventListener("touchend", handleTouchEnd);
      element.removeEventListener("touchcancel", handleTouchCancel);
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    },
  };
};

/**
 * Initializes progressive expansion and collapse of detail sub-elements in mobile lists.
 *
 * @param {HTMLElement} element - Target container element.
 * @param {Object} [options={}] - Styling configuration map.
 * @param {string} [options.expandedClass='expanded'] - Class to append when expanded.
 * @param {string} [options.collapsedClass='collapsed'] - Class to append when collapsed.
 * @param {number} [options.animationDuration=300] - Lifespan of transition in ms.
 * @returns {{expand: Function, collapse: Function, toggle: Function, isExpanded: boolean, destroy: Function}} Progressive disclosure control APIs.
 */
export const addProgressiveDisclosure = (element, options = {}) => {
  const {
    expandedClass = "expanded",
    collapsedClass = "collapsed",
    animationDuration = 300,
  } = options;

  let isExpanded = false;
  let details = element.querySelector(".transaction-details");
  let summary = element.querySelector(".transaction-summary");

  if (!details || !summary) {
    console.warn(
      "Progressive disclosure requires .transaction-details and .transaction-summary elements",
    );
    return { destroy() {} };
  }

  // Initial state
  details.style.maxHeight = "0";
  details.style.overflow = "hidden";
  details.style.transition = `max-height ${animationDuration}ms ease`;
  element.classList.add(collapsedClass);

  /**
   * Expands the detail container element.
   */
  const expand = () => {
    if (isExpanded) return;

    isExpanded = true;
    element.classList.remove(collapsedClass);
    element.classList.add(expandedClass);

    // Animate expansion
    const scrollHeight = details.scrollHeight;
    details.style.maxHeight = `${scrollHeight}px`;

    /**
     * Resets max-height to none upon transition completion.
     */
    const onTransitionEnd = () => {
      details.style.maxHeight = "none";
      details.removeEventListener("transitionend", onTransitionEnd);
    };
    details.addEventListener("transitionend", onTransitionEnd);
  };

  /**
   * Collapses the detail container element.
   */
  const collapse = () => {
    if (!isExpanded) return;

    isExpanded = false;
    element.classList.remove(expandedClass);
    element.classList.add(collapsedClass);

    // Animate collapse
    details.style.maxHeight = `${details.scrollHeight}px`;
    // Trigger reflow
    details.offsetHeight;
    details.style.maxHeight = "0";
  };

  /**
   * Toggles the detail container state between collapsed and expanded.
   */
  const toggle = () => {
    if (isExpanded) {
      collapse();
    } else {
      expand();
    }
  };

  return {
    expand,
    collapse,
    toggle,
    get isExpanded() {
      return isExpanded;
    },
    destroy() {
      details.style.maxHeight = "";
      details.style.overflow = "";
      details.style.transition = "";
      element.classList.remove(expandedClass, collapsedClass);
    },
  };
};

/**
 * Identifies and isolates ergonomic screen boundary zones suited for one-handed thumb interaction.
 *
 * @param {HTMLElement} container - The target container.
 * @returns {{getThumbZones: Function, isInThumbZone: Function, addThumbZoneIndicators: Function}} Zone boundaries and analysis.
 */
export const optimizeForThumbZone = (container) => {
  /**
   * Evaluates viewport coordinates defining easy, moderate, and hard reach areas for thumb movement.
   * @returns {Object} Boundaries of reach zones.
   */
  const getThumbZones = () => {
    const rect = container.getBoundingClientRect();
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    // Define thumb-reachable zones (approximate)
    const thumbReach = Math.min(screenWidth * 0.3, 120); // 30% of screen width or 120px max

    return {
      leftThumb: {
        x: 0,
        y: screenHeight * 0.3,
        width: thumbReach,
        height: screenHeight * 0.4,
      },
      rightThumb: {
        x: screenWidth - thumbReach,
        y: screenHeight * 0.3,
        width: thumbReach,
        height: screenHeight * 0.4,
      },
      bothThumbs: {
        x: 0,
        y: screenHeight * 0.7,
        width: screenWidth,
        height: screenHeight * 0.3,
      },
    };
  };

  /**
   * Assesses whether the center of the given element rests inside an optimized thumb reach area.
   * @param {HTMLElement} element - Target child element.
   * @returns {boolean} True if center of target rests inside any thumb bounds.
   */
  const isInThumbZone = (element) => {
    const elementRect = element.getBoundingClientRect();
    const zones = getThumbZones();

    const elementCenter = {
      x: elementRect.left + elementRect.width / 2,
      y: elementRect.top + elementRect.height / 2,
    };

    // Check if element center is in any thumb zone
    return Object.entries(zones).some(([zone, bounds]) => {
      return (
        elementCenter.x >= bounds.x &&
        elementCenter.x <= bounds.x + bounds.width &&
        elementCenter.y >= bounds.y &&
        elementCenter.y <= bounds.y + bounds.height
      );
    });
  };

  return {
    getThumbZones,
    isInThumbZone,
    addThumbZoneIndicators: () => {
      // Optional: Add visual indicators for thumb zones (debug mode)
      const zones = getThumbZones();
      const indicators = [];

      Object.entries(zones).forEach(([name, zone]) => {
        const indicator = document.createElement("div");
        indicator.className = `thumb-zone-${name}`;
        indicator.style.cssText = `
                    position: fixed;
                    left: ${zone.x}px;
                    top: ${zone.y}px;
                    width: ${zone.width}px;
                    height: ${zone.height}px;
                    border: 2px dashed rgba(255, 0, 0, 0.3);
                    background: rgba(255, 0, 0, 0.1);
                    pointer-events: none;
                    z-index: 10000;
                `;
        document.body.appendChild(indicator);
        indicators.push(indicator);
      });

      return () => {
        indicators.forEach((indicator) => indicator.remove());
      };
    },
  };
};

/**
 * Assures target clickable nodes conform to mobile accessibility and ergonomic regulations by extending target bounds to at least 44x44px.
 *
 * @param {HTMLElement} element - Target DOM interactive element.
 * @param {number} [minSize=44] - Minimum size in pixels.
 * @returns {void}
 */
export const ensureTouchTargetSize = (element, minSize = 44) => {
  const rect = element.getBoundingClientRect();

  if (rect.width < minSize || rect.height < minSize) {
    element.style.minWidth = `${minSize}px`;
    element.style.minHeight = `${minSize}px`;
    element.style.display = element.style.display || "inline-flex";
    element.style.alignItems = "center";
    element.style.justifyContent = "center";
  }
};
