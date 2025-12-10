import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import prisma from "./prisma.js";
import "dotenv/config";
import passport from "passport";

const localStrategy = new LocalStrategy(
    {
        usernameField: "identifier",
        passwordField: "password",
    }, async (identifier, password, done) => {
        try {
            const user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: identifier },
                        { username: identifier }
                    ]
                }
            });

            if (!user) {
                return done(null, false, { message: "Incorrect username or email." });
            }

            const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
            if (!isPasswordValid) {
                return done(null, false, { message: "Incorrect password." });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
);

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                username: true,
                email: true
            }
        });
        done(null, user);
    } catch (err) {
        done(err);
    }
});


passport.use(localStrategy);

export default passport;