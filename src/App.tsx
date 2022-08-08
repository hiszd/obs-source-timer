import styles from './App.module.css';
import { createEffect, createSignal, onMount } from 'solid-js';
import { createSocket, obs, obsApi } from '../lib/obs';
import { Timer } from '../lib/Timer';
import { Scene, SceneItem, DefaultSceneItem } from '../lib/OBSTypes';
// import { getSuspenseContext } from 'solid-js/types/reactive/signal';

function App() {

  const [scene, setScene] = createSignal<Scene>({ sceneIndex: 0, sceneName: 'Connecting...' });
  const [source, setSource] = createSignal<SceneItem>(DefaultSceneItem());

  const [scenes, setScenes] = createSignal<[Scene]>([{ sceneIndex: 0, sceneName: 'Connecting...' }]);
  const [sources, setSources] = createSignal<[SceneItem]>([DefaultSceneItem()]);

  const [connected, setConnected] = createSignal(false);
  obs.on('ConnectionOpened', () => { setConnected(true); });

  const [identified, setIdentified] = createSignal(false);
  obs.on('Identified', () => { setIdentified(true); });

  createEffect(() => {
    if (scene().sceneName != 'Connecting...') {
      console.log('Scene: ' + scene());
      obsApi('sourcelist', { sceneName: scene().sceneName }).then((e) => {
        console.log(e);
        setSource(e.sceneItems[0] as unknown as SceneItem);
        setSources(e.sceneItems as unknown as [SceneItem]);
      });
    }
  });

  createEffect(() => {
    if (identified()) {
      obsApi('scenelist').then((e) => {
        console.log(e);
        setScene(e.scenes[0] as unknown as Scene);
        setScenes(e.scenes as unknown as [Scene]);
      });
    }
  });

  let identTimer = setInterval(() => {
    if (obs.identified) {
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

  const getSceneFromName = (sceneName: string) => {
    let scene = scenes().find(e => e.sceneName == sceneName);
    return scene;
  }

  const getSourceFromName = (sourceName: string) => {
    let source = sources().find(e => e.sourceName == sourceName);
    return source;
  }

  let timerIndex = 0;

  let bob: Timer;
  const startTimers = () => {
    bob = new Timer({
      id: timerIndex,
      scene: scene(),
      source: source(),
      delay: 2,
      show_duration: 2,
      hide_duration: 5,
      start_visible: false,
    });
    bob.activate();
  }

  const killTimers = () => {
    bob.KillTimers();
    bob = null;
  }

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1 class={styles.title}>
          Welcome to <span>OBS Source Timer</span>
        </h1>
        <div>
          <select class={styles.selectList} onChange={(e) => {
            if (e.target.value != 'Connecting...') {
              setScene(getSceneFromName(e.target.value));
            }
          }} size={6}>
            <For each={scenes()}>{(scene: Scene) =>
              <option value={scene.sceneName}>{scene.sceneIndex}: {scene.sceneName}</option>
            }</For>
          </select>
          <select class={styles.selectList} onChange={(e) => {
            if (e.target.value != 'Connecting...') {
              setSource(getSourceFromName(e.target.value));
            }
          }} size={6}>
            <For each={sources()}>{(source: SceneItem) =>
              <option value={source.sourceName}>{source.sceneItemId}: {source.sourceName}</option>
            }</For>
          </select>
        </div>
        <div>
          <input type='button' onClick={startTimers} value='Hide' />
          <input type='button' onClick={killTimers} value='Show' />
        </div>
      </header >
    </div >
  );
}

export default App;
