## Knn Training

Dit is het KNN herkenning gedeelte van mijn programmeren 8 opdracht. Door middel van deze applicatie kan je poses trainen en opslaan in een .json file.

## Voorbereiding

Installeer node(npm) om packages die deze applicatie gebruikt te kunnen installeren.

## Installatie

1. Clone dit project met git clone
2. Installeer de packages: npm install
3. start applicatie via vite: npm run:dev
4. Druk op de link die je in de terminal krijgt om de site te bezoeken

## Gebruiken

1. Houdt je hand voor de camera om een pose te leren. Druk terwijl je dit doet op de "Capture pose" knop. Herhaal dit proces voor alle poses meerdere malen om te zorgen dat de data zo accuraat mogelijk wordt.
2. Mocht de camera van jouw perspectief gespiegeld zijn, druk dan op de "Mirror Image" knop.
3. Als je genoeg hebt getraind druk dan op de "Train" Knop. Dit geeft een .json bestand terug die je kan gebruiken om een [ml5 algoritme te trainen](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/ml5Training).

Tip: Wil je andere poses voor de verschillende acties trainen, verwijder dan de trainingData.json uit de project map en ververs de pagina. Je zal een waarschuwing krijgen dat er geen training data is en dat je die zelf moet maken.
De rest van de stappen zijn hetzelfde als waneer het bestand al bestaat. Je kan nu zelf poses bedenken die voor jou het best passen bij de besturing van de youtube muziek app.

## waarschuwing

Het is mogelijk dat de applicatie niet werkt door vernieuwde versies van mediapipe task vision. Mocht dit het geval zijn, vraag dan aan de ontwikkelaar van deze app om de node_modules map of trouble shoot de app

## Andere delen van het project:

- [main](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/main)
- [ML5 Training](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/ml5Training)
- [ML5 Music Control](https://github.com/olevanderheiden/porgrammeren8Opdracht2/tree/musicControlMl5)
