import { action, makeObservable, observable, runInAction } from 'mobx';

import { TimelineAggregation } from '../../entities/dashboard/types.ts';
import current3DStoreInstance from './3d/stores/Current3DStore.ts';
import contentLoadStoreInstance from './contentLoadStore.ts';

export class TimeIntervalsStore {
  sliderValue = 0;
  activeIndex = 0;
  isAnimationPlaying = false;
  isDataNormalized = true;
  animatedSliderProgress = 0;
  typeOfRange: TimelineAggregation = TimelineAggregation.ENTIRE;

  constructor() {
    makeObservable(this, {
      sliderValue: observable,
      animatedSliderProgress: observable,
      activeIndex: observable,
      isAnimationPlaying: observable,
      isDataNormalized: observable,
      typeOfRange: observable,
      setSliderValue: action,
      setActiveIndex: action,
      setTypeOfRange: action,
      handlePlay: action,
      handleStop: action,
    });
  }

  setTypeOfRange(type: TimelineAggregation) {
    this.typeOfRange = type;
  }

  setSliderValue(value: number) {
    this.sliderValue = value;
  }

  setActiveIndex(index: number) {
    this.activeIndex = index;
  }

  async handlePlay(length: number, step: number) {
    this.isAnimationPlaying = true;
    let localValue = this.sliderValue;

    current3DStoreInstance.startPreloadData(Math.floor(localValue), length - Math.ceil(localValue));

    const playNextStep = async () => {
      const prevIndex = Number(localValue.toFixed(2));
      if (prevIndex === length) {
        await runInAction(async () => {
          this.isAnimationPlaying = false;
          this.sliderValue = 0;
          this.activeIndex = 0;
          this.animatedSliderProgress = 0;
          await current3DStoreInstance.fetchParams(0, 1);
        });
      } else {
        if (!this.isAnimationPlaying) return;

        await runInAction(async () => {
          const prevIndex1 = Number((prevIndex + step).toFixed(2));
          // TODO: requestAnimationFrame is framerate dependant,
          // so increment animation using framerate dependant delta
          current3DStoreInstance.updateAnimation(prevIndex - this.activeIndex);
          this.animatedSliderProgress = prevIndex - this.activeIndex;

          if (Number.isInteger(prevIndex1)) {
            contentLoadStoreInstance.setIsSelectedTimePointLoading(true);
            this.activeIndex = Math.floor(prevIndex1);
            try {
              await current3DStoreInstance.fetchParams(prevIndex1, (prevIndex1 + 1) % length);
              current3DStoreInstance.updateAnimation(0);
            } catch {
              this.handleStop();
            } finally {
              runInAction(() => {
                this.sliderValue = prevIndex1;
                localValue = prevIndex1;
                contentLoadStoreInstance.setIsSelectedTimePointLoading(false);
              });
            }
            requestAnimationFrame(playNextStep);
          } else {
            localValue = prevIndex1;
            requestAnimationFrame(playNextStep);
          }
        });
      }
    };

    requestAnimationFrame(playNextStep);
  }

  handleStop() {
    this.isAnimationPlaying = false;
    this.animatedSliderProgress = 0;
  }

  setDefaultState() {
    this.handleStop();
    this.sliderValue = 0;
    this.activeIndex = 0;
  }
}

const timeIntervalsStoreInstance = new TimeIntervalsStore();
export default timeIntervalsStoreInstance;
