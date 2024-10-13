import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { minify } from "html-minifier";
import inquirer from "inquirer";
import versionData from "./package.json" assert { type: "json" };
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
const questions = [
  {
    type: "input",
    name: "name",
    message: "What's your name?",
  },
  {
    type: "input",
    name: "role",
    message: "What's your role?",
  },
  {
    type: "input",
    name: "email",
    message: "What's your email?",
  },
  {
    type: "input",
    name: "phoneNumber",
    message: "What's your phone number (+61 434 123 123)?",
  },
];

inquirer.prompt(questions).then((answers) => {
  try {
    // Create dist folder
    if (!existsSync(distDir)) {
      mkdirSync(distDir);
    }

    // Load the input file
    let data = readFileSync("template.html", "utf8");
    // Replace the template values with the answers provided
    data = data.replace(
      /\b(?:name|role|email|phoneNumber)\b/gi,
      (matched) => answers[matched]
    );

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
      sortClassName: true,
    };
    const result = minify(data, minifyOptions);

    // Shape the file naming output
    const nameSnakeCase = toSnakeCase(answers["name"]);
    const companySnakeCase = toSnakeCase(company);
    const fileVersion = version.replaceAll(".", "");

    // Write the minified file output to the dist folder
    writeFileSync(
      `dist/${nameSnakeCase}-${companySnakeCase}-signature-v${fileVersion}.html`,
      result
    );
  } catch (err) {
    console.error(err);
  }
});
