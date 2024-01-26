require('dotenv').config();
const Sequelize = require('sequelize');

let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
host: process.env.DB_HOST,
dialect: 'postgres',
port: 5432,
dialectOptions: {
ssl: { rejectUnauthorized: false },
},
});

const Type = sequelize.define('types', {
type_id: {
type: Sequelize.INTEGER,
primaryKey: true,
autoIncrement: true,
},
qtype: Sequelize.STRING,
Img : Sequelize.STRING,
}, {
timestamps: false,
});


const Answers = sequelize.define('answers', {
answerId: {
type: Sequelize.INTEGER,
primaryKey: true,
autoIncrement: true,
},
answer: Sequelize.STRING,
}, {
timestamps: false,
});

const Questions = sequelize.define('questions', {
id: {
type: Sequelize.INTEGER,
primaryKey: true,
autoIncrement: true,
},
questype: Sequelize.INTEGER,
question : Sequelize.STRING,
options : Sequelize.TEXT,
}, {
timestamps: false,
});


Questions.belongsTo(Type, {foreignKey: 'questype'})

sequelize
.authenticate()
.then(() => {
console.log('Connection has been established successfully');
})
.catch((err) => {
console.log('Unable to connect to the database:', err);
});


async function Initialize() {
try {

const types = await Type.findAll();
const answers = await Answers.findAll();
const questions = await Questions.findAll();

for (const question of questions) {
const type = types.find(t => t.type_id === question.questype);
if (type) {
question.questype = type.qtype;
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
throw new Error('Initialization failed');
}
}

async function getAllQuestions(){
try {
const allQuestions = await Questions.findAll({
include: [{ model: Type }, { model: Answers }],
});
if (allQuestions.length > 0) {
return allQuestions;
} else {
throw new Error('No questions available');
}
} catch (error) {
throw new Error('Error fetching questions');
}
};

async function getQuestionsById(questionId) {
try {
const foundQuestion = await Questions.findOne({
where: { id : questionId },
include: [{ model: Type }],
});
const answers = await Answers.findAll();
const answer = answers.find(a => a.answerId === foundQuestion.id);
if (answer) {
  foundQuestion.answer = answer.answer;
}
if (foundQuestion) {
return foundQuestion;
} else {
throw new Error('Question not found');
}
} catch (error) {
throw new Error('Error fetching question');
}
}

function getQuestionsByType(quetype) {
  return new Promise(async (resolve, reject) => {
    try {
      const filteredQuestions = await Questions.findAll({
        include: [
          {
            model: Type,
            where: { qtype: quetype },
          },
        ],
      });

      if (!filteredQuestions || filteredQuestions.length === 0) {
        reject('No questions found for this type');
      } else {
        resolve(filteredQuestions);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function addQuestion(QuestionData) {
  return new Promise(async (resolve,reject)=>{
    try {
      await Questions.create(QuestionData);
      resolve();
    } catch (err) {
      reject(err.errors[0].message);
    }
  });
}

const editQuestion = async (empId, updatedData) => {
  try {
    if (empId !== undefined) {
      await Questions.update(updatedData, { where: { id: empId } });
    } else {
      throw new Error("Invalid or undefined empId");
    }
  } catch (err) {
    throw err;
  }
};

const deleteQuestion = async (QuestId) => {
  try {
    await Questions.destroy({ where: { id: QuestId } });
  } catch (err) {
    throw err;
  }
};


const getAllTypes = async () => {
try {
const allTypes = await Type.findAll();
return allTypes;
} catch (err) {
throw err;
}
};



module.exports = { Initialize,getAllQuestions,getQuestionsById,getQuestionsByType,addQuestion,getAllTypes,deleteQuestion,editQuestion };

