import type { NextConfig } from "next";

// Helper function to validate environment variables
function validateEnvVars() {
  const requiredEnvVars = [
    'OPENROUTER_API_KEY',
    // 'NEXTAUTH_SECRET', // Uncomment if NextAuth is actively used
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_RECAPTCHA_SITE_KEY',
    'RECAPTCHA_SECRET_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_WEBHOOK_SECRET', // Re-added webhook secret check
    // 'MASTERY_ENGINE_URL', // Removed as Mastery Engine is not used
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error("\n❌ Missing required environment variables:");
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.error("\nPlease check your .env file or environment configuration.\n");
    // Optionally, throw an error to halt the build/startup process
    // throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    // For now, just log the error and continue
  } else {
    console.log("✅ All required environment variables are set.");
  }

  // Check for placeholder values in critical secrets
  const placeholderChecks = [
      { key: 'STRIPE_WEBHOOK_SECRET', placeholder: 'whsec_YOUR_STRIPE_WEBHOOK_SIGNING_SECRET_HERE' }, // Re-added
      { key: 'RECAPTCHA_SECRET_KEY', placeholder: 'YOUR_RECAPTCHA_V3_SECRET_KEY_HERE' },
      // { key: 'MASTERY_ENGINE_URL', placeholder: 'YOUR_MASTERY_ENGINE_ENDPOINT_URL_HERE' }, // Removed
  ];
  placeholderChecks.forEach(({ key, placeholder }) => {
      if (process.env[key] === placeholder) {
          console.warn(`⚠️ Environment variable ${key} still contains a placeholder value.`);
      }
  });
}

// Run validation when the config is loaded
validateEnvVars();


const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui.aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.aceternity.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  /* config options here */
};

export default nextConfig;
