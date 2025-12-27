import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "estimate-templates.json");

type TemplateItem = {
  code?: string;
  description: string;
  unit: string;
  rate: number;
  defaultQty?: number;
  category?: string;
};

type EstimateTemplate = {
  id: string;
  name: string;
  estimateType: string; // e.g., road | building | solar-pump | water-chiller | civil-work
  items: TemplateItem[];
  createdAt: string;
};

async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch {
    const defaults: EstimateTemplate[] = [
      {
        id: "tpl-road-basic",
        name: "Road - Basic (Excavation, Sub-base, Base)",
        estimateType: "road",
        items: [
          { code: "EARTH-EXC", description: "Earthwork excavation in ordinary soil", unit: "Cum", rate: 150, defaultQty: 100, category: "Earthwork" },
          { code: "GSB", description: "Granular sub-base laying and compaction", unit: "Cum", rate: 1250, defaultQty: 80, category: "Sub-base" },
          { code: "WBM", description: "WBM base course laying and compaction", unit: "Cum", rate: 2200, defaultQty: 75, category: "Base" }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "tpl-drain-rcc",
        name: "RCC Drain with slab - Typical",
        estimateType: "civil-work",
        items: [
          { code: "EXC-FOUND", description: "Excavation for foundation", unit: "Cum", rate: 145, defaultQty: 50, category: "Earthwork" },
          { code: "SAND-FILL", description: "Sand filling in foundation", unit: "Cum", rate: 480, defaultQty: 10, category: "Backfill" },
          { code: "PCC-1:4:8", description: "PCC 1:4:8 in foundation", unit: "Cum", rate: 4200, defaultQty: 8, category: "Concrete" },
          { code: "RCC-M25", description: "RCC M25 for drain wall/slab", unit: "Cum", rate: 5668, defaultQty: 12, category: "Concrete" },
          { code: "REBAR", description: "Reinforcement steel Fe500", unit: "Kg", rate: 65, defaultQty: 1200, category: "Steel" }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "tpl-building-small",
        name: "Building - Small Unit (Foundation to Roof)",
        estimateType: "building",
        items: [
          { code: "FOUND-EXC", description: "Excavation for foundation", unit: "Cum", rate: 160, defaultQty: 60, category: "Earthwork" },
          { code: "BRICK-MASON", description: "Brick masonry in cement mortar", unit: "Cum", rate: 5200, defaultQty: 30, category: "Masonry" },
          { code: "RCC-SLAB", description: "RCC slab M25", unit: "Cum", rate: 5700, defaultQty: 15, category: "Concrete" },
          { code: "PLASTER", description: "Cement plaster 12mm", unit: "Sqm", rate: 180, defaultQty: 200, category: "Finishes" }
        ],
        createdAt: new Date().toISOString()
      }
    ];
    await fs.writeFile(DATA_FILE, JSON.stringify(defaults, null, 2), "utf-8");
  }
}

async function readAll(): Promise<EstimateTemplate[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeAll(items: EstimateTemplate[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estimateType = (searchParams.get("estimateType") || "").trim();
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const items = await readAll();
    const filtered = items.filter(t => (
      (!estimateType || t.estimateType === estimateType) &&
      (!q || t.name.toLowerCase().includes(q))
    ));
    return NextResponse.json({ items: filtered, totalCount: filtered.length });
  } catch (e) {
    return NextResponse.json({ error: "Failed to read templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, estimateType, items } = body as {
      name: string; estimateType: string; items: TemplateItem[];
    };

    if (!name || !estimateType || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "name, estimateType and items are required" }, { status: 400 });
    }

    const all = await readAll();
    const id = `tpl-${Date.now()}`;
    const newTpl: EstimateTemplate = {
      id,
      name,
      estimateType,
      items,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newTpl);
    await writeAll(all);
    return NextResponse.json(newTpl, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save template" }, { status: 500 });
  }
}

