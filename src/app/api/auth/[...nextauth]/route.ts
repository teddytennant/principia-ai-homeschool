import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { supabase } from "../../../../lib/supabaseClient";

// Extend NextAuth session type to include custom properties
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      firstName?: string;
      lastName?: string;
      profileData?: Record<string, unknown>;
      preferences?: Record<string, unknown>;
      name?: string;
      email?: string;
      image?: string;
    }
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After sign-in, redirect based on user role
      const userId = url.includes('token') ? new URL(url).searchParams.get('token')?.split('.')[1] : null;
      if (userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        if (error) {
          console.error('Error fetching user role for redirect:', error);
          return baseUrl;
        }
        if (data && data.role === 'teacher') {
          return `${baseUrl}/teacher/dashboard`;
        } else if (data && data.role === 'student') {
          return `${baseUrl}/chat`;
        }
      }
      // Default redirect to homepage if role not found or other issues
      return baseUrl;
    },
    async session({ session, token }) {
      if (token && session.user && token.sub) {
        // Fetch user role and data from Supabase profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('role, first_name, last_name, profile_data, preferences')
          .eq('id', token.sub)
          .single();
        
        if (error) {
          console.error('Error fetching profile from Supabase:', error);
        } else if (data) {
          session.user.id = token.sub;
          session.user.role = data.role;
          session.user.firstName = data.first_name;
          session.user.lastName = data.last_name;
          session.user.profileData = data.profile_data || {};
          session.user.preferences = data.preferences || {};
        }
      } else {
        console.warn('Token or token.sub is undefined, skipping profile fetch');
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account && user) {
        // Check if user exists in Supabase profiles, create if not
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single();
        
        if (error && error.code === 'PGRST116') {
          // User not found, create a new profile
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              role: 'student', // Default role, can be updated later
              first_name: user.name?.split(' ')[0] || 'User',
              last_name: user.name?.split(' ')[1] || '',
              profile_data: {},
              preferences: {}
            });
          
          if (insertError) {
            console.error('Error creating profile in Supabase:', insertError);
            return false;
          }
        } else if (error) {
          console.error('Error checking profile in Supabase:', error);
          return false;
        }
      }
      return true;
    },
  },
});

export { handler as GET, handler as POST };
