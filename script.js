const channel = "thesis-untitled"; // Updated channel slug

// Fetch content from the Are.na channel
fetch(`https://api.are.na/v2/channels/${channel}/contents`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log("API Response:", data); // Debugging
        const posts = data.contents.reverse(); // Show newest first

        const contentContainer = document.getElementById("posts");

        if (posts.length === 0) {
            contentContainer.innerHTML = "<p>No posts found in this channel.</p>";
            return;
        }

        posts.forEach(post => {
            const postBox = document.createElement("div");
            postBox.classList.add("post");

            // Text blocks
            if (post.class === "Text" && post.content) {
                const textElement = document.createElement("p");
                textElement.textContent = post.content;
                postBox.appendChild(textElement);
            }

            // Image blocks
            if (post.image && post.image.original && post.image.original.url) {
                const imgElement = document.createElement("img");
                imgElement.src = post.image.original.url;
                imgElement.alt = post.title || "Arena image";
                postBox.appendChild(imgElement);
            }

            // Link blocks
            if (post.class === "Link" && post.source && post.source.url) {
                const linkElement = document.createElement("a");
                linkElement.href = post.source.url;
                linkElement.textContent = post.title || post.source.url;
                linkElement.target = "_blank";
                linkElement.rel = "noopener noreferrer";
                postBox.appendChild(linkElement);
            }

            // Posted by
            const usernameElement = document.createElement("p");
            usernameElement.classList.add("posted-by");
            const author = post.connected_user?.username || post.user?.username || "Unknown User";
            usernameElement.textContent = `Posted by: ${author}`;
            usernameElement.style.fontSize = "0.8rem";
            usernameElement.style.color = "#555";
            postBox.appendChild(usernameElement);

            contentContainer.appendChild(postBox);
        });
    })
    .catch(error => {
        console.error('Fetch error:', error);
        document.getElementById("posts").innerHTML = `<p>Unable to load posts: ${error.message}</p>`;
    });
