const questions = require('../data/questions.json');
const types = require('../data/type.json');
const answers = require('../data/answers.json');

let quest = [];

async function Initialize() {
  try {
    for (const question of questions) {
      const type = types.find(t => t.type_id === question.type);
      if (type) {
        question.type = type.qtype;
      }
      const answer = answers.find(a => a.answerId === question.id);
      if (answer) {
        question.answer = answer.answer;
      }
    }
    quest = questions;
    return 'Initialization successful';
  } catch (error) {
    console.error('Error in Initialize:', error);
    reject('Initialization failed');
  }
}

function getAllQuestions() {
  return new Promise((resolve, reject) => {
    if (quest.length > 0) {
      resolve(quest);
    } else {
      reject('No questions available');
    }
  });
}

function getQuestionsById(questionId) {
  return new Promise((resolve, reject) => {
    const foundQuestion = quest.find(question => question.id === questionId);
    if (foundQuestion) {
      resolve(foundQuestion);
    } else {
      reject('Question not found');
    }
  });
}

function getQuestionsByType(quetype) {
  return new Promise((resolve, reject) => {
    const filteredQuestions = quest.filter(question => question.type === quetype);
    if (filteredQuestions.length > 0) {
      resolve(filteredQuestions);
    } else {
      reject('No questions found for this type');
    }
  });
}

const getAllTypes = async () => {
  try {
    const test = await types;
    return test;
  } catch (err) {
    throw err;
  }
};


module.exports = { Initialize,getAllQuestions,getQuestionsById,getQuestionsByType,getAllTypes };
