/**
 * src: https://gist.github.com/romgrk/40c89ba3cd077c4f4f42b63ddcf20735
 */
export function download({
  content,
  type = 'application/octet-binary',
  filename,
}: {
  filename: string;
  content: BlobPart;
  type?: string;
}) {
  const fileBlob = new Blob([content], {type});
  const url = URL.createObjectURL(fileBlob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);

  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
  });
  link.dispatchEvent(event);

  // Deallocate resources
  if (URL.revokeObjectURL) {
    URL.revokeObjectURL(url);
  }
}
