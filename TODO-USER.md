# User TODO

## Pending

- [ ] Set `GITHUB_TOKEN` environment variable - Required to avoid GitHub API rate limits (60 requests/hour without token)
- [ ] Set `ANTHROPIC_API_KEY` environment variable - Required for AI summarization with Claude Sonnet
- [ ] Run `npm run generate:skills` to generate AI descriptions and GitHub metadata - This will populate `data/skills-cache.json`

## Environment Variables

Create a `.env.local` file with:

```bash
GITHUB_TOKEN=your_github_personal_access_token
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Getting the tokens:
- **GitHub Token**: Go to GitHub Settings > Developer Settings > Personal Access Tokens > Generate new token (classic). No special scopes needed for public repos.
- **Anthropic API Key**: Get from https://console.anthropic.com/

## Notes

- The `generate:skills` script will fetch GitHub metadata (stars, forks, watchers, language, license) and generate AI summaries for all skills
- The script caches results and only re-fetches data older than 24 hours
- Estimated API cost for 95 skills: ~$0.17 (using Claude Sonnet)

## Completed

- [x] Initial skill page improvements implementation
