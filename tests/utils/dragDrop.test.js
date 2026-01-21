import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  initDragStart,
  isDragDistanceExceeded,
  setDragData,
  getDragData,
  calculateDropPosition,
  addDraggingClass,
  removeDraggingClass,
  addDropZoneClass,
  removeDropZoneClass,
} from '../../src/utils/dragDrop.js';

describe('dragDrop', () => {
  let mockEvent;
  let mockElement;

  beforeEach(() => {
    mockElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      getBoundingClientRect: vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      })),
    };

    mockEvent = {
      clientX: 50,
      clientY: 50,
      dataTransfer: {
        setData: vi.fn(),
        getData: vi.fn(),
      },
      target: mockElement,
      currentTarget: mockElement,
    };
  });

  describe('initDragStart', () => {
    it('should store initial drag position', () => {
      initDragStart(mockEvent);
      // Function stores position internally, test by checking isDragDistanceExceeded
      const samePos = { clientX: 50, clientY: 50 };
      expect(isDragDistanceExceeded(samePos)).toBe(false);
    });
  });

  describe('isDragDistanceExceeded', () => {
    beforeEach(() => {
      initDragStart({ clientX: 50, clientY: 50 });
    });

    it('should return false for small movement', () => {
      const currentEvent = { clientX: 52, clientY: 52 };
      const result = isDragDistanceExceeded(currentEvent);
      expect(result).toBe(false);
    });

    it('should return true for horizontal movement > 5px', () => {
      const currentEvent = { clientX: 60, clientY: 50 };
      const result = isDragDistanceExceeded(currentEvent);
      expect(result).toBe(true);
    });

    it('should return true for vertical movement > 5px', () => {
      const currentEvent = { clientX: 50, clientY: 60 };
      const result = isDragDistanceExceeded(currentEvent);
      expect(result).toBe(true);
    });

    it('should return true for diagonal movement > 5px', () => {
      const currentEvent = { clientX: 57, clientY: 57 };
      const result = isDragDistanceExceeded(currentEvent);
      expect(result).toBe(true);
    });
  });

  describe('setDragData and getDragData', () => {
    it('should set and get drag data', () => {
      setDragData(mockEvent, 'text/plain', 'test-data');
      expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith(
        'text/plain',
        'test-data'
      );

      mockEvent.dataTransfer.getData.mockReturnValue('test-data');
      const result = getDragData(mockEvent, 'text/plain');
      expect(result).toBe('test-data');
    });

    it('should handle missing dataTransfer', () => {
      const noDataEvent = { clientX: 0, clientY: 0 };
      setDragData(noDataEvent, 'text/plain', 'data');
      // Should not throw
    });

    it('should return null for missing dataTransfer on get', () => {
      const noDataEvent = { clientX: 0, clientY: 0 };
      const result = getDragData(noDataEvent, 'text/plain');
      expect(result).toBeNull();
    });
  });

  describe('calculateDropPosition', () => {
    it('should calculate drop position based on mouse coordinates', () => {
      const container = {
        children: [
          {
            getBoundingClientRect: () => ({
              left: 0,
              top: 0,
              width: 50,
              height: 50,
            }),
            classList: { contains: () => true },
            dataset: { albumId: '1' },
          },
          {
            getBoundingClientRect: () => ({
              left: 60,
              top: 0,
              width: 50,
              height: 50,
            }),
            classList: { contains: () => true },
            dataset: { albumId: '2' },
          },
          {
            getBoundingClientRect: () => ({
              left: 120,
              top: 0,
              width: 50,
              height: 50,
            }),
            classList: { contains: () => true },
            dataset: { albumId: '3' },
          },
        ],
      };

      const event = { clientX: 70, clientY: 25 };
      const position = calculateDropPosition(container, event);
      expect(position).toBeGreaterThanOrEqual(0);
      expect(position).toBeLessThanOrEqual(3);
    });

    it('should return 0 for empty container', () => {
      const emptyContainer = { children: [] };
      const position = calculateDropPosition(emptyContainer, mockEvent);
      expect(position).toBe(0);
    });
  });

  describe('addDraggingClass and removeDraggingClass', () => {
    it('should add dragging class', () => {
      addDraggingClass(mockElement);
      expect(mockElement.classList.add).toHaveBeenCalledWith('dragging');
    });

    it('should remove dragging class', () => {
      removeDraggingClass(mockElement);
      expect(mockElement.classList.remove).toHaveBeenCalledWith('dragging');
    });

    it('should not throw for null element', () => {
      expect(() => addDraggingClass(null)).not.toThrow();
      expect(() => removeDraggingClass(null)).not.toThrow();
    });
  });

  describe('addDropZoneClass and removeDropZoneClass', () => {
    it('should add drop-zone class', () => {
      addDropZoneClass(mockElement);
      expect(mockElement.classList.add).toHaveBeenCalledWith('drop-zone');
    });

    it('should remove drop-zone class', () => {
      removeDropZoneClass(mockElement);
      expect(mockElement.classList.remove).toHaveBeenCalledWith('drop-zone');
    });

    it('should not throw for null element', () => {
      expect(() => addDropZoneClass(null)).not.toThrow();
      expect(() => removeDropZoneClass(null)).not.toThrow();
    });
  });
});
