// OAuth2.0 implementation for google signin

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import clientPromise from "@/lib/mongodb"; 

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],

  callbacks: {
    async signIn({ user }) {
    try {
        console.log("Signin triggered for:", user.email);
    
        const client = await clientPromise;
        const db = client.db("AniDB"); 
        const users = db.collection("users");
        const counters = db.collection("counters");
        const profiles = db.collection("profiles");

        const existingUser = await users.findOne({ email: user.email });
        console.log("Existing user:", existingUser);
    
        if (!existingUser) {
            const counterResult = await counters.findOneAndUpdate(
                { _id: "userId" },
                { $inc: { sequence_value: 1 } },
                {
                    upsert: true,
                    returnDocument: "after"
                }
                );
            console.log(JSON.stringify(counterResult, null, 2));
            
            const sequence = counterResult.sequence_value;
            
            if (!sequence)
                console.warn("Counter fallback: no sequence value found, using default 1000");
            
            const userId = sequence || 1000;
            
            const newUser = {
                userId: userId,
                email: user.email,
                name: user.name,
                image: user.image,
            };

            const newProfile = {
              userId: userId,
              username: null,
              profilePicture: "/profile.jpg",
              bannerImage: "/banner.jpg",
              description: "",
              totalAnimeWatched: 0,
              updatedAt: new Date()
            }
            
            console.log("Inserting user with userId:", userId);
            await users.insertOne(newUser);    
            await profiles.insertOne(newProfile);
        }
    
        return true;
        } catch (error) {
            console.error("Error in signIn callback:", error);
            return false;
        }
    },

    async jwt({ token, user }) {
      if (user) {
        const client = await clientPromise;
        const db = client.db("AniDB");
        const users = db.collection("users");

        const dbUser = await users.findOne({ email: user.email });
        token.userId = dbUser?.userId;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.userId; 
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET
};

export default NextAuth(authOptions);
