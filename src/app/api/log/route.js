// API route to receive client-side logs and display them in server console
export async function POST(request) {
  try {
    let body = null;
    try {
      body = await request.json();
    } catch (jsonError) {
      // If JSON parsing fails, log and return success (don't break server)
      console.warn('[SERVER] Log API received malformed or empty JSON:', jsonError);
      return new Response(JSON.stringify({ warning: 'Malformed or empty JSON received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!body || typeof body !== 'object') {
      console.warn('[SERVER] Log API received empty or non-object body');
      return new Response(JSON.stringify({ warning: 'Empty or non-object body received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { level = 'info', message = '', data = null, timestamp = Date.now(), userAgent = '' } = body;

    // Format the log with timestamp and user agent info
    const logPrefix = `[CLIENT-${level.toUpperCase()}] ${new Date(timestamp).toISOString()}`;
    const deviceInfo = userAgent ? ` [${userAgent.includes('iPhone') ? 'iPhone' : userAgent.includes('iPad') ? 'iPad' : 'Mobile'}]` : '';

    // Choose appropriate console method based on level
    switch (level) {
      case 'error':
        console.error(`${logPrefix}${deviceInfo}:`, message, data ? data : '');
        break;
      case 'warn':
        console.warn(`${logPrefix}${deviceInfo}:`, message, data ? data : '');
        break;
      case 'info':
        console.info(`${logPrefix}${deviceInfo}:`, message, data ? data : '');
        break;
      default:
        console.log(`${logPrefix}${deviceInfo}:`, message, data ? data : '');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[SERVER] Error processing client log:', error);
    return new Response(JSON.stringify({ error: 'Failed to process log' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
