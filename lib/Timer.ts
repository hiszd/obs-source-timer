import { obsApi } from './obs';

type Duration = {
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

type TimerStore = {

  id: number;

  scene: Object;
  source: Object;

  delay: number;
  duration: Duration;
  repeat: Repeat;
  start_visible: boolean;
  currently_visible: boolean;
}

export class TimerType {
  constructor(props: TimerStore) {
    if (props.id) {
      this.id = props.id;
    }
    if (props.scene) {
      this.scene = props.scene;
    }
    if (props.source) {
      this.source = props.source;
    }
    if (props.delay) {
      this.delay = props.delay;
    }
    if (props.duration) {
      this.duration = props.duration;
    }
    if (props.repeat) {
      this.repeat = props.repeat;
    }
    if (props.start_visible) {
      this.start_visible = props.start_visible;
    }
    if (props.currently_visible) {
      this.currently_visible = props.currently_visible;
    }
  }

  activate() {
    if (this.delay != 0) {
      createDelayTimer() // TODO make callback
    }
    if (this.duration.show != 0) {
      createShowTimer() // TODO make callback
    }

    if (this.duration.hide != 0) {
      createHideTimer() // TODO make callback
    }
  }



  private createDelayTimer(callback: Function): number {
    let tim = setTimeout(callback, this.delay);
    this.delay_timer = tim;
    return tim;
  }

  private createShowTimer(callback: Function): number {
    let tim = setTimeout(callback, this.duration.show);
    this.show_timer = tim;
    return tim;
  }

  //TODO add random hide
  private createHideTimer(callback: Function): number {
    let tim = setTimeout(callback, this.duration.hide);
    this.hide_timer = tim;
    return tim;
  }

  id: number = 0;

  scene: Object = {};
  source: Object = {};

  delay: number = 5;
  delay_timer: number;
  duration: Duration = {
    show: 2,
    hide: 5,
    hide_random: 0,
  }
  show_timer: number;
  hide_timer: number;

  repeat: Repeat = {
    times: 0,
    reset: false,
    reset_after: 60,
  }

  start_visible: boolean = false;
  currently_visible: boolean = false;

}
