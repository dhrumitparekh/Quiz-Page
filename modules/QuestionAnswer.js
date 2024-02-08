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
order:[['id','ASC']],
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
order: [['id', 'ASC']],
});

if (!filteredQuestions || filteredQuestions.length === 0) {
reject('No questions found for this type');
} else {
const answers = await Answers.findAll();
const questionsWithAnswers = filteredQuestions.map((question) => {
const answer = answers.find(a => a.answerId === question.id);
return {
id: question.id,
questype: question.questype,
question: question.question,
options: question.options,
answer: answer ? answer.answer : null,
};
});

resolve(questionsWithAnswers);
}
} catch (error) {
reject(error);
}
});
}


async function deleteType(typeId) {
const transaction = await sequelize.transaction();

try {
const foundType = await Type.findOne({ where: { type_id: typeId }, transaction });

if (!foundType) {
throw new Error('Type not found');
}

await Questions.destroy({ where: { questype: foundType.type_id }, transaction });
await Type.destroy({ where: { type_id: typeId }, transaction });

await transaction.commit();
} catch (err) {
await transaction.rollback();
throw err;
}
}

async function addType(typeData) {
try {
const newType = await Type.create(typeData);
return newType;
} catch (err) {
if (err.name === 'SequelizeUniqueConstraintError' && err.fields.includes('type_id')) {
throw 'Type Id must be unique.';
} else {
throw err.errors[0].message;
}
}
}


function addQuestion(QuestionData) {
return new Promise(async (resolve, reject) => {
try {
const createdQuestion = await Questions.create(QuestionData);
const { answer } = QuestionData;


if (answer) {
await Answers.create({
answer: answer,
answerId: createdQuestion.id,
});
}

resolve();
} catch (err) {
reject(err.errors[0].message);
}
});
}



const editQuestion = async (questionId, updatedQuestionData) => {
const transaction = await sequelize.transaction();

try {

await Questions.update(updatedQuestionData, { where: { id: questionId }, transaction });
const updatedQuestion = await Questions.findOne({ where: { id: questionId }, transaction });

if (!updatedQuestion) {
throw new Error('Question not found after update');
}

const { answer } = updatedQuestionData;

if (answer) {
const foundAnswer = await Answers.findOne({ where: { answerId: updatedQuestion.id }, transaction });
if (!foundAnswer) {
throw new Error('Associated answer not found');
}
await Answers.update({ answer }, { where: { answerId: updatedQuestion.id }, transaction });
}
await transaction.commit();
} catch (err) {
await transaction.rollback();
throw err;
}
};

const deleteQuestion = async (QuestId) => {
const transaction = await sequelize.transaction();
try {

const foundQuestion = await Questions.findOne({ where: { id: QuestId }, transaction });

if (!foundQuestion) {
throw new Error('Question not found');
}

await Answers.destroy({ where: { answerId: foundQuestion.id }, transaction });
await Questions.destroy({ where: { id: QuestId }, transaction });
await transaction.commit();
} catch (err) {

await transaction.rollback();
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



module.exports = { Initialize,getAllQuestions,getQuestionsById,getQuestionsByType,addQuestion,getAllTypes,deleteQuestion,editQuestion,addType,deleteType};
