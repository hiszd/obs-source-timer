import OBSWebSocket from "obs-websocket-js";

export const obs = new OBSWebSocket();

export async function createSocket() {
  try {
    const {
      obsWebSocketVersion,
      negotiatedRpcVersion
    } = await obs.connect('ws://192.168.1.3:4455', 'VvGMDA9o1u2w4qKl');
    if (obs.identified) {
      console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
      return true;
    }
  } catch (error) {
    console.error('Failed to connect', error.code, error.message);
    return false;
  }
}

export async function obsApi(request, data) {
  if (!obs.identified) {
    console.log('Not yet connected. Connecting now.');
    await createSocket();
  }
  console.log('request: ' + request);
  console.log('data: ' + JSON.stringify(data));
  switch (request) {
    case 'scenelist':
      let scenes = undefined;
      scenes = await obs.call('GetSceneList').then(({ scenes }) => {
        // console.log("Scenes: ");
        // console.log(scenes);
        return scenes;
      });
      return { scenes }
      break;
    case 'sourcelist':
      let sceneItems = undefined;
      sceneItems = await obs.call('GetSceneItemList', data).then(({ sceneItems }) => {
        // console.log("SceneItems: ");
        // console.log(sceneItems);
        return sceneItems;
      });
      return { sceneItems };
      break;
    case 'setsceneitemenabled':
      await obs.call('SetSceneItemEnabled', data).then(() => {
        return;
      });
      break;
    default:
      console.log("Not a known option");
      break;
  }
  return;
}
