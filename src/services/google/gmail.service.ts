import { getAccessToken } from '../gdrive/auth.service';

export async function sendWeeklyDigestEmail(userEmail: string, contentHtml: string, quote: string): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  const subject = '🍏 Your Weekly Health Planner Summary & Motivation';
  const emailLines = [
    `To: ${userEmail}`,
    `Subject: ${subject}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    `<div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #1e293b;">`,
    `<h2>🍏 Your Weekly Health & Calorie Summary</h2>`,
    `<div>${contentHtml}</div>`,
    `<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;" />`,
    `<blockquote style="font-style: italic; color: #475569; font-size: 1.1em;">"${quote}"</blockquote>`,
    `<p><small style="color: #94a3b8;">Sent automatically from your Health Planner PWA on GitHub Pages</small></p>`,
    `</div>`,
  ];

  const emailRaw = emailLines.join('\r\n');
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailRaw)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    const res = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: base64EncodedEmail }),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to send Gmail digest:', err);
    return false;
  }
}
