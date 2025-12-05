export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    interval: 'month' | 'year' | 'one-time';
    features: string[];
    stripePriceId: string;
    type: 'subscription' | 'payment';
    active: boolean;
    highlight?: boolean;
    buttonText?: string;
}

export interface PaymentLog {
    id: string;
    userId: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    description?: string;
}
