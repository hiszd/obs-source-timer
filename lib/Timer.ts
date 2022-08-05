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

  id: number = 0;

  scene: Object = {};
  source: Object = {};

  delay: number = 5;
  duration: Duration = {
    show: 2,
    hide: 5,
    hide_random: 0,
  }

  repeat: Repeat = {
    times: 0,
    reset: false,
    reset_after: 60,
  }

  start_visible: boolean = false;
  currently_visible: boolean = false;

}
