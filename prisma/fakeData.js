import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function generateFakeSurvey() {
  // Define the actual QuestionType enum values from your schema
  const questionTypes = ["mcq", "textarea"];
  // Generate fake QuestionObject array
  const questions = Array.from(
    { length: faker.number.int({ min: 3, max: 10 }) },
    () => ({
      qid: faker.string.uuid(),
      questionText: faker.lorem.sentence({ min: 5, max: 10 }) + "?",
      type: faker.helpers.arrayElement(questionTypes),
      choices: faker.helpers
        .arrayElement(["SINGLE_CHOICE", "MULTI_CHOICE"])
        .includes(faker.helpers.arrayElement(questionTypes))
        ? Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
            faker.lorem.word()
          )
        : [],
      isRequired: faker.datatype.boolean(),
    })
  );

  // Generate fake Survey
  const survey = {
    userId: "680eb022b928af068bfcf29d", // Reference to a User ID
    title: faker.lorem.words({ min: 3, max: 6 }),
    description: faker.lorem.paragraph(),
    deadline: faker.date.future(),
    cover: faker.image.url(),
    status: faker.helpers.arrayElement(["draft", "published", "closed"]), // Adjust if SurveyStatus enum is different
    link: faker.internet.url(),
    questions,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };

  // Insert into database
  try {
    const createdSurvey = await prisma.survey.create({
      data: survey,
    });
    console.log("Created Survey:", createdSurvey);
  } catch (error) {
    console.error("Error creating survey:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
generateFakeSurvey();
