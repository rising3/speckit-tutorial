import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FileService } from '../../src/services/FileService.js';

describe('FileService', () => {
  let fileService;

  beforeEach(() => {
    // Mock window.showOpenFilePicker
    global.window = {
      showOpenFilePicker: vi.fn(),
    };
    fileService = new FileService();
  });

  describe('constructor', () => {
    it('should initialize with file system access support detection', () => {
      expect(fileService).toBeDefined();
      expect(typeof fileService.supportsFileSystemAccess).toBe('boolean');
    });
  });
});
