import 'next-auth';
import 'next-auth/jwt';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: 'Admin' | 'Delivery Boy' | 'User';
      accessToken?: string;
      profileImage?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    mongodbId?: string;
    role?: 'Admin' | 'Delivery Boy' | 'User';
    accessToken?: string;
    profileImage?: string;
  }
}
