// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }


  async sendVerificationEmail(email: string, token: string, firstName: string) {
    const hostEmail = this.configService.get('MAIL_FROM');
    const verificationUrl = `${this.configService.get('FRONTEND_URL')}/auth/verify-email?token=${token}`;

    Logger.log(`Sending verification email from ${hostEmail} with token ${token}`);
    const mailOptions = {
      from: `"${this.configService.get('APP_NAME')}" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: this.getVerificationEmailTemplate(firstName, verificationUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string) {
    const resetUrl = `${this.configService.get('FRONTEND_URL')}/auth/reset-password?token=${token}`;

    const mailOptions = {
      from: `"${this.configService.get('APP_NAME')}" <${this.configService.get('SMTP_FROM')}>`,
      to: email,
      subject: 'Reset Your Password',
      html: this.getPasswordResetEmailTemplate(firstName, resetUrl),
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      return false;
    }
  }

  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #4CAF50;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${this.configService.get('APP_NAME')}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #FF5722;
            color: white;
            padding: 20px;
            text-align: center;
          }
          .content {
            padding: 20px;
            background-color: #f9f9f9;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #FF5722;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${firstName},</p>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${this.configService.get('APP_NAME')}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}