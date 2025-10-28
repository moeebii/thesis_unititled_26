const postsContainer = document.getElementById('posts');
const channelId = 'moe-ebii/thesis-untitled'; // Replace with your actual Are.na channel ID

// Fetch posts from the Are.na API
async function fetchPosts() {
  const response = await fetch(`https://api.are.na/v2/channels/${channelId}/blocks`);
  const data = await response.json();
  const blocks = data.data;

  blocks.forEach(block => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');

    const title = block.title || 'Untitled';
    const content = block.content || 'No content provided.';
    const author = block.user.name || 'Anonymous';
    const date = new Date(block.created_at).toLocaleDateString();

    postElement.innerHTML = `
      <h2>${title}</h2>
      <p>${content}</p>
      <footer>
        <span>By: ${author}</span>
        <span>${date}</span>
      </footer>
    `;

    postsContainer.appendChild(postElement);
  });
}

// Initialize the page
fetchPosts();
