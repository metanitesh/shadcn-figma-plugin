import type { Message, PluginMessageEvent } from "../../src/globals";
import type { EventTS } from "../../shared/universals";

export const dispatch = (data: any, origin = "*") => {
  figma.ui.postMessage(data, {
    origin,
  });
};

export const dispatchTS = <Key extends keyof EventTS>(
  event: Key,
  data: EventTS[Key],
  origin = "*",
) => {
  dispatch({ event, data }, origin);
};

export const listenTS: any = (
  eventName: any,
  callback: (data: any) => any,
  listenOnce = false,
) => {
  const func = (event: any) => {
    if (event.event === eventName) {
      callback(event);
      if (listenOnce) figma.ui && figma.ui.off("message", func); // Remove Listener so we only listen once
    }
  };

  figma.ui.on("message", func);
};

export const getStore = async (key: string) => {
  const value = await figma.clientStorage.getAsync(key);
  return value;
};

export const setStore = async (key: string, value: string) => {
  await figma.clientStorage.setAsync(key, value);
};
