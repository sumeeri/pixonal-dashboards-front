import { makeAutoObservable } from 'mobx';
import RecordRTC, { invokeSaveAsDialog } from 'recordrtc';

/*
 * Somehow we should access tracks after recording and stop them manually,
 * otherwise inbrowser overlay stays visible
 *
 * Issues in videofile indexing, vlc doesn't show playback progress
 *
 * I don't think it's possible to record screen without submitting target window manually
 *
 * Viewport height decrease due to inbrowser screen sharing notification
 *
 * preferCurrentTab and displaySurface params are experimental, therefore there are issues in typecheck
 *
 * */

export class VideoRecorderStore {
  private recorder: RecordRTC | null = null;

  public seconds = 0;
  public isRecording = false;

  constructor() {
    makeAutoObservable(this);
  }

  async recordOneMinuteVideo() {
    this.startRecording();
    this.seconds = 60;
    const timerId = setInterval(() => {
      this.seconds -= 1;
    }, 1000);
    setTimeout(() => {
      clearInterval(timerId);
    }, this.seconds * 1000);
    await new Promise((resolve) => setTimeout(resolve, this.seconds * 1000));
    this.stopRecording();
  }

  startRecording() {
    this.stopRecording();

    const canvas = document.getElementsByClassName('mapboxgl-canvas')[0] as HTMLCanvasElement;

    if (canvas) {
      this.recorder = new RecordRTC(canvas, {
        type: 'canvas',
        mimeType: 'video/mp4',
      });

      this.recorder.startRecording();

      this.isRecording = true;
    }
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stopRecording(this.saveRecording.bind(this));
    }
    this.isRecording = false;
  }

  private saveRecording() {
    if (this.recorder) {
      const blob = this.recorder.getBlob();
      invokeSaveAsDialog(blob);

      this.recorder.destroy();
      this.recorder = null;
    }
  }
}

const videoRecorderStoreInstance = new VideoRecorderStore();
export default videoRecorderStoreInstance;

// view source code of this page
// https://www.webrtc-experiment.com/RecordRTC/Canvas-Recording/webpage-recording.html

// const start = useCallback(() => {
//   const htmlElement = document.getElementById('root');
//   const canvas = document.getElementById('background-canvas');

//   if (htmlElement) {
//     recorder.current = new RecordRTC(htmlElement, {
//       type: 'canvas',
//       mimeType: 'video/mp4',
//       canvas: { width: 1000, height: 2000 },
//     });

//     recorder.current.startRecording();
//   }
// }, []);

// const start = useCallback(() => {
//   navigator.mediaDevices
//     // @ts-expect-error preferCurrentTab is experimental
//     .getDisplayMedia({ preferCurrentTab: true, audio: false, video: { displaySurface: 'browser' } })
//     .then((stream) => {
//       recorder.current = new RecordRTC(stream, {
//         type: 'video',
//         mimeType: 'video/mp4',
//       });

//       recorder.current.startRecording();
//     });
// }, []);
