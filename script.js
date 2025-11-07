const channel = "thesis-untitled";
const container = document.getElementById("posts");
const headerElement = document.querySelector("header");

fetch(`https://api.are.na/v2/channels/${channel}/contents`)
  .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
  .then(data => {
    const posts = data.contents.reverse();
    if (!posts.length) {
      container.innerHTML = "<p>No posts found in this channel.</p>";
      return;
    }

    posts.forEach(post => {
      const postBox = document.createElement("div");
      postBox.classList.add("post");

      // --- Text ---
      if (post.class === "Text" && post.content) {
        const p = document.createElement("p");
        p.textContent = post.content;
        p.dataset.orig = post.content;
        postBox.appendChild(p);
      }

      // --- Image ---
      if (post.image?.original?.url) {
        const link = document.createElement("a");
        link.href = post.image.original.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        const img = document.createElement("img");
        img.src = post.image.original.url;
        img.alt = post.title || "Arena image";
        link.appendChild(img);
        postBox.appendChild(link);
      }

      // --- Link ---
      if (post.class === "Link" && post.source?.url) {
        const link = document.createElement("a");
        link.href = post.source.url;
        link.textContent = post.title || post.source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        postBox.appendChild(link);
      }

      // --- Audio ---
      if (post.class === "Attachment" && post.attachment?.content_type.startsWith("audio")) {
        const audioContainer = document.createElement("div");
        audioContainer.classList.add("custom-audio");
        const audio = document.createElement("audio");
        audio.src = post.attachment.url;
        const playButton = document.createElement("div");
        playButton.classList.add("audio-button");
        playButton.textContent = "▶";
        const progressWrapper = document.createElement("div");
        progressWrapper.classList.add("audio-progress");
        const progressBar = document.createElement("div");
        progressBar.classList.add("audio-progress-bar");
        progressWrapper.appendChild(progressBar);

        playButton.addEventListener("click", () => {
          if (audio.paused) { audio.play(); playButton.textContent = "■"; }
          else { audio.pause(); playButton.textContent = "▶"; }
        });
        audio.addEventListener("timeupdate", () => {
          progressBar.style.width = `${(audio.currentTime/audio.duration)*100}%`;
        });
        audio.addEventListener("ended", () => {
          playButton.textContent = "▶"; progressBar.style.width = "0%";
        });

        audioContainer.appendChild(playButton);
        audioContainer.appendChild(progressWrapper);
        postBox.appendChild(audioContainer);
      }

      // --- PDF ---
      if (post.class === "Attachment" && post.attachment?.content_type === "application/pdf") {
        const link = document.createElement("a");
        link.href = post.attachment.url;
        link.textContent = post.title || "View PDF";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        postBox.appendChild(link);
      }

      // --- Video ---
      if (post.class === "Media" && post.embed?.html) {
        const wrapper = document.createElement("div");
        wrapper.innerHTML = post.embed.html;
        wrapper.querySelectorAll("iframe").forEach(iframe => {
          iframe.width = "100%"; iframe.height = "200";
        });
        postBox.appendChild(wrapper);
      }

      // --- Fallback link ---
      if (post.source?.url && !post.class.match(/(Link|Attachment|Media)/)) {
        const link = document.createElement("a");
        link.href = post.source.url;
        link.textContent = post.title || post.source.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        postBox.appendChild(link);
      }

      // --- User + timestamp ---
      const meta = document.createElement("p");
      const user = post.connected_user?.username || post.user?.username || "Unknown User";
      const time = post.created_at ? new Date(post.created_at).toLocaleString("en-US", {
        year: "numeric", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit"
      }) : "Unknown date";
      meta.innerHTML = `${user}<br>${time}`;
      meta.style.fontSize = "0.75rem"; meta.style.color = "#444";
      postBox.appendChild(meta);

      container.appendChild(postBox);
    });

    // --- Masonry Layout ---
    function layoutMasonry() {
      let columns = 5; const gap = 15;
      const containerWidth = container.clientWidth;
      if (window.innerWidth <= 600) columns = 2;
      else if (window.innerWidth <= 900) columns = 3;
      else if (window.innerWidth <= 1200) columns = 4;

      const colWidth = (containerWidth - gap*(columns-1))/columns;
      const colHeights = Array(columns).fill(0);

      Array.from(container.children).forEach(post => {
        post.style.width = colWidth + "px";
        const minCol = colHeights.indexOf(Math.min(...colHeights));
        post.style.transform = `translate(${(colWidth+gap)*minCol}px, ${colHeights[minCol]}px)`;
        post.dataset.origX = (colWidth+gap)*minCol;
        post.dataset.origY = colHeights[minCol];
        colHeights[minCol] += post.offsetHeight + gap;
      });
      container.style.height = Math.max(...colHeights) + "px";
    }

    layoutMasonry();
    window.addEventListener("resize", layoutMasonry);

    const allElements = document.querySelectorAll(".post, .post p, .post a, header");

    // --- Stage 1: First 10s normal ---
    setTimeout(() => {
      let hue = 0;
      let sat = 50;
      let light = 90;

      const stage1 = setInterval(() => {
        hue = (hue + 0.2) % 360;
        document.body.style.background = `linear-gradient(120deg,
          hsl(${hue},${sat}%,${light}%),
          hsl(${(hue+90)%360},${sat+20}%,${light-20}%))`;
      }, 100);

      // --- Stage 2: Trippy, vivid evolution ---
      setTimeout(() => {
        let frame = 0;
        const stage2 = setInterval(() => {
          frame++;

          // Bold, vibrant, moving background
          const hue1 = (frame * 2) % 360;
          const hue2 = (frame * 3 + 120) % 360;
          document.body.style.background = `
            linear-gradient(${frame % 360}deg,
              hsl(${hue1},100%,45%),
              hsl(${hue2},90%,50%),
              hsl(${(hue1+180)%360},80%,40%)
            )`;

          // Keep posts visible — add subtle glowing outlines
          container.querySelectorAll(".post").forEach(post => {
            const styles = ['solid','dashed','double','ridge'];
            const borderColor = `hsl(${Math.random()*360},100%,60%)`;
            post.style.border = `2px ${styles[Math.floor(Math.random()*styles.length)]} ${borderColor}`;
            post.style.boxShadow = `0 0 20px ${borderColor}`;
            post.style.backgroundColor = "rgba(255,255,255,0.9)";
            post.style.filter = `contrast(1.2) brightness(1.1)`;
          });

          // Images stay crisp
          document.querySelectorAll('.post img').forEach(img => {
            img.style.filter = `hue-rotate(${frame}deg) saturate(1.5)`;
          });

          // Word-by-word hover glitch
          allElements.forEach(el => {
            if (el.matches('p,a')) {
              const words = el.dataset.orig ? el.dataset.orig.split(' ') : [];
              if (el.matches(':hover')) {
                const newWords = words.map(word => {
                  if (Math.random() < 0.3) {
                    return word.split('').map(() => 
                      String.fromCharCode(33 + Math.floor(Math.random() * 94))
                    ).join('');
                  } else return word;
                });
                el.textContent = newWords.join(' ');
              } else if (el.dataset.orig) {
                el.textContent = el.dataset.orig;
              }
            }
          });

          // Gradual motion later on
          if (frame > 3000) {
            container.querySelectorAll(".post").forEach(post => {
              const dx = Math.sin((frame + parseFloat(post.dataset.origX || 0)) / 50) * 5;
              const dy = Math.cos((frame + parseFloat(post.dataset.origY || 0)) / 40) * 5;
              post.style.transform = `translate(${parseFloat(post.dataset.origX)+dx}px, ${parseFloat(post.dataset.origY)+dy}px) rotate(${Math.sin(frame/100)*2}deg)`;
            });
          }

        }, 70);
      }, 30000);

    }, 10000);
  })
  .catch(err => { 
    container.innerHTML = `<p>Unable to load posts: ${err}</p>`; 
  });
