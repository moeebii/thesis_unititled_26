const channel = "thesis-untitled";
const container = document.getElementById("posts");
const headerElement = document.querySelector("header");

// --- Fetch posts ---
fetch(`https://api.are.na/v2/channels/${channel}/contents`)
  .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
  .then(data => {
    const posts = data.contents.reverse();
    if (!posts.length) {
      container.innerHTML = "<p>No posts found in this channel.</p>";
      return;
    }

    // --- Append posts ---
    posts.forEach(post => {
      const postBox = document.createElement("div");
      postBox.classList.add("post");

      // --- Text ---
      if (post.class === "Text" && post.content) {
        const p = document.createElement("p");
        p.textContent = post.content;
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
      meta.style.fontSize = "0.75rem"; meta.style.color = "#555";
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
        post.dataset.originalX = (colWidth+gap)*minCol;
        post.dataset.originalY = colHeights[minCol];
        colHeights[minCol] += post.offsetHeight + gap;
      });
      container.style.height = Math.max(...colHeights) + "px";
    }

    layoutMasonry();
    window.addEventListener("resize", layoutMasonry);

    const allElements = document.querySelectorAll(".post, .post p, .post a, header");

    // --- Stage 1: Initial 10s normal, then slow natural color fade ---
    setTimeout(() => {
      let hue = 0;
      const stage1 = setInterval(() => {
        hue = (hue + 0.02) % 360;
        document.body.style.backgroundColor = `hsl(${hue},50%,95%)`;
        headerElement.style.color = `hsl(${(hue+180)%360},20%,10%)`;
        allElements.forEach(el => el.style.color = `hsl(${(hue+180)%360},20%,10%)`);
        document.querySelectorAll('.post img').forEach(img => {
          img.style.filter = `invert(1) hue-rotate(${hue}deg)`;
        });
      }, 100);
      setTimeout(() => clearInterval(stage1), 30000);
    }, 10000);

    // --- Stage 2: Sharp metallic text ---
    setTimeout(() => {
      allElements.forEach(el => {
        if (!el.classList.contains('sharp-text-metal')) el.classList.add('sharp-text-metal');
        const text = el.textContent;
        el.textContent = '';
        text.split('').forEach((char, idx) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.dataset.orig = char; // store original char
          el.appendChild(span);
        });
      });
    }, 30000);

    // --- Stage 3: Experimental chaos / flicker / kinetic ---
    setTimeout(() => {
      let frameCount = 0;
      const mouse = {x: window.innerWidth/2, y: window.innerHeight/2};

      window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });

      setInterval(() => {
        frameCount++;

        // Borders & shadows
        container.querySelectorAll(".post").forEach(post => {
          const styles = ['solid','dashed','dotted','double','groove','ridge'];
          const width = Math.floor(Math.random()*4+1);
          const color = `hsl(${Math.random()*360},80%,50%)`;
          post.style.border = `${width}px ${styles[Math.floor(Math.random()*styles.length)]} ${color}`;
          post.style.boxShadow = `${Math.floor(Math.random()*20-10)}px ${Math.floor(Math.random()*20-10)}px ${Math.floor(Math.random()*30)}px ${color}`;
        });

        // Background flicker
        const hue = Math.random()*360;
        document.body.style.backgroundColor = `hsl(${hue},60%,15%)`;

        // Pixelation / filter
        document.body.style.filter = `contrast(${1 + Math.random()}) saturate(${1 + Math.random()}) blur(${Math.random()*2}px)`;

        // --- Kinetic movement after 3 min ---
        if(frameCount > 2500){
          container.querySelectorAll(".post").forEach(post => {
            let dx = (Math.random()-0.5)*10 + (mouse.x - (parseFloat(post.dataset.originalX)||0))/200;
            let dy = (Math.random()-0.5)*10 + (mouse.y - (parseFloat(post.dataset.originalY)||0))/200;
            post.style.transform = `translate(${(parseFloat(post.dataset.originalX)||0)+dx}px, ${(parseFloat(post.dataset.originalY)||0)+dy}px) rotate(${Math.random()*10-5}deg)`;
          });
        }

        // After 5 min, extreme chaos
        if(frameCount > 5000){
          container.querySelectorAll(".post, .post p, .post a").forEach(el => {
            el.style.transform += ` rotate(${Math.random()*30-15}deg) scale(${1+Math.random()})`;
            el.style.textShadow = `${Math.random()*15-7}px ${Math.random()*15-7}px 3px hsl(${Math.random()*360},100%,50%)`;
          });
        }

      }, 70);

    }, 40000);

    // --- Hover: gradual random char morph ---
    allElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        const spans = Array.from(el.querySelectorAll('span'));
        spans.forEach((span, idx) => {
          const interval = setInterval(() => {
            span.textContent = String.fromCharCode(33 + Math.floor(Math.random()*94));
          }, 30 + Math.random()*50);
          span.dataset.randInterval = interval;
        });
      });

      el.addEventListener('mouseleave', () => {
        const spans = Array.from(el.querySelectorAll('span'));
        spans.forEach(span => {
          clearInterval(span.dataset.randInterval);
          span.textContent = span.dataset.orig;
        });
      });
    });

  })
  .catch(err => { 
    container.innerHTML = `<p>Unable to load posts: ${err}</p>`; 
  });
