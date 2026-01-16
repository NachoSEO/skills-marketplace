const skills = require("../data/skills-data.json");

// Check for skills with undefined in bash block
const bad = skills.filter(s => {
  const seo = s.seoContent || "";
  return seo.includes("undefined") || seo.includes("```bash\n\n```");
});

console.log("Skills with bad bash blocks:", bad.length);
bad.slice(0, 10).forEach(s => {
  console.log("-", s.slug);
  const match = s.seoContent.match(/```bash[\s\S]*?```/);
  if (match) console.log("  ", match[0].replace(/\n/g, "\\n"));
});
