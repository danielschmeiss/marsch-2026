# Marsch-Treffpunkt

Eine Webseite, auf der Freunde und Familie sehen, wo der Marschierer beim Berlin Marsch 2026 (50 km, 3.10.2026) zu einer gewählten Uhrzeit ungefähr sein wird — damit sie ihn unterwegs treffen können.

## Language

**Marschierer**:
Der eine Teilnehmer, um den es geht: Daniel, Startnummer 10. Auf der Seite erscheint nur der Vorname.
_Avoid_: Läufer, Teilnehmer, Walker

**Besucher**:
Freunde oder Familie, die die Seite aufrufen, um einen Treffpunkt zu finden.
_Avoid_: User, Zuschauer, Fan

**Strecke**:
Der offizielle 50-km-Rundkurs mit Start und Ziel in Friedrichshagen.
_Avoid_: Route, Track, Weg

**Start**:
Startzeitpunkt 6:40 Uhr am 3.10.2026 in Friedrichshagen; zugleich das **Ziel**.

**VP (Verpflegungspunkt)**:
Einer der vier offiziellen Versorgungspunkte (VP1–VP4) an der Strecke, In der **Prognose** pausiert der Marschierer an jedem VP genau 15 Minuten (**VP-Pause**).
_Avoid_: Station, Checkpoint, Pause

**Streckenkilometer**:
Position auf der **Strecke**, gemessen entlang des GPX-Tracks ab **Start** (0 bis 50,1). Maßgeblich für alle Berechnungen, auch dort, wo die Teilnehmerinfo gerundete Werte nennt („VP2 nach 17 km“).
_Avoid_: offizielle km, Kilometerangabe

**Gehtempo**:
Konstant 5 km/h über die gesamte Strecke, ohne Berücksichtigung von Steigungen oder Ermüdung.
_Avoid_: Pace, Geschwindigkeit

**Prognose**:
Die vorab berechnete, feste Zuordnung von Uhrzeit zu Position auf der Strecke, abgeleitet aus **Start**, **Gehtempo** und **VP-Pausen**. Wird am Renntag nicht angepasst.
_Avoid_: Tracking, Live-Position, Schätzung

**Korridor**:
Der Abschnitt der **Strecke**, auf dem der Marschierer zu einer Uhrzeit wahrscheinlich ist: Prognose-Position ± 10 % der seit dem **Start** vergangenen Zeit, umgerechnet über die **Prognose** in Streckenkilometer. Wächst im Tagesverlauf.
_Avoid_: Unsicherheit, Bereich, Toleranz

**Durchgangszeit**:
Die Uhrzeit, zu der der Marschierer laut **Prognose** einen bestimmten Punkt der **Strecke** passiert (an einem **VP**: Ankunft und Abgang). Dazu gehört ein **Zeitfenster**: die Spanne, in der dieser Punkt im **Korridor** liegt.
_Avoid_: ETA, Ankunftszeit

**Statusmeldung**:
Ein kurzer, humorvoller Satz, der beschreibt, was der Marschierer laut **Prognose** zu einer Uhrzeit gerade tut (z. B. „Wahrscheinlich am Käsebrot-Buffet an VP2“). Hängt von Streckenkilometer und Zustand (gehend / in VP-Pause) ab.
_Avoid_: Kommentar, Tooltip, Nachricht

**Streckenhighlight**:
Ein sehenswerter Ort an der **Strecke** mit kurzem Text (z. B. Großer Müggelberg). Kein **VP** — liegt ein Highlight an einem VP, gehört der Text zum VP.
_Avoid_: POI, Sehenswürdigkeit, Wegpunkt

**Stempel**:
Das Wanderpass-Symbol eines **VP**. Gilt als gestempelt, sobald die gewählte Uhrzeit die **Durchgangszeit** (Ankunft) dieses VP erreicht hat.
_Avoid_: Badge, Checkmark, Häkchen

## Relationships

- Die **Prognose** ordnet jeder Uhrzeit zwischen **Start** und Zielankunft genau eine Position auf der **Strecke** zu
- Die **Strecke** hat genau vier **VPs** in fester Reihenfolge

## Flagged ambiguities

- Keine Live-Anpassung: Weicht der Marschierer am Renntag vom Plan ab, zeigt die Seite trotzdem die ursprüngliche **Prognose**.
