export const otpTemplate = ({ OTP_CODE, EXPIRATION_TIME }) => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:8px;">
    <h2>Verify Your Account</h2>

    <p>Your OTP is:</p>

    <div
      style="
        font-size:32px;
        font-weight:bold;
        text-align:center;
        letter-spacing:5px;
        padding:15px;
        background:#f5f5f5;
        border-radius:6px;
      "
    >
      ${OTP_CODE}
    </div>

    <p>This code will expire in <strong>${EXPIRATION_TIME}</strong> minutes.</p>

    <p>If you did not request this code, you can safely ignore this email.</p>

    <p>Best regards,<br />Saraha-App</p>
  </div>
</body>
</html>`;
};
