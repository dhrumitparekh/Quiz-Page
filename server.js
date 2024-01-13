const express = require('express');
const QuizData = require("./modules/QuesionAnswer");
const path = require('path');
const Data = express();
Data.use(express.static('public')); 
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
    res.sendFile(path.join(__dirname, './views/home.html'));
  });


  Data.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, './views/about.html'));
  });

Data.get('/questions',async(req,res)=>{
  const QuestType = req.query.type;
  try{
    if(QuestType)
    {
      const quest = await QuizData.getQuestionsByType(QuestType);
      res.json(quest);
    }
    else
    {
    QuizData.getAllQuestions()
    .then((Data) => {
        res.json(Data);
      })
    }
    }
    catch 
    {
      res.status(404).json({error:error});
    }
  });
  
  
 
    Data.get('/questions/get_Question/:id', (req, res) => {
      const Questid = req.params.id; 
      QuizData.getQuestionsById(Questid)
        .then((Que) => {
          res.json(Que);
        })
        .catch((error) => {
          res.status(404).json({ error: error });
        });
    });
