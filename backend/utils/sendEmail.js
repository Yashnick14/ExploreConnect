import { Resend } from 'resend';

const resend = new Resend('re_F24vb1eT_5AbMnoPQWFXCQ2vS5CMTprqV'); // use your API key

const sendEmail = async (to, resetLink) => {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // ✅ this is allowed by Resend if domain not added
      to,
      subject: 'Reset Your Password',
      html: `
        <p>You requested to reset your password.</p>
        <p>Click below to change it:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link is valid for 1 hour.</p>
      `,
    });

    console.log('📩 Email sent:', data);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

export default sendEmail;
