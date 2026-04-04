import * as cheerio from "cheerio";

const BASE_URL = "https://roodmp.github.io";

// Cache scraped data for 5 minutes to keep responses fast
let cache: { data: PortfolioData | null; timestamp: number } = {
  data: null,
  timestamp: 0,
};
const CACHE_TTL = 5 * 60 * 1000;

export interface Job {
  title: string;
  company: string;
  dates: string;
  description: string;
  bullets: string[];
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  status: string;
  type: string;
  tags: string[];
  description: string;
  link: string | null;
  image: string | null;
}

export interface Resource {
  name: string;
  url: string;
  category: string;
  description?: string;
  featured: boolean;
}

export interface PortfolioData {
  bio: {
    name: string;
    location: string;
    email: string;
    summary: string;
    github: string;
    linkedin: string;
  };
  skills: SkillCategory[];
  jobs: Job[];
  education: {
    title: string;
    institution: string;
    bullets: string[];
  }[];
  recognitions: {
    title: string;
    date: string;
    description: string;
  }[];
  projects: Project[];
  resources: Resource[];
}

async function fetchPage(path: string): Promise<cheerio.CheerioAPI> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const html = await response.text();
  return cheerio.load(html);
}

function scrapeResume($: cheerio.CheerioAPI) {
  // Bio
  const name = $(".resume-name").text().trim();
  const contactText = $(".resume-contact").text().trim();
  const location = contactText.split("//")[0]?.trim() || "";
  const email =
    $(".resume-contact a[href^='mailto:']").text().trim() || "";
  const summary = $(".summary-text").text().trim();
  const github =
    $('a[aria-label="GitHub"]').attr("href") || "";
  const linkedin =
    $('a[aria-label="LinkedIn"]').attr("href") || "";

  // Skills
  const skills: SkillCategory[] = [];
  $(".skill-card").each((_, card) => {
    const category = $(card).find(".skill-card-title").text().trim();
    const skillTags: string[] = [];
    $(card)
      .find(".skill-tag")
      .each((_, tag) => {
        skillTags.push($(tag).text().trim());
      });
    skills.push({ category, skills: skillTags });
  });

  // Jobs
  const jobs: Job[] = [];
  $(".job-entry").each((_, entry) => {
    const title = $(entry).find(".job-title").text().trim();
    const company = $(entry).find(".job-company").text().trim();
    const dates = $(entry).find(".job-date").text().trim();
    const description = $(entry).find(".job-description").text().trim();
    const bullets: string[] = [];
    $(entry)
      .find(".job-list li")
      .each((_, li) => {
        bullets.push($(li).text().trim());
      });
    jobs.push({ title, company, dates, description, bullets });
  });

  // Education
  const education: { title: string; institution: string; bullets: string[] }[] =
    [];
  $(".edu-entry").each((_, entry) => {
    const title = $(entry).find(".edu-title").text().trim();
    const institution = $(entry).find(".edu-institution").text().trim();
    const bullets: string[] = [];
    $(entry)
      .find(".job-list li")
      .each((_, li) => {
        bullets.push($(li).text().trim());
      });
    education.push({ title, institution, bullets });
  });

  // Recognitions
  const recognitions: {
    title: string;
    date: string;
    description: string;
  }[] = [];
  $(".recognition-entry").each((_, entry) => {
    const title = $(entry).find(".recognition-title").text().trim();
    const date = $(entry).find(".recognition-date").text().trim();
    const description = $(entry).find(".recognition-desc").text().trim();
    recognitions.push({ title, date, description });
  });

  return {
    bio: { name, location, email, summary, github, linkedin },
    skills,
    jobs,
    education,
    recognitions,
  };
}

function scrapeProjects($: cheerio.CheerioAPI): Project[] {
  const projects: Project[] = [];

  // The projects array is defined in a <script> block — extract it
  const scripts = $("script")
    .map((_, el) => $(el).html())
    .get();

  for (const script of scripts) {
    if (!script || !script.includes("const projects")) continue;

    // Extract the array content between the first [ and its matching ]
    const startIdx = script.indexOf("const projects = [");
    if (startIdx === -1) continue;

    const arrayStart = script.indexOf("[", startIdx);
    let depth = 0;
    let arrayEnd = -1;

    for (let i = arrayStart; i < script.length; i++) {
      if (script[i] === "[") depth++;
      if (script[i] === "]") depth--;
      if (depth === 0) {
        arrayEnd = i + 1;
        break;
      }
    }

    if (arrayEnd === -1) continue;

    const arrayStr = script.slice(arrayStart, arrayEnd);

    // Parse the JS object array — it uses single quotes and unquoted keys,
    // so we need to convert to valid JSON
    const jsonStr = arrayStr
      // Wrap unquoted property keys in double quotes
      .replace(/(\s)(\w+)\s*:/g, '$1"$2":')
      // Replace single-quoted strings with double-quoted
      .replace(/'([^']*?)'/g, (_, content) => {
        // Escape any double quotes inside the string
        const escaped = content.replace(/"/g, '\\"');
        return `"${escaped}"`;
      })
      // Remove trailing commas before ] or }
      .replace(/,\s*([\]}])/g, "$1");

    try {
      const parsed = JSON.parse(jsonStr);
      for (const p of parsed) {
        projects.push({
          id: p.id || "",
          name: p.name || "",
          status: p.status || "",
          type: p.type || "",
          tags: p.tags || [],
          description: p.description || "",
          link: p.link || null,
          image: p.image || null,
        });
      }
    } catch (e) {
      console.error("Failed to parse projects array:", e);
    }
  }

  return projects;
}

function scrapeResources($: cheerio.CheerioAPI): Resource[] {
  const resources: Resource[] = [];

  // Featured cards
  $(".featured-card").each((_, card) => {
    const name = $(card).find("h3").text().trim();
    const url = $(card).attr("href") || "";
    const description = $(card).find("p").text().trim();
    resources.push({
      name,
      url,
      category: "Daily Drivers",
      description,
      featured: true,
    });
  });

  // Category sections
  $(".category").each((_, cat) => {
    const category = $(cat).find(".category-title").text().trim();
    $(cat)
      .find(".pill-link")
      .each((_, pill) => {
        const name = $(pill).clone().children().remove().end().text().trim();
        const url = $(pill).attr("href") || "";
        resources.push({
          name,
          url,
          category,
          featured: false,
        });
      });
  });

  return resources;
}

export async function getPortfolioData(): Promise<PortfolioData> {
  // Return cached data if still fresh
  if (cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const [$resume, $about, $resources] = await Promise.all([
    fetchPage("/index.html"),
    fetchPage("/about.html"),
    fetchPage("/resources.html"),
  ]);

  const resume = scrapeResume($resume);
  const projects = scrapeProjects($about);
  const resources = scrapeResources($resources);

  const data: PortfolioData = {
    ...resume,
    projects,
    resources,
  };

  cache = { data, timestamp: Date.now() };
  return data;
}
