// import nodemailer from 'nodemailer';
import * as nodemailer from 'nodemailer'
import sgMail from '@sendgrid/mail'

export class EmailService {
  private transporter?: nodemailer.Transporter;
  private useSendgrid: boolean;

  constructor() {
    const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
    const sendgridKey = process.env.SENDGRID_API_KEY;
    this.useSendgrid = provider === 'sendgrid' || provider === 'twilio' || (!!sendgridKey && provider !== 'smtp');

    if (this.useSendgrid) {
      if (!sendgridKey) {
        throw new Error('SendGrid configuration missing: set SENDGRID_API_KEY');
      }
      sgMail.setApiKey(sendgridKey);
      return;
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    if (!host || !user || !pass) {
      throw new Error('SMTP configuration missing: set SMTP_HOST, SMTP_USER, SMTP_PASS');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    const from = (process.env.EMAIL_FROM || process.env.SENDGRID_FROM || process.env.SMTP_USER) as string;
    if (this.useSendgrid) {
      await sgMail.send({ to, from, subject, html });
      return;
    }
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }
    await this.transporter.sendMail({ from, to, subject, html });
  }
}
