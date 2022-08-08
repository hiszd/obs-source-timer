import { obsApi } from './obs';
import { Scene, SceneItem } from './OBSTypes';

type Duration = {
  delay: number;
  show: number;
  hide: number;
  hide_random: number;
}

type Repeat = {
  times: number;
  reset: boolean;
  reset_after: number;
}

type TimerCallbacks = {
  delay: Function;
  show: Function;
  hide: Function;
}

interface TimerProps {
  id: number;
  scene: Scene;
  source: SceneItem;
  delay: number;
  show_duration: number;
  hide_duration: number;
  start_visible: boolean;
}

export class Timer {
  constructor(props: TimerProps) {
    if (props.id) {
      this.id = props.id;
    }
    if (props.scene) {
      this.scene = props.scene;
    }
    if (props.source) {
      this.source = props.source;
    }
    this.duration = {
      delay: 5,
      show: 2,
      hide: 5,
      hide_random: 0,
    }
    if (props.delay) {
      this.duration.delay = props.delay;
    }
    if (props.show_duration) {
      this.duration.show = props.show_duration;
    }
    if (props.hide_duration) {
      this.duration.hide = props.hide_duration;
    }
    if (props.start_visible) {
      this.start_visible = props.start_visible;
    }

    console.log(JSON.stringify(this));

    // Get visibility of source
    obsApi('getsceneitemenabled', { sceneName: this.scene.sceneName, sceneItemId: this.source.sceneItemId }).then((e) => {
      console.log(e);
      if (e) {
        const { sceneitemenabled } = e;
        this.currently_visible = sceneitemenabled;
      }
    });
  }

  public activate = () => {
    if (this.duration.delay != 0) {
      this.createDelayTimer()
    } else {
      if (this.start_visible) {
        this.createShowTimer();
      } else {
        this.createHideTimer();
      }
    }
  }

  private createDelayTimer = (): number => {
    console.log('[Delay] ' + this.duration.delay);
    let tim = setTimeout(this.callback.delay, (this.duration.delay * 1000));
    this.delay_timer = tim;
    return tim;
  }

  private createShowTimer = (): number => {
    console.log('[Show] ' + this.duration.show);
    let tim = setTimeout(this.callback.show, (this.duration.show * 1000));
    this.show_timer = tim;
    return tim;
  }

  // TODO add random hide
  private createHideTimer = (): number => {
    console.log('[Hide] ' + this.duration.hide);
    let tim = setTimeout(this.callback.hide, (this.duration.hide * 1000));
    this.hide_timer = tim;
    return tim;
  }

  private setVisibility = (vis: boolean) => {
    obsApi('setsceneitemenabled', { sceneName: this.scene.sceneName, sceneItemId: this.source.sceneItemId, sceneItemEnabled: vis });
  }

  callback: TimerCallbacks = {
    delay: () => {
      if (this.start_visible) {
        this.setVisibility(true);
        this.createShowTimer();
      } else {
        this.setVisibility(false);
        this.createHideTimer();
      }
    },

    show: () => {
      this.setVisibility(false);
      this.createHideTimer();
    },

    hide: () => {
      this.setVisibility(true);
      this.createShowTimer();
    },
  }

  public KillTimers = () => {
    clearTimeout(this.delay_timer);
    clearTimeout(this.show_timer);
    clearTimeout(this.hide_timer);
  }

  id: number;

  scene: Scene;
  source: SceneItem;

  duration: Duration;
  show_timer: number;
  hide_timer: number;
  delay_timer: number;

  repeat: Repeat;

  start_visible: boolean;
  currently_visible: boolean;

}
