const API_URL = "http://localhost:3001";

async function showPosts() {
  const postsContainer = document.querySelector("#posts");
  postsContainer.innerHTML = "";

  try {
    const res = await fetch(`${API_URL}/posts`);
    const data = await res.json();
    const postsList = document.createElement("ul");

    data.forEach((post) => {
      const postElement = document.createElement("li");
      postElement.textContent = post.title;
      postsList.append(postElement);
    });

    postsContainer.append(postsList);
  } catch (error) {
    console.error(error);
    postsContainer.textContent = "Error retrieving posts!";
  }
}

function initAddPostForm() {
  const form = document.querySelector("form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameInput = form.elements.name;

    if (nameInput.value.trim().length === 0) {
      alert("Post Name is required!");
      return;
    }

    const swRegistration = await navigator.serviceWorker.ready;
    const isOffline = !window.navigator.onLine;
    try {
      if (isOffline) throw new Error("Offline!");
      await fetch(`${API_URL}/post`, {
        method: "post",
        body: JSON.stringify({ title: nameInput.value }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (isOffline) {
        await saveOfflinePost(nameInput.value);
        swRegistration.sync.register("addOfflinePosts");
        alert(
          "You are currently offline! The post will be added as soon as your connection is restored!"
        );
        return;
      }

      console.log(error);
      alert("Error when adding post!");
    } finally {
      nameInput.value = "";
    }

    showPosts();
  });
}

async function saveOfflinePost(postName) {
  const prevPosts = (await idbKeyval.get("offlinePosts")) || [];
  await idbKeyval.set("offlinePosts", [...prevPosts, postName]);
}

function initSW() {
  navigator.serviceWorker.register("/sw.js");
  navigator.serviceWorker.addEventListener("message", async (event) => {
    if (event.data.type === "NEW_POSTS") {
      await showPosts();
      setTimeout(() => {
        alert("We have successfully synced your added posts!");
      }, 1000);
    }
  });
}

initSW();
showPosts();
initAddPostForm();
