/**
 * Drag and Drop utility functions
 */

let dragStartX = 0;
let dragStartY = 0;
const DRAG_THRESHOLD = 5; // pixels

/**
 * Initialize drag start position
 * @param {DragEvent} event
 */
export function initDragStart(event) {
  dragStartX = event.clientX;
  dragStartY = event.clientY;
}

/**
 * Check if mouse has moved beyond threshold (to distinguish click from drag)
 * @param {DragEvent} event
 * @returns {boolean}
 */
export function isDragDistanceExceeded(event) {
  const deltaX = Math.abs(event.clientX - dragStartX);
  const deltaY = Math.abs(event.clientY - dragStartY);
  return deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD;
}

/**
 * Set up drag data transfer
 * @param {DragEvent} event
 * @param {string} dataType
 * @param {string} data
 */
export function setDragData(event, dataType, data) {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(dataType, data);
  }
}

/**
 * Get drag data from transfer
 * @param {DragEvent} event
 * @param {string} dataType
 * @returns {string}
 */
export function getDragData(event, dataType) {
  if (event.dataTransfer) {
    return event.dataTransfer.getData(dataType);
  }
  return null;
}

/**
 * Calculate drop position from mouse position
 * @param {HTMLElement} container
 * @param {DragEvent} event
 * @returns {number} Index position for drop
 */
export function calculateDropPosition(container, event) {
  if (!container || !container.children) {
    console.warn('Invalid container for calculateDropPosition');
    return 0;
  }

  const cards = Array.from(container.children).filter(
    child =>
      child.classList &&
      child.classList.contains('album-card') &&
      !child.classList.contains('dragging')
  );

  if (cards.length === 0) return 0;

  const mouseY = event.clientY;
  const mouseX = event.clientX;

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const rect = card.getBoundingClientRect();

    // Check if mouse is over this card
    if (
      mouseX >= rect.left &&
      mouseX <= rect.right &&
      mouseY >= rect.top &&
      mouseY <= rect.bottom
    ) {
      // Determine if drop should be before or after this card
      const cardCenterY = rect.top + rect.height / 2;
      return mouseY < cardCenterY ? i : i + 1;
    }
  }

  // If mouse is after all cards, return length
  return cards.length;
}

/**
 * Add visual feedback for dragging element
 * @param {HTMLElement} element
 */
export function addDraggingClass(element) {
  if (element && element.classList) {
    element.classList.add('dragging');
  }
}

/**
 * Remove visual feedback from dragging element
 * @param {HTMLElement} element
 */
export function removeDraggingClass(element) {
  if (element && element.classList) {
    element.classList.remove('dragging');
  }
}

/**
 * Add drop zone highlight
 * @param {HTMLElement} element
 */
export function addDropZoneClass(element) {
  if (element && element.classList) {
    element.classList.add('drop-zone');
  }
}

/**
 * Remove drop zone highlight
 * @param {HTMLElement} element
 */
export function removeDropZoneClass(element) {
  if (element && element.classList) {
    element.classList.remove('drop-zone');
  }
}
