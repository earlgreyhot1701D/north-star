import {
  BedrockRuntimeClient,
  ConverseCommand,
  type Message,
} from "@aws-sdk/client-bedrock-runtime";
import { SYSTEM_PROMPT, buildUserMessage } from "./prompt";
import type { Decision, Profile } from "./schemas";

export const DEFAULT_MODEL_ID = "amazon.nova-lite-v1:0";

export interface BedrockResult {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  modelId: string;
}

let cachedClient: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
  if (!cachedClient) {
    cachedClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION ?? process.env.BEDROCK_REGION,
    });
  }
  return cachedClient;
}

// Exposed for tests so the client can be swapped for a stub.
export function __setClientForTests(client: BedrockRuntimeClient | null): void {
  cachedClient = client;
}

export async function invokeModel(
  profile: Profile,
  decision: Decision,
): Promise<BedrockResult> {
  const modelId = process.env.BEDROCK_MODEL_ID?.trim() || DEFAULT_MODEL_ID;
  const messages: Message[] = [
    {
      role: "user",
      content: [{ text: buildUserMessage(profile, decision) }],
    },
  ];

  const command = new ConverseCommand({
    modelId,
    system: [{ text: SYSTEM_PROMPT }],
    messages,
    inferenceConfig: {
      // Low temperature for predictable, structured output.
      temperature: 0.2,
      topP: 0.9,
      maxTokens: 1200,
    },
  });

  const response = await getClient().send(command);
  const text =
    response.output?.message?.content
      ?.map((block) => ("text" in block ? block.text : ""))
      .join("")
      .trim() ?? "";

  return {
    text,
    inputTokens: response.usage?.inputTokens,
    outputTokens: response.usage?.outputTokens,
    modelId,
  };
}
