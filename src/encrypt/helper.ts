export const base64ToUint8Array = (base64: string) =>
  new Uint8Array(
    window
      .atob(base64)
      .split("")
      .map((c) => c.charCodeAt(0)),
  );

export const uint8ArrayToBase64 = (
  array: Uint8Array<ArrayBuffer | SharedArrayBuffer>,
) => window.btoa(String.fromCharCode.apply(null, Array.from(array)));
