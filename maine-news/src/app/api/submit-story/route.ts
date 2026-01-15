import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { uploadToS3 } from '@/lib/s3';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const content = formData.get('content') as string;
        const urgency = formData.get('urgency') as string;

        if (!content || !email) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Handle File Uploads
        const fileLinks: string[] = [];
        const files = Array.from(formData.entries())
            .filter(([key]) => key.startsWith('file-'))
            .map(([, value]) => value as File);

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const link = await uploadToS3(buffer, file.name, file.type);
            fileLinks.push(link);
        }

        const data = await resend.emails.send({
            from: 'Maine News Today <info@nathanreardon.com>',
            to: ['jamesezekiel039@gmail.com', 'info@mainenewsnow.com', 'nathan@membershipauto.com'],
            subject: `STORY SUBMISSION: ${title || 'New Tip'}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #bf9b30; border-bottom: 2px solid #bf9b30; padding-bottom: 10px;">New Story Submission</h2>
                    <p><strong>Title:</strong> ${title || 'N/A'}</p>
                    <p><strong>Proposed by:</strong> ${name || 'Anonymous'}</p>
                    <p><strong>Contact Email:</strong> ${email}</p>
                    <p><strong>Urgency:</strong> ${urgency}</p>
                    
                    ${fileLinks.length > 0 ? `
                        <div style="margin: 20px 0; padding: 15px; background: #fff8e1; border: 1px solid #ffe082; border-radius: 4px;">
                            <h4 style="margin-top:0;">Attached Media:</h4>
                            <ul style="margin-bottom:0;">
                                ${fileLinks.map(link => `<li><a href="${link}">${link}</a></li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

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
