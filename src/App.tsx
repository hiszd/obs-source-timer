import styles from './App.module.css';
import { createEffect, createSignal, onCleanup, onMount, Switch, Match } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createSocket, removeSocket, obs, obsApi } from '../lib/obs';
import { Timer } from '../lib/Timer';
import { Timers } from '../lib/Timers';
import { Scene, SceneItem } from '../lib/OBSTypes';
// import { getSuspenseContext } from 'solid-js/types/reactive/signal';

const DefaultScene = { sceneIndex: 0, sceneName: '' };
const DefaultSceneItem = {
  "inputKind": "color_source_v3",
  "isGroup": null,
  "sceneItemBlendMode": "OBS_BLEND_NORMAL",
  "sceneItemEnabled": true,
  "sceneItemId": 1,
  "sceneItemIndex": 0,
  "sceneItemLocked": false,
  "sceneItemTransform": {
    "alignment": 5,
    "boundsAlignment": 0,
    "boundsHeight": 0,
    "boundsType": "OBS_BOUNDS_NONE",
    "boundsWidth": 0,
    "cropBottom": 0,
    "cropLeft": 0,
    "cropRight": 0,
    "cropTop": 0,
    "height": 1080,
    "positionX": 0,
    "positionY": 0,
    "rotation": 0,
    "scaleX": 1,
    "scaleY": 1,
    "sourceHeight": 1080,
    "sourceWidth": 1920,
    "width": 1920
  },
  "sourceName": "",
  "sourceType": "OBS_SOURCE_TYPE_INPUT"
};

enum connectionState {
  CONNECTING,
  CONNECTED,
  FAILED,
  DISCONNECTED
}

function App() {
  let server: string = 'ws://192.168.1.3:4455';
  let password: string = 'VvGMDA9o1u2w4qKl';
  const [scene, setScene] = createSignal<Scene>(DefaultScene);
  const [source, setSource] = createSignal<SceneItem>(DefaultSceneItem);

  const [scenes, setScenes] = createSignal<[Scene]>([DefaultScene]);
  const [sources, setSources] = createSignal<[SceneItem]>([DefaultSceneItem]);

  const [connectionStatus, setConnectionStatus] = createSignal<connectionState>(connectionState.DISCONNECTED);

  const [connected, setConnected] = createSignal(false);
  obs.on('ConnectionClosed', () => {
    console.log('connection closed');
    setConnected(false);
    setConnectionStatus(connectionState.DISCONNECTED);
    setIdentified(false);
    tims.clean();
    tims = new Timers();
    setTimer();
    setTimerList([]);
    setScene(DefaultScene);
    setSource(DefaultSceneItem);
    setScenes([DefaultScene]);
    setSources([DefaultSceneItem]);
    server = 'ws://192.168.1.3:4455';
    password = 'VvGMDA9o1u2w4qKl';
    setServerArea(
      <div class='cont1'>
        <label style='margin-right: 1rem;'>Server: </label>
        <input onChange={(e) => { server = e.target.value; console.log(server); }} style='width: max-content; min-width: 12.5rem; margin-right: 2rem;' type='text' placeholder='ws://192.168.1.1:4455' />
        <label style='margin-right: 1rem;'>Password: </label>
        <input onChange={(e) => { password = e.target.value; console.log(password); }} type='text' placeholder='passwordnotsafe' />
        <input style='margin-left: 1rem;' type='button' value='Connect' onClick={(e) => {
          console.log('creating socket');
          setConnectionStatus(connectionState.CONNECTING);
          createSocket(server, password);
        }} />
      </div>
    );
  });
  obs.on('ConnectionOpened', () => {
    console.log('connection opened');
    setConnected(true);
    setConnectionStatus(connectionState.CONNECTED);
    setServerArea(
      <div>
        <input type="button" value="Disconnect" onClick={() => {
          removeSocket();
        }} />
      </div>
    );
  });

  const [serverArea, setServerArea] = createSignal(
    <div class='cont1'>
      <label style='margin-right: 1rem;'>Server: </label>
      <input onChange={(e) => { server = e.target.value; console.log(server); }} style='width: max-content; min-width: 12.5rem; margin-right: 2rem;' type='text' placeholder='ws://192.168.1.1:4455' />
      <label style='margin-right: 1rem;'>Password: </label>
      <input onChange={(e) => { password = e.target.value; console.log(password); }} type='text' placeholder='passwordnotsafe' />
      <input style='margin-left: 1rem;' type='button' value='Connect' onClick={(e) => {
        console.log('creating socket');
        createSocket(server, password);
      }} />
    </div>
  )

  const [identified, setIdentified] = createSignal(false);
  obs.on('Identified', () => { setIdentified(true); });

  createEffect(() => {
    if (scene().sceneName != 'Connecting...') {
      console.log('getting sources');
      obsApi('sourcelist', { sceneName: scene().sceneName }).then((e) => {
        setSource(e.sceneItems[0] as unknown as SceneItem);
        setSources(e.sceneItems as unknown as [SceneItem]);
      });
    }
  });

  createEffect(() => {
    if (identified() && connected()) {
      console.log('getting scenes: ' + identified() + ' ' + connected());
      obsApi('scenelist').then((e) => {
        setScene(e.scenes[0] as unknown as Scene);
        setScenes(e.scenes as unknown as [Scene]);
      });
    }
  });

  let input_delay, input_show_duration, input_hide_duration, input_start_visible;
  let input_edit_delay, input_edit_show_duration, input_edit_hide_duration, input_edit_start_visible;

  onMount(() => {
    console.log('Mounted');
  });

  onCleanup(() => {
    tims.clean();
  });

  const getSceneFromName = (sceneName: string) => {
    let scene = scenes().find(e => e.sceneName == sceneName);
    return scene;
  }

  const getSourceFromName = (sourceName: string) => {
    let source = sources().find(e => e.sourceName == sourceName);
    return source;
  }

  const [timer, setTimer] = createSignal<Timer>();

  let tims = new Timers();

  const [timerList, setTimerList] = createStore<Timer[]>([]);
  // <div style='margin-top: 4rem; margin-left: auto; margin-right: auto; display: flex; flex-direction: row; white-space: nowrap;'>

  return (
    <div class={styles.App}>
      <header class={styles.header}>
        <h1 class={styles.title}>
          Welcome to <span>OBS Source Timer</span>
        </h1>
        <div class="status-div">
          <Switch fallback={<div></div>}>
            <Match when={connectionStatus() == connectionState.CONNECTING}>
              <h4 class='status-h4'>
                Connecting
              </h4>
            </Match>
            <Match when={connectionStatus() == connectionState.CONNECTED}>
              <h4 class='status-h4'>
                Connected
              </h4>
            </Match>
            <Match when={connectionStatus() == connectionState.FAILED}>
              <h4 class='status-h4'>
                Failed
              </h4>
            </Match>
            <Match when={connectionStatus() == connectionState.DISCONNECTED}>
              <h4 class='status-h4'>
                Disconnected
              </h4>
            </Match>
          </Switch>
        </div>
        <div class={styles.contdiv}>
          <div class='cont1'>
            <div style='width: 70%;'>
              <div style='display: inline-block; width: 30%;'>
                <label style='display: block' class='overline'>Scenes</label>
                <select class={styles.selectList} onChange={(e) => {
                  if (e.target.value != 'Connecting...') {
                    setScene(getSceneFromName(e.target.value));
                  }
                }} size={6}>
                  <For each={scenes()}>{(scene: Scene) =>
                    <Switch>
                      <Match when={scene.sceneName != ''}>
                        <option value={scene.sceneName}>{scene.sceneIndex}: {scene.sceneName}</option>
                      </Match>
                    </Switch>
                  }</For>
                </select>
              </div>
              <div style='display: inline-block; width: 70%;'>
                <label style='display: block' class='overline'>Sources</label>
                <select class={styles.selectList} onChange={(e) => {
                  if (e.target.value != 'Connecting...') {
                    setSource(getSourceFromName(e.target.value));
                  }
                }} size={6}>
                  <For each={sources()}>{(source: SceneItem) =>
                    <Switch>
                      <Match when={source.sourceName != ''}>
                        <option value={source.sourceName}>{source.sceneItemId}: {source.sourceName}</option>
                      </Match>
                    </Switch>
                  }</For>
                </select>
              </div>
            </div>
            <div class='timer-input-area'>
              <label class='overline'>Create Timer</label>
              <div style='display: flex; justify-content: end;'>
                <div>
                  <label>Delay: </label>
                  <input ref={input_delay} type='number' min='0.5' max='20.0' pattern='[0-9]{2}.[0-9]' step='0.5' value='5.0' />
                </div>
              </div>
              <div style='display: flex; justify-content: end;'>
                <label>Show Duration: </label>
                <input ref={input_show_duration} type='number' min='0.5' max='20.0' pattern='[0-9]{2}.[0-9]' step='0.5' value='5.0' />
              </div>
              <div style='display: flex; justify-content: end;'>
                <label>Hide Duration: </label>
                <input ref={input_hide_duration} type='number' min='0.5' max='20.0' pattern='[0-9]{2}.[0-9]' step='0.5' value='2.0' />
              </div>
              <div style='display: flex; justify-content: end;'>
                <label>Start Visible: </label>
                <input ref={input_start_visible} type='checkbox' />
              </div>
              <div style='display: flex; justify-content: end;'>
                <input type='button' value='Add Timer' onClick={() => {
                  let ind = timerList.length;
                  let tim = tims.addTimer({
                    scene: scene(),
                    source: source(),
                    delay: input_delay.value,
                    show_duration: input_show_duration.value,
                    hide_duration: input_hide_duration.value,
                    start_visible: input_start_visible.checked,
                  });
                  setTimerList([ind], tim);
                }} />
              </div>
            </div>
          </div>
          <br />
          <div class='cont2'>
            <div>
              <div class='timer-list' style='display: inline-block; white-space: initial;'>
                <label class='overline' style='display: block'>Timers</label>
                <select class={styles.selectList} onChange={(e) => {
                  let ids = e.target.value.split(',');
                  let timer = tims.timerById(ids[0], ids[1]);
                  setTimer(timer);
                  input_edit_delay.value = timer.duration.delay;
                  input_edit_show_duration.value = timer.duration.show;
                  input_edit_hide_duration.value = timer.duration.hide;
                  input_edit_start_visible.checked = timer.start_visible;
                }} size={6}>
                  <For each={timerList}>{(tim: Timer) =>
                    <option value={tim.scene.sceneIndex + ',' + tim.source.sceneItemId}>{tim.scene.sceneName}: {tim.source.sourceName}</option>
                  }</For>
                </select>
                <input type='button' value='Remove Timer' onClick={() => {
                  let timers = timerList;
                  tims.removeTimer(timer().scene, timer().source);
                  timers = timers.filter((value) => {
                    if (value.scene.sceneIndex == timer().scene.sceneIndex && value.source.sceneItemId == timer().source.sceneItemId) {
                      return false;
                    } else {
                      return true;
                    }
                  });
                  setTimerList(timers);
                  setTimer(undefined);
                }} />
              </div>
            </div>
            <div class='timer-input-area' style='min-width: max-content;'>
              <label class='overline' style='display: block'>Edit Timer</label>
              <div style='display: flex; justify-content: end;'>
                <div>
                  <label>Delay: </label>
                  <input ref={input_edit_delay} type='number' min='0.5' max='20.0' pattern='[0-9]{2}.[0-9]' step='0.5' value='5.0' autocomplete='off' />
                </div>
              </div>
              <div style='display: flex; justify-content: end;'>
                <label>Show Duration: </label>
                <input ref={input_edit_show_duration} type='number' min='0.5' max='20.0' pattern='[0-9]{2}.[0-9]' step='0.5' value='5.0' autocomplete='off' />
              </div>
              <div style='display: flex; justify-content: end;'>
                <label>Hide Duration: </label>
                <input ref={input_edit_hide_duration} type='number' min='0.5' max='20.0' pattern='[0-9]{2}.[0-9]' step='0.5' value='2.0' autocomplete='off' />
              </div>
              <div style='display: flex; justify-content: end;'>
                <label>Start Visible: </label>
                <input ref={input_edit_start_visible} type='checkbox' autocomplete='off' />
              </div>
              <div style='display: flex; justify-content: end;'>
                <input type='button' value='Edit Timer' onClick={() => {
                  tims.hasTimer(timer().scene, timer().source).editTimer({
                    delay: input_edit_delay.value,
                    show_duration: input_edit_show_duration.value,
                    hide_duration: input_edit_hide_duration.value,
                    start_visible: input_edit_start_visible.value,
                  });
                }} />
              </div>
            </div>
          </div>
          <div class="cont3">
            {serverArea}
          </div>
        </div >
      </header >
    </div >
  );
}

export default App;
