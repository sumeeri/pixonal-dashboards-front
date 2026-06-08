export const generatePassword = () => {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$';

  return Array.from(crypto.getRandomValues(new Uint32Array(10)))
    .map((x) => characters[x % characters.length])
    .join('');
};
