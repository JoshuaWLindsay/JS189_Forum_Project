const express = require("express"); // Routing Engine
const morgan = require("morgan"); // Console logging
// constants session & store provide ability to store session data & cookies
const session = require("express-session");
// express-validator validates and sanitizes user-supplied data
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");
const flash = require("express-flash"); // Error & situational messages
const favicon = require("express-favicon"); // Browser tab icon
const PgPersistence = require("./lib/pg-persistence"); // PostgreSQL object
const catchError = require("./lib/catch-error");

// Creates `app` object for enabling use of HTTP methods for routing
const app = express();
const LokiStore = store(session); // Creates new object for session store
const host = "localhost";
const port = 3000;

app.set("views", "./views"); // Sets to find view templates from view folder
app.set("view engine", "pug"); // Sets view engine to Pug

app.use(morgan("common")); // Console logs info regarding HTTP methods
app.use(express.static("public")); // Tells app where to find static assets
// parses HTTP req.body object
app.use(express.urlencoded({ extended: false }));
app.use(favicon('public/images/favicon.ico'));
app.use(session({
  cookie: {
    // security-related; true for sensitive cookies: unalterable
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
    path: "/", // applies to all paths including "/" (i.e. everything)
    secure: false, // `true` requires HTTPS
  },
  name: "holy-conferences-forum-session-id", // unique name relative to server
  resave: false, // false since session store should not expire data
  saveUninitialized: true, // set to false when requiring cookie permissions
  secret: "this is not very secure", // used to sign and encrypt cookie
  store: new LokiStore({}), // defines data store used
}));
app.use(flash()); // Tell express to use flash for error & situational messages

// Create a new datastore
app.use((req, res, next) => {
  res.locals.store = new PgPersistence(req.session);
  next();
});

// Extract session info; uses local storage to pass flash messages onto another
// middleware function that renders a view
app.use((req, res, next) => {
  res.locals.username = req.session.username;
  res.locals.signedIn = req.session.signedIn;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// Detect unauthorized access to routes.
const requiresAuthentication = (req, res, next) => {
  if (!res.locals.signedIn) {
    req.session.originalUrl = req.originalUrl;
    res.redirect(302, "/signin");
  } else {
    next();
  }
};

// Redirect for root
app.get("/", (req, res) => {
  res.redirect("/churches/page/1");
});

// Render list of churches
app.get("/churches/page/:number", 
  requiresAuthentication,
  catchError(async (req, res) => {
    let currentPage = +req.params.number;

    let churchPages = await res.locals.store.churchPages();
    let pageArray = [1];
    for (let index = 2; index <= churchPages; index++) pageArray.push(index);

    if (currentPage > churchPages || currentPage < 1 || 
      !Number.isInteger(currentPage)) {
      let churches = await res.locals.store.churches(1);

      req.flash("danger", `Page ${req.params.number} does not exist.`);
      res.render("churches", {
        flash: req.flash(),
        churches,
        currentPage: 1,
        pageArray,
      });
    } else {
      let churches = await res.locals.store.churches(currentPage);

      res.render("churches", {
        churches,
        currentPage,
        pageArray,
      });  
    }
  })
);

// Render list of sermon series for a particular church
app.get("/churches/:churchName/series/page/:number",
  requiresAuthentication,
  catchError(async (req, res) => {
    let churchName = req.params.churchName;
    let currentPage = +req.params.number;

    let seriesPages = await res.locals.store.seriesPages(churchName);
    let pageArray = [1];
    for (let index = 2; index <= seriesPages; index++) pageArray.push(index);
    
    let church = await res.locals.store.church(churchName);

    if (currentPage > seriesPages || currentPage < 1 || 
      !Number.isInteger(currentPage)) {
      let churchSeries = await res.locals.store.churchSeries(church.id, 1);

      req.flash("danger", `Page ${req.params.number} does not exist.`);
      res.render("church", {
        flash: req.flash(),
        churchName,
        currentPage: 1,
        churchSeries,
        pageArray,
      });
    } else {
      let churchSeries = await res.locals.store.churchSeries(church.id, 
        currentPage);
  
      res.render("church", {
        churchName,
        currentPage,
        churchSeries,
        pageArray,
      });
    }
  })
);

// Renders a list of sermons from a church's sermon series
app.get("/churches/:churchName/series/:seriesName/sermons/page/:number", 
  requiresAuthentication,
  catchError(async (req, res) => {
    let { churchName, seriesName } = { ...req.params };
    let currentPage = +req.params.number;

    let church = await res.locals.store.church(churchName);
    let sermonPages = await res.locals.store.sermonPages(churchName, 
      seriesName);
    let pageArray = [1];
    for (let index = 2; index <= sermonPages; index++) pageArray.push(index);

    if (currentPage > sermonPages || currentPage < 1 || 
      !Number.isInteger(currentPage)) {
      let seriesSermons = await res.locals.store.seriesSermons(church.id, 
      seriesName, 1);

      req.flash("danger", `Page ${req.params.number} does not exist.`);
      res.render("seriesSermons", {
        flash: req.flash(),
        churchName,
        seriesName,
        currentPage: 1,
        pageArray,
        seriesSermons,
      });
    } else {
      let seriesSermons = await res.locals.store.seriesSermons(church.id, 
        seriesName, currentPage);
  
      res.render("seriesSermons", {
        churchName,
        seriesName,
        currentPage,
        pageArray,
        seriesSermons,
      });  
    }
  })
);

// Renders threads for a particular sermon
app.get("/churches/:churchName/series/:seriesName/sermons/:sermonName" + 
        "/threads/page/:number", 
  requiresAuthentication,
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName } = { ...req.params };
    let currentPage = +req.params.number;

    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);

    let threadPages = await res.locals.store.threadPages(sermon.id);
    let pageArray = [1];
    for (let index = 2; index <= threadPages; index++) pageArray.push(index);

    if (currentPage > threadPages || currentPage < 1 || 
      !Number.isInteger(currentPage)) {
      let threads = await res.locals.store.threads(sermon.id, 1);

      req.flash("danger", `Page ${req.params.number} does not exist.`);
      res.render("sermonThreads", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        currentPage: 1,
        sermon,
        threads,
        pageArray,
      });
    } else {
      let threads = await res.locals.store.threads(sermon.id, currentPage);

      res.render("sermonThreads", {
        churchName,
        seriesName,
        sermonName,
        currentPage,
        sermon,
        threads,
        pageArray,
      });        
    }
  })
);

// Creates new thread for particular sermon
app.post("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
         "/threads/page/:number/newThread",
  requiresAuthentication,
  [
    body("sermonThreadName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Group Name requires one or more characters.")
      .isLength({ max: 100 })
      .withMessage("Group Name must be between 1 and 100 characters."),
    body("sermonThreadPrompt")
      .isLength({ max: 1000 })
      .withMessage("Prompt must be between 1 and 1000 characters."),
  ],
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName } = { ...req.params };
    let currentPage = +req.params.number;
    let { sermonThreadName, sermonThreadPrompt } = { ...req.body };

    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);

    let threadPages = await res.locals.store.threadPages(sermon.id);
    let pageArray = [1];
    for (let index = 2; index <= threadPages; index++) pageArray.push(index);

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("danger", message.msg));

      let threads = await res.locals.store.threads(sermon.id, currentPage);

      res.render("sermonThreads", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        currentPage,
        sermon,
        threads,
        pageArray,
        sermonThreadName,
        sermonThreadPrompt,
      });
    } else {
      let created = await res.locals.store.createThread(sermonThreadName, 
        sermonThreadPrompt, sermon.id);
      if (!created) throw new Error("Not found.");

      let newThreadId = await res.locals.store.newThreadId(sermonThreadName, 
        sermon.id);

      req.flash("success", "Your thread has been created!");
      res.redirect(`/churches/${churchName}/series/${seriesName}` +
                   `/sermons/${sermonName}/threads/${newThreadId}/page/1`);
    }
  })
);

// Renders forum thread
app.get("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
        "/threads/:threadId/page/:number", 
  requiresAuthentication,
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId } = { ...req.params };
    let currentPage = +req.params.number;
    let username = req.session.username;
  
    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);

    let thread = await res.locals.store.thread(sermon.id, threadId);    
    if (!thread) {
      let threads = await res.locals.store.threads(sermon.id, 1);
      let threadPages = await res.locals.store.threadPages(sermon.id);
      let pageArray = [1];
      for (let index = 2; index <= threadPages; index++) pageArray.push(index);

      req.flash("danger", `Thread does not exist. Choose from threads below.`);
      res.render("sermonThreads", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        currentPage: 1,
        sermon,
        threads,
        pageArray,
      });
    }

    let postPages = await res.locals.store.postPages(thread.id);
    let pageArray = [1];
    for (let index = 2; index <= postPages; index++) pageArray.push(index);
    
    if (currentPage > postPages || currentPage < 1 || 
      !Number.isInteger(currentPage)) {
      let posts = await res.locals.store.posts(thread.id, 1);

      req.flash("danger", `Page ${req.params.number} does not exist.`);
      res.render("thread", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        threadId,
        currentPage: 1,
        username,
        sermon,
        thread,
        posts,
        pageArray,
      });
    } else {
      let posts = await res.locals.store.posts(thread.id, currentPage);

      res.render("thread", {
        churchName,
        seriesName,
        sermonName,
        threadId,
        currentPage,
        username,
        sermon,
        thread,
        posts,
        pageArray,
      });
    }
  })
);

// Render edit page for thread
app.get("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
        "/threads/:threadId/editThread", 
  requiresAuthentication,
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId } = { ...req.params };
    let username = req.session.username;

    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);

    let thread = await res.locals.store.thread(sermon.id, threadId);
    if (!thread) {
      let threads = await res.locals.store.threads(sermon.id, 1);
      let threadPages = await res.locals.store.threadPages(sermon.id);
      let pageArray = [1];
      for (let index = 2; index <= threadPages; index++) pageArray.push(index);

      req.flash("danger", `Thread does not exist. Choose from threads below.`);
      res.render("sermonThreads", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        currentPage: 1,
        sermon,
        threads,
        pageArray,
      });
    }

    res.render("threadEdit", {
      churchName,
      seriesName,
      sermonName,
      threadId,
      username,
      sermon,
      thread,
    });
  })
);

// Edit thread for particular sermon
app.post("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
         "/threads/:threadId/editThread",
  requiresAuthentication,
  [
    body("sermonThreadName")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Group Name requires one or more characters.")
      .isLength({ max: 100 })
      .withMessage("Group Name must be between 1 and 100 characters."),
    body("sermonThreadPrompt")
      .isLength({ max: 1000 })
      .withMessage("Prompt must be between 1 and 1000 characters."),
  ],
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId } = { ...req.params };
    let { sermonThreadName, sermonThreadPrompt } = { ...req.body };
    let username = req.session.username;

    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);
    let thread = await res.locals.store.thread(sermon.id, threadId);

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("danger", message.msg));

      res.render("threadEdit", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        threadId,
        username,  
        sermon,
        thread,
        sermonThreadName,
        sermonThreadPrompt
      });
    } else {
      let edited = await res.locals.store.editThread(sermonThreadName, 
        sermonThreadPrompt, threadId);
      if (!edited) throw new Error("Not found.");

      req.flash("success", "Your thread has been edited.");
      res.redirect(`/churches/${churchName}/series/${seriesName}` +
                   `/sermons/${sermonName}/threads/${threadId}/page/1`);  
    }
  })
);

// Delete thread for particular sermon
app.post("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
         "/threads/:threadId/deleteThread",
  requiresAuthentication,
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId } = { ...req.params };

    let deletedThread = await res.locals.store.deleteThread(threadId);
    if (!deletedThread) throw new Error("Not found.");

    req.flash("success", "Your thread has been deleted.");
    res.redirect(`/churches/${churchName}/series/${seriesName}` +
                 `/sermons/${sermonName}/threads/page/1`);
  })
);

// Create new post in sermon thread
app.post("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
         "/threads/:threadId/page/:number/post", 
  requiresAuthentication,
  [
    body("postContent")
      .isLength({ min: 1 })
      .withMessage("Post requires one or more characters.")
      .isLength({ max: 1000 })
      .withMessage("Post must be between 1 and 1000 characters."),
  ],
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId } = { ...req.params };
    let currentPage = +req.params.number;

    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);
    let thread = await res.locals.store.thread(sermon.id, threadId);
    let posts = await res.locals.store.posts(thread.id, currentPage);
    let postContent = req.body.postContent;

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("danger", message.msg));

      res.render("thread", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        threadId,
        currentPage,
        sermon,
        thread,
        posts,
      });
    } else {
      let created = await res.locals.store.createPost(postContent, thread.id);
      if (!created) throw new Error("Not found.");

      req.flash("success", "Your comment has been posted.");
      res.redirect('back');  
    }
  })
);

// Render edit page for post
app.get("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
        "/threads/:threadId/editPost/:postId", 
  requiresAuthentication,
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId, postId } = 
      { ...req.params };
    let username = req.session.username;

    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);

    let thread = await res.locals.store.thread(sermon.id, threadId);
    if (!thread) {
      let threads = await res.locals.store.threads(sermon.id, 1);
      let threadPages = await res.locals.store.threadPages(sermon.id);
      let pageArray = [1];
      for (let index = 2; index <= threadPages; index++) pageArray.push(index);

      req.flash("danger", `Thread does not exist. Choose from threads below.`);
      res.render("sermonThreads", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        currentPage: 1,
        sermon,
        threads,
        pageArray,
      });
    }

    let post = await res.locals.store.post(postId);

    res.render("threadPostEdit", {
      churchName,
      seriesName,
      sermonName,
      threadId,
      postId,
      username,
      sermon,
      thread,
      post,
    });
  })
);

// Edit post in sermon thread
app.post("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
         "/threads/:threadId/page/:number/editPost/:postId", 
  requiresAuthentication,
  [
    body("postContent")
      .isLength({ min: 1 })
      .withMessage("Post requires one or more characters.")
      .isLength({ max: 1000 })
      .withMessage("Post must be between 1 and 1000 characters."),
  ],
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId, postId } = 
      { ...req.params };
    let username = req.session.username;
    let postContent = req.body.postContent;

    let church = await res.locals.store.church(churchName);
    let sermon = await res.locals.store.sermon(church.id, seriesName, 
      sermonName);
    let thread = await res.locals.store.thread(sermon.id, threadId);
    let post = await res.locals.store.post(postId);

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("danger", message.msg));

      res.render("threadPostEdit", {
        flash: req.flash(),
        churchName,
        seriesName,
        sermonName,
        threadId,
        postId,
        username,
        sermon,
        thread,
        post,
      });
    } else {
      let edited = await res.locals.store.editPost(postContent, thread.id, 
        post.id);
      if (!edited) throw new Error("Not found.");

      req.flash("success", "Your comment has been edited.");
      res.redirect(`/churches/${churchName}/series/${seriesName}/sermons` +
                   `/${sermonName}/threads/${threadId}/page/1`);
    }
  })
);

// Delete post from sermon thread
app.post("/churches/:churchName/series/:seriesName/sermons/:sermonName" +
         "/threads/:threadId/deletePost/:postId",
  requiresAuthentication,
  catchError(async (req, res) => {
    let { churchName, seriesName, sermonName, threadId, postId } = 
      { ...req.params };

    let deletedPost = await res.locals.store.deletePost(postId);
    if (!deletedPost) throw new Error("Not found.");

    req.flash("success", "Your post has been deleted.");
    res.redirect(`/churches/${churchName}/series/${seriesName}` +
                 `/sermons/${sermonName}/threads/${threadId}/page/1`);
  })
);

// Route to Sign In page
app.get("/signin", (req, res) => {
  req.flash("info", "Please sign in.");
  res.render("signin", {
    flash: req.flash(),
  });
});

// Handle Sign In form submission
app.post("/signin", 
  catchError(async (req, res) => {
    let username = req.body.username.trim();
    let password = req.body.password;

    let authenticated = await res.locals.store
      .authenticateUser(username, password);
    if (!authenticated) {
      req.flash("danger", "Invalid credentials.");
      res.render("signin", {
        flash: req.flash(),
        username: req.body.username,
      });
    } else {
      req.session.username = username;
      req.session.signedIn = true;
      req.flash("info", "Welcome!");
      if (!req.session.originalUrl) res.redirect("/churches/page/1");
      else res.redirect(req.session.originalUrl);
  }
})
);

// Handle Sign Out
app.post("/signout", (req, res) => {
  delete req.session.username;
  delete req.session.signedIn;
  delete req.session.originalUrl;
  res.redirect("/signin");
});

// Error handler
app.use((err, req, res, _next) => {
  console.log(err);
  res.status(404).send(err.message);
});

// Listener provides security by only listening for connections from the
// specified host
app.listen(port, host, () => {
  console.log(`Forum is listening on port ${port} of ${host}!`);
});