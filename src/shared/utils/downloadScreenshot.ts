const createFileName = (name: string, extension: string) => {
  if (!extension) {
    return '';
  }

  return `${name}.${extension}`;
};

export const download = (image: string, { name = 'img', extension = 'png' } = {}) => {
  const a = document.createElement('a');
  a.href = image;
  a.download = createFileName(name, extension);
  a.click();
};
