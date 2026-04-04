import type { PortfolioData } from "./scraper.js";
import { aliases, growthFramings } from "./skill-mappings.js";

export interface FitAnalysis {
  strongMatches: { skill: string; evidence: string }[];
  relevantExperience: { role: string; company: string; why: string }[];
  relevantProjects: { name: string; why: string }[];
  transferableSkills: string[];
  growthAreas: { area: string; framing: string }[];
}

/**
 * Tokenize and normalize text for matching.
 * Returns lowercase tokens and also preserves 2-3 word phrases for compound skill matching.
 */
function tokenize(text: string): Set<string> {
  const lower = text.toLowerCase();
  const tokens = new Set<string>();

  // Single words
  for (const word of lower.split(/[\s,;|/()[\]{}]+/)) {
    const clean = word.replace(/[^a-z0-9#+.-]/g, "");
    if (clean.length > 1) tokens.add(clean);
  }

  // 2-3 word phrases (for matching things like "product management", "machine learning")
  const words = lower.split(/\s+/).map((w) => w.replace(/[^a-z0-9#+.-]/g, ""));
  for (let i = 0; i < words.length - 1; i++) {
    if (words[i].length > 1 && words[i + 1].length > 1) {
      tokens.add(`${words[i]} ${words[i + 1]}`);
    }
    if (i < words.length - 2 && words[i + 2].length > 1) {
      tokens.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  return tokens;
}

/**
 * Check if any of the alias terms appear in the JD tokens.
 */
function matchesJD(
  canonicalSkill: string,
  aliasTerms: string[],
  jdTokens: Set<string>
): boolean {
  const lower = canonicalSkill.toLowerCase();
  if (jdTokens.has(lower)) return true;
  for (const alias of aliasTerms) {
    if (jdTokens.has(alias.toLowerCase())) return true;
  }
  return false;
}

/**
 * Evaluate how well Mark's portfolio matches a job description.
 * Performs deterministic keyword matching — no LLM calls.
 */
export function evaluateFit(
  jobDescription: string,
  data: PortfolioData
): FitAnalysis {
  const jdTokens = tokenize(jobDescription);
  const jdLower = jobDescription.toLowerCase();

  // ── Skill matching ──────────────────────────────────────────────────────
  const strongMatches: FitAnalysis["strongMatches"] = [];
  const matchedCanonicalSkills = new Set<string>();

  for (const cat of data.skills) {
    for (const skill of cat.skills) {
      const skillLower = skill.toLowerCase();
      // Direct match
      if (jdTokens.has(skillLower) || jdLower.includes(skillLower)) {
        strongMatches.push({
          skill,
          evidence: `Listed under ${cat.category} skills`,
        });
        matchedCanonicalSkills.add(skillLower);
        continue;
      }
      // Alias match
      for (const [canonical, terms] of Object.entries(aliases)) {
        const allTerms = [canonical, ...terms];
        if (
          allTerms.some((t) => t.toLowerCase() === skillLower) &&
          matchesJD(canonical, terms, jdTokens)
        ) {
          strongMatches.push({
            skill,
            evidence: `Listed under ${cat.category} skills (matches JD requirement)`,
          });
          matchedCanonicalSkills.add(canonical.toLowerCase());
          break;
        }
      }
    }
  }

  // Also check alias categories against JD even if Mark's skill name doesn't match directly
  for (const [canonical, terms] of Object.entries(aliases)) {
    if (matchedCanonicalSkills.has(canonical.toLowerCase())) continue;
    if (matchesJD(canonical, terms, jdTokens)) {
      // Check if any of Mark's skills fall under this canonical category
      for (const cat of data.skills) {
        for (const skill of cat.skills) {
          const skillLower = skill.toLowerCase();
          if (
            [canonical, ...terms].some(
              (t) => t.toLowerCase() === skillLower
            ) &&
            !strongMatches.some(
              (m) => m.skill.toLowerCase() === skillLower
            )
          ) {
            strongMatches.push({
              skill,
              evidence: `Matches JD requirement for "${canonical}"`,
            });
            matchedCanonicalSkills.add(canonical.toLowerCase());
          }
        }
      }
    }
  }

  // ── Experience matching ─────────────────────────────────────────────────
  const relevantExperience: FitAnalysis["relevantExperience"] = [];

  for (const job of data.jobs) {
    const jobText = [
      job.title,
      job.company,
      job.description,
      ...job.bullets,
    ]
      .join(" ")
      .toLowerCase();
    const jobTokens = tokenize(jobText);

    // Find overlapping keywords between JD and this job
    const overlaps: string[] = [];
    for (const token of jdTokens) {
      if (token.length > 3 && jobTokens.has(token)) {
        overlaps.push(token);
      }
    }
    // Also check if JD text fragments appear in job text
    for (const [canonical, terms] of Object.entries(aliases)) {
      if (matchesJD(canonical, terms, jdTokens)) {
        if (
          [canonical, ...terms].some((t) => jobText.includes(t.toLowerCase()))
        ) {
          overlaps.push(canonical);
        }
      }
    }

    const uniqueOverlaps = [...new Set(overlaps)];
    if (uniqueOverlaps.length >= 2) {
      relevantExperience.push({
        role: job.title,
        company: job.company,
        why: `Relevant keywords: ${uniqueOverlaps.slice(0, 5).join(", ")}`,
      });
    }
  }

  // ── Project matching ────────────────────────────────────────────────────
  const relevantProjects: FitAnalysis["relevantProjects"] = [];

  for (const project of data.projects) {
    const projText = [
      project.name,
      project.description,
      ...project.tags,
    ]
      .join(" ")
      .toLowerCase();

    const reasons: string[] = [];
    for (const token of jdTokens) {
      if (token.length > 3 && projText.includes(token)) {
        reasons.push(token);
      }
    }
    for (const [canonical, terms] of Object.entries(aliases)) {
      if (matchesJD(canonical, terms, jdTokens)) {
        if (
          [canonical, ...terms].some((t) => projText.includes(t.toLowerCase()))
        ) {
          reasons.push(canonical);
        }
      }
    }

    const uniqueReasons = [...new Set(reasons)];
    if (uniqueReasons.length >= 1) {
      relevantProjects.push({
        name: project.name,
        why: `Demonstrates: ${uniqueReasons.slice(0, 4).join(", ")}`,
      });
    }
  }

  // ── Transferable skills (alias matches not in direct skills) ────────────
  const transferableSkills: string[] = [];
  for (const [canonical, terms] of Object.entries(aliases)) {
    if (matchedCanonicalSkills.has(canonical.toLowerCase())) continue;
    if (matchesJD(canonical, terms, jdTokens)) {
      // Check if experience or projects demonstrate this even though it's not a listed skill
      const evidenceInExp = data.jobs.some((j) => {
        const jobText = [j.title, j.description, ...j.bullets]
          .join(" ")
          .toLowerCase();
        return [canonical, ...terms].some((t) =>
          jobText.includes(t.toLowerCase())
        );
      });
      if (evidenceInExp) {
        transferableSkills.push(
          `${canonical} — demonstrated through work experience`
        );
        matchedCanonicalSkills.add(canonical.toLowerCase());
      }
    }
  }

  // ── Growth areas (JD requirements with no match) ────────────────────────
  const growthAreas: FitAnalysis["growthAreas"] = [];

  for (const [area, framing] of Object.entries(growthFramings)) {
    const areaLower = area.toLowerCase();
    // Check if this growth area term appears in the JD
    if (jdLower.includes(areaLower) && !matchedCanonicalSkills.has(areaLower)) {
      // Also check aliases
      const areaAliases = aliases[area] || [];
      const alreadyMatched = [area, ...areaAliases].some((t) =>
        matchedCanonicalSkills.has(t.toLowerCase())
      );
      if (!alreadyMatched) {
        growthAreas.push({ area, framing });
      }
    }
  }

  return {
    strongMatches,
    relevantExperience,
    relevantProjects,
    transferableSkills,
    growthAreas,
  };
}

/**
 * Format a FitAnalysis into markdown for the tool response.
 */
export function formatFitAnalysis(
  analysis: FitAnalysis,
  jobDescription: string
): string {
  let text = "# Job Fit Evaluation for Mark Rood\n\n";

  // Strong matches
  text += "## Strong Matches\n";
  if (analysis.strongMatches.length > 0) {
    text += `Mark has **${analysis.strongMatches.length} direct skill matches** with this role:\n\n`;
    for (const m of analysis.strongMatches) {
      text += `- **${m.skill}** — ${m.evidence}\n`;
    }
  } else {
    text +=
      "No direct skill keyword matches found. Consider using `ask_mark` for a more open-ended assessment.\n";
  }
  text += "\n";

  // Relevant experience
  text += "## Relevant Experience\n";
  if (analysis.relevantExperience.length > 0) {
    for (const exp of analysis.relevantExperience) {
      text += `- **${exp.role} at ${exp.company}** — ${exp.why}\n`;
    }
  } else {
    text += "No strong experience keyword overlaps detected.\n";
  }
  text += "\n";

  // Relevant projects
  text += "## Relevant Projects\n";
  if (analysis.relevantProjects.length > 0) {
    for (const proj of analysis.relevantProjects) {
      text += `- **${proj.name}** — ${proj.why}\n`;
    }
  } else {
    text += "No directly matching projects found.\n";
  }
  text += "\n";

  // Transferable skills
  if (analysis.transferableSkills.length > 0) {
    text += "## Transferable Skills\n";
    text +=
      "These aren't listed as explicit skills but are demonstrated through experience:\n\n";
    for (const skill of analysis.transferableSkills) {
      text += `- ${skill}\n`;
    }
    text += "\n";
  }

  // Growth areas
  if (analysis.growthAreas.length > 0) {
    text += "## Growth Areas\n";
    text +=
      "These JD requirements aren't direct matches, but Mark brings adjacent experience:\n\n";
    for (const gap of analysis.growthAreas) {
      text += `- **${gap.area}** — ${gap.framing}\n`;
    }
    text += "\n";
  }

  // Summary stats
  const totalSignals =
    analysis.strongMatches.length +
    analysis.relevantExperience.length +
    analysis.relevantProjects.length +
    analysis.transferableSkills.length;
  text += "## Summary\n";
  text += `- **${analysis.strongMatches.length}** direct skill matches\n`;
  text += `- **${analysis.relevantExperience.length}** relevant roles\n`;
  text += `- **${analysis.relevantProjects.length}** relevant projects\n`;
  text += `- **${analysis.transferableSkills.length}** transferable skills\n`;
  text += `- **${analysis.growthAreas.length}** growth areas identified\n\n`;
  text += `Use this analysis alongside the full portfolio data (via \`ask_mark\`) to provide a comprehensive assessment of Mark's fit for this role.\n`;

  return text;
}
