import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const awcId = searchParams.get("awc_id");
    const villageName = searchParams.get("village");
    const blockId = searchParams.get("block_id");
    const childId = searchParams.get("child_id");

    // Case 1: Fetch child's individual growth history timeline
    if (childId) {
      const historyRes = await pool.query(
        `
        SELECT 
          id,
          weight,
          height,
          head_circumference,
          arm_circumference,
          status,
          trend,
          wfa_zscore,
          lhfa_zscore,
          wfh_zscore,
          reading_month,
          reading_year,
          measured_date
        FROM child_growth
        WHERE child_id = $1
        ORDER BY measured_date ASC;
      `,
        [childId]
      );

      return NextResponse.json({
        childId,
        history: historyRes.rows.map((r) => ({
          id: r.id,
          weight: r.weight ? parseFloat(r.weight) : null,
          height: r.height ? parseInt(r.height, 10) : null,
          status: r.status,
          trend: r.trend,
          wfaZScore: r.wfa_zscore ? parseFloat(r.wfa_zscore) : null,
          lhfaZScore: r.lhfa_zscore ? parseFloat(r.lhfa_zscore) : null,
          wfhZScore: r.wfh_zscore ? parseFloat(r.wfh_zscore) : null,
          month: r.reading_month,
          year: r.reading_year,
          measuredDate: r.measured_date,
        })),
      });
    }

    // Case 2: Fetch all children for an entire Village OR a single AWC
    if (!villageName && !awcId) {
      return NextResponse.json({ error: "Missing village or awc_id parameter" }, { status: 400 });
    }

    let query = "";
    let params: any[] = [];

    if (villageName && blockId) {
      // Query all children belonging to this village in the selected block
      query = `
        SELECT 
          c.id,
          c.first_name,
          c.middle_name,
          c.last_name,
          c.mother_name,
          c.gender,
          c.date_of_birth,
          a.name AS awc_name,
          g.id AS growth_id,
          g.weight,
          g.height,
          g.head_circumference,
          g.arm_circumference,
          COALESCE(g.status, 1) AS status,
          COALESCE(g.trend, 3) AS trend,
          g.wfa_zscore,
          g.lhfa_zscore,
          g.wfh_zscore,
          g.measured_date
        FROM child_profile c
        JOIN anganwadi a ON a.id = c.awc_id
        JOIN sector s ON s.id = a.sector_id
        JOIN block b ON b.id = s.block_id
        LEFT JOIN LATERAL (
          SELECT * FROM child_growth 
          WHERE child_id = c.id 
          ORDER BY measured_date DESC 
          LIMIT 1
        ) g ON true
        WHERE b.id = $1 AND a.name ILIKE $2
        ORDER BY 
          CASE WHEN g.status = 3 THEN 1 WHEN g.status = 2 THEN 2 ELSE 3 END,
          c.first_name ASC;
      `;
      params = [blockId, `${villageName}%`];
    } else {
      // Fallback by awcId
      query = `
        SELECT 
          c.id,
          c.first_name,
          c.middle_name,
          c.last_name,
          c.mother_name,
          c.gender,
          c.date_of_birth,
          a.name AS awc_name,
          g.id AS growth_id,
          g.weight,
          g.height,
          g.head_circumference,
          g.arm_circumference,
          COALESCE(g.status, 1) AS status,
          COALESCE(g.trend, 3) AS trend,
          g.wfa_zscore,
          g.lhfa_zscore,
          g.wfh_zscore,
          g.measured_date
        FROM child_profile c
        JOIN anganwadi a ON a.id = c.awc_id
        LEFT JOIN LATERAL (
          SELECT * FROM child_growth 
          WHERE child_id = c.id 
          ORDER BY measured_date DESC 
          LIMIT 1
        ) g ON true
        WHERE c.awc_id = $1
        ORDER BY 
          CASE WHEN g.status = 3 THEN 1 WHEN g.status = 2 THEN 2 ELSE 3 END,
          c.first_name ASC;
      `;
      params = [awcId];
    }

    const childrenRes = await pool.query(query, params);

    const children = childrenRes.rows.map((row) => {
      // Calculate age in months & days
      let ageText = "Unknown";
      let ageInDays = 0;
      if (row.date_of_birth) {
        const dob = new Date(row.date_of_birth);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - dob.getTime());
        ageInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths =
          (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
        const years = Math.floor(diffMonths / 12);
        const remMonths = diffMonths % 12;
        if (years > 0) {
          ageText = `${years}y ${remMonths}m`;
        } else {
          ageText = `${remMonths}m`;
        }
      }

      let statusLabel = "Normal";
      if (row.status === 3) statusLabel = "SAM (Severe)";
      else if (row.status === 2) statusLabel = "MAM (Moderate)";

      return {
        id: row.id,
        name: `${row.first_name} ${row.middle_name || ""} ${row.last_name || ""}`.replace(/\s+/g, " ").trim(),
        motherName: row.mother_name,
        gender: row.gender === 1 ? "Boy" : "Girl",
        genderCode: row.gender,
        dob: row.date_of_birth,
        ageText,
        ageInDays,
        awcName: row.awc_name,
        weight: row.weight ? parseFloat(row.weight) : null,
        height: row.height ? parseInt(row.height, 10) : null,
        headCircumference: row.head_circumference ? parseFloat(row.head_circumference) : null,
        armCircumference: row.arm_circumference ? parseFloat(row.arm_circumference) : null,
        status: row.status,
        statusLabel,
        trend: row.trend, // 1 = Improving, 2 = Worsening, 3 = Stable
        wfaZScore: row.wfa_zscore ? parseFloat(row.wfa_zscore) : null,
        lhfaZScore: row.lhfa_zscore ? parseFloat(row.lhfa_zscore) : null,
        wfhZScore: row.wfh_zscore ? parseFloat(row.wfh_zscore) : null,
        measuredDate: row.measured_date,
      };
    });

    return NextResponse.json({
      village: villageName,
      awcId,
      totalCount: children.length,
      children,
    });
  } catch (error: any) {
    console.error("Error fetching child growth records:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
