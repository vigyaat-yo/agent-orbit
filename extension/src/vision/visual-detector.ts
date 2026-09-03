export interface VisualDetection { type: string; confidence: number; boundingBox?: { x: number; y: number; width: number; height: number }; source: "fallback" | "onnx"; }
export interface VisualDetector { detect(): Promise<VisualDetection[]>; }

/** Lightweight local fallback. DOM detection remains the authoritative MVP path. */
export class LocalVisualFallback implements VisualDetector {
  async detect(): Promise<VisualDetection[]> { return []; }
}

// Future: implement OnnxWebGpuVisualDetector here with onnxruntime-web, WebGPU and a bundled local model.
