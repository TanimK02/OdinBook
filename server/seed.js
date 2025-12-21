import prisma from './config/prisma.js';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';


export async function main() {
    console.log('Starting seed...');

    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.like.deleteMany();
    await prisma.retweet.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.tweet.deleteMany();
    await prisma.profile.deleteMany();
    await prisma.user.deleteMany();
    console.log('Database cleared!');

    // Create users
    const users = [];
    const usernames = [
        ... new Set(Array.from({ length: 50 }, () => faker.internet.userName()))
    ];

    const bios = [
        ...new Set(Array.from({ length: 50 }, () => faker.lorem.sentence()))
    ];

    console.log('Creating users...');

    // Create guest user first
    const guestUser = await prisma.user.create({
        data: {
            username: 'guest',
            email: 'guest@example.com',
            passwordHash: bcrypt.hashSync('password123', 10),
            profile: {
                create: {
                    bio: 'Guest user account - feel free to explore!',
                    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest'
                }
            }
        }
    });
    users.push(guestUser);
    console.log('Created guest user (username: guest, password: password123)');

    for (let i = 0; i < usernames.length; i++) {
        const user = await prisma.user.create({
            data: {
                username: usernames[i],
                email: `${usernames[i]}@example.com`,
                passwordHash: bcrypt.hashSync('password123', 10),
                profile: {
                    create: {
                        bio: bios[i],
                        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernames[i]}`
                    }
                }
            }
        });
        users.push(user);
    }
    console.log(`Created ${users.length} users`);

    // Create follows (random follows between users)
    console.log('Creating follows...');
    let followCount = 0;
    for (let i = 0; i < users.length; i++) {
        const numFollows = Math.floor(Math.random() * 8) + 2; // Each user follows 2-10 others
        const followIndices = new Set();

        while (followIndices.size < numFollows) {
            const randomIndex = Math.floor(Math.random() * users.length);
            if (randomIndex !== i) {
                followIndices.add(randomIndex);
            }
        }

        for (const followIndex of followIndices) {
            try {
                await prisma.follow.create({
                    data: {
                        followerId: users[i].id,
                        followingId: users[followIndex].id
                    }
                });
                followCount++;
            } catch (e) {
                // Skip if duplicate
            }
        }
    }
    console.log(`Created ${followCount} follow relationships`);

    // Tweet content templates
    const tweetTemplates = [
        ... new Set(Array.from({ length: 100 }, () => faker.lorem.sentence()))
    ];

    // Create tweets
    console.log('Creating tweets...');
    const tweets = [];
    for (let i = 0; i < 200; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomTemplate = tweetTemplates[Math.floor(Math.random() * tweetTemplates.length)];

        const tweet = await prisma.tweet.create({
            data: {
                content: randomTemplate,
                authorId: randomUser.id,
            }
        });
        tweets.push(tweet);
    }
    console.log(`Created ${tweets.length} tweets`);

    // Create some reply tweets (threads)
    console.log('Creating reply tweets...');
    let replyCount = 0;
    for (let i = 0; i < 50; i++) {
        const randomTweet = tweets[Math.floor(Math.random() * tweets.length)];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const replyTemplates = [
            "I totally agree with this!",
            "Interesting perspective!",
            "Thanks for sharing this",
            "This is so true!",
            "Great point!",
            "I never thought about it this way",
            "Exactly what I was thinking",
            "This made my day",
            "So relatable!",
            "Love this energy!",
        ];

        await prisma.tweet.create({
            data: {
                content: replyTemplates[Math.floor(Math.random() * replyTemplates.length)],
                authorId: randomUser.id,
                parentTweetId: randomTweet.id
            }
        });
        replyCount++;
    }
    console.log(`Created ${replyCount} reply tweets`);

    // Create likes
    console.log('Creating likes...');
    let likeCount = 0;
    for (let i = 0; i < 500; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomTweet = tweets[Math.floor(Math.random() * tweets.length)];

        try {
            await prisma.like.create({
                data: {
                    userId: randomUser.id,
                    tweetId: randomTweet.id
                }
            });
            likeCount++;
        } catch (e) {
            // Skip if duplicate
        }
    }
    console.log(`Created ${likeCount} likes`);

    // Create retweets
    console.log('Creating retweets...');
    let retweetCount = 0;
    for (let i = 0; i < 300; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomTweet = tweets[Math.floor(Math.random() * tweets.length)];

        try {
            await prisma.retweet.create({
                data: {
                    userId: randomUser.id,
                    tweetId: randomTweet.id
                }
            });
            retweetCount++;
        } catch (e) {
            // Skip if duplicate
        }
    }
    console.log(`Created ${retweetCount} retweets`);

    console.log('Seed completed successfully! 🎉');
    console.log('Summary:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Follows: ${followCount}`);
    console.log(`- Tweets: ${tweets.length}`);
    console.log(`- Replies: ${replyCount}`);
    console.log(`- Likes: ${likeCount}`);
    console.log(`- Retweets: ${retweetCount}`);
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main()
        .catch((e) => {
            console.error('Error during seed:', e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
