const express = require('express');
const QuizData = require("./modules/QuesionAnswer");
const path = require('path');
const Data = express();
Data.use(express.static('public')); 
Data.set('view engine', 'ejs');
const port = 8080;

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
        res.render('mainpage', { questions: quest });  
      } 
      else {
        const allQuestions = await QuizData.getAllQuestions();
        res.render('mainpage', { questions: allQuestions });  
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
        const specificquest = await QuizData.getQuestionsById(Questid);
        res.render("questId",{questions:specificquest});
      }catch(error){
        res.render("404", { message: `Error: ${err.message}` });
        }
    });

  
  

  
