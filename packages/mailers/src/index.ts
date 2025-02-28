import process from 'node:process';
import { z } from 'zod';

const MAILER_PROVIDER = z
  .enum(['nodemailer', 'resend'])
  .default('nodemailer')
  .parse(process.env.MAILER_PROVIDER);

/**
 * @description Get the mailer based on the environment variable.
 */
export async function getMailer() {
  switch (MAILER_PROVIDER) {
    case 'nodemailer':
      return getNodemailer();

    case 'resend':
      return getResendMailer();

    default:
      throw new Error(`Invalid mailer: ${MAILER_PROVIDER as string}`);
  }
}

async function getNodemailer() {
  const { Nodemailer } = await import('./impl/nodemailer');

  return new Nodemailer();
}

async function getResendMailer() {
  const { ResendMailer } = await import('./impl/resend');

  return new ResendMailer();
}
