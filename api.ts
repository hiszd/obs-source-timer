import express from 'express';
import { writeFileSync, readFileSync } from 'node:fs';

const app = express();
app.use(express.json());

const save = async (file: string, content: string) => {
  try {
    writeFileSync(file as string, content);
    console.log('Writing to file: ' + file + '\n');
  } catch (err) {
    console.error(err);
    return;
  }
}

const load = (type: 'autoload' | 'load') => {
  try {
    if (type == 'autoload') {
      return readFileSync('autosave.json');
    } else if (type == 'load') {
      return readFileSync('save.json');
    }
  } catch (err) {
    console.error(err);
    return;
  }
}

app.post("/api/savefile", async (req, res) => {

  let file = req.body.file;
  let status = 'failed';

  save('save.json', file).then(() => {
    status = 'succeded';

    res.json({ status, file });
    res.end();
  });
});

app.post("/api/loadfile", async (req, res) => {
  let file = load(req.body.req);

  res.json({ file: file.toString() });
  res.end();

});

export const handler = app;
