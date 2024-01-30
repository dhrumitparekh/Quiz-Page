const express = require('express');
const QuizData = require("./modules/QuestionAnswer");
const path = require('path');
const Data = express();
Data.use(express.static('public')); 
const bodyParser = require('body-parser');
Data.use(express.urlencoded({ extended: true }));
Data.set('view engine', 'ejs');
const port = 8080;

Data.use(bodyParser())
QuizData.Initialize()
  .then(() => {
    Data.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Initialization failed:', error);
  });

  Data.get('/', (req, res) => {
    res.render("home");
  });


  Data.get('/about', (req, res) => {
    res.render("about");
  });
  
  Data.get('/questions', async (req, res) => {
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
  

    Data.get("/TypePage",async (req, res) => {
      try {
        const Type = await QuizData.getAllTypes();
        res.render("questpage", { Type });
      } catch (err) {
        res.render("404", { message: `Error: ${err.message}` });
      }
    });
    
    Data.get('/questions/get_Question/:id',async(req, res) => {
      const Questid = req.params.id; 
      try{
        const questions = await QuizData.getQuestionsById(Questid);
        res.render("questId",{questions});
      }catch(error){
        res.render("404", { message: `Error: ${error.message}` });
        }
    });
    Data.get('/questions/deleteQuestions/:id', async (req, res) => {
      try {
        await QuizData.deleteQuestion(req.params.id);
        res.redirect('/questions');
      } catch (err) {
        res.status(500).render('500', { message: `Error: ${err}` });
      }
    });
  
  
    Data.get("/questions/addQuestion", async (req, res) => {
      try {
        const Types = await QuizData.getAllTypes();
        res.render("addQuestions", { Types });
      } catch (err) {
        res.render("404", { message: `Error: ${err.message}` });
      }
    });

    Data.post('/questions/addQuestion',async (req, res) => {
      try {
  
        await QuizData.addQuestion(req.body);
        res.redirect('/questions');
      } catch (err) {
        console.log(err);
        res.render("404", { message: `Error: ${err}` });
      }
    });

    Data.get('/questions/editQuestion/:id',async (req, res) => {
      try {
        const Quests = await QuizData.getQuestionsById(req.params.id);
        const Types = await QuizData.getAllTypes();
        res.render('editQuestions', { Quests, Types });
      } catch (err) {
        res.status(404).render('404', { message: err.message });
      }
    });
    
    Data.post('/questions/editQuestion',async (req, res) => {
      try {
        const empId = req.body.id; 
        const updatedData = req.body; 
    
        await QuizData.editQuestion(empId, updatedData);
    
        res.redirect('/questions');
      } catch (err) {
        res.status(404).render('404', { message: `Error: ${err}` });
      }
    });
