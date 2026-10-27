This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Razorpay checkout configuration

The storefront uses Razorpay Checkout for full online payment. Configure these server-side environment variables in your local environment and Vercel project settings:

- `RAZORPAY_KEY_ID` — public checkout key ID from Razorpay.
- `RAZORPAY_KEY_SECRET` — private API/signature secret. Never expose this with a `NEXT_PUBLIC_` prefix.
- `RAZORPAY_WEBHOOK_SECRET` — webhook secret configured for the webhook endpoint below.

The order page creates a Razorpay order from the order total stored in Supabase. The browser callback is not treated as proof of payment: the verification endpoint checks the signature, fetches the payment from Razorpay, confirms the amount and currency, and only then updates the order to `PAID`.

### Razorpay webhook

Configure a Razorpay webhook URL for each environment:

- Production: `https://vaishnavicollections.vercel.app/api/razorpay/webhook`
- Preview/local: use the URL of that deployment or a secure tunnel.

Subscribe to the `payment.captured` event and set the webhook secret to the same value as `RAZORPAY_WEBHOOK_SECRET`. Add the environment variables to Vercel before testing. Start in Razorpay Test Mode, complete a successful payment and a failed/cancelled payment, then configure Live Mode keys only when the test flow has passed.

Do not commit real API keys or webhook secrets to Git.
