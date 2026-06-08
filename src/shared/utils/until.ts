// https://stackoverflow.com/a/52657929/6591804
export function until(conditionFunction: () => boolean) {
  const poll = (resolve: any) => {
    if (conditionFunction()) resolve();
    else setTimeout((_: any) => poll(resolve), 100);
  };

  return new Promise(poll);
}

// https://stackoverflow.com/a/16436975/6591804
export function arraysEqual(a: any[], b: any[]) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  // If you don't care about the order of the elements inside
  // the array, you should sort both arrays here.
  // Please note that calling sort on an array will modify that array.
  // you might want to clone your array first.

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

// https://stackoverflow.com/a/30832210/6591804
export function downloadDataAsFile(data: BlobPart, filename: string, type: any) {
  const file = new Blob([data], { type: type });
  const a = document.createElement('a'),
    url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function () {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

// https://stackoverflow.com/a/40971885/6591804
export function loadFileDialog(handler: (data: string) => void) {
  const input = document.createElement('input');
  input.type = 'file';

  input.onchange = (e) => {
    // getting a hold of the file reference
    // @ts-expect-error files
    const file = e.target!.files[0];

    // setting up the reader
    const reader = new FileReader();
    reader.readAsText(file); // this is reading as data url

    // here we tell the reader what to do when it's done reading...
    reader.onload = (readerEvent) => {
      const content = readerEvent.target!.result; // this is the content!
      if (typeof content == 'string') {
        handler(content);
      }
    };
  };

  input.click();
}

// https://stackoverflow.com/a/52171480/6591804
/**
 * String hashing
 */
export const cyrb53 = (str: string, seed: number = 0): number => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};
