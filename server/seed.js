import prisma from './config/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('Starting seed...');

    // Create users
    const users = [];
    const usernames = [
        'techguru', 'coffeelover', 'bookworm', 'travelbug', 'fitnessfan',
        'musiclover', 'foodie', 'gamerlife', 'naturelover', 'artlover',
        'coderlife', 'moviebuff', 'yogafan', 'photographer', 'writer',
        'designer', 'entrepreneur', 'teacher', 'student', 'developer'
    ];

    const bios = [
        'Living life one day at a time ✨',
        'Coffee enthusiast ☕ | Tech lover 💻',
        'Exploring the world 🌍',
        'Building cool stuff',
        'Just here for the memes',
        'Professional overthinker',
        'Making mistakes and learning',
        'Currently obsessed with coding',
        'Living my best life',
        'Trying to be better every day',
        'Dog lover 🐕 | Nature enthusiast',
        'Creating, learning, growing',
        'Just vibing',
        'Passionate about everything',
        'Life is good',
        'Always learning something new',
        'Dream big, work hard',
        'Spreading positivity',
        'Adventure seeker',
        'Tech geek and proud'
    ];

    console.log('Creating users...');
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
        "Just finished working on an amazing project! 🚀",
        "Can't believe how beautiful the weather is today ☀️",
        "Coffee + Code = Happiness ☕💻",
        "Learning something new every day!",
        "This is going to be a great week!",
        "Anyone else obsessed with this new tech?",
        "Hot take: pineapple on pizza is underrated 🍕",
        "Working on improving my skills one day at a time",
        "Just discovered this amazing new tool!",
        "Feeling grateful for all the opportunities",
        "Monday motivation: Let's crush this week! 💪",
        "The best part of my day is...",
        "Just had the best meal ever 🍜",
        "Reading this incredible book right now 📚",
        "Nature is absolutely stunning today 🌳",
        "Building something cool, stay tuned!",
        "Life update: Things are going well!",
        "Does anyone else feel this way?",
        "Pro tip: Always keep learning",
        "Throwback to an amazing memory",
        "Working from my favorite coffee shop today",
        "The grind never stops 💼",
        "Excited about what's coming next!",
        "Just completed a major milestone 🎉",
        "Sharing some wisdom I learned today",
        "This made me smile today 😊",
        "Weekend vibes are the best vibes",
        "Productivity level: Maximum 📈",
        "Taking a break to appreciate the little things",
        "New day, new opportunities",
        "Sometimes you just need to take a moment",
        "Celebrating small wins today!",
        "This is what I've been working on lately",
        "Inspiration strikes at the oddest times",
        "Just another day in paradise",
        "Making progress, one step at a time",
        "Feeling creative today ✨",
        "Life is too short for bad coffee",
        "Just hit a personal record!",
        "Grateful for this community 🙏",
        "Testing out some new ideas",
        "The journey is just as important as the destination",
        "Sharing some thoughts on...",
        "Currently obsessed with this new hobby",
        "Making memories that will last forever",
        "This is the energy we need!",
        "Sometimes the best ideas come from nowhere",
        "Taking it one day at a time",
        "Here's to new beginnings!",
        "Just had an amazing conversation about...",
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

main()
    .catch((e) => {
        console.error('Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
