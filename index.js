const inquirer = require("inquirer");
const minify = require("html-minifier").minify;
const { readFileSync, writeFileSync, existsSync, mkdirSync } = require("fs");
const version = require("./package.json").version;

/**
 * Capitalize each word and trim the spaces
 * @param {string} sentence the phrase to be formatted
 * @returns
 */
const toCapitalize = (sentence) => {
  const words = sentence.split(" ");
  const userName = words
    .map((word) => {
      return word[0].toUpperCase() + word.substring(1);
    })
    .join("");
  return userName;
};

const company = "Pera Pay";
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
    const companyCaps = toCapitalize(company);
    const nameCaps = toCapitalize(answers["name"]);
    const fileVersion = version.replaceAll(".", "");

    // Write the minified file output to the dist folder
    writeFileSync(
      `dist/${nameCaps}_${companyCaps}_Signature_v${fileVersion}.html`,
      result
    );
  } catch (err) {
    console.error(err);
  }
});
