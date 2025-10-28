const postsContainer = document.getElementById('posts');

// Replace with your Arena channel handle
const channelId = 'moe-ebii/thesis-untitled';

// Fetch blocks from Arena
async function fetchArenaBlocks() {
  try {
    const response = await fetch(`https://api.are.na/v2/channels/${channelId}/blocks`);
    const data = await response.json();

    // Sort blocks reverse chronological
    const sortedBlocks = data.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    sortedBlocks.forEach(block => {
      const postElement = document.createElement('div');
      postElement.classList.add('post');

      const title = block.title || 'Untitled';
      const content = block.content || block.embed?.html || 'No content provided';
      const author = block.user?.name || 'Anonymous';
      const date = new Date(block.created_at).toLocaleDateString();

      postElement.innerHTML = `
        <h2>${title}</h2>
        <p>${content}</p>
        <footer>
          <span>${author}</span>
          <span>${date}</span>
        </footer>
      `;

      postsContainer.appendChild(postElement);
    });

  } catch (err) {
    console.error('Error fetching Arena blocks:', err);
    postsContainer.innerHTML = '<p>Unable to load posts at this time.</p>';
  }
}

// Initialize
fetchArenaBlocks();
