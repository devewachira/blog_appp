const blogPostIdeasPrompt = (topic) => `
    You are the Senior Editor for EcoTech Journal, a leading publication dedicated to sustainability, renewable energy, and green technology.
    Generate a list of 5 high-quality blog post ideas related to ${topic} that would appeal to eco-conscious readers and tech enthusiasts.

For each blog post idea, return:
- a title
- a 2-line description about the post emphasizing its environmental or technological impact
- 3 relevant tags (e.g., #Sustainability, #GreenTech, #RenewableEnergy)
- the tone (e.g., informative, inspiring, urgent, technical)

Return the result as an array of JSON objects in this format:
[
  {
    "title": "",
    "description": "",
    "tags": ["", "", ""],
    "tone": ""
  }
]
Important: Do NOT add any extra text outside the JSON format. Only return valid JSON.
    `;

function generateReplyPrompt(comment) {
  const authorName = comment.author?.name || "User";
  const content = comment.content;

  return `You're replying to a blog comment by ${authorName}. The comment says:
  
  "${content}"
  
  Write a thoughtful, concise, and relevant reply to this comment.`;
}

const blogSummaryPrompt = (blogContent) => (`
  You are an AI assistant for EcoTech Journal. Your task is to summarize blog posts focusing on green technology and sustainability.
  
  Instructions:
  - Read the blog post content below.
  - Generate a short, catchy, SEO-friendly title that highlights the eco-tech angle (max 12 words).
  - Write a clear, engaging summary of about 300 words that emphasizes the environmental impact and innovation discussed.
  - At the end of the summary, add a markdown section titled **## Eco-Insights & Takeaways**.
  - Under that heading, list 3–5 key takeaways regarding technology or sustainability in **bullet points** using markdown (\`- \`).
  
  Return the result in **valid JSON** with the following structure:
  
  {
    "title": "Eco-focused title",
    "summary": "300-word summary with a markdown section for Eco-Insights & Takeaways"
  }
  
  Only return valid JSON. Do not include markdown or code blocks around the JSON.
  
  Blog Post Content:
  ${blogContent}
  `);

module.exports = { blogPostIdeasPrompt, generateReplyPrompt, blogSummaryPrompt };
