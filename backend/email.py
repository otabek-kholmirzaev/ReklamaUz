import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "") or SMTP_USER


def send_verification_email(to_email: str, code: str) -> None:
    if not SMTP_USER or not SMTP_PASSWORD:
        # Dev fallback: print to console so registration works without SMTP config
        print(f"\n[DEV] Verification code for {to_email}: {code}\n", flush=True)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Your Reklama.uz code: {code}"
    msg["From"] = SMTP_FROM
    msg["To"] = to_email

    text = (
        f"Your Reklama.uz verification code is: {code}\n\n"
        "This code expires in 15 minutes. Do not share it with anyone."
    )
    html = f"""<!doctype html>
<html><body style="font-family:sans-serif;max-width:480px;margin:40px auto;color:#111">
  <h2 style="margin-bottom:4px">Verify your Reklama.uz account</h2>
  <p style="color:#555">Enter the code below to complete your registration.</p>
  <div style="font-size:36px;font-weight:700;letter-spacing:10px;margin:32px 0;padding:20px;
              background:#f5f5f5;border-radius:12px;text-align:center">{code}</div>
  <p style="color:#888;font-size:13px">Expires in 15 minutes. If you didn't request this, ignore this email.</p>
</body></html>"""

    msg.attach(MIMEText(text, "plain"))
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_FROM, to_email, msg.as_string())
