const express = require('express');
const QuizData = require("./modules/QuesionAnswer");
const Data = express();
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

  Data.get ('/',(req,res)=>{
    res.send('Testing');
});
  

Data.get('/questions',(req,res)=>{
    QuizData.getAllQuestions()
    .then((Data) => {
        res.json(Data);
      })
    });
  
 
    Data.get('/questions/get_Question',(req,res)=>{
        const Questid = "3";
  QuizData.getQuestionsById(Questid).then((Que)=>
  {
    res.json(Que);
  }).catch((error) => {
    res.status(404).json({ error: error });
  });
    });

  
  
    Data.get('/questions/get_QuestType',(req,res)=>
    {
      const Type = "coding";
      QuizData.getQuestionsByType(Type).then((Titles)=>{
        res.json(Titles);
      })
      .catch((error)=>{
        res.status(404).json({ error: error });
      })
    });
  
  