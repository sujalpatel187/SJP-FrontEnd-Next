// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions, Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { promises as fs } from 'fs'
import path from 'path'

// Extend the Session user type to include provider
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
      userId?: string;
      companyName?: string;
    }
  }
}

interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  password?: string;
  companyName?: string;
  createdAt: string;
  provider?: 'google' | 'credentials';
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Save Google user to your data file
          const dataDir = path.join(process.cwd(), 'public', 'loginn-register');
          await fs.mkdir(dataDir, { recursive: true });
          const filePath = path.join(dataDir, 'data.txt');

          // Check if user already exists
          let existingUsers: User[] = [];
          try {
            const data = await fs.readFile(filePath, 'utf8');
            existingUsers = data.trim() ? data.trim().split('\n').map(line => JSON.parse(line)) : [];
          } catch (error) {
            // File doesn't exist yet
          }

          const existingUser = existingUsers.find(u => u.email === user.email);
          
          if (!existingUser) {
            // Create new user from Google data
            const newUser: User = {
              id: Date.now().toString(),
              name: user.name || '',
              email: user.email || '',
              createdAt: new Date().toISOString(),
              provider: 'google'
            };

            // Append to file
            await fs.appendFile(filePath, JSON.stringify(newUser) + '\n');
          }

          return true;
        } catch (error) {
          console.error('Error saving Google user:', error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // Add provider info
      if (account?.provider === 'google') {
        token.provider = 'google';
      }
      // Add user info to the token on sign in
      if (user) {
        token.userId = (user as any).id;
        token.email = user.email;
        token.name = user.name;
        token.companyName = (user as any).companyName || '';
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.provider = token.provider as string;
        session.user.userId = token.userId as string;
        session.user.companyName = token.companyName as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login', // Your custom login page
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };