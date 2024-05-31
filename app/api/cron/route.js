export async function GET() {
    const result = await fetch(
      'http://worldtimeapi.org/api/timezone/America/New_York',
      {
        cache: 'no-store',
      },
    );
    const data = await result.json();
   
    return Response.json({ datetime: data.datetime });
  }
