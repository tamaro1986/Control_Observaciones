import fs from 'fs';
import { SourceMapConsumer } from 'source-map';

const rawSourceMap = JSON.parse(fs.readFileSync('./dist/assets/index-D8j8ODGG.js.map', 'utf8'));

SourceMapConsumer.with(rawSourceMap, null, consumer => {
  const pos = consumer.originalPositionFor({
    line: 34,
    column: 6402
  });
  console.log(pos);
});
