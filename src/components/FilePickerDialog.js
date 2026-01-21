export class FilePickerDialog {
  constructor(fileService, photoService) {
    this.fileService = fileService;
    this.photoService = photoService;
    this.onFilesSelected = null;
  }

  async show() {
    try {
      const files = await this.fileService.selectPhotos(true);

      if (files.length === 0) {
        return []; // User cancelled
      }

      // Validate files
      const validFiles = [];
      for (const file of files) {
        const isValid = await this.photoService.validateFile(file);
        if (isValid) {
          validFiles.push(file);
        } else {
          console.warn(`Invalid file type: ${file.name}`);
        }
      }

      if (validFiles.length === 0) {
        alert(
          'No valid image files selected. Please select JPEG, PNG, WebP, or GIF files.'
        );
        return [];
      }

      if (validFiles.length < files.length) {
        const skipped = files.length - validFiles.length;
        alert(
          `${skipped} file(s) skipped (invalid format). ${validFiles.length} valid image(s) selected.`
        );
      }

      return validFiles;
    } catch (error) {
      console.error('File picker error:', error);
      alert('Failed to select files. Please try again.');
      return [];
    }
  }

  static async open(fileService, photoService) {
    const dialog = new FilePickerDialog(fileService, photoService);
    return await dialog.show();
  }
}
