R6 Taktika — repo setup

Fájlok:
- index.html
- tactic.html
- css/styles.css
- js/main.js
- js/tactic.js
- data/tactics.json
- assets/ (kép mappa, lentebb)

Assets struktúra (kötelező):
assets/
  Bank/
    Armory/
      attack/
        1.png
        2.png
      defense/
        1.png
        2.png
    Vault/
      attack/
      defense/
  Outback/
    A-site/
      attack/
      defense/

Névkonvenció:
- Képek sorszámozva: 1.png, 2.png, ... (a JSON-ben `img` mezővel felülírható a szám)
- Map/ site neve pontosan egyezzen a `data/tactics.json`-ben szereplő kulcsokkal (kis/nagybetűk -> jobb ha egyeznek)

Deploy:
- Push a repo gyökérébe.
- GitHub Pages beállítás: Branch -> gh-pages vagy main (ahogy beállítottad).
- Oldal elérhető lesz: https://<felhasználó>.github.io/<repo> vagy ha repo neve `username.github.io` akkor root.

Szerkesztés:
- Bővítsd a `data/tactics.json`-t új map/site/móddal.
- Töltsd fel a képeket a megfelelő folderbe.
