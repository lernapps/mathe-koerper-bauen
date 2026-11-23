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
  - Vorwissen-Seite `recap` („Das brauchst du für dieses Kapitel“, `competencies: [grundfiguren-eben]`, aus #397): eine normale Seite statt `recap`-Block, weil der Block keine Aufgaben erlaubt (regeln.md Abschnitt 7). Fachbegriffe als `definition` (Seite und Ecke, Quadrat und Rechteck, Dreieck, Kreis, Vieleck), vier Aufgaben (`recap-quadrat`, `recap-merkmale`, `recap-seiten`, `recap-durchmesser`), am Ende „Du bist bereit, wenn du …“ mit Links auf die Kartenseiten von `grundfiguren-eben` und `parallel-senkrecht-abstand`. Kein Link in die App eines anderen Explainers.
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
Die Vorwissen-Seite hat Begriffe (fett als Definition mit Beispiel), Aufgaben mit Rückmeldung und eine Checkliste. Anrede „du“, kurze Sätze.

## Terminology

Wörter der Karte: Quader, Würfel, Prisma, Zylinder, Pyramide, Kegel, Kugel, Netz, Schrägbild, Modell, Grundfläche,
Mantel, Kante, Ecke, Fläche. Maße mit geschütztem Leerzeichen (`3 cm`), Komma in Dezimalzahlen, `·` und `:`, `−` (U+2212).
Nicht verwenden: „Seitenfläche“ für den Zylindermantel (es heißt Mantel), „Spitze“ nur für Pyramide und Kegel.
Schrägbild: Vorderseite in wahrer Größe, Tiefenkanten unter 45° auf halber Länge (Kavalierperspektive).

## Exercise patterns

Daten: keine Datendatei. Anzahlen (Flächen, Kanten, Ecken) folgen aus der Zahl n der Ecken der Grundfläche und stehen als Rechnung in `generated` (n-Eck), nicht als Tabelle. Tabellen der Seiten sind `table`-Blöcke.

- Körper beschreiben: `matching`, `single-choice`, `multiple-choice`, `true-false` mit Begründung, `number`, `generated` mit n-Eck (Prisma: Ecken 2n, Flächen n+2; Pyramide: Ecken n+1, Kanten 2n).
- Netz falten: Übungskomponente `NetzFalten` (nur Würfelnetze; Modus `faltbar`: ja oder nein, Modus `gegenueber`: welche Fläche liegt gegenüber). Netze der anderen Körper: `single-choice` mit Netz-Bild in `material` (`images/netz-*.svg`).
- Baukasten: Anzeigekomponente `KoerperBaukasten` (drehen, Regler „Aufklappen“).
- Schrägbild zeichnen: Übungskomponente `Schraegbild` mit `body` quader, prisma, zylinder, pyramide oder kegel. Lernende stellen mit zwei Zählern (Nach rechts, Nach oben, in Kästchen) die Verschiebung der Rückseite, der oberen Ellipse oder der Spitze ein und sehen den Körper gezeichnet. Ein Kästchen ist 0,5 cm; Breite und Höhe in wahrer Länge (1 cm = 2 Kästchen), Tiefe diagonal mit so vielen Kästchen wie cm.
- Wo das Netz nicht geht (Kugel): `single-choice` / `true-false` mit Begründung (Weltkarte).
- Fehler, die die Rückmeldung nennt: vier Quadrate in Reihe plus Anbau falsch; Fläche doppelt; Tiefe in voller Länge;
  Tiefe waagerecht; Mantel des Zylinders als Kreis; Kegelmantel als Dreieck; Flächen- und Kantenzahl vertauscht.
- Zufallswerte immer mit festem Seed prüfbar; Antworten mit Komma und Punkt.

## Figures

Eigene SVG-Bilder (kein Foto, nichts von Dritten), in `src/images/` aus einem Skript ausserhalb des Repos erzeugt: Quader-, Prisma-, Zylinder-, Pyramide-, Kegel-, Kugelbilder im Schrägbild (verdeckte Kanten gestrichelt) und Netze. Flächen unterscheiden sich durch Beschriftung (1–6) und Muster, nie
nur durch Farbe. Jedes Bild mit `alt` und Bildunterschrift. Komponenten nutzen nur die Farbvariablen der Seite und haben
`nojs`-Text; alle Aktionen per Tastatur (Tab, Pfeile, Enter), Ziele mindestens 44 px.

## Sources

Eigene Herleitungen und Aufgaben. Nachgeschlagen (nicht verlinkt, keine Formulierungen oder Bilder übernommen): die
Lernlandkarte und Wikipedia „Axonometrie“, „Netz (Geometrie)“. Wikipedia steht nicht in `sources` oder `links`. Keine
Dritt-Inhalte, `thirdParty` leer. Der fachliche Prüfer rechnet Aufgaben nach.

## Adding a chapter or round

1. Kompetenz-Ids aus der Karte nehmen, neue Seiten in `chapter.yaml` unter `pages` eintragen (Reihenfolge der Karte).
2. Seite `src/<kapitel>/<seite>.yaml` mit den Abschnitten oben (keine Datendatei nötig).
3. 1 bis 3 ihrer Übungen in `selfAssessment` aufnehmen, wie Skill `lernapps-explainer-self-assessment` sagt (`chapter.yaml` des Kapitels; Übungen, die ohne Seite klar sind, bevorzugt `generated` und Komponenten).
4. Komponenten in `src/components/` (`<Name>.vue`, `.ts`, `.test.ts`), gemeinsame Geometrie in `Koerper.ts`.
5. Kapitel in `src/app.yaml` unter `chapters` eintragen.
6. `npx vp check --fix`, `npx vp build`, `npx --no -- lernapps check`, commit.

## Rules learned from mistakes

None yet.
