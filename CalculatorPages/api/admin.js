import { neon } from '@neondatabase/serverless';

export default async function handler(request, response) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const action = url.searchParams.get('action') || request.query.action;
    const secret = (url.searchParams.get('secret') || request.query.secret || '').trim();

    if (secret !== 'h14sua12' && secret !== 'yourcalc123') {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    const sql = neon(process.env.DATABASE_URL);

    try {
        switch (action) {
            case 'get-leads': {
                const leads = await sql`SELECT * FROM leads ORDER BY last_activity_at DESC LIMIT 100`;
                const totals = await sql`SELECT 
                    (SELECT COUNT(*) FROM leads) as total_visitors,
                    (SELECT COUNT(*) FROM user_activity) as total_pageviews,
                    (SELECT COUNT(*) FROM feedback WHERE status = 'pending') as pending_feedback
                `;
                const toolPerformance = await sql`SELECT tool, COUNT(*) as views, COUNT(DISTINCT email) as conversion_count FROM user_activity GROUP BY tool ORDER BY views DESC`;
                const referrers = await sql`SELECT referrer, COUNT(*) as count FROM user_activity GROUP BY referrer ORDER BY count DESC LIMIT 5`;
                const activityStream = await sql`SELECT a.*, l.name FROM user_activity a LEFT JOIN leads l ON a.email = l.email ORDER BY a.created_at DESC LIMIT 20`;
                const topPages = await sql`SELECT url, COUNT(*) as count FROM user_activity GROUP BY url ORDER BY count DESC LIMIT 10`;
                const trend = await sql`SELECT TO_CHAR(created_at, 'Mon DD') as day, COUNT(*) as count FROM user_activity WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY day, DATE_TRUNC('day', created_at) ORDER BY DATE_TRUNC('day', created_at) ASC`;
                const categoryPerformance = await sql`
                    SELECT 
                        CASE 
                            WHEN url LIKE '%finance%' OR url LIKE '%invest%' OR url LIKE '%crypto%' THEN 'High Value (Finance)'
                            WHEN url LIKE '%health%' OR url LIKE '%fitness%' OR url LIKE '%medical%' THEN 'Medium Value (Health)'
                            WHEN url LIKE '%math%' OR url LIKE '%science%' OR url LIKE '%engineering%' THEN 'Academic (Low RPM)'
                            ELSE 'General'
                        END as category,
                        COUNT(*) as views
                    FROM user_activity
                    GROUP BY category
                    ORDER BY views DESC
                `;
                const feedback = await sql`SELECT * FROM feedback WHERE status = 'pending' ORDER BY created_at DESC LIMIT 20`;

                return response.status(200).json({ 
                    leads, 
                    feedback, 
                    stats: { totals: totals[0], toolPerformance, referrers, activityStream, topPages, trend, categoryPerformance } 
                });
            }

            case 'get-lead-details': {
                const email = url.searchParams.get('email') || request.query.email;
                if (!email) return response.status(400).json({ error: 'Missing email' });
                const activity = await sql`SELECT tool, inputs, results, url, created_at FROM user_activity WHERE email = ${email} ORDER BY created_at DESC LIMIT 50`;
                return response.status(200).json({ activity });
            }

            case 'moderate-feedback': {
                const id = url.searchParams.get('id') || request.query.id;
                const subAction = url.searchParams.get('subAction') || request.query.subAction;
                if (!id || !subAction) return response.status(400).json({ error: 'Missing params' });
                
                if (subAction === 'approve') await sql`UPDATE feedback SET status = 'approved' WHERE id = ${id}`;
                else if (subAction === 'delete') await sql`DELETE FROM feedback WHERE id = ${id}`;
                
                return response.status(200).json({ success: true });
            }

            case 'seed': {
                // Simplified seed logic
                await sql`INSERT INTO user_activity (email, tool, url, referrer) VALUES ('test@example.com', 'mortgage', '/finance.html', 'google.com')`;
                return response.status(200).json({ success: true, message: 'Sample seed completed' });
            }

            default:
                return response.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Admin API Error:', error);
        return response.status(500).json({ error: error.message });
    }
}
