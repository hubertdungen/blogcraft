const fs = require('fs');
const path = require('path');
const schedule = require('node-schedule');

// File containing posts to be scheduled. Each entry:
// {"id": "postId", "blogId": "blogId", "publishDate": "2024-06-01T10:00:00Z"}
const postsFile = process.env.SCHEDULED_POSTS_FILE || path.join(__dirname, 'scheduled-posts.json');

// OAuth token to access Blogger API
const token = process.env.BLOGGER_TOKEN;

if (!token) {
  console.error('Missing BLOGGER_TOKEN environment variable.');
  process.exit(1);
}

let posts = [];
try {
  const data = fs.readFileSync(postsFile, 'utf-8');
  posts = JSON.parse(data);
} catch (err) {
  console.error('Failed to load scheduled posts file:', postsFile, err);
  process.exit(1);
}

posts.forEach(post => {
  const publishDate = new Date(post.publishDate);
  if (isNaN(publishDate)) {
    console.error('Invalid publishDate for post', post);
    return;
  }

  schedule.scheduleJob(publishDate, async () => {
    try {
      const baseUrl = `https://www.googleapis.com/blogger/v3/blogs/${post.blogId}/posts/${post.id}/publish`;
      const url = `${baseUrl}?publishDate=${encodeURIComponent(publishDate.toISOString())}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        console.error('Failed to publish post', post.id, await res.text());
      } else {
        console.log('Published post', post.id, 'at', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error publishing post', post.id, error);
    }
  });
});

console.log(`Scheduled ${posts.length} posts. Scheduler running...`);
