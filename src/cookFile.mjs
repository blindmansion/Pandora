import { http } from "http";
// import { createWriteStream } from "fs";

//import pkg from "http";
//const http = pkg;

import { createWriteStream } from "fs";

export function cookFile(recordingId) {
  const url = `http://localhost:3004/${recordingId}`;
  const outputPath = `cooked_recordings/${recordingId}.ogg`;

  return ((resolve, reject) => {
    http
      .get(url, (response) => {
        if (response.statusCode === 200) {
          const file = createWriteStream(outputPath);
          response.pipe(file);
          file.on("finish", () => {
            console.log(`File downloaded to ${outputPath}`);
            resolve();
          });
          file.on("close", () => {
            console.log("File closed");
          });
        } else {
          console.error(
            `Failed to download file, status code: ${response.statusCode}`
          );
          reject(
            new Error(
              `Failed to download file, status code: ${response.statusCode}`
            )
          );
        }
      })
      .on("error", (error) => {
        console.error(`Error downloading file: ${error.message}`);
        reject(error);
      });
  })();
}

try {
  const uniqueId = "436542443";
  await cookFile(uniqueId);
  console.log("File cooked successfully");
} catch (error) {
  console.error("Error cooking file:", error);
}
