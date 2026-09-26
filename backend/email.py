import os

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
RESEND_FROM = os.getenv("RESEND_FROM", "Reklama.uz <onboarding@resend.dev>")


def send_verification_email(to_email: str, code: str) -> None:
    if not RESEND_API_KEY:
        # Dev fallback: print to console so registration works without any config
        print(f"\n[DEV] Verification code for {to_email}: {code}\n", flush=True)
        return

    import resend  # only imported when key is present

    resend.api_key = RESEND_API_KEY
    resend.Emails.send({
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": f"Your Reklama.uz code: {code}",
        "html": f"""<!doctype html>
<html><body style="font-family:sans-serif;max-width:480px;margin:40px auto;color:#111">
  <h2 style="margin-bottom:4px">Verify your Reklama.uz account</h2>
  <p style="color:#555">Enter the code below to complete your registration.</p>
  <div style="font-size:36px;font-weight:700;letter-spacing:10px;margin:32px 0;padding:20px;
              background:#f5f5f5;border-radius:12px;text-align:center">{code}</div>
  <p style="color:#888;font-size:13px">Expires in 15 minutes. If you didn't request this, ignore this email.</p>
</body></html>""",
    })
