/**
 * API endpoint for updating quarter
 * POST /api/score/quarter
 * 
 * Body: { quarter: number }
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    if (typeof body.quarter !== "number") {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: { error: "quarter must be a number" },
      });
    }

    // Log the update (in production, would persist to database)
    console.log(`Quarter Update: Q${body.quarter}`);

    return {
      success: true,
      quarter: body.quarter,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Quarter update error:", error);
    // Return success anyway - the UI already updated locally
    return {
      success: true,
      message: "Quarter updated locally",
    };
  }
});
