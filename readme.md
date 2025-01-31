## Ml5 Music Control

Deze aplicatie maakt het mogelijk om een youtube playlist af te spelen en deze met gebaren te besturen. Je kan hier een youtube link (youtube.com/watch?v=example&list=example)
en/of playlist id(tekst na list= in de url) invullen. Je kan doormiddel van voorgetrainde gebaren de muziek besturen.

## Voorbereiding

Installeer node(npm) om packages die deze applicatie gebruikt te kunnen installeren.

## Installatie

1. Clone dit project met git clone
2. Installeer de packages: npm install
3. Start applicatie via vite: npm run:dev
4. Druk op de link die je in de terminal krijgt om de site te bezoeken

Tip: Het wordt aangeraden om een incognito tabblad te gebruiken in opera GX. Andere browsers werken wellicht ook maar zijn niet getest. Het gebruiken van een normaal tabblad kan er voor zorgen dat de app soms geen actie onderneemt bij het herkennen van een pose omdat de onderdelen van de youtube api door addblockers of andere plugins worden geblokkeerd. Als dit gebeurt ververs dan de pagina en probeer het opnieuw.

## Gebruiken

1. Zorg ervoor dat het project een map met de naam "model" bevat (niet te verwarren met models of node_modules). Deze map moet 3 bestanden bevatten: model_meta.json, model.json en een model.weights.bin.
   Deze bestanden kunnen verkregen worden door middel van de [ml5Training app](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/ml5Training). (dit is enkel nodig mocht er gebruik gemaakt willen worden van zelf gekozen poses). Mochten er één of meerder van deze bestanden
   ontbreken dan zal de app niet naar behoren werken.
2. Zoek een playlist op die je wilt beluisten(enkel youtube links of id's worden ondersteund). Vul deze link in bij het text veld met de tekst "Enter YouTube Playlist ID or url". En druk op de "load playlist"knop.
3. Gebruik de poses die je getraind hebt of de ingebrepen poses om de muziek te bedienen.

- Rechter open hand omhoog is Start
- Linker open hand omhoog is stop
- Rechter Vuist met duim omhoog is volume omhoog
- Rechter vuist met duim omlaag is volume omlaag
- Linker Vuist met duim omhoog is volgende nummer
- Linker vuist met duim omlaag is vorige nummer
- Vredes teken(met 1 van de twee handen) is herstarten van het huidige nummer

4. Mocht je er tegenaan lopen dat je camera gespiegeld is, druk dan op de "Mirror Image" knop. Let op: dit heeft geen invloed om de vaardigheid van ML5 om poses te herkennen en is enkel voor de gebruiker.

Tip: Wees niet verbaast als het uitvoeren van de actie die je wilt uitvoeren met gebaren langer duurt dan verwacht. Dit komt doordat er 10× achter elkaar hetzelfde gebaar herkend moet worden voordat de actie wordt uitgevoerd.
Dit is om te voorkomen dat acties te snel achter elkaar uitgevoerd kunnen worden. Mocht u zich hier aan storen of is 10× voor u niet genoeg, verander dan de const requiredAmountOfChecks op regel 23 van script.js

## waarschuwingen

- Het is mogelijk dat de applicatie niet werkt door vernieuwde versies van mediapipe task vision die gedownload wordt door npm. Mocht dit het geval zijn, vraag dan aan de ontwikkelaar van deze app om de node_modules map of trouble shoot de app.
- Als er geen playlist wordt ingevuld dan zal de voorgeprogrammeerde playlist worden gestart. Dit is de game muziek van Kai no kiseki. Het kan voorkomen dat de nieuw ingevulde playlist niet gelijk goed start en
  de voorgeprogrammeerde in plaats daarvan start. Druk in dat geval nogmaal op de "load playlist" knop, dit zou het probleem moeten verhelpen.

  ## Andere delen van het project:

- [main](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/main)
- [KNN Training](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/KNNTraining)
- [ML5 Training](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/ml5Training)
