import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, name, email, content, urgency } = body;

        if (!content || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const data = await resend.emails.send({
            from: 'Maine News Today <info@nathanreardon.com>',
            to: ['jamesezekiel039@gmail.com', 'info@mymainenews.com', 'nathan@membershipauto.com'],
            subject: `STORY SUBMISSION: ${title || 'New Tip'}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #bf9b30; border-bottom: 2px solid #bf9b30; padding-bottom: 10px;">New Story Submission</h2>
                    <p><strong>Title:</strong> ${title || 'N/A'}</p>
                    <p><strong>Proposed by:</strong> ${name || 'Anonymous'}</p>
                    <p><strong>Contact Email:</strong> ${email}</p>
                    <p><strong>Urgency:</strong> ${urgency}</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <h3 style="color: #000;">Content / Details:</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap;">
                        ${content}
                    </div>
                </div>
            `,
        });

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Submission failed:', error);
        return NextResponse.json({
            error: 'Submission failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
