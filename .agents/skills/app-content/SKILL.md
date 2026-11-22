---
name: app-content
description: Use for any content work in this app - researching, writing, extending, correcting or reviewing its competencies, chapters, pages, rounds, questions, exercises, figures, terms or sources. This app's own content decisions; they take precedence over the generic lernapps content skills. Load it before you change any content.
---

# Content guide of this app

Explainer "Körper bauen, aufklappen und zeichnen" (Mathematik, Strang `mathematik/geometrie`, Issue lernapps/apps#432).
Shared rules of the epic: `regeln.md` (Schreibweisen, Aufgaben, Quellen). Where this guide is silent, those rules hold.

## Curriculum

Hessen, Sek I (Annahme der Epic-Regeln), Stufen 5-6, 7-8, 9-10. Orientierung ist die Lernlandkarte Mathematik
(`https://lernapps.net/apps/map/mathematik.json`), kein Lehrplantext: die App folgt der Reihenfolge der Karte
(`requires`). KMK-Bildungsstandards 2022 und Hessischer Lehrplan sind nicht geöffnet worden (nicht geprüft). Abgrenzung:
Volumen und Oberfläche gehören zu #398 und #429 und kommen hier nicht vor.

## Competencies

Alle sechs sind Lücken der Karte. Zwei Seiten je Kapitel nennen dieselbe Kompetenz „Netze und Schrägbilder“.

- Kapitel `koerper-quader` (5-6)
  - `grundkoerper-quader-wuerfel`: „Ich kann Quader, Würfel und zusammengesetzte Körper erkennen und beschreiben.“ Seite `quader-wuerfel`.
  - `netze-schraegbilder-modelle`: „Ich kann Netze, Schrägbilder und Modelle von Quader und Würfel zeichnen oder bauen.“ Seiten `netze-quader-wuerfel`, `schraegbild-quader`.
  - Recap `recap` (`mathematik/grundfiguren-eben`, aus #397), keine Übung.
- Kapitel `koerper-prisma` (7-8)
  - `grundkoerper-prisma-zylinder`: „Ich kann Prisma und Zylinder erkennen und von anderen Körpern unterscheiden.“ Seite `prisma-zylinder`.
  - `netze-schraegbilder-prisma-zylinder`: Seiten `netze-prisma-zylinder`, `schraegbild-prisma-zylinder`.
- Kapitel `koerper-pyramide` (9-10)
  - `grundkoerper-pyramide-kegel-kugel`: Seite `pyramide-kegel-kugel`.
  - `netze-schraegbilder-pyramide-kegel`: Seiten `netze-pyramide-kegel`, `schraegbild-pyramide-kegel`.

Die Übungs-Ids stehen in den Seitendateien (`src/<kapitel>/<seite>.yaml`, Abschnitt `uebung`).

## Content structure

Jede Seite: Abschnitt `einstieg` (erste Aufgabe oder Bild, was Lernende gleich tun, Ziel in einem Satz), `erklaerung`
(ein neuer Gedanke, mit Baukasten oder Bild), `uebung` (mindestens drei Aufgaben von Erkennen über Anwenden zu neuer
Situation, Rückmeldung mit Fehlertyp). Höchstens 350 Wörter Text je Seite, höchstens vier Textblöcke hintereinander.
Der Recap hat nur Text. Anrede „du“, kurze Sätze.

## Terminology

Wörter der Karte: Quader, Würfel, Prisma, Zylinder, Pyramide, Kegel, Kugel, Netz, Schrägbild, Modell, Grundfläche,
Mantel, Kante, Ecke, Fläche. Maße mit geschütztem Leerzeichen (`3 cm`), Komma in Dezimalzahlen, `·` und `:`, `−` (U+2212).
Nicht verwenden: „Seitenfläche“ für den Zylindermantel (es heißt Mantel), „Spitze“ nur für Pyramide und Kegel.
Schrägbild: Vorderseite in wahrer Größe, Tiefenkanten unter 45° auf halber Länge (Kavalierperspektive).

## Exercise patterns

Daten: `src/data/koerper.yaml` (Name, Flächen, Kanten, Ecken, Grundfläche je Körper; jedes Faktum einmal).

- Körper beschreiben: `matching`, `single-choice`, `true-false` mit Begründung, `generated` aus `koerper.yaml`.
- Netz falten: Übungskomponente `NetzFalten` (Netz gegeben; Entscheidung faltbar oder nicht, Fläche zuordnen).
- Baukasten: Anzeigekomponente `KoerperBaukasten` (drehen, Regler „Aufklappen“).
- Schrägbild zeichnen: Übungskomponente `Schraegbild` (Kästchenpapier, Kanten setzen, Prüfung der Kantenlängen und Richtungen).
- Wo das Netz nicht geht (Kugel): `single-choice` / `true-false` mit Begründung (Weltkarte).
- Fehler, die die Rückmeldung nennt: vier Quadrate in Reihe plus Anbau falsch; Fläche doppelt; Tiefe in voller Länge;
  Tiefe waagerecht; Mantel des Zylinders als Kreis; Kegelmantel als Dreieck; Flächen- und Kantenzahl vertauscht.
- Zufallswerte immer mit festem Seed prüfbar; Antworten mit Komma und Punkt.

## Figures

Eigene SVG-Bilder (kein Foto, nichts von Dritten). Flächen unterscheiden sich durch Beschriftung (1–6) und Muster, nie
nur durch Farbe. Jedes Bild mit `alt` und Bildunterschrift. Komponenten nutzen nur die Farbvariablen der Seite und haben
`nojs`-Text; alle Aktionen per Tastatur (Tab, Pfeile, Enter), Ziele mindestens 44 px.

## Sources

Eigene Herleitungen und Aufgaben. Nachgeschlagen (nicht verlinkt, keine Formulierungen oder Bilder übernommen): die
Lernlandkarte und Wikipedia „Axonometrie“, „Netz (Geometrie)“. Wikipedia steht nicht in `sources` oder `links`. Keine
Dritt-Inhalte, `thirdParty` leer. Der fachliche Prüfer rechnet Aufgaben nach.

## Adding a chapter or round

1. Kompetenz-Ids aus der Karte nehmen, neue Seiten in `chapter.yaml` unter `pages` eintragen (Reihenfolge der Karte).
2. Seite `src/<kapitel>/<seite>.yaml` mit den Abschnitten oben; Daten in `src/data/koerper.yaml` ergänzen.
3. Komponenten in `src/components/` (`<Name>.vue`, `.ts`, `.test.ts`), gemeinsame Geometrie in `Koerper.ts`.
4. Kapitel in `src/app.yaml` unter `chapters` eintragen.
5. `npx vp check --fix`, `npx vp build`, `npx --no -- lernapps check`, commit.

## Rules learned from mistakes

None yet.
