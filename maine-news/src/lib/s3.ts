import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export async function uploadToS3(file: Buffer, fileName: string, contentType: string) {
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) throw new Error("AWS_BUCKET_NAME is not defined");

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `submissions/${Date.now()}-${fileName}`,
        Body: file,
        ContentType: contentType,
    });

    await s3Client.send(command);

    // Construct the public URL (this assumes the bucket is public or has a CDN)
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/submissions/${Date.now()}-${fileName}`;
}
