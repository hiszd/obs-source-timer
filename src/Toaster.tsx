import styles from './Toaster.module.scss';
import { createSignal, onMount } from 'solid-js';

interface ToasterProps {
  helpers: Function,
}

const toastStyleBase = {
  'position': 'absolute',
  'left': 'calc(50% - 10rem)',
  'width': '20rem',
  'min-height': '4rem',
  'background-color': 'hsla(0deg 0% 100% / 0.7)',
  'color': 'black',
  'border-radius': '0rem 0rem 1rem 1rem',
  'padding-top': '1.5rem',
}
const toastStyles = {
  'hidden': {
    ...toastStyleBase,
    'display': 'none',
  },
  shown: {
    ...toastStyleBase,
    'display': 'block',
  },
}

export function Toaster(props: ToasterProps) {
  const [toastStyle, setToastStyle] = createSignal(toastStyles.hidden);
  const [toastClass, setToastClass] = createSignal(styles.show);
  let Toast: Element;

  onMount(() => {
    props.helpers({ toast });
  });

  /**
   * toast
   */
  const toast = (message: string, timeout: number = 3000): void => {
    if (timeout < 1000) {
      timeout = 1000;
    }
    Toast.innerHTML = message;
    setToastStyle(toastStyles.shown)
    setTimeout(() => {
      setToastClass(styles.hide);
    }, (timeout - 500));
    setTimeout(() => {
      setToastStyle(toastStyles.hidden);
      setToastClass(styles.show);
      Toast.innerHTML = '';
    }, timeout);
  }

  return (
    <div ref={Toast} class={toastClass()} style={toastStyle()}></div>
  );
}
