import * as htmlToImage from 'html-to-image';
import { ImageSource } from 'merge-images';

export const takeScreenShot = async (): Promise<ImageSource> => {
  const element = document.getElementById('root')!;
  const time = document.getElementById('interval')!;
  const zoom = document.getElementById('zoom-panel')!;
  const navigation = document.getElementById('navigation')!;
  time.style.opacity = '1';
  zoom.style.display = 'none';
  navigation.style.display = 'none';

  const dataURI = await htmlToImage.toPng(element);
  time.style.opacity = '1';
  zoom.style.display = '';
  navigation.style.display = '';
  return dataURI;
};
