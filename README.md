# 🌤️ Panell Meteorològic Avançat (Firebase + XML API)

Aquest projecte és una aplicació web dinàmica desenvolupada per a l'activitat **AEA4**. L'aplicació permet gestionar una llista personalitzada de ciutats i consultar-ne l'estat climàtic en temps real, integrant un backend de tercers i el consum d'una API externa en format XML.

## 🚀 Funcionalitats Principals

- **Persistència amb Firebase:** Utilitza Google Firebase Firestore per emmagatzemar la llista de ciutats de forma permanent.
- **Consum d'API XML:** Implementa la recuperació i el parseig de dades en format **XML** des de l'API d'OpenWeatherMap, utilitzant l'objecte `DOMParser` de JavaScript.
- **Gestió Avançada de Taula:** 
    - **Cerca:** Filtre dinàmic per nom de ciutat.
    - **Ordenació:** Permet ordenar per data d'inserció o alfabèticament (A-Z / Z-A).
    - **Paginació:** Mostra les ciutats en blocs de 4 per optimitzar les crides a l'API i el rendiment.
- **Seguretat de Claus:** Les claus d'API no estan exposades al codi font del repositori. S'utilitzen **GitHub Secrets** i un workflow de **CI/CD** per injectar-les durant el desplegament.

## 🛠️ Tecnologies Utilitzades

- **Frontend:** HTML5, CSS3, Vanilla JavaScript.
- **Backend:** [Firebase Firestore](https://firebase.google.com/).
- **Dades Externes:** [OpenWeatherMap API](https://openweathermap.org/) (Mode XML).
- **CI/CD:** GitHub Actions.
- **Hosting:** [Netlify](https://www.netlify.com/).

## 📦 Seguretat i Gestió de Secrets

Aquest projecte aplica bones pràctiques de seguretat per evitar la filtració de claus d'API:

1.  **Fitxer de Plantilla:** S'utilitza el fitxer `config.example.js` com a base, el qual conté "placeholders" (ex: `FIREBASE_APIKEY_PLACEHOLDER`).
2.  **GitHub Secrets:** Totes les claus reals estan guardades de forma xifrada a la configuració del repositori de GitHub.
3.  **Injecció Automàtica:** El workflow de GitHub Actions utilitza la comanda `sed` per substituir els "placeholders" per les claus reals just abans d'enviar el codi a Netlify. 
4.  **Resultat:** El codi públic és segur, però l'aplicació desplegada és totalment funcional.

## ⚙️ Instal·lació i Configuració Local

1.  **Clona el repositori:**
    ```bash
    git clone https://github.com/el-teu-usuari/gestion-clima-ciudades.git
    ```
2.  **Configuració local:**
    - Per provar l'aplicació al teu PC, edita el fitxer `config.example.js` i substitueix els valors de "PLACEHOLDER" per les teves claus reals de Firebase i OpenWeatherMap.
    - **IMPORTANT:** Si vols pujar canvis a GitHub, recorda tornar a posar els "PLACEHOLDERS" o assegura't de no fer `commit` de les teves claus reals.

3.  **Configuració de Desplegament:**
    - A GitHub: Afegeix els secrets (`FIREBASE_APIKEY`, `WEATHER_APIKEY`, `PROJECT_ID`, etc.) a **Settings > Secrets**.
    - Afegeix també `NETLIFY_SITE_ID` i `NETLIFY_AUTH_TOKEN` per al funcionament del robot de desplegament.

## 📄 Detalls Tècnics: Parseig XML

L'extracció de dades meteorològiques es realitza mitjançant la funció asíncrona `obtenirClimaXML`. El procés segueix aquests passos:

1.  Cridada a l'API amb el paràmetre `mode=xml`.
2.  Conversió de la resposta a text.
3.  Ús de `DOMParser` per crear un arbre de nodes.
4.  Accés a les dades mitjançant atributs:
    ```javascript
    xmlDoc.getElementsByTagName("temperature")[0].getAttribute("value")
    ```

---
