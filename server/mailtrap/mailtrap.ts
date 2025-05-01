import {MailtrapClient} from "mailtrap";
//import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
// console.log(process.env.MAILTRAP_API_TOKEN);
const ENDPOINT = "https://send.api.mailtrap.io/"
export const client = new MailtrapClient({token: process.env.MAILTRAP_API_TOKEN! });

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Foodista",
};  