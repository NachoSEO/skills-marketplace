#!/usr/bin/env python3
"""
Script to tag untagged skills in skills-data.json based on name, description, category, and GitHub URL.
Also validates and reports metadata completeness issues.
"""
import json
import re
from collections import defaultdict

DATA_PATH = "/Users/nacho/Workspace/skills-marketplace/data/skills-data.json"

# Category-based default tags
CATEGORY_DEFAULTS = {
    "ai-llm": ["ai", "claude", "llm"],
    "development-tools": ["claude-code", "developer-tools"],
    "document-processing": ["documents", "document-processing"],
    "productivity": ["productivity", "claude-code"],
    "communication": ["communication", "writing"],
    "creative-design": ["design", "creative"],
    "security": ["security"],
    "devops-cicd": ["devops", "ci-cd"],
    "automation": ["automation", "agents"],
    "business-marketing": ["marketing", "business"],
    "data-analysis": ["data", "analytics"],
    "web-scraping": ["web-scraping", "automation"],
    "seo-search": ["seo", "search"],
    "translation-localization": ["translation", "localization"],
}

# Keyword → tags mapping (applied to lowercased name + description)
KEYWORD_TAGS = [
    # Claude / Anthropic
    (r"\bclaude[\s-]code\b", ["claude-code"]),
    (r"\bclaude[\s-]code[\s-]skill\b", ["claude-code-skill"]),
    (r"\bclaude[\s-]desktop\b", ["claude-desktop"]),
    (r"\bclaude\b", ["claude"]),
    (r"\banthrop", ["anthropic"]),
    (r"\bcodex\b", ["codex"]),
    (r"\bgeminicli\b|\bgemini[\s-]cli\b", ["gemini-cli"]),
    (r"\bgpt\b|\bopenai\b", ["openai"]),
    # MCP / Protocol
    (r"\bmcp\b|\bmodel context protocol\b", ["mcp"]),
    (r"\bmcp[\s-]server\b", ["mcp-server"]),
    # Agent / AI
    (r"\bagent skill\b|\bagent-skill\b", ["agent-skills"]),
    (r"\bagent\b", ["agents"]),
    (r"\bai[\s-]agent\b", ["ai-agents"]),
    (r"\bagentic\b", ["agentic-ai"]),
    (r"\bllm\b", ["llm"]),
    (r"\bai\b", ["ai"]),
    # Development tools
    (r"\btdd\b|\btest[\s-]driven\b", ["tdd", "testing"]),
    (r"\bvitest\b", ["vitest", "testing"]),
    (r"\bplaywright\b", ["playwright", "testing", "browser-automation"]),
    (r"\bdocker\b", ["docker", "devops"]),
    (r"\bkubernetes\b|\bk8s\b", ["kubernetes", "devops"]),
    (r"\bgit\b(?!hub)", ["git"]),
    (r"\bgithub\b", ["github"]),
    (r"\bcli\b", ["cli"]),
    (r"\bterminal\b", ["cli", "terminal"]),
    (r"\brust\b", ["rust"]),
    (r"\bpython\b", ["python"]),
    (r"\btypescript\b|\bts\b", ["typescript"]),
    (r"\bjavascript\b|\bjs\b", ["javascript"]),
    (r"\breact\b", ["react"]),
    (r"\bsvelte\b", ["svelte"]),
    (r"\bvue\b", ["vue"]),
    (r"\bnext\.?js\b", ["nextjs"]),
    (r"\bnode\.?js\b|\bnodejs\b", ["nodejs"]),
    (r"\bswift\b|\bswiftui\b", ["swift", "ios"]),
    (r"\bandroid\b", ["android", "mobile"]),
    (r"\bios\b|\biphone\b|\bipad\b", ["ios", "mobile"]),
    (r"\bmobile\b", ["mobile"]),
    (r"\bjava\b", ["java"]),
    (r"\bkotlin\b", ["kotlin"]),
    (r"\bgo\b(?:lang)?\b", ["golang"]),
    (r"\bc\+\+\b", ["cpp"]),
    (r"\bphp\b", ["php"]),
    # Web / frontend
    (r"\bfrontend\b|\bfront[\s-]end\b", ["frontend"]),
    (r"\bbackend\b|\bback[\s-]end\b", ["backend"]),
    (r"\bfullstack\b|\bfull[\s-]stack\b", ["fullstack"]),
    (r"\bweb\b", ["web"]),
    (r"\bhtml\b", ["html"]),
    (r"\bcss\b", ["css"]),
    (r"\btailwind\b", ["tailwind"]),
    (r"\bshadcn\b", ["shadcn"]),
    (r"\bapi\b", ["api"]),
    (r"\brest api\b", ["rest-api"]),
    (r"\bgraphql\b", ["graphql"]),
    # Cloud / infra
    (r"\baws\b|\bamazon web\b", ["aws", "cloud"]),
    (r"\bcloudflare\b", ["cloudflare"]),
    (r"\bgcp\b|\bgoogle cloud\b", ["gcp", "cloud"]),
    (r"\bazure\b", ["azure", "cloud"]),
    (r"\bvercel\b", ["vercel"]),
    (r"\bdeployment\b", ["deployment"]),
    (r"\bserverless\b", ["serverless"]),
    # AI/ML
    (r"\bembedding\b|\bembeddings\b", ["embeddings", "ai"]),
    (r"\brag\b|\bretrieval[\s-]augmented\b", ["rag"]),
    (r"\bvector\b", ["vector-search"]),
    (r"\bprompt engineering\b|\bprompt[\s-]coach\b", ["prompt-engineering"]),
    (r"\bcontext engineering\b", ["context-engineering"]),
    (r"\bsemantic\b", ["semantic-search"]),
    (r"\bimage generation\b|\bimagen\b|\bsdxl\b|\bstable diffusion\b", ["image-generation", "ai"]),
    (r"\bvision\b|\bvlm\b", ["computer-vision", "ai"]),
    (r"\bspeech\b|\baudio\b|\bvoice\b", ["voice", "audio"]),
    (r"\bvideo\b", ["video"]),
    # Documents / processing
    (r"\bpdf\b", ["pdf"]),
    (r"\bdocx\b|\bword\b", ["word-docs"]),
    (r"\bexcel\b|\bxlsx\b|\bspreadsheet\b", ["excel"]),
    (r"\bpptx\b|\bpowerpoint\b|\bslide\b|\bpresentation\b", ["presentations"]),
    (r"\bcsv\b", ["csv"]),
    (r"\bjson\b", ["json"]),
    (r"\bmarkdown\b", ["markdown"]),
    (r"\bextraction\b", ["extraction"]),
    (r"\bocr\b", ["ocr"]),
    # Productivity
    (r"\bnotion\b", ["notion"]),
    (r"\bslack\b", ["slack"]),
    (r"\bgmail\b", ["gmail", "email"]),
    (r"\bcalendar\b", ["calendar"]),
    (r"\bjira\b", ["jira"]),
    (r"\blinear\b", ["linear"]),
    (r"\btrello\b", ["trello"]),
    (r"\btask\b|\btodo\b", ["task-management"]),
    (r"\bnote\b|\bnotes\b", ["notes"]),
    # Security
    (r"\bsecurity\b|\bsecure\b", ["security"]),
    (r"\bpentesting\b|\bpenetration test\b", ["pentesting"]),
    (r"\bfuzzing\b|\bfuzz\b", ["fuzzing"]),
    (r"\bvulnerabilit\b", ["vulnerability"]),
    (r"\bsandbox\b", ["sandboxing"]),
    (r"\bauth\b|\bauthentication\b", ["authentication"]),
    # DevOps / CI/CD
    (r"\bcicd\b|\bci/cd\b|\bcontinuous integration\b", ["ci-cd"]),
    (r"\bgithub actions\b", ["github-actions"]),
    (r"\bmonitoring\b", ["monitoring"]),
    (r"\blogging\b|\blogs\b", ["logging"]),
    (r"\bretry logic\b", ["error-handling"]),
    # Communication
    (r"\bwriting\b|\bwriter\b|\bcopywriting\b", ["writing"]),
    (r"\bblog\b", ["blogging"]),
    (r"\bcontent\b", ["content"]),
    (r"\bemail\b", ["email"]),
    (r"\bchat\b", ["chat"]),
    # Marketing / SEO
    (r"\bseo\b", ["seo"]),
    (r"\bsearch engine\b", ["seo"]),
    (r"\bmarketing\b", ["marketing"]),
    (r"\banalytics\b", ["analytics"]),
    (r"\bsocial media\b", ["social-media"]),
    (r"\btwitter\b|\bx\.com\b", ["twitter"]),
    (r"\blinkedin\b", ["linkedin"]),
    # Browser / Web automation
    (r"\bbrowser\b", ["browser"]),
    (r"\bchrome\b|\bchromium\b", ["chrome"]),
    (r"\bselenium\b", ["selenium", "browser-automation"]),
    (r"\bpuppeteer\b", ["puppeteer", "browser-automation"]),
    (r"\bscraping\b|\bscraper\b", ["web-scraping"]),
    # Design / Creative
    (r"\bdesign\b", ["design"]),
    (r"\bfigma\b", ["figma"]),
    (r"\bcanvas\b", ["canvas"]),
    (r"\bart\b(?!ifact)", ["art"]),
    (r"\bsvg\b", ["svg"]),
    (r"\bgenerative\b", ["generative-ai"]),
    (r"\bdiagram\b|\bexcalidraw\b", ["diagrams"]),
    # Data
    (r"\bdatabase\b|\bdb\b", ["database"]),
    (r"\bpostgresql\b|\bpostgres\b", ["postgresql"]),
    (r"\bmysql\b", ["mysql"]),
    (r"\bsqlite\b", ["sqlite"]),
    (r"\bsql\b", ["sql"]),
    (r"\bnosql\b|\bmongodb\b", ["mongodb", "nosql"]),
    (r"\bdata[\s-]analysis\b|\banalyze\b", ["data-analysis"]),
    (r"\bvisuali", ["data-visualization"]),
    # n8n / Workflow
    (r"\bn8n\b", ["n8n", "workflows"]),
    (r"\bworkflow\b", ["workflows"]),
    (r"\bzapier\b", ["zapier", "automation"]),
    (r"\bmake\b|\bintegromat\b", ["make-com", "automation"]),
    # Translation
    (r"\btranslat", ["translation"]),
    (r"\blocali", ["localization"]),
    # Nostr / Web3
    (r"\bnostr\b", ["nostr", "decentralized"]),
    (r"\bblockchain\b|\bweb3\b|\bcrypto\b", ["blockchain", "web3"]),
    (r"\bsolana\b", ["solana", "blockchain"]),
    (r"\bethereum\b", ["ethereum", "blockchain"]),
    # Mobile
    (r"\bflutter\b", ["flutter", "mobile"]),
    (r"\breact native\b", ["react-native", "mobile"]),
    # Video
    (r"\byoutube\b", ["youtube"]),
    (r"\bnotebooklm\b", ["notebooklm", "google"]),
    # Research / Docs
    (r"\bresearch\b", ["research"]),
    (r"\bdocumentation\b|\bdocs\b", ["documentation"]),
    (r"\bwiki\b", ["wiki"]),
    # Humanizer
    (r"\bhumaniz", ["writing", "ai-content"]),
    # Context / Memory
    (r"\bmemory\b", ["memory", "context-engineering"]),
    (r"\bcontext\b", ["context-engineering"]),
]

def infer_tags(skill: dict) -> list[str]:
    """Infer tags for a skill based on its name, description, category, and GitHub URL."""
    name = (skill.get("name") or "").lower()
    description = (skill.get("description") or "").lower()
    category = skill.get("category") or ""
    github_url = (skill.get("githubUrl") or "").lower()

    text = f"{name} {description} {github_url}"

    tags = set()

    # Add category defaults
    for tag in CATEGORY_DEFAULTS.get(category, []):
        tags.add(tag)

    # Apply keyword rules
    for pattern, tag_list in KEYWORD_TAGS:
        if re.search(pattern, text):
            for t in tag_list:
                tags.add(t)

    # Special case: if no category default covered claude-code, add it for dev tools
    if category == "development-tools" and "claude-code" not in tags:
        tags.add("claude-code")

    # Clean up redundancies: if claude-code-skill is present, ensure claude-code is too
    if "claude-code-skill" in tags:
        tags.add("claude-code")

    # Return sorted list, max 8 tags for quality
    tag_list = sorted(tags)

    # Prioritize more specific/useful tags
    priority = ["claude-code", "claude-code-skill", "mcp", "mcp-server", "claude", "anthropic",
                "ai-agents", "agents", "agentic-ai", "llm", "ai"]

    sorted_tags = []
    for p in priority:
        if p in tag_list:
            sorted_tags.append(p)
            tag_list.remove(p)
    sorted_tags.extend(tag_list)

    return sorted_tags[:8]


def main():
    with open(DATA_PATH, "r") as f:
        data = json.load(f)

    total = len(data)
    untagged = [s for s in data if not s.get("tags") or len(s["tags"]) == 0]

    print(f"Total skills: {total}")
    print(f"Untagged: {len(untagged)}")
    print()

    # Tag untagged skills
    tagged_count = 0
    for skill in data:
        if not skill.get("tags") or len(skill["tags"]) == 0:
            new_tags = infer_tags(skill)
            if new_tags:
                skill["tags"] = new_tags
                tagged_count += 1
                print(f"  Tagged [{skill.get('category')}] {skill['name']}: {new_tags}")

    print()
    print(f"Tagged {tagged_count} skills")

    # Metadata validation report
    print()
    print("=== METADATA VALIDATION REPORT ===")

    no_desc = [s for s in data if not s.get("description") or s["description"].strip() == ""]
    no_license = [s for s in data if not s.get("license")]
    no_updated = [s for s in data if not s.get("updatedAt")]
    still_untagged = [s for s in data if not s.get("tags") or len(s["tags"]) == 0]

    print(f"Missing description: {len(no_desc)} skills")
    for s in no_desc:
        print(f"  - {s.get('name')} ({s.get('githubUrl', 'no url')})")

    print(f"\nMissing license: {len(no_license)} skills")
    print(f"Missing updatedAt: {len(no_updated)} skills")
    print(f"Still untagged after processing: {len(still_untagged)}")

    if still_untagged:
        for s in still_untagged:
            print(f"  - {s.get('name')}: {s.get('description', '')[:50]}")

    # Fix updatedAt for skills that only have createdAt
    fixed_updated = 0
    for skill in data:
        if not skill.get("updatedAt") and skill.get("createdAt"):
            skill["updatedAt"] = skill["createdAt"]
            fixed_updated += 1

    print(f"\nFixed updatedAt from createdAt: {fixed_updated} skills")

    # Save updated data
    with open(DATA_PATH, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\nSaved updated skills-data.json")

    # Final stats
    final_untagged = [s for s in data if not s.get("tags") or len(s["tags"]) == 0]
    final_no_updated = [s for s in data if not s.get("updatedAt")]
    print(f"\nFinal stats:")
    print(f"  Untagged: {len(final_untagged)}")
    print(f"  Missing updatedAt: {len(final_no_updated)}")
    print(f"  Missing description: {len(no_desc)} (requires GitHub fetch to fix)")
    print(f"  Missing license: {len(no_license)} (requires GitHub fetch to fix)")


if __name__ == "__main__":
    main()
