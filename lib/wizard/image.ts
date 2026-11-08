export function fileToResizedDataUrl(file: File, maxSide = 900): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.naturalWidth * scale);
      canvas.height = Math.round(image.naturalHeight * scale);
      const context = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);

      if (!context) {
        reject(new Error('Your browser could not process this image.'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('This file could not be read as an image.'));
    };

    image.src = objectUrl;
  });
}
