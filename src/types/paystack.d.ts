// types/paystack.d.ts
declare module '@paystack/inline-js';

interface PaystackPop {
    new(): PaystackPopInstance;
}

interface PaystackPopInstance {
    resumeTransaction(
        accessCode: string,
        callbacks?: {
            onSuccess?: (transaction: { reference: string }) => void;
            onCancel?: () => void;
        }
    ): void;
}

interface Window {
    PaystackPop: PaystackPop;
}