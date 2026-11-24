import type {
  CollectionItem,
  MicroSvgAsset,
  PaletteDef,
  PlateConfig,
  RecentRoll,
} from '../engine/types';

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const errBody = (await res.json()) as { error?: string };
      if (errBody?.error) msg = errBody.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export const api = {
  async listCollection(): Promise<CollectionItem[]> {
    const data = await requestJson<{ items: CollectionItem[] }>('/api/collection');
    return data.items;
  },

  async mintToCollection(payload: {
    title: string;
    seed: number;
    config: PlateConfig;
    previewSvg: string;
  }): Promise<CollectionItem> {
    const data = await requestJson<{ item: CollectionItem }>('/api/collection', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.item;
  },

  async deleteCollectionItem(id: string): Promise<void> {
    await requestJson(`/api/collection/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async listPalettes(): Promise<PaletteDef[]> {
    const data = await requestJson<{ items: PaletteDef[] }>('/api/palettes');
    return data.items;
  },

  async addPalette(payload: {
    name: string;
    bg: string;
    ink: string;
    accent: string;
  }): Promise<PaletteDef> {
    const data = await requestJson<{ item: PaletteDef }>('/api/palettes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.item;
  },

  async deletePalette(id: string): Promise<void> {
    await requestJson(`/api/palettes/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async listRecent(): Promise<RecentRoll[]> {
    const data = await requestJson<{ items: RecentRoll[] }>('/api/recent');
    return data.items;
  },

  async pushRecent(payload: {
    title: string;
    seed: number;
    config: PlateConfig;
  }): Promise<RecentRoll[]> {
    const data = await requestJson<{ items: RecentRoll[] }>('/api/recent', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.items;
  },

  async clearRecent(): Promise<void> {
    await requestJson('/api/recent', { method: 'DELETE' });
  },

  async listAssets(): Promise<MicroSvgAsset[]> {
    const data = await requestJson<{ items: MicroSvgAsset[] }>('/api/assets');
    return data.items;
  },

  async addAsset(payload: {
    name: string;
    jpName?: string;
    svgContent: string;
  }): Promise<MicroSvgAsset> {
    const data = await requestJson<{ item: MicroSvgAsset }>('/api/assets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return data.item;
  },

  async deleteAsset(id: string): Promise<void> {
    await requestJson(`/api/assets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  async listServerExports(): Promise<string[]> {
    const data = await requestJson<{ files: string[] }>('/api/exports');
    return data.files;
  },

  async saveExportToServer(payload: {
    filename: string;
    svgContent: string;
  }): Promise<{ filename: string; path: string }> {
    return requestJson('/api/exports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
