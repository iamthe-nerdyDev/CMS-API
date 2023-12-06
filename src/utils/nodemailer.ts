import dotenv from "dotenv";
import nodemailer from "nodemailer";
import util from "util";
import { SendMailParams } from "../interface";
import log from "./logger";

dotenv.config();

function removeHTML(html: string) {
  if (!html || html === "") return html;

  return html.toString().replace(/(<([^>]+)>)/gi, "");
}

export async function sendMail(data: SendMailParams): Promise<boolean> {
  const { SMTP_PORT, SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_PORT) throw new Error(".env variable missing: SMTP_PORT");
  if (!SMTP_HOST) throw new Error(".env variable missing: SMTP_HOST");
  if (!SMTP_USER) throw new Error(".env variable missing: SMTP_USER");
  if (!SMTP_PASS) throw new Error(".env variable missing: SMTP_PASS");

  let port = typeof SMTP_PORT !== "number" ? parseInt(SMTP_PORT) : SMTP_PORT;

  const transporter = nodemailer.createTransport({
    port,
    host: SMTP_HOST,
    secure: port === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailData = {
    from: SMTP_USER,
    to: data.receiver,
    subject: data.subject,
    text: removeHTML(data.html),
    html: data.html,
  };

  const sendMailPromise = util
    .promisify(transporter.sendMail)
    .bind(transporter);

  try {
    await sendMailPromise(mailData);

    return true;
  } catch (e: any) {
    log.error(e);

    return false;
  }
}
