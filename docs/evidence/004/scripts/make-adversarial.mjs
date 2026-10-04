// Variante adversarial (spec 004 §4): el post de la tesis con un título con comillas y </script>, y un link
// `javascript:` en el cuerpo (ES y EN). Sale de snapshot/sanity-snapshot.json y escribe snapshot/adversarial.json.
import { readFileSync, writeFileSync } from 'node:fs';

const src = new URL('./snapshot/sanity-snapshot.json', import.meta.url);
const json = JSON.parse(readFileSync(src, 'utf8'));
const post = json.result.find((d) => d._id === 'post-no-context-no-intelligence');
post.title = {
  ...post.title,
  es: 'Sin "contexto" </script><script>alert(1)</script> no hay inteligencia',
  en: 'No "context" </script><script>alert(1)</script> no intelligence',
};
for (const l of ['es', 'en']) {
  post.body[l].push({
    _key: 'adv-js', _type: 'block', style: 'normal',
    markDefs: [{ _key: 'jsl', _type: 'link', href: 'javascript:alert(document.domain)' }, { _key: 'okl', _type: 'link', href: 'https://example.com/ok' }],
    children: [
      { _key: 'a1', _type: 'span', marks: ['jsl'], text: 'link javascript adversarial' },
      { _key: 'a2', _type: 'span', marks: [], text: ' y ' },
      { _key: 'a3', _type: 'span', marks: ['okl'], text: 'link https de control' },
    ],
  });
}
writeFileSync(new URL('./snapshot/adversarial.json', import.meta.url), JSON.stringify(json, null, 1));
console.log('adversarial.json', post.title);
