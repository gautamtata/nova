import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export function createAIClient(apiKey: string) {
  return createOpenRouter({ apiKey });
}

export type AIAction =
  | 'rewrite'
  | 'simplify'
  | 'improve'
  | 'fix-grammar'
  | 'make-shorter'
  | 'make-longer'
  | 'change-tone-formal'
  | 'change-tone-casual'
  | 'continue-writing'
  | 'custom-write';

const ACTION_PROMPTS: Record<AIAction, string> = {
  rewrite:
    'Rewrite the following text while keeping the same meaning. Make it clearer and more engaging. Return ONLY the rewritten text, nothing else.',
  simplify:
    'Simplify the following text. Use shorter sentences and simpler words while preserving the meaning. Return ONLY the simplified text.',
  improve:
    'Improve the writing quality of the following text. Enhance clarity, flow, and word choice. Return ONLY the improved text.',
  'fix-grammar':
    'Fix all grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text.',
  'make-shorter':
    'Make the following text more concise. Remove unnecessary words and phrases while preserving the key meaning. Return ONLY the shortened text.',
  'make-longer':
    'Expand the following text with more detail and depth. Add supporting points or examples. Return ONLY the expanded text.',
  'change-tone-formal':
    'Rewrite the following text in a formal, professional tone. Return ONLY the rewritten text.',
  'change-tone-casual':
    'Rewrite the following text in a casual, conversational tone. Return ONLY the rewritten text.',
  'continue-writing':
    'Continue writing from where the following text ends. Match the style and tone. Write 2-3 more sentences. Return ONLY the continuation text (do not repeat the original).',
  'custom-write':
    'You are a writing assistant. The user will provide a request describing what they want written. Write exactly what they ask for. Return ONLY the written content, nothing else.',
};

export async function runAIAction(
  apiKey: string,
  model: string,
  action: AIAction,
  selectedText: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const client = createAIClient(apiKey);
  const systemPrompt = ACTION_PROMPTS[action];

  const result = streamText({
    model: client(model),
    system: systemPrompt,
    prompt: selectedText,
  });

  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
    onChunk(fullText);
  }

  return fullText;
}

export async function runCustomWrite(
  apiKey: string,
  model: string,
  userPrompt: string,
  context: string,
  onChunk: (text: string) => void,
): Promise<string> {
  const client = createAIClient(apiKey);
  const systemPrompt = ACTION_PROMPTS['custom-write'];

  const prompt = context
    ? `Context (preceding text in the document):\n${context}\n\nUser request: ${userPrompt}`
    : userPrompt;

  const result = streamText({
    model: client(model),
    system: systemPrompt,
    prompt,
  });

  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
    onChunk(fullText);
  }

  return fullText;
}

export async function chatWithAI(
  apiKey: string,
  model: string,
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  onChunk: (text: string) => void,
): Promise<string> {
  const client = createAIClient(apiKey);

  const result = streamText({
    model: client(model),
    system:
      'You are a helpful AI writing assistant integrated into a text editor called Nova. Help users with their writing: answer questions, brainstorm ideas, explain concepts, suggest edits, and provide writing guidance. Be concise but thorough. When the user shares text from their editor, provide specific, actionable feedback. Use markdown formatting in your responses.',
    messages,
  });

  let fullText = '';
  for await (const chunk of result.textStream) {
    fullText += chunk;
    onChunk(fullText);
  }

  return fullText;
}
