import { Timer } from './Timer';
import { Scene, SceneItem } from './OBSTypes';

interface addProps {
  scene: Scene;
  source: SceneItem;
  delay: number;
  show_duration: number;
  hide_duration: number;
  start_visible: boolean;
}

export class Timers {
  constructor() {
  }

  public timerCount: number = 0;

  public timers: Object = new Object;

  public addTimer = (tim: addProps): Timer => {
    let addtim = new Timer({
      id: this.timerCount,
      scene: tim.scene,
      source: tim.source,
      delay: tim.delay,
      show_duration: tim.show_duration,
      hide_duration: tim.hide_duration,
      start_visible: tim.start_visible,
    });
    if (this.timers.hasOwnProperty(tim.scene.sceneIndex)) {
      this.timers[tim.scene.sceneIndex][tim.source.sceneItemId] = addtim;
    } else {
      this.timers[tim.scene.sceneIndex] = {};
      this.timers[tim.scene.sceneIndex][tim.source.sceneItemId] = addtim;
    }
    this.timers[tim.scene.sceneIndex][tim.source.sceneItemId].activate();
    this.timerCount++;
    return this.timers[tim.scene.sceneIndex][tim.source.sceneItemId];
  }

  public removeTimer = (scn: Scene, src: SceneItem): boolean => {
    if (this.timers[scn.sceneIndex][src.sceneItemId]) {
      this.timers[scn.sceneIndex][src.sceneItemId].killTimers();
      this.timers[scn.sceneIndex][src.sceneItemId] = undefined;
      console.log(JSON.stringify(this.timers));
      return true;
    }
    return false;
  }

  public clean = (): void => {
    for (let tim in Object.keys(this.timers)) {
      // this.timers[tim].killTimers();
      for (let tom in this.timers[tim]) {
        this.timers[tim][tom].killTimers();
      }
    }
  }

  public dump = (): Object => {
    return JSON.stringify(this.timers);
  }

  public hasTimer = (scn: Scene, src: SceneItem): Timer | null => {
    if (this.timers[scn.sceneIndex][src.sceneItemId] != undefined) {
      return this.timers[scn.sceneIndex][src.sceneItemId];
    }
    return null;
  }

  public timerById = (sceneIndex: number, sceneItemId: number): Timer | null => {
    if (this.timers[sceneIndex][sceneItemId] != undefined) {
      return this.timers[sceneIndex][sceneItemId];
    }
    return null;
  }

}
