// test-llama.mjs
import { fileURLToPath } from "url";
import path from "path";
import { getLlama } from "node-llama-cpp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // 1) Initialize the loader and native binding
  const llama = await getLlama();                            // :contentReference[oaicite:7]{index=7}
  // 2) Load your GGUF model
  const model = await llama.loadModel({
    modelPath: path.join(__dirname, "../models/llama-2-7b.gguf"),
  });                                                         // :contentReference[oaicite:8]{index=8}

  // 3) Run inference
  const out = await model.generate({ prompt: "Hello, world!", max_tokens: 16 });
  console.log("Response:", out.trim());
}

main();
