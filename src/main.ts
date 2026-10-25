
import { buildChatModel } from "./models.js";

export async function main() {
  const [_, provider] = buildChatModel();
  const result = await _.invoke("Hello!");
  console.log('Provider that we got is: ', provider.name);
  console.log("The result of hello to this model is: ", result);
}

