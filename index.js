import { input } from "@inquirer/prompts";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { minify } from "html-minifier-next";
import versionData from "./package.json" with { type: "json" };
const { version } = versionData;

/**
 * Convert a string to Snake Case
 * @param {string} sentence the phrase to be formatted
 * @returns {string} the formatted string in snake case
 */
const toSnakeCase = (sentence) => {
  return sentence.toLowerCase().replace(/\s+/g, "_");
};

const company = "Company Name";
const distDir = "dist";

/**
 * Ask the user for the signature details
 * @returns {Promise<Record<string, string>>} the answers keyed by template placeholder
 */
const askQuestions = async () => ({
  name: await input({ message: "What's your name?" }),
  role: await input({ message: "What's your role?" }),
  email: await input({ message: "What's your email?" }),
  phoneNumber: await input({
    message: "What's your phone number (+61 434 123 123)?",
  }),
});

let answers;
try {
  answers = await askQuestions();
} catch (err) {
  // Exit quietly when the user cancels the prompt with Ctrl+C
  if (err instanceof Error && err.name === "ExitPromptError") {
    process.exit(0);
  }
  throw err;
}

try {
  // Create dist folder
  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }

  // Load the input file
  let data = readFileSync("template.html", "utf8");
  // Replace the template values with the answers provided
  data = data.replace(/\b(?:name|role|email|phoneNumber)\b/gi, (matched) => answers[matched]);

  // Minify the file content
  const minifyOptions = {
    collapseWhitespace: true,
    decodeEntities: true,
    minifyCSS: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    sortAttributes: true,
    sortClassNames: true,
  };
  const result = await minify(data, minifyOptions);

  // Shape the file naming output
  const nameSnakeCase = toSnakeCase(answers["name"]);
  const companySnakeCase = toSnakeCase(company);
  const fileVersion = version.replaceAll(".", "");

  // Write the minified file output to the dist folder
  writeFileSync(`dist/${nameSnakeCase}-${companySnakeCase}-signature-v${fileVersion}.html`, result);
} catch (err) {
  console.error(err);
}
