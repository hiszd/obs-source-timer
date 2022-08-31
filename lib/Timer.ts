import { obsApi } from './obs';
import { Scene, SceneItem } from './OBSTypes';
import { addProps } from './Timers';
import { createSignal } from 'solid-js';

interface editProps {
  delay: number;
  show_duration: number;
  hide_duration: number;
  start_visible: boolean;
}

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
    this.id = props.id;
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
    this.currently_visible = false;

    // Get visibility of source
    // obsApi('getsceneitemenabled', { sceneName: this.scene.sceneName, sceneItemId: this.source.sceneItemId }).then((e) => {
    // console.log(e);
    // if (e) {
    // const { sceneitemenabled } = e;
    // this.currently_visible = sceneitemenabled;
    // }
    // });
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
    console.log('[Delay][' + this.source.sourceName + '] ' + this.duration.delay);
    let tim = setTimeout(this.callback.delay, (this.duration.delay * 1000));
    this.delay_timer = tim;
    return tim;
  }

  private createShowTimer = (): number => {
    console.log('[Show][' + this.source.sourceName + '] ' + this.duration.show);
    let tim = setTimeout(this.callback.show, (this.duration.show * 1000));
    this.show_timer = tim;
    return tim;
  }

  // TODO add random hide
  private createHideTimer = (): number => {
    console.log('[Hide][' + this.source.sourceName + '] ' + this.duration.hide);
    let tim = setTimeout(this.callback.hide, (this.duration.hide * 1000));
    this.hide_timer = tim;
    return tim;
  }

  private setVisibility = (vis: boolean) => {
    obsApi('setsceneitemenabled', { sceneName: this.scene.sceneName, sceneItemId: this.source.sceneItemId, sceneItemEnabled: vis });
    this.currently_visible = vis;
    this.emit('visibilityChange', vis);
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

  public killTimers = (): void => {
    clearTimeout(this.delay_timer);
    clearTimeout(this.show_timer);
    clearTimeout(this.hide_timer);
  }

  public editTimer = (props: editProps): void => {
    this.duration.delay = props.delay;
    this.duration.show = props.show_duration;
    this.duration.hide = props.hide_duration;
    this.start_visible = props.start_visible;
    this.killTimers();
    this.activate();
  }

  /// active subscribers
  private subscribers: {} = {};

  /// subscribe to event
  public sub = (event: string, func: Function) => {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(func);
  }

  /// unsubscribe from event
  public unsub = (event: string, fun: Function) => {
    console.log(this.subscribers[event]);
    this.subscribers[event] = this.subscribers[event].filter((e: Function) => e != fun);
    console.log(this.subscribers[event]);
  }

  /// emit event to all subscribers
  private emit(event: string, state: string | number | boolean) {
    this.subscribers[event].forEach((e: Function, ind: number) => {
      e(state);
    });
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
