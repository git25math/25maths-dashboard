import { localAgentService } from './localAgentService';

export interface FigureMapEntry {
  filename: string;
  url?: string;
  question_num?: number;
  sub_question?: string | null;
  is_stem?: boolean;
  fig_idx?: number;
  width?: number;
  height?: number;
  page?: number;
}

export type FigureMap = Record<string, Record<string, FigureMapEntry[]>>;

export interface FigureAsset {
  id: string;            // `${paperKey}/${questionKey}/${filename}`
  session: string;       // e.g. `2018March`
  paper: string;         // e.g. `Paper12`
  paperKey: string;      // e.g. `2018March/Paper12`
  questionKey: string;   // e.g. `Q07`
  filename: string;
  remoteUrl: string;
  localPath: string;
  meta: FigureMapEntry;
}

export const DEFAULT_AGENT_BASE_URL = 'http://127.0.0.1:4318';
export const DEFAULT_FIGURES_ROOT = '/Users/zhuxingzhe/Project/ExamBoard/25maths-cie0580-figures';
export const DEFAULT_REMOTE_BASE_URL = 'https://git25math.github.io/25maths-cie0580-figures';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export function buildRemoteFigureUrl(remoteBaseUrl: string, paperKey: string, questionKey: string, filename: string): string {
  return `${remoteBaseUrl.replace(/\/$/, '')}/${paperKey}/${questionKey}/${filename}`;
}

export function buildLocalFigurePath(figuresRoot: string, paperKey: string, questionKey: string, filename: string): string {
  const root = figuresRoot.replace(/\/$/, '');
  return `${root}/${paperKey}/${questionKey}/${filename}`;
}

export function flattenFigureMap(
  map: FigureMap,
  figuresRoot: string,
  remoteBaseUrl: string,
): FigureAsset[] {
  const assets: FigureAsset[] = [];
  for (const [paperKey, qMap] of Object.entries(map)) {
    const [session, paper] = paperKey.split('/');
    if (!session || !paper) continue;
    for (const [questionKey, entries] of Object.entries(qMap)) {
      for (const entry of entries) {
        const filename = entry.filename;
        if (!filename) continue;
        const id = `${paperKey}/${questionKey}/${filename}`;
        const remoteUrl = entry.url || buildRemoteFigureUrl(remoteBaseUrl, paperKey, questionKey, filename);
        const localPath = buildLocalFigurePath(figuresRoot, paperKey, questionKey, filename);
        assets.push({
          id,
          session,
          paper,
          paperKey,
          questionKey,
          filename,
          remoteUrl,
          localPath,
          meta: entry,
        });
      }
    }
  }
  return assets;
}

export async function loadFigureMapRemote(remoteBaseUrl: string): Promise<FigureMap> {
  const url = `${remoteBaseUrl.replace(/\/$/, '')}/figure-map.json`;
  return fetchJSON<FigureMap>(url);
}

export async function loadFigureMapLocal(agentBaseUrl: string, figuresRoot: string): Promise<FigureMap> {
  const fileUrl = localAgentService.getFileUrl(agentBaseUrl, `${figuresRoot.replace(/\/$/, '')}/figure-map.json`);
  return fetchJSON<FigureMap>(fileUrl);
}

export function buildAssetsFromScanItems(
  items: Array<{ paperKey: string; questionKey: string; filename: string; width?: number; height?: number }>,
  figuresRoot: string,
  remoteBaseUrl: string,
): FigureAsset[] {
  const assets: FigureAsset[] = [];
  for (const item of items) {
    const paperKey = item.paperKey;
    const [session, paper] = paperKey.split('/');
    if (!session || !paper) continue;
    const questionKey = item.questionKey;
    const filename = item.filename;
    if (!questionKey || !filename) continue;

    const id = `${paperKey}/${questionKey}/${filename}`;
    const remoteUrl = buildRemoteFigureUrl(remoteBaseUrl, paperKey, questionKey, filename);
    const localPath = buildLocalFigurePath(figuresRoot, paperKey, questionKey, filename);
    assets.push({
      id,
      session,
      paper,
      paperKey,
      questionKey,
      filename,
      remoteUrl,
      localPath,
      meta: {
        filename,
        width: item.width,
        height: item.height,
      },
    });
  }
  return assets;
}

export async function scanFigureAssetsLocal(agentBaseUrl: string, figuresRoot: string, remoteBaseUrl: string): Promise<FigureAsset[]> {
  const resp = await localAgentService.scanFigures(agentBaseUrl, { root: figuresRoot.replace(/\/$/, ''), limit: 50_000 });
  return buildAssetsFromScanItems(resp.items, figuresRoot, remoteBaseUrl);
}
