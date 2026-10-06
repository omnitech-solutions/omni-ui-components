import type { ChatMessage, ChatRun, ConversationTurn } from './Transcript.conversation.types';

/** The text of a message: its text parts joined by newlines and trimmed. */
export const promptOf = (message: ChatMessage): string =>
  message.parts
    .flatMap((part) => (part.type === 'text' ? [part.text] : []))
    .join('\n')
    .trim();

const proposalId = (output: unknown): string | undefined => {
  if (output && typeof output === 'object' && 'proposalId' in output) {
    const id = (output as { proposalId: unknown }).proposalId;
    return typeof id === 'string' ? id : undefined;
  }
  return undefined;
};

/**
 * Groups the messages of the branch in view into turns: a question, then everything the assistant did to answer it.
 * Pure; ported from the original `buildTurns` (`omnitech-assistant/packages/react/src/turns.ts`).
 *
 * - System messages are skipped; tool-role messages only fill in the output of the step that called them.
 * - Tool calls become `steps`; calls made together in one assistant message share a `group` (they ran in parallel).
 *   A step is `failed` when its output has an `error` key.
 * - The last assistant message without tool calls is the `final` answer; a `partial` message marks the answer partial.
 * - `reasoning`, `sources`, `suggestions` and `usage` parts are collected onto the answer; `proposalIds` are mined from
 *   tool results shaped `{ proposalId }`.
 * - `answer.seconds` is the time from the question to the final message.
 * - `run` is the latest run for that user message (from `runs`).
 *
 * @example
 * const turns = buildTurns(messages, runs); // [{ id, user, answer?, run? }]
 */
export function buildTurns(messages: readonly ChatMessage[], runs: readonly ChatRun[] = []): ConversationTurn[] {
  const turns: ConversationTurn[] = [];
  const latestRun = new Map<string, ChatRun>();
  for (const run of runs) if (run.userMessageId) latestRun.set(run.userMessageId, run);
  let group = 0;
  for (const message of messages) {
    // [GUARD] System messages never show.
    if (message.role === 'system') continue;
    if (message.role === 'user') {
      const run = latestRun.get(message.id);
      turns.push({ id: message.id, user: message, ...(run ? { run } : {}) });
      continue;
    }
    // An assistant or tool message before any question has nothing to answer.
    const turn = turns.at(-1);
    if (!turn) continue;
    if (!turn.answer) {
      turn.answer = { first: message, text: '', steps: [], sources: [], suggestions: [], partial: false, proposalIds: [] };
    }
    const answer = turn.answer;
    if (message.role === 'tool') {
      // [STATE] A tool result completes the step that made the call.
      for (const part of message.parts) {
        if (part.type !== 'tool-result') continue;
        const step = answer.steps.find((candidate) => candidate.id === part.id);
        if (!step) continue;
        step.output = part.output;
        step.done = true;
        step.failed = Boolean(part.output && typeof part.output === 'object' && 'error' in part.output);
        const id = proposalId(part.output);
        if (id && !answer.proposalIds.includes(id)) answer.proposalIds.push(id);
      }
      continue;
    }
    const calls = message.parts.flatMap((part) => (part.type === 'tool-call' ? [part] : []));
    if (calls.length) {
      group++;
      for (const call of calls) answer.steps.push({ id: call.id, name: call.name, input: call.input, done: false, failed: false, group });
    } else {
      answer.final = message;
      answer.text = promptOf(message);
    }
    if (message.status === 'partial') {
      answer.partial = true;
      if (!calls.length) answer.text = promptOf(message);
    }
    for (const part of message.parts) {
      if (part.type === 'reasoning' && part.seconds !== undefined) answer.reasoning = { text: part.text, seconds: part.seconds };
      else if (part.type === 'sources') answer.sources = [...part.items];
      else if (part.type === 'suggestions') answer.suggestions = [...part.items];
      else if (part.type === 'usage') answer.usage = part.usage;
    }
  }
  // Seconds taken: question to the final (or first) answer message.
  for (const turn of turns) {
    const answer = turn.answer;
    if (!answer) continue;
    const end = Date.parse((answer.final ?? answer.first).createdAt);
    const start = Date.parse(turn.user.createdAt);
    if (Number.isFinite(end - start) && end >= start) answer.seconds = (end - start) / 1000;
  }
  return turns;
}
