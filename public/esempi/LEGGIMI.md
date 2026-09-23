# Immagini d'esempio della style guide

Servono a **una** story — `Primitive/EntityImage` — e a rispondere a una domanda
che senza una figura vera non si risponde: *a quella larghezza la foto si
riconosce?*

**Provenienza**: sono immagini di Tassullo, prese dalla sezione **Sistemi** di
<https://www.tassullo.it/sistemi> su indicazione di Francesco (2026-09-19).
`sistema-*.png` sono i render di stratigrafia delle sei categorie di sistema
(sorgente **1080×1080**); `prodotto-*.png` sono le foto pacco della linea Wall,
da <https://www.tassullo.it/prodotti> (sorgente **1800×1800**); `cantiere.jpg` è
la fotografia di testata della sezione Sistemi (1920×931).

**I `.png` sono scontornati, senza fondo**, rifatti da Francesco il 2026-09-19.
La prima versione era quella del sito, su bianco, e il difetto si è visto
subito: una foto su fondo bianco dentro una card scura è un blocco chiaro. Il
fondo appartiene alla pagina, non all'immagine — per questo `entity-image` non
dipinge più un fondo sulla radice. Verificato sui nove file: alpha a 252-253 sul
soggetto, **zero pixel di frangia bianca** sul bordo, ombra portata tolta
insieme al piano. `cantiere.jpg` resta una fotografia col suo sfondo, perché una
fotografia non si scontorna.

Ridimensionate per il repo (640px le quadrate, 900px la fotografia) e
nient'altro: non ritoccate, non ritagliate. 1,0 MB in tutto.

**Tutte e due le librerie di Tassullo sono quadrate**, ed è il fatto che ha
fatto entrare il rapporto `1:1` in `entity-image` (v. `docs/DECISIONI.md` §45).

Sono **contenuto d'esempio**, non parte del design system:

- **Nessun item del registry le spedisce.** `registry.json` elenca i file uno
  per uno, e nessuno di questi ci compare; le story non vengono spedite affatto.
  Un'app che installa `entity-image` non si porta dietro niente di qui.
- **Sono locali di proposito.** Con indirizzi remoti, in una CI senza rete
  l'immagine non arriva, `AvatarFallback` ripiega sul segnaposto e le scene «con
  foto» misurerebbero il **segnaposto** — cioè lo stesso difetto di «un popup
  non aperto non è un popup senza violazioni».
- Storybook `public/` non la serve da sé: la riga è in `.storybook/main.ts`,
  fra gli `staticDirs`.

## Le fotografie dei macchinari

`macchina-*.jpg` servono a `Pagine/Lista a due facce` (il parco macchine) e
vengono da **Wikimedia Commons**, con licenza libera. Ridotte a 640px sul lato
lungo e ricompresse, nient'altro: non ritoccate, non ritagliate. Le licenze CC BY
e CC BY-SA chiedono di citare l'autore, ed è questa tabella; le BY-SA chiedono
anche che la copia ridotta resti sotto la stessa licenza, e lo resta.

| File | Originale | Autore | Licenza |
|---|---|---|---|
| `macchina-intonacatrice.jpg` | [Gips-spuit-machine.jpg](https://commons.wikimedia.org/wiki/File:Gips-spuit-machine.jpg) | Michel Pol | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `macchina-miscelatore.jpg` | [Putzmaschine.jpg](https://commons.wikimedia.org/wiki/File:Putzmaschine.jpg) | Mailtosap | uso libero dichiarato dall'autore |
| `macchina-pompa.jpg` | [Concrete pump truck - Arlington, MA.jpg](https://commons.wikimedia.org/wiki/File:Concrete_pump_truck_-_Arlington,_MA.jpg) | Daderot | [CC0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `macchina-silo.jpg` | [Tarmac Dry Silo Mortar - geograph.org.uk - 4314671.jpg](https://commons.wikimedia.org/wiki/File:Tarmac_Dry_Silo_Mortar_-_geograph.org.uk_-_4314671.jpg) | David P Howard | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| `macchina-ponteggio.jpg` | [Lift-climber.jpg](https://commons.wikimedia.org/wiki/File:Lift-climber.jpg) | ゆっかりーん | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `macchina-generatore.jpg` | [Job done – diesel generator, Lidl site, Pickard Street, Warwick - geograph.org.uk - 7093422.jpg](https://commons.wikimedia.org/wiki/File:Job_done_%E2%80%93_diesel_generator,_Lidl_site,_Pickard_Street,_Warwick_-_geograph.org.uk_-_7093422.jpg) | Robin Stott | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| `macchina-betoniera.jpg` | [Concrete Mixture at a construction site.jpg](https://commons.wikimedia.org/wiki/File:Concrete_Mixture_at_a_construction_site.jpg) | iMahesh | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `macchina-termocamera.jpg` | [Flir E8-Thermal imaging camera-Thermographic camera-03ASD.jpg](https://commons.wikimedia.org/wiki/File:Flir_E8-Thermal_imaging_camera-Thermographic_camera-03ASD.jpg) | Asurnipal | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
