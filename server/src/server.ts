import express from "express";
import cors from "cors";

const app = express();
app.use(
  cors((req, callback) => {
    callback(null, {
      origin: req.header("Origin") === "http://localhost:3000",
    });
  })
);
app.use(express.json());

const port = 3001;

type Post = {
  id: number;
  title: string;
};

const posts: Post[] = [];

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/post", (req, res) => {
  posts.push({
    ...req.body,
    id: posts.length + 1,
  });
  res.send(posts);
});

app.listen(port, () => {
  return console.log(
    `Express server is listening at http://localhost:${port} 🚀`
  );
});
