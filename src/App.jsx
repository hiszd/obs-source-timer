import logo from './logo.svg';
import styles from './App.module.css';
import { createSignal } from 'solid-js';

function App() {

  const [scene, setScene] = createSignal('Scene 2');

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <p>
          {scene()}
        </p>
      </header>
    </div>
  );
}

export default App;
