import OBSWebSocket, { OBSRequestTypes, OBSResponseTypes } from "obs-websocket-js";

export const obs = new OBSWebSocket();

export async function createSocket(server: string, password: string) {
  try {
    const {
      obsWebSocketVersion,
      negotiatedRpcVersion
    } = await obs.connect(server, password);
    if (obs.identified) {
      console.log(`Connected to server ${obsWebSocketVersion} (using RPC ${negotiatedRpcVersion})`)
      return true;
    }
  } catch (error) {
    console.error('Failed to connect', error.code, error.message);
    return false;
  }
}

export async function obsApi(request: string, data: OBSRequestTypes['GetSceneItemList'] | OBSRequestTypes['SetSceneItemEnabled'] | OBSRequestTypes['GetSceneItemEnabled']) {
  if (!obs.identified) {
    console.log('Not yet connected. Connecting now.');
    await createSocket();
  }
  // console.log('request: ' + request);
  // console.log('data: ' + JSON.stringify(data));
  switch (request) {
    case 'scenelist':
      let scenes = undefined;
      scenes = await obs.call('GetSceneList').then(({ scenes }) => {
        // console.log("Scenes: ");
        // console.log(scenes);
        return scenes;
      });
      return { scenes }
    case 'sourcelist':
      let sceneItems = undefined;
      sceneItems = await obs.call('GetSceneItemList', data as OBSRequestTypes['GetSceneItemList']).then(({ sceneItems }) => {
        // console.log("SceneItems: ");
        // console.log(sceneItems);
        return sceneItems;
      });
      return { sceneItems };
    case 'setsceneitemenabled':
      await obs.call('SetSceneItemEnabled', data as OBSRequestTypes['SetSceneItemEnabled'])
      return;
    case 'getsceneitemenabled':
      let sceneitemenabled = undefined;
      sceneitemenabled = await obs.call('GetSceneItemEnabled', data as OBSRequestTypes['GetSceneItemEnabled']).then((sie) => {
        return sie;
      });
      return { sceneitemenabled };
    default:
      console.log("Not a known option");
      return;
  }
}
