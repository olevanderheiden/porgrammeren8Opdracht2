## Ml5 Music Control

Deze aplicatie maakt het mogelijk om een youtube playlist aftespelen en deze met gebaren te besturen. Je kan hier een youtube link (https://www.youtube.com/watch?v=example&list=example)
of en playlist id(tekst na list= in de url) invullen. Je kan doormiddel van voorgetrainde gebaren de muziek besturen.

## Voorbereiding

Installeer node(npm) om packages die deze applicatie gebruikt te kunnen installeren.

## Installatie

1. Clone dit project met git clone
2. Installeer de packages: npm install
3. start applicatie via vite: npm run:dev
4. Druk op de link die je in de terminal krijgt om de site te bezoeken

# Tip: Het wordt aangeraden om een incognito tabblad te gebruiken in opera GX. Andere browsers werken wellicht ook maar zijn niet getest. Het gebruiken van een normaal tabblad kan er voor zorgen dat de app soms geen actie onderneemd bij het herkennen van een pose omdat de onderdelen van de youtube api door addblockers of andere plugins worden geblokkeerd. Als dit gebeurd ververs dan de pagina en probeer het opnieuw.

## Gebruiken

1. zorg ervoor Dat het project een map met de naam "model" bevat(niet te verwarren met models of node_modules). Deze map moet 3 bestanden bevatten: model_meta.json, model.json en een model.weights.bin.
   Deze bestanden kunnen verkregen worden door middel van de ml5Training app. (dit is enkel nodig mocht er gebruik gemaakt willen worden van zelf gekozen poses). Mochten er één of meerder van deze bestanden
   ontbreken dan zal de app niet naar behoren werken.
2. Zoek een playlist op die je wil beluisten(enkel youtube links of id's worden ondersteund). Vul deze link in bij het text veld met de tekst "Enter YouTube Playlist ID or url". En druk op de "load playlist"knop.
3. Gebruik de poses die je getraint hebt of de ingebrepen poses om de muziek te bedienen.

- Rechter open hand omhoog = Start
- Linker open hand omhoog is stop
- Rechter Vuist met duim omhoog is volume omhoog
- Rechter vuist met duim omlaag is volume omlaag
- Linker Vuist met duim omhoog is volgende nummer
- Linker vuist met duim omlaag is vorige nummer
- Vredes teken(met 1 van de twee handen) is herstarten van het huidige nummer

4. Mocht je er tegenaan lopen dat je camera gespiegeld is druk dan op de "Mirror Image" knop. Let op dit heeft geen invloed om de vaardigheid van ml5 om poses te herkennen en is enkel voor de gebruiker.

# Tip: Wees niet verbaast als het uitvoeren van de actie die je wil uitvoeren met gebaren langer duurd dan verwcht dit komt doordat er 10× achter elkaar het zelfde gebaar herkent moet worden voordat de actie wordt uitgevoerd. Dit is om te voorkomen dat acties te snel achter elkaar uitgevoerd kunnen worden. Mocht u zich hier aan storen of is 10× voor u niet genoeg verrander dan de const requiredAmountOfChecks op regel 23 van script.js

## waarschuwingen

- Het is mogelijk dat de applicatie niet werkt door vernieuwde versies van mediapipe task vision die gedownload wordt door npm. Mocht dit het geval zijn vraag dan aan de ontwikkelaar van deze app om de node_modules map of trouble shoot de ap.
- Als er geen playlist wordt ingevuld dan zal de voorgeprogrammeerde playlist worden gestart dit is de game muziek van Kai no kiseki. Het kan voorkomen dat de nieuw ingevulde playlist niet gelijk goed start en
  de voorgeprogrammeerde daar inplaatsvan start. Druk in dat geval nogmaal op de "load playlist" knop dit zou het probleem moeten verhelpen.
