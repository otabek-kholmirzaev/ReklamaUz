import os

from .messages import Messages

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
RESEND_FROM = os.getenv("RESEND_FROM", "Reklama.uz <onboarding@resend.dev>").strip()


def send_verification_email(to_email: str, code: str) -> None:
    if not RESEND_API_KEY:
        print(f"\n[DEV] Verification code for {to_email}: {code}\n", flush=True)
        return

    import resend

    resend.api_key = RESEND_API_KEY
    try:
        resend.Emails.send({
            "from": RESEND_FROM,
            "to": [to_email],
            "subject": Messages.email_subject(code),
            "html": f"""<!doctype html>
<html><body style="font-family:sans-serif;max-width:480px;margin:40px auto;color:#111">
  <h2 style="margin-bottom:4px">{Messages.EMAIL_HEADING}</h2>
  <p style="color:#555">{Messages.EMAIL_BODY}</p>
  <div style="font-size:36px;font-weight:700;letter-spacing:10px;margin:32px 0;padding:20px;
              background:#f5f5f5;border-radius:12px;text-align:center">{code}</div>
  <p style="color:#888;font-size:13px">{Messages.EMAIL_EXPIRY_NOTE}</p>
</body></html>""",
        })
    except Exception as exc:
        raise ValueError(str(exc)) from exc
