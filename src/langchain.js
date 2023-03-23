import dotenv from "dotenv";
dotenv.config();

import { OpenAI, OpenAIChat } from "langchain/llms";
import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage } from "langchain/schema";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain } from "langchain/chains";

import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "langchain/prompts";

const model = new ChatOpenAI({
  temperature: 0.9,
  modelName: "gpt-3.5-turbo",
  apiKey: process.env.OPENAI_API_KEY,
});

const scribe = ChatPromptTemplate.fromPromptMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "You are an assistant who listens to. Your job is to read portions of a transcript of a debate, then follow directions to write clear, comprehensive, concise notes based on the instructions."
  ),
  HumanMessagePromptTemplate.fromTemplate(
    "Read the following portion of a debate transcript, then follow these instructions: {instructions}.\n\n{speaker}: {speech}"
  ),
]);

export async function summarize(speech, instructions) {
  const transcription = await model.generatePrompt([
    await scribe.formatPromptValue({
      speaker: speech.speaker,
      speech: speech.speech,
      instructions: instructions,
    }),
  ]);
  return transcription.generations[0][0].text.trim();
}

export const instructions = {
  writeClaimsAndSubpoints:
    "Write a json array of key value pairs where the keys are strings which contain only a summary of one the main claims made in the speech, and the values are arrays of strings containing the subpoints or evidence for each claim.",
  writeClaims:
    "Write a json array of strings which each contain a summary of one the main claims made in the speech (don't include anything in the string but the claim itself).",
  writeToulminBreakdown:
    'In this task, you will break down debate speech segments into components using the Toulmin model. The Toulmin model consists of the following categories:\n\n1. Claim: A statement or assertion that the speaker is arguing for.\n2. Evidence: Data, facts, or examples that support the claim.\n3. Warrant: The logical connection or reasoning that links the evidence to the claim.\n4. Impact: The consequences or implications of the claim if it is accepted.\n\nPlease analyze the following examples of debate speech segments and break them down into their respective components according to the Toulmin model. Write each component concisely and provide the breakdown as a JSON object with keys for \'claim\', \'evidence\', \'warrant\', and \'impact\'. If the argument transcript doesn\'t include a particular element of the Toulmin model, enter an empty string instead. Additionally, if there are no arguments made in the transcript provided, simply output an empty array.\n\nExample 1:\n"Raising the minimum wage will improve the economy. Research has shown that when low-wage workers receive a pay increase, they spend more money, which stimulates economic growth. The increased consumer spending results in more demand for products and services, and businesses respond by hiring more employees to meet the demand."\n\nExample 1 Breakdown:\n{\n  "claim": "Raising the minimum wage will improve the economy",\n  "evidence": "Research has shown that when low-wage workers receive a pay increase, they spend more money",\n  "warrant": "The increased consumer spending results in more demand for products and services",\n  "impact": "Businesses respond by hiring more employees to meet the demand, stimulating economic growth"\n}\n\nExample 2:\n"Renewable energy is essential for our future. The burning of fossil fuels is responsible for the majority of greenhouse gas emissions, which contribute to global warming. By transitioning to renewable energy sources, we can reduce these harmful emissions and mitigate the effects of climate change. Furthermore, investing in renewable energy technologies will create jobs and stimulate economic growth in the long term."\n\nExample 2 Breakdown:\n{\n  "claim": "Renewable energy is essential for our future",\n  "evidence": "The burning of fossil fuels is responsible for the majority of greenhouse gas emissions, which contribute to global warming",\n  "warrant": "By transitioning to renewable energy sources, we can reduce these harmful emissions",\n  "impact": "Mitigating the effects of climate change and stimulating economic growth through job creation in the renewable energy sector"\n}',
};
