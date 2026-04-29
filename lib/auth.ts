import { NextAuthOptions } from "next-auth";
import GoogleProvider      from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect           from "@/lib/db";
import User                from "@/models/User";
import bcrypt              from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    // ── Google OAuth ──────────────────────────────────────────────────────────
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // ── Email / Password ──────────────────────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        await dbConnect();

        const user = await User.findOne({ email: credentials.email.toLowerCase() })
          .select("+password")
          .lean() as {
            _id:       { toString(): string };
            name:      string;
            email:     string;
            password?: string;
            avatar?:   string;
            phone?:    string;
            role?:     string;
          } | null;

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id:    user._id.toString(),
          name:  user.name,
          email: user.email,
          image: user.avatar ?? null,
          phone: user.phone  ?? "",
          role:  user.role   ?? "user",
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          await dbConnect();

          let dbUser = await User.findOne({ email: user.email });

          if (!dbUser) {
            dbUser = await User.create({
              name:   user.name,
              email:  user.email,
              avatar: user.image,
            });
          }

          user.id = dbUser._id.toString();
          (user as { phone?: string; role?: string }).phone = dbUser.phone ?? "";
          (user as { phone?: string; role?: string }).role  = dbUser.role  ?? "user";
        } catch (err) {
          console.error("[signIn callback]", err);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id      = user.id;
        token.name    = user.name;
        token.email   = user.email;
        token.picture = (user as { image?: string }).image ?? token.picture;
        token.phone   = (user as { phone?: string }).phone ?? "";
        token.role    = (user as { role?:  string }).role  ?? "user";
      }

      if (trigger === "update" && session) {
        if (session.name)   token.name    = session.name;
        if (session.email)  token.email   = session.email;
        if (session.phone)  token.phone   = session.phone;
        if (session.avatar) token.picture = session.avatar;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id    = token.id      as string;
        session.user.name  = token.name    as string;
        session.user.email = token.email   as string;
        session.user.image = token.picture as string;
        (session.user as { phone?: string }).phone = token.phone as string;
        (session.user as { role?:  string }).role  = token.role  as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/account/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};