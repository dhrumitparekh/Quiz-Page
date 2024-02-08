const express = require('express');
const QuizData = require("./modules/QuestionAnswer");
const path = require('path');
const Data = express();
Data.use(express.static('public'));
const bodyParser = require('body-parser');
Data.use(express.urlencoded({ extended: true }));
const authData = require('./modules/auth-service');
const clientSessions = require('client-sessions');
Data.set('view engine', 'ejs');
const HTTP_PORT = 8080;

Data.use(bodyParser())

authData.initialize()
.then(QuizData.Initialize())
.then(function(){
Data.listen(HTTP_PORT, function(){
console.log(`Data listening on: ${HTTP_PORT}`);
});
}).catch(function(err){
console.log(`unable to start server: ${err}`);
});

Data.use((req, res, next) => {
Data.locals.currentRoute = req.path;
next();
});

Data.use(
clientSessions({
cookieName: 'session',
secret: 'your-secret-key',
duration: 24 * 60 * 60 * 1000,
activeDuration: 5 * 60 * 1000,
})
);

Data.use((req, res, next) => {
res.locals.session = req.session;
next();
});

Data.get('/', (req, res) => {
try {
let errorMessage = '';
res.render('home', { errorMessage });
} catch (error) {
res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` })
}
})

Data.post('/', async (req, res) => {
try {
const { userName, password } = req.body;
const userAgent = req.get('User-Agent');
console.log(userName, password, userAgent);
let user = await authData.checkUser(userName, password, userAgent);
if (user == 404) return res.render('home', { errorMessage: "User not fount" })
if (user == 400) return res.render('home', { errorMessage: "Password not match" })
req.session.user = user;
res.redirect('/questions');
} catch (error) {
res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` })
}
})

const ensureLogin = (req, res, next) => {
if (!req.session.user) {
res.redirect('/');
} else {
next();
}
};

const isAdmin = (req, res, next) => {
const user = req.session.user;

if (user && user.role === 'admin') {
next();
} else {
res.status(500).render('500', { message: 'Admin Access Required' });
}
};

Data.get('/logout', (req, res) => {
req.session.reset();
res.redirect('/');
});

Data.get('/about', (req, res) => {
res.render("about");
});

Data.get('/questions',ensureLogin,async (req, res) => {
const QuestType = req.query.type;
try {
if (QuestType) {
const quest = await QuizData.getQuestionsByType(QuestType);
res.render('mainpage', { quest });
} else {
const allQuestions = await QuizData.getAllQuestions();

res.render('mainpage', { quest: allQuestions });
}
} catch (error) {
res.status(404).render('mainpage', { error: error.message });
}
});


Data.get("/TypePage",ensureLogin,async (req, res) => {
try {
const Type = await QuizData.getAllTypes();
res.render("questpage", { Type });
} catch (err) {
res.render("404", { message: `Error: ${err.message}` });
}
});

Data.get('/questions/get_Question/:id',ensureLogin,async(req, res) => {
const Questid = req.params.id;
try{
const questions = await QuizData.getQuestionsById(Questid);
res.render("questId",{questions});
}catch(error){
res.render("404", { message: `Error: ${error.message}` });
}
});
Data.get('/questions/deleteQuestions/:id',ensureLogin,isAdmin,async (req, res) => {
try {
await QuizData.deleteQuestion(req.params.id);
res.redirect('/questions');
} catch (err) {
res.status(500).render('500', { message: `Error: ${err}` });
}
});

Data.get('/deleteType/:id', ensureLogin,isAdmin, async (req, res) => {
try {
const typeId = req.params.id;
await QuizData.deleteType(typeId);
res.redirect('/TypePage');
} catch (error) {
console.error(error);
res.status(500).render('500', { message: `Error: ${error}` });
}
});

Data.get('/addType', ensureLogin,isAdmin, (req, res) => {
try {
res.render('addType');
} catch (error) {
res.status(500).render('500', { message: `Error: ${error}` });
}
});

Data.post('/addType', ensureLogin,isAdmin, async (req, res) => {
try {
const newType = {
type_id: req.body.type_id,
qtype: req.body.qtype,
Img: req.body.Img,
};

await QuizData.addType(newType);

res.redirect('/TypePage');
} catch (error) {
console.error(error);
res.status(400).render('addType', { errorMessage: error });
}
});

Data.get("/questions/addQuestion",ensureLogin,isAdmin,async (req, res) => {
try {
const Types = await QuizData.getAllTypes();
res.render("addQuestions", { Types });
} catch (err) {
res.render("404", { message: `Error: ${err.message}` });
}
});

Data.post('/questions/addQuestion',ensureLogin,async (req, res) => {
try {

await QuizData.addQuestion(req.body);
res.redirect('/questions');
} catch (err) {
console.log(err);
res.render("404", { message: `Error: ${err}` });
}
});

Data.get('/questions/editQuestion/:id',ensureLogin,isAdmin,async (req, res) => {
try {
const Quests = await QuizData.getQuestionsById(req.params.id);
const Types = await QuizData.getAllTypes();
res.render('editQuestions', { Quests, Types });
} catch (err) {
res.status(404).render('404', { message: err.message });
}
});


Data.post('/questions/editQuestion',ensureLogin,isAdmin,async (req, res) => {
try {
const queID = req.body.id;
const updatedData = req.body;

await QuizData.editQuestion(queID, updatedData);

res.redirect('/questions');
} catch (err) {
res.status(404).render('404', { message: `Error: ${err}` });
}
});

Data.get('/register', (req, res) => {
const errorMessage = '';
res.render('register', {
errorMessage
})
})

Data.post('/register', async (req, res) => {
try {
let { userName, email, password1, password2 } = req.body;
console.log(userName, email, password1, password2)
if (password1 != password2) return res.status(400).render('register', { errorMessage: "Passwords do not match" });
await authData.registerUser(userName, email, password1, password2);
res.status(201).redirect('/');
} catch (error) {
res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` })
}
})


Data.get('/userHistory', ensureLogin,isAdmin, (req, res) => {
let user = req.session?.user;
res.render('userHistory', {
user
})
})
