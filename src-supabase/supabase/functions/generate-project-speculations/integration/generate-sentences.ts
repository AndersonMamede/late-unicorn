import OpenAI from "https://deno.land/x/openai@v4.37.1/mod.ts";
import { IProject } from "../database/project.ts";

interface GenerateSentencesInput {
  project: IProject;

  /**
   * The target length of each sentence
   */
  targetLength?: number;

  /**
   * Maximum number of phrases that will be created
   */
  maxSentences?: number;

  /**
   * Language used in the return of the sentences
   */
  language?: string;

  /**
   * GPT temperature
   */
  temperature?: number;

  /**
   * GPT max_tokens
   */
  maxTokens?: number;
}

interface GenerateSentencesOutput {
  /**
   * An array of sentences or an empty array if unable to generate
   */
  sentences: string[];
}

/**
 * Generates sentences based on the given project.
 * @param {IProject} project - The project for generating sentences.
 * @param {number} [targetLength=400] - The target length of each sentence. Default is 400.
 * @param {string} [language='English'] - The language of the sentences. Default is 'English'.
 * @param {number} [maxSentences=3] - The maximum number of sentences to generate. Default is 3.
 * @param {number} [temperature=0.7] - The temperature for generating sentences. Default is 0.7.
 * @param {number} [maxTokens=1000] - The maximum number of tokens for generating sentences. Default is 1000.
 * @returns An array of sentences or an empty array if unable to generate.
 */
export const generateSentences = async ({
  project,
  targetLength = 400,
  language = "English",
  maxSentences = 3,
  temperature = 0.7,
  maxTokens = 1000,
}: GenerateSentencesInput): Promise<GenerateSentencesOutput> => {
  try {
    const client = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY") ?? "",
    });

    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "assistant",
          content:
            "You are an actor and writer, and your specialty is being ironic and bittersweet.",
        },
        {
          role: "system",
          content:
            `You must create easy-to-read and ironically-bittersweet toned unique sentences about the fictitious future
            of a discontinued project (like "what could have been if the project wasn't discontinued?"), respecting the following rules:\n
              - You must create ${maxSentences} sentences in ${language} regardless of the context's language.\n
              - You must write the sentences in a straightforward and non-poetic manner, and using everyday language.\n
              - The irony must be clear and easy to understand, and it should always be placed at the end of the sentence.\n
              - The sentences must contain the name of the project, which is: ${project.name}\n
              - Each sentence must have about ${targetLength} characters.\n
              - The return must be in JSON format with the key 'sentences' containing an array of strings.\n
              - When unable to create sentences, return specifications with empty array.\n
              - You MUST ALWAYS return ${maxSentences} SENTENCES, you should not return just one.
          `,
        },
        { role: "user", content: `${project.name} ${project.description}` },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const choice = response.choices[0].message.content;

    if (!choice) {
      return {
        sentences: [],
      };
    }

    return JSON.parse(choice);
  } catch (error) {
    throw error;
  }
};
