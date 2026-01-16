import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function summarizeReadme(
  readme: string,
  skillName: string
): Promise<string> {
  const truncatedReadme = readme.slice(0, 8000);

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: `You are summarizing a GitHub repository README for a skills marketplace. The skill is called "${skillName}".

Write a 2-3 sentence summary that explains:
1. What this skill/tool does
2. Key features or use cases

Be concise and focus on practical value. Do not use marketing language. Write in third person.

README content:
${truncatedReadme}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }

  return textBlock.text.trim();
}
