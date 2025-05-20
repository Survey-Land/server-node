import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function generateFakeSurveys() {
  // Define the actual QuestionType enum values from your schema
  const questionTypes = ["mcq", "textarea"];
  const surveyStatuses = ["draft", "published", "closed"];

  // Generate 29 fake surveys
  for (let i = 0; i < 29; i++) {
    // Generate fake QuestionObject array
    const questions = Array.from(
      { length: faker.number.int({ min: 3, max: 10 }) },
      () => ({
        qid: faker.string.uuid(),
        questionText: faker.lorem.sentence({ min: 5, max: 10 }) + "?",
        type: faker.helpers.arrayElement(questionTypes),
        choices:
          faker.helpers.arrayElement(questionTypes) === "mcq"
            ? Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
                faker.lorem.word()
              )
            : [],
        isRequired: faker.datatype.boolean(),
      })
    );

    // Generate fake Survey
    const survey = {
      userId: "682c6a577fb973a37b8af40d", // Fixed User ID
      title: faker.lorem.words({ min: 3, max: 6 }),
      description: faker.lorem.paragraph(),
      deadline: faker.date.future({ years: 1 }),
      cover: faker.image.url(),
      status: faker.helpers.arrayElement(surveyStatuses),
      link: faker.internet.url(),
      questions,
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: faker.date.recent({ days: 30 }),
      lastMilestone: faker.number.int({ min: 0, max: 5 }),
    };

    // Insert into database
    try {
      const createdSurvey = await prisma.survey.create({
        data: survey,
      });
      console.log(`Created Survey ${i + 1}:`, createdSurvey);
    } catch (error) {
      console.error(`Error creating survey ${i + 1}:`, error);
    }
  }
}

// Run the script
async function main() {
  try {
    await generateFakeSurveys();
  } catch (error) {
    console.error("Error in main:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
