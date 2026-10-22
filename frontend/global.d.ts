declare module "*.css";

interface RazorpayCheckoutOptions {
  [key: string]: unknown;
}

interface Window {
  Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
}
