export type Scene = {
  sceneIndex: number,
  sceneName: string
}

export type SceneItem = {
  inputKind: string,
  isGroup: boolean,
  sceneItemBlendMode: string,
  sceneItemEnabled: boolean,
  sceneItemId: number,
  sceneItemIndex: number,
  sceneItemLocked: boolean,
  sceneItemTransform: {
    alignment: number,
    boundsAlignment: number,
    boundsHeight: number,
    boundsType: string,
    boundsWidth: number,
    cropBottom: number,
    cropLeft: number,
    cropRight: number,
    cropTop: number,
    height: number,
    positionX: number,
    positionY: number,
    rotation: number,
    scaleX: number,
    scaleY: number,
    sourceHeight: number,
    sourceWidth: number,
    width: number
  },
  sourceName: string,
  sourceType: string
}

export function DefaultSceneItem(): SceneItem {
   return {
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
  "sourceName": "Connecting...",
  "sourceType": "OBS_SOURCE_TYPE_INPUT"
}
}
