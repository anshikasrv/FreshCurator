import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/users';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'mock',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock'
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        role: { label: 'Role', type: 'text' },
        otp: { label: 'OTP', type: 'text' }
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${BACKEND_URL}/login`, {
            email: credentials?.email,
            password: credentials?.password,
            role: credentials?.role,
            otp: credentials?.otp
          });
          const user = res.data;
          if (user) return user;
          return null;
        } catch (error: any) {
          throw new Error(error.response?.data?.error || 'Validation failed');
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const { cookies } = await import('next/headers');
          const cookieStore = cookies();
          const selectedRole = cookieStore.get('fc_oauth_role')?.value || 'User';

          const res = await axios.post(`${BACKEND_URL}/social-sync`, {
            email: user.email,
            name: user.name,
            profileImage: user.image,
            role: selectedRole === 'Rider' ? 'Delivery Boy' : selectedRole
          });

          // Enrich user object for the jwt callback
          (user as any).mongodbId = res.data._id;
          (user as any).role = res.data.role;
          (user as any).profileImage = res.data.profileImage;
          (user as any).token = res.data.token;
          
          return true;
        } catch (error) {
          console.error('Social Sync Error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      // user is only available on sign-in
      if (user) {
        token.mongodbId = (user as any).mongodbId || (user as any)._id || (user as any).id;
        token.role = (user as any).role;
        token.profileImage = (user as any).profileImage;
        token.accessToken = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        (session.user as any).id = token.mongodbId;
        (session.user as any).role = token.role;
        (session.user as any).profileImage = token.profileImage;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret',
});

export { handler as GET, handler as POST };
