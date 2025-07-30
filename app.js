// Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGN7t5FjDeJ-ewm7S_9z0VJrRSggTaJ2Q",
  authDomain: "coin-base-by-hector.firebaseapp.com",
  projectId: "coin-base-by-hector",
  storageBucket: "coin-base-by-hector.appspot.com",
  messagingSenderId: "398789890422",
  appId: "1:398789890422:web:ed6a928037b24be2e36a57"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const emailEl = document.getElementById("email");
const passwordEl = document.getElementById("password");
const authBox = document.getElementById("auth");
const postInput = document.getElementById("postInput");
const postsDiv = document.getElementById("posts");
const myPostsDiv = document.getElementById("myPosts");

let currentUser = null;

// NAVIGATION
function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.getElementById(page).classList.remove("hidden");

  if (page === "home") loadPosts();
  if (page === "profile") loadMyPosts();
}

// AUTH
function login() {
  signInWithEmailAndPassword(auth, emailEl.value, passwordEl.value)
    .then(() => console.log("Logged in"))
    .catch(err => alert(err.message));
}

function register() {
  createUserWithEmailAndPassword(auth, emailEl.value, passwordEl.value)
    .then(() => console.log("Registered"))
    .catch(err => alert(err.message));
}

function logout() {
  signOut(auth);
}

onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    authBox.style.display = "none";
    document.getElementById("nav").style.display = "block";
    navigate("home");
  } else {
    currentUser = null;
    authBox.style.display = "block";
    document.getElementById("nav").style.display = "none";
    navigate("auth");
  }
});

// POSTING
window.createPost = async function () {
  const content = postInput.value.trim();
  if (!content) return;

  await addDoc(collection(db, "posts"), {
    content,
    uid: currentUser.uid,
    email: currentUser.email,
    likes: 0,
    createdAt: serverTimestamp()
  });

  postInput.value = "";
  loadPosts();
}

// LOAD ALL POSTS
async function loadPosts() {
  postsDiv.innerHTML = "Loading...";
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  postsDiv.innerHTML = "";
  snap.forEach(docSnap => {
    const post = docSnap.data();
    const id = docSnap.id;
    postsDiv.innerHTML += `
      <div class="post">
        <b>${post.email}</b>
        <p>${post.content}</p>
        <small>${post.likes} likes</small>
        <span class="like-btn" onclick="likePost('${id}', ${post.likes})">❤️ Like</span>
      </div>
    `;
  });
}

// LIKE
window.likePost = async function (id, likes) {
  const ref = doc(db, "posts", id);
  await updateDoc(ref, { likes: likes + 1 });
  loadPosts();
}

// LOAD MY POSTS
async function loadMyPosts() {
  myPostsDiv.innerHTML = "Loading...";
  const q = query(
    collection(db, "posts"),
    where("uid", "==", currentUser.uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  myPostsDiv.innerHTML = "";

  snap.forEach(docSnap => {
    const post = docSnap.data();
    myPostsDiv.innerHTML += `
      <div class="post">
        <p>${post.content}</p>
        <small>${post.likes} likes</small>
      </div>
    `;
  });
}
