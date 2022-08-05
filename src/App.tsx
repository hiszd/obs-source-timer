import styles from './App.module.css';
import { createEffect, createSignal, onMount } from 'solid-js';
import { createSocket, obs, obsApi } from '../lib/obs';
import { Timer } from '../lib/Timer';

function App() {

  const [scene, setScene] = createSignal('Connecting...');
  const [source, setSource] = createSignal('Connecting...');

  const [scenes, setScenes] = createSignal([{ sceneIndex: 0, sceneName: 'Connecting...' }]);
  const [sources, setSources] = createSignal([{ sceneIndex: 0, sceneName: 'Connecting...' }]);

  const [connected, setConnected] = createSignal(false);
  obs.on('ConnectionOpened', () => { setConnected(true); });

  const [identified, setIdentified] = createSignal(false);
  obs.on('Identified', () => { setIdentified(true); });

  createEffect(() => {
    if (scene() != 'Connecting...') {
      console.log('Scene: ' + scene());
      obsApi('sourcelist', { sceneName: scene().sceneName }).then((e) => {
        console.log(e);
        setSource(e.sceneItems[0]);
        setSources(e.sceneItems);
      });
    }
  });

  let identTimer = setInterval(() => {
    if (obs.identified) {
      obsApi('scenelist').then((e) => {
        console.log(e);
        setScene(e.scenes[0]);
        setScenes(e.scenes);
      });
      clearInterval(identTimer);
    }
  }, 1000);

  onMount(() => {
    console.log('Mounted and creating socket');
    let socketTimer = setInterval(() => {
      if (!connected() || !identified()) {
        console.log('creating socket');
        createSocket();
      } else {
        clearInterval(socketTimer);
      }
    }, 4000);
  });

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1 class={styles.title}>
          Welcome to <span>OBS Source Timer</span>
        </h1>
        <div>
          <select class={styles.selectList} size={6}>
            <For each={scenes()}>{(scene) =>
              <option value={scene.sceneName}>{scene.sceneIndex}: {scene.sceneName}</option>
            }</For>
          </select>
          <select class={styles.selectList} size={6}>
            <For each={sources()}>{(source) =>
              <option value={source.sourceName}>{source.sceneItemId}: {source.sourceName}</option>
            }</For>
          </select>
        </div>
      </header>
    </div >
  );
}

export default App;