import { pipeline } from "@xenova/transformers";

type FeatureExtractionPipeline = Awaited<ReturnType<typeof pipeline>>;
let extractorPipeline: FeatureExtractionPipeline | null = null;

/**
 * Retrieves the embedding pipeline (loads model on first call)
 * Model: Xenova/all-MiniLM-L6-v2 (~90MB, downloaded on first use)
 */
async function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
  if (!extractorPipeline) {
    console.log("[Embedding] Loading model Xenova/all-MiniLM-L6-v2...");
    extractorPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );
    console.log("[Embedding] Model loaded successfully.");
  }
  return extractorPipeline;
}

/**
 * 
 * @param text - The text to generate an embedding for
 * @returns A 384-dimensional array of floating-point numbers
 * 
 * Generates a 384-dimensional embedding vector from text
 * Uses mean pooling and normalization for sentence embeddings
 *
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getEmbeddingPipeline();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = await (extractor as any)(text, {
    pooling: "mean",
    normalize: true,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Array.from((output as any).data as Float32Array);
}

export { generateEmbedding };

