export const resetPasswordTemplate = ({ resetLink }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Reset Password</title>
    </head>

    <body style="
      font-family: Arial, sans-serif;
      background: #f4f4f4;
      padding: 20px;
    ">

      <div style="
        max-width: 500px;
        margin: auto;
        background: white;
        padding: 30px;
        border-radius: 8px;
      ">

        <h2>Reset Your Password</h2>

        <p>
          We received a request to reset your password.
        </p>

        <p>
          Click the button below to reset your password:
        </p>

        <a
          href="${resetLink}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          Reset Password
        </a>

        <p style="margin-top: 20px;">
          This link will expire in <strong>5 minutes</strong>.
        </p>

        <p>
          If you did not request this, you can safely ignore this email.
        </p>

        <p>
          Best regards,<br />
          Saraha-App
        </p>

      </div>

    </body>
    </html>
  `;
};