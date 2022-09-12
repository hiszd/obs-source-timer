import styles from './App.module.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import { For, createEffect, createSignal, onCleanup, onMount, Switch, Match, Accessor } from 'solid-js';
import { createStore } from 'solid-js/store';
import { createSocket, removeSocket, obs, obsApi } from '../lib/obs';
import { Timer } from '../lib/Timer';
import { Timers } from '../lib/Timers';
import { Scene, SceneItem } from '../lib/OBSTypes';
import { Toaster } from './Toaster';


const url = 'http://dev.noiz.tech:3000/';


const fetchopts: RequestInit = {
  method: 'POST',
  mode: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
  },
  body: undefined,
}

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

const save = async (content: Object, server: string) => {
  try {
    let opts = fetchopts;
    let serv = {};
    serv[server] = content;
    opts.body = JSON.stringify({ file: JSON.stringify(serv) });
    fetch(url + 'api/savefile', opts)
      .then((response) => response.json())
      .then((data) => {
        console.log('Success:', data);
        return content;
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } catch (err) {
    console.error(err);
  }
}

const load = async (type: 'autoload' | 'load') => {
  try {
    let opts = fetchopts;
    if (type == 'autoload') {
      opts.body = JSON.stringify({ file: undefined, req: 'autoload' });
    } else if (type == 'load') {
      opts.body = JSON.stringify({ file: undefined, req: 'load' });
    }
    return fetch(url + 'api/loadfile', opts)
      .then((response) => response.json())
      .then((data: { file: string }) => {
        // console.log('Success:', data.file);
        // console.log(JSON.parse(data.file));
        return JSON.parse(data.file)
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  } catch (err) {
    console.error(err);
  }
}

const timSub = (s: string, ele: Element, sceneName: string, sourceName: string) => {
  let style = "color: white;";
  if (s == false) {
    ele.innerHTML = "<i class='bi bi-eye-slash-fill'></i>  " + sceneName + ': ' + sourceName;
    style = "color: grey;";
  } else {
    ele.innerHTML = "<i class='bi bi-eye-fill'></i>  " + sceneName + ': ' + sourceName;
  }
  ele.setAttribute("style", style);
}

function App() {
  let server: string = 'ws://192.168.1.3:4455';
  let password: string = 'VvGMDA9o1u2w4qKl';
  const [scene, setScene] = createSignal<Scene>(DefaultScene);
  const [source, setSource] = createSignal<SceneItem>(DefaultSceneItem);

  const [scenes, setScenes] = createSignal<[Scene]>([DefaultScene]);
  const [sources, setSources] = createSignal<[SceneItem]>([DefaultSceneItem]);

  const [connectionStatus, setConnectionStatus] = createSignal<connectionState>(connectionState.DISCONNECTED);

  /// Keep the state of the connection to server
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
          tims.close().then(() => {
            removeSocket();
            setTimChange(false);
          });
        }} />
        <input style='margin-left: 1rem;' type="button" value="Save Timers" onClick={() => {
          setTimChange(false);
          save(tims.dump(), server).then(() => {
            Toasty.toast('Timers were saved!');
          });
        }} />
        <input style='margin-left: 1rem;' type="button" value="Load Timers" onClick={() => {
          load('load').then((e: Object) => {
            setTimChange(false);
            console.log(e);
            if (e.hasOwnProperty(server)) {
              const timrs = JSON.parse(e[server]);
              for (let a in timrs) {
                console.log(timrs[a]);
                for (let t in timrs[a]) {
                  if (!tims.hasTimer(timrs[a][t].scene, timrs[a][t].source)) {
                    let ind = timerList.length;
                    let timr = timrs[a][t];
                    let tim = tims.addTimer({
                      scene: timr.scene,
                      source: timr.source,
                      delay: timr.duration.delay,
                      show_duration: timr.duration.show,
                      hide_duration: timr.duration.hide,
                      start_visible: timr.start_visible,
                    });
                    setTimerList([ind], tim);
                    tim.sub('visibilityChange', (s: string) => {
                      let ele = document.querySelector("option[id='" + tim.id + "']");
                      timSub(s, ele, tim.scene.sceneName, tim.source.sourceName);
                    });
                  }
                }
              }
              Toasty.toast('Timers loaded successfully!');
            } else {
              Toasty.toast('No timers saved for this server');
            }
          });
        }} />
      </div>
    );
  });

  /// The server area of the webpage
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

  /// Monitor identification by server
  const [identified, setIdentified] = createSignal(false);
  obs.on('Identified', () => { setIdentified(true); });

  const getSources = (e?) => {
    if (e && e.sceneName == scene().sceneName) {
      console.log('getting sources');
      obsApi('sourcelist', { sceneName: scene().sceneName }).then((e) => {
        setSource(e.sceneItems[0] as unknown as SceneItem);
        setSources(e.sceneItems as unknown as [SceneItem]);
      });
    } else {
      console.log('getting sources');
      obsApi('sourcelist', { sceneName: scene().sceneName }).then((e) => {
        setSource(e.sceneItems[0] as unknown as SceneItem);
        setSources(e.sceneItems as unknown as [SceneItem]);
      });
    }
  }
  obs.on('SceneItemCreated', getSources);
  obs.on('SceneItemRemoved', getSources);
  obs.on('SceneItemListReindexed', getSources);

  /// Get sources when the scene has been loaded
  createEffect(() => {
    if (scene().sceneName != '') {
      console.log('getting sources');
      obsApi('sourcelist', { sceneName: scene().sceneName }).then((e) => {
        setSource(e.sceneItems[0] as unknown as SceneItem);
        setSources(e.sceneItems as unknown as [SceneItem]);
      });
    }
  });

  const getScenes = () => {
    if (identified() && connected()) {
      console.log('getting scenes');
      obsApi('scenelist').then((e) => {
        setScene(e.scenes[0] as unknown as Scene);
        setScenes(e.scenes as unknown as [Scene]);
      });
    }
  }
  obs.on('SceneCreated', getScenes);
  obs.on('SceneRemoved', getScenes);
  obs.on('SceneNameChanged', getScenes);
  obs.on('SceneListChanged', getScenes);

  /// Get scenes once identified by the server
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
    window.onbeforeunload = (event) => {
      if (timchange()) {
        event.preventDefault();
        return event.returnValue = "Don't you want to save your timers before you go?";
      }
    }
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

  /// Currently selected timer
  const [timer, setTimer] = createSignal<Timer>();
  /// Has timers changed since save/load
  const [timchange, setTimChange] = createSignal<boolean>(false);

  /// Array of timers currently active
  let tims = new Timers();

  /// List of timers to be used to show the webpage
  /// this tracks along with tims
  const [timerList, setTimerList] = createStore<Timer[]>([]);

  let Toasty: any;

  return (
    <div class={styles.App}>
      <Toaster helpers={(e: any) => Toasty = e} />
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
            <Match when={connectionStatus() == connectionState.CONNECTED && timchange() == false}>
              <h4 class='status-h4'>
                Connected
              </h4>
            </Match>
            <Match when={connectionStatus() == connectionState.CONNECTED && timchange() == true}>
              <h4 class='status-h4'>
                Connected, Timers Unsaved
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
                  if (e.target.value != '') {
                    setScene(getSceneFromName(e.target.value));
                  }
                }} size={6}>
                  <For each={scenes()}>{(scene: Scene, ind: Accessor<number>) =>
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
                  if (e.target.value != '') {
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
                  <input ref={input_delay} type='number' min='0.5' max='20.0' pattern='[0-9]{2}.[0-9]' step='0.5' value='0.0' />
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
                  setTimChange(true);
                  let ind = timerList.length;
                  if (scene().sceneName != '' && source().sourceName != '') {
                    let tim = tims.addTimer({
                      scene: scene(),
                      source: source(),
                      delay: input_delay.value,
                      show_duration: input_show_duration.value,
                      hide_duration: input_hide_duration.value,
                      start_visible: input_start_visible.checked,
                    });
                    setTimerList([ind], tim);
                    tim.sub('visibilityChange', (s: string) => {
                      let ele = document.querySelector("option[id='" + tim.id + "']");
                      timSub(s, ele, tim.scene.sceneName, tim.source.sourceName);
                    });
                  }
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
                    <option style="display: none;" id={tim.id} value={tim.scene.sceneIndex + ',' + tim.source.sceneItemId}>{tim.scene.sceneName}: {tim.source.sourceName}</option>
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
                  setTimChange(true);
                  tims.hasTimer(timer().scene, timer().source).editTimer({
                    delay: input_edit_delay.value,
                    show_duration: input_edit_show_duration.value,
                    hide_duration: input_edit_hide_duration.value,
                    start_visible: input_edit_start_visible.checked,
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
