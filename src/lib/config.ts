const config = {
    env: process.env.NEXT_PUBLIC_APP_ENV || 'local',
    firebase: {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },

    isLocal: (process.env.NEXT_PUBLIC_APP_ENV || 'local') === 'local',
    isTest: process.env.NEXT_PUBLIC_APP_ENV === 'test',
    isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',
};

export default config;
