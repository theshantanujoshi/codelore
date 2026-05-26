const NVIDIA_MODELS = [
  "nvidia/llama-3.1-nemotron-70b-instruct",
  "nvidia/nemotron-4-340b-instruct",
];

let currentIndex = 0;

/**
 * Returns the next NVIDIA model from the available pool using round-robin logic.
 */
export function getNextNvidiaModel(): string {
  const model = NVIDIA_MODELS[currentIndex];
  currentIndex = (currentIndex + 1) % NVIDIA_MODELS.length;
  return model;
}
