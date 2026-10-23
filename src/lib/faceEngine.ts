/**
 * Browser-side face detection + embedding extraction (face-api.js / TFJS).
 * Everything here runs in the browser only — import lazily from client code.
 */
export type DetectedFace = {
  box: { x: number; y: number; width: number; height: number };
  descriptor: Float32Array;
  score: number;
};

type FaceApi = typeof import("@vladmandic/face-api");

let apiPromise: Promise<FaceApi> | null = null;

export function loadFaceEngine(): Promise<FaceApi> {
  if (!apiPromise) {
    apiPromise = (async () => {
      const faceapi = await import("@vladmandic/face-api");
      const tf = faceapi.tf as unknown as {
        setBackend: (b: string) => Promise<boolean>;
        ready: () => Promise<void>;
      };
      try {
        await tf.setBackend("webgl");
      } catch {
        await tf.setBackend("cpu");
      }
      await tf.ready();
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      ]);
      return faceapi;
    })().catch((error) => {
      apiPromise = null;
      throw error;
    });
  }
  return apiPromise;
}

/** Detect every face in the image and compute its 128-d embedding. */
export async function detectFaces(
  image: HTMLImageElement,
  opts: { minConfidence?: number } = {},
): Promise<DetectedFace[]> {
  const faceapi = await loadFaceEngine();
  const results = await faceapi
    .detectAllFaces(
      image,
      new faceapi.SsdMobilenetv1Options({ minConfidence: opts.minConfidence ?? 0.4 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

  return results
    .map((r) => ({
      box: {
        x: r.detection.box.x,
        y: r.detection.box.y,
        width: r.detection.box.width,
        height: r.detection.box.height,
      },
      score: r.detection.score,
      descriptor: r.descriptor,
    }))
    .sort((a, b) => b.box.width * b.box.height - a.box.width * a.box.height);
}

export function readImage(file: File): Promise<{ url: string; image: HTMLImageElement }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve({ url, image });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This image could not be opened. It may be corrupt."));
    };
    image.src = url;
  });
}

export function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be loaded."));
    image.src = url;
  });
}
