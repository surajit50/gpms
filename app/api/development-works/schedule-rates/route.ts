import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

import { auth } from "@/auth";

// GET: Fetch schedule rates
export async function GET(request: NextRequest) {
  try {
    const session = await  auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const estimateTypeId = searchParams.get('estimateTypeId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    let whereClause: any = {};

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (estimateTypeId) {
      whereClause.estimateTypeId = estimateTypeId;
    }

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }

    const scheduleRates = await db.scheduleRate.findMany({
      where: whereClause,
      include: {
        estimateType: {
          select: {
            name: true,
            code: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { code: 'asc' }
      ]
    });

    return NextResponse.json(scheduleRates);
  } catch (error) {
    console.error("Error fetching schedule rates:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create new schedule rate
export async function POST(request: NextRequest) {
  try {
    const session = await  auth()
    
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      estimateTypeId, 
      code, 
      description, 
      unit, 
      rate, 
      category,
      effectiveFrom,
      effectiveTo 
    } = body;

    // Validate required fields
    if (!estimateTypeId || !code || !description || !unit || rate === undefined || !category) {
      return NextResponse.json({ 
        error: "EstimateTypeId, code, description, unit, rate, and category are required" 
      }, { status: 400 });
    }

    // Check if code already exists for this estimate type
    const existingRate = await db.scheduleRate.findFirst({
      where: { 
        estimateTypeId,
        code,
        isActive: true
      }
    });

    if (existingRate) {
      return NextResponse.json({ 
        error: "Schedule rate code already exists for this estimate type" 
      }, { status: 409 });
    }

    const scheduleRate = await db.scheduleRate.create({
      data: {
        estimateTypeId,
        code,
        description,
        unit,
        rate: parseFloat(rate.toString()),
        category,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveTo: effectiveTo ? new Date(effectiveTo) : null
      },
      include: {
        estimateType: {
          select: {
            name: true,
            code: true,
            icon: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(scheduleRate, { status: 201 });
  } catch (error) {
    console.error("Error creating schedule rate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update schedule rate
export async function PUT(request: NextRequest) {
  try {
    const session = await  auth()
    
    if (!session?.user || !['admin', 'superadmin'].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id,
      code, 
      description, 
      unit, 
      rate, 
      category,
      effectiveFrom,
      effectiveTo,
      isActive 
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    // Check if code already exists for another record with same estimate type
    if (code) {
      const existingRate = await db.scheduleRate.findFirst({
        where: { 
          code,
          id: { not: id },
          estimateTypeId: (await db.scheduleRate.findUnique({ 
            where: { id }, 
            select: { estimateTypeId: true } 
          }))?.estimateTypeId,
          isActive: true
        }
      });

      if (existingRate) {
        return NextResponse.json({ 
          error: "Schedule rate code already exists for this estimate type" 
        }, { status: 409 });
      }
    }

    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (unit !== undefined) updateData.unit = unit;
    if (rate !== undefined) updateData.rate = parseFloat(rate.toString());
    if (category !== undefined) updateData.category = category;
    if (effectiveFrom !== undefined) updateData.effectiveFrom = new Date(effectiveFrom);
    if (effectiveTo !== undefined) updateData.effectiveTo = effectiveTo ? new Date(effectiveTo) : null;
    if (isActive !== undefined) updateData.isActive = isActive;

    const scheduleRate = await db.scheduleRate.update({
      where: { id },
      data: updateData,
      include: {
        estimateType: {
          select: {
            name: true,
            code: true,
            icon: true,
            color: true
          }
        }
      }
    });

    return NextResponse.json(scheduleRate);
  } catch (error) {
    console.error("Error updating schedule rate:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
