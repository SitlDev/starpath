import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    const sql = neon(process.env.DATABASE_URL);

    if (request.method === 'GET') {
        const url = new URL(request.url, `http://${request.headers.host}`);
        const pageUrl = url.searchParams.get('url');
        if (!pageUrl) return response.status(400).json({ error: 'Missing URL' });
        
        try {
            const feedback = await sql`
                SELECT name, handle, comment, created_at 
                FROM feedback 
                WHERE (page_url = ${pageUrl} OR page_url LIKE ${'%' + pageUrl.split('/').pop()})
                AND status = 'approved' 
                ORDER BY created_at DESC 
                LIMIT 50
            `;
            return response.status(200).json({ comments: feedback });
        } catch (error) {
            return response.status(500).json({ error: error.message });
        }
    }

    if (request.method === 'POST') {
        const { name, handle, email, comment, page_url, parent_id } = request.body;
        if (!email || !comment) return response.status(400).json({ error: 'Missing fields' });

        try {
            await sql`
                INSERT INTO feedback (name, handle, email, comment, page_url, parent_id, status)
                VALUES (${name || 'Anonymous'}, ${handle || ''}, ${email}, ${comment}, ${page_url || ''}, ${parent_id || null}, 'pending')
            `;
            return response.status(200).json({ success: true });
        } catch (error) {
            return response.status(500).json({ error: error.message });
        }
    }

    return response.status(405).json({ error: 'Method not allowed' });
}
