import { Router, Request, Response } from 'express';

const router = Router();
const GH_TOKEN = process.env.GITHUB_TOKEN || '';
const GH_API = 'https://api.github.com';

async function ghFetch(path: string) {
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'OpenClaw-Meeting-Hub' };
  if (GH_TOKEN) headers['Authorization'] = `Bearer ${GH_TOKEN}`;
  const res = await fetch(`${GH_API}${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

router.get('/repo/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const data = await ghFetch(`/repos/${owner}/${repo}`);
    res.json({
      data: {
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        html_url: data.html_url,
        default_branch: data.default_branch,
        language: data.language,
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count,
        open_issues_count: data.open_issues_count,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pushed_at: data.pushed_at,
        size: data.size,
        visibility: data.visibility,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/commits/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { per_page, sha } = req.query;
    const limit = Math.min(parseInt(per_page as string) || 20, 100);
    let path = `/repos/${owner}/${repo}/commits?per_page=${limit}`;
    if (sha) path += `&sha=${sha}`;

    const commits = await ghFetch(path);
    const mapped = commits.map((c: any) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name,
      author_email: c.commit.author?.email,
      date: c.commit.author?.date,
      url: c.html_url,
      additions: c.stats?.additions,
      deletions: c.stats?.deletions,
    }));

    res.json({ data: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/branches/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const branches = await ghFetch(`/repos/${owner}/${repo}/branches`);
    const mapped = branches.map((b: any) => ({
      name: b.name,
      sha: b.commit.sha,
      protected: b.protected,
    }));
    res.json({ data: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/pulls/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;
    const { state } = req.query;
    const pulls = await ghFetch(`/repos/${owner}/${repo}/pulls?state=${state || 'all'}&per_page=20`);
    const mapped = pulls.map((p: any) => ({
      number: p.number,
      title: p.title,
      state: p.state,
      user: p.user?.login,
      created_at: p.created_at,
      updated_at: p.updated_at,
      merged_at: p.merged_at,
      html_url: p.html_url,
      head_branch: p.head?.ref,
      base_branch: p.base?.ref,
      additions: p.additions,
      deletions: p.deletions,
      changed_files: p.changed_files,
    }));
    res.json({ data: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/activity-summary/:owner/:repo', async (req: Request, res: Response) => {
  try {
    const { owner, repo } = req.params;

    const [repoData, commits, pulls, branches] = await Promise.all([
      ghFetch(`/repos/${owner}/${repo}`),
      ghFetch(`/repos/${owner}/${repo}/commits?per_page=10`),
      ghFetch(`/repos/${owner}/${repo}/pulls?state=all&per_page=10`),
      ghFetch(`/repos/${owner}/${repo}/branches`),
    ]);

    res.json({
      data: {
        repo: { name: repoData.name, stars: repoData.stargazers_count, forks: repoData.forks_count, issues: repoData.open_issues_count },
        recent_commits: commits.length,
        last_commit: commits[0] ? { message: commits[0].commit.message, date: commits[0].commit.author?.date, author: commits[0].commit.author?.name } : null,
        pull_requests: { total: pulls.length, open: pulls.filter((p: any) => p.state === 'open').length, merged: pulls.filter((p: any) => p.merged_at).length },
        branches: branches.length,
        last_pushed: repoData.pushed_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
