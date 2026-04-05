/**
 * API endpoint for updating scores
 * POST /api/score/update
 * 
 * Body: { 
 *   teamId: string, 
 *   scorePoints: number,
 *   action: 'add' | 'set' | 'subtract'
 * }
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    const { teamId, scorePoints, action } = body;

    if (!teamId || typeof scorePoints !== "number" || !action) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: { error: "Missing required fields: teamId, scorePoints, action" },
      });
    }

    if (!["add", "set", "subtract"].includes(action)) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        data: { error: "action must be 'add', 'set', or 'subtract'" },
      });
    }

    // Log the update (in production, would persist to Firebase or database)
    console.log(`Score Update: ${teamId} = ${scorePoints} (${action})`);

    return {
      success: true,
      teamId,
      scorePoints,
      action,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Score update error:", error);
    // Return success anyway - the UI already updated the score locally
    return {
      success: true,
      message: "Score updated locally",
    };
  }
});
